"use client"

import {
  useState,
  useRef,
  useCallback,
  type ChangeEvent,
} from "react"
import { useAuth }   from "@/hooks/useAuth"
import { useLang }   from "@/hooks/useLang"
import { useAnnexe } from "@/hooks/useAnnexe"
import { exportToExcel, importFromExcel } from "@/lib/excel"
import { calcRest, calcPrixTotal, toComputed } from "@/types/annexe"
import type { AnnexeRow } from "@/types"

// ── HELPERS ───────────────────────────────────────────────────────────────
function fmt(v: number | string): string {
  if (v === "" || v === null || v === undefined) return ""
  const n = Number(v)
  if (isNaN(n)) return String(v)
  return n.toLocaleString("fr-FR", {
    minimumFractionDigits: n % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })
}

function newRowId() {
  return `row_${Date.now()}_${Math.random().toString(36).slice(2)}`
}

// ── EDITABLE CELL ─────────────────────────────────────────────────────────
function EditCell({
  value,
  onSave,
  numeric,
  readonly,
}: {
  value:    string | number
  onSave:   (v: string) => void
  numeric:  boolean
  readonly: boolean
}) {
  const [editing, setEditing] = useState(false)
  const [val,     setVal]     = useState(String(value))

  if (readonly) {
    return (
      <span style={{
        display:  "block",
        fontSize: 12,
        color:    "var(--text-sub)",
      }}>
        {numeric ? fmt(value) : value || "—"}
      </span>
    )
  }

  if (editing) {
    return (
      <input
        autoFocus
        value={val}
        onChange={e => setVal(e.target.value)}
        onBlur={() => { onSave(val); setEditing(false) }}
        onKeyDown={e => {
          if (e.key === "Enter")  { onSave(val); setEditing(false) }
          if (e.key === "Escape") { setVal(String(value)); setEditing(false) }
        }}
        style={{
          width:        "100%",
          background:   "var(--input-bg)",
          border:       "1px solid var(--border-focus)",
          borderRadius: 4,
          color:        "var(--text)",
          fontSize:     12,
          padding:      "2px 6px",
          outline:      "none",
          fontFamily:   "inherit",
        }}
      />
    )
  }

  return (
    <span
      onClick={() => { setVal(String(value)); setEditing(true) }}
      style={{
        display:   "block",
        fontSize:  12,
        color:     value !== "" && value !== 0 ? "var(--text)" : "var(--text-muted)",
        cursor:    "text",
        minHeight: 20,
        padding:   "1px 2px",
      }}
      title="Cliquer pour modifier"
    >
      {numeric
        ? (value !== "" ? fmt(value) : <span style={{ color: "var(--text-muted)" }}>—</span>)
        : (value || <span style={{ color: "var(--text-muted)" }}>—</span>)
      }
    </span>
  )
}

// ── MAIN TABLE ────────────────────────────────────────────────────────────
export default function AnnexeTable({
  annexeId,
  isAdmin,
}: {
  annexeId: string
  isAdmin:  boolean
}) {
  const { appUser }                          = useAuth()
  const { t }                                = useLang()
  const { rows, loading, saving, saveRow, removeRow, importRows, setRows } =
    useAnnexe(annexeId)
  const [selected, setSelected]              = useState<Set<string>>(new Set())
  const [search,   setSearch]                = useState("")
  const [toast,    setToast]                 = useState<string | null>(null)
  const fileRef                              = useRef<HTMLInputElement>(null)
  const [showImport, setShowImport]          = useState(false)

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  // Update a field in a row and save to Firebase
  async function updateField(
    rowId: string,
    field: keyof AnnexeRow,
    value: string
  ) {
    if (!appUser) return
    const row = rows.find(r => r.rowId === rowId)
    if (!row) return
    const updated: AnnexeRow = {
      ...row,
      [field]:    field === "designation" || field === "unite" || field === "num"
                  ? value
                  : Number(value) || 0,
      updatedBy:  appUser.uid,
      updatedAt:  Date.now(),
    }
    await saveRow(updated)
  }

  // Add item row
  async function addItem() {
    if (!appUser) return
    const row: AnnexeRow = {
      rowId:       newRowId(),
      adminId:     appUser.adminId,
      annexeId,
      type:        "item",
      num:         "",
      designation: "Nouvel article",
      unite:       "U",
      qte:         0,
      qte01:       0,
      qte02:       0,
      qte03:       0,
      prixU:       0,
      order:       rows.length,
      updatedBy:   appUser.uid,
      updatedAt:   Date.now(),
    }
    await saveRow(row)
    showToast(t.annexe.addItem)
  }

  // Add category row
  async function addCategory() {
    if (!appUser) return
    const row: AnnexeRow = {
      rowId:       newRowId(),
      adminId:     appUser.adminId,
      annexeId,
      type:        "cat",
      num:         "",
      designation: "Nouvelle catégorie",
      unite:       "F",
      qte:         0,
      qte01:       0,
      qte02:       0,
      qte03:       0,
      prixU:       0,
      order:       rows.length,
      updatedBy:   appUser.uid,
      updatedAt:   Date.now(),
    }
    await saveRow(row)
    showToast(t.annexe.addCategory)
  }

  // Delete selected
  async function deleteSelected() {
    for (const id of selected) {
      await removeRow(id)
    }
    showToast(`${selected.size} ${t.common.rows} supprimées`)
    setSelected(new Set())
  }

  // Move row up/down
  async function moveRow(rowId: string, dir: -1 | 1) {
    const idx = rows.findIndex(r => r.rowId === rowId)
    if (idx < 0) return
    const ni = idx + dir
    if (ni < 0 || ni >= rows.length) return
    const copy = [...rows]
    ;[copy[idx], copy[ni]] = [copy[ni], copy[idx]]
    const reordered = copy.map((r, i) => ({ ...r, order: i }))
    setRows(reordered)
    await saveRow(reordered[idx])
    await saveRow(reordered[ni])
  }

  // Export
  function handleExport() {
    exportToExcel(rows, "Annexe_N01")
    showToast(t.annexe.exportSuccess)
  }

  // Import
  async function handleImport(e: ChangeEvent<HTMLInputElement>) {
    if (!appUser) return
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const imported = await importFromExcel(
        file, annexeId, appUser.adminId, appUser.uid
      )
      await importRows(imported)
      showToast(`${imported.length} ${t.annexe.importSuccess}`)
    } catch {
      showToast(t.annexe.importError)
    }
    setShowImport(false)
    e.target.value = ""
  }

  // Computed totals
  const items       = rows.filter(r => r.type === "item")
  const grandTotal  = items.reduce((s, r) => s + calcPrixTotal(r), 0)
  const totalOrdered = items.reduce((s, r) => s + r.qte, 0)
  const totalDel    = items.reduce((s, r) => s + r.qte01 + r.qte02 + r.qte03, 0)
  const totalRest   = items.reduce((s, r) => s + calcRest(r), 0)

  const visible = rows.filter(r =>
    !search ||
    r.designation.toLowerCase().includes(search.toLowerCase()) ||
    r.num.includes(search)
  )

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0, height: "100%" }}>

      {/* TOAST */}
      {toast && (
        <div style={{
          position:   "fixed",
          top:        16,
          right:      16,
          zIndex:     9999,
          background: "var(--btn-primary-bg)",
          border:     "0.5px solid var(--btn-primary-border)",
          color:      "var(--btn-primary-text)",
          padding:    "10px 18px",
          borderRadius: 8,
          fontSize:   12,
          boxShadow:  "var(--shadow-md)",
        }}>
          {toast}
        </div>
      )}

      {/* IMPORT MODAL */}
      {showImport && (
        <div
          onClick={() => setShowImport(false)}
          style={{
            position:       "fixed",
            inset:          0,
            background:     "rgba(0,0,0,0.5)",
            zIndex:         999,
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background:   "var(--card)",
              border:       "0.5px solid var(--border)",
              borderRadius: 12,
              padding:      28,
              width:        360,
              boxShadow:    "var(--shadow-md)",
            }}
          >
            <div style={{
              fontSize:   14,
              fontWeight: 500,
              color:      "var(--text)",
              marginBottom: 8,
            }}>
              {t.annexe.importTitle}
            </div>
            <div style={{
              fontSize:    11,
              color:       "var(--text-muted)",
              marginBottom: 20,
              lineHeight:  1.6,
            }}>
              {t.annexe.importDesc}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleImport}
              style={{ display: "none" }}
            />
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => fileRef.current?.click()}
                style={{
                  flex:         1,
                  padding:      "9px 0",
                  background:   "var(--btn-green-bg)",
                  color:        "var(--btn-green-text)",
                  border:       "0.5px solid var(--btn-green-border)",
                  borderRadius: 7,
                  cursor:       "pointer",
                  fontSize:     12,
                  fontFamily:   "inherit",
                }}
              >
                {t.annexe.chooseFile}
              </button>
              <button
                onClick={() => setShowImport(false)}
                style={{
                  padding:      "9px 16px",
                  background:   "var(--card)",
                  color:        "var(--text-sub)",
                  border:       "0.5px solid var(--border)",
                  borderRadius: 7,
                  cursor:       "pointer",
                  fontSize:     12,
                  fontFamily:   "inherit",
                }}
              >
                {t.annexe.cancel}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOOLBAR */}
      <div style={{
        padding:      "10px 0",
        display:      "flex",
        alignItems:   "center",
        gap:          8,
        flexWrap:     "wrap",
        borderBottom: "0.5px solid var(--border)",
        marginBottom: 0,
      }}>
        {isAdmin && (
          <>
            <button onClick={addItem} className="btn btn-green">
              + {t.annexe.addItem}
            </button>
            <button onClick={addCategory} className="btn btn-primary">
              + {t.annexe.addCategory}
            </button>
            <div style={{
              width:      1,
              height:     20,
              background: "var(--border)",
            }} />
            <button
              onClick={deleteSelected}
              disabled={selected.size === 0}
              className="btn btn-danger"
            >
              {t.annexe.delete}
              {selected.size > 0 ? ` (${selected.size})` : ""}
            </button>
            <div style={{
              width:      1,
              height:     20,
              background: "var(--border)",
            }} />
            <button
              onClick={() => setShowImport(true)}
              className="btn btn-primary"
            >
              ↑ {t.annexe.importExcel}
            </button>
          </>
        )}
        <button onClick={handleExport} className="btn btn-green">
          ↓ {t.annexe.exportExcel}
        </button>

        {/* Search */}
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={t.annexe.search}
          style={{
            marginLeft:   "auto",
            background:   "var(--input-bg)",
            border:       "0.5px solid var(--input-border)",
            borderRadius: 7,
            color:        "var(--input-text)",
            padding:      "6px 12px",
            fontSize:     12,
            outline:      "none",
            width:        200,
            fontFamily:   "inherit",
          }}
        />

        {/* Saving indicator */}
        {saving && (
          <span style={{
            fontSize: 11,
            color:    "var(--text-muted)",
            display:  "flex",
            alignItems: "center",
            gap: 6,
          }}>
            <div className="spinner" style={{ width: 12, height: 12, borderWidth: 1.5 }} />
            {t.annexe.saving}
          </span>
        )}
      </div>

      {/* TABLE */}
      <div style={{ overflowX: "auto", flex: 1 }}>
        <table style={{
          width:           "100%",
          borderCollapse: "collapse",
          fontSize:        12,
        }}>
          <thead>
            <tr style={{
              background:   "var(--header-bg)",
              borderBottom: "0.5px solid var(--border)",
            }}>
              {isAdmin && (
                <th style={{ width: 36, padding: "8px 0", textAlign: "center" }}>
                  <input
                    type="checkbox"
                    checked={selected.size === rows.length && rows.length > 0}
                    onChange={() => {
                      if (selected.size === rows.length) setSelected(new Set())
                      else setSelected(new Set(rows.map(r => r.rowId)))
                    }}
                  />
                </th>
              )}
              {[
                t.annexe.num,
                t.annexe.designation,
                t.annexe.unite,
                t.annexe.qte,
                t.annexe.dem01,
                t.annexe.dem02,
                t.annexe.dem03,
                t.annexe.rest,
                t.annexe.prixU,
                t.annexe.prixTotal,
              ].map(h => (
                <th
                  key={h}
                  style={{
                    padding:       "8px 10px",
                    color:         "var(--text-sub)",
                    fontSize:      10,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    fontWeight:    500,
                    textAlign:     h === t.annexe.designation ? "left" : "right",
                    whiteSpace:    "nowrap",
                  }}
                >
                  {h}
                </th>
              ))}
              {isAdmin && (
                <th style={{ width: 48, padding: "8px 0" }} />
              )}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={12}
                  style={{ padding: 40, textAlign: "center" }}
                >
                  <div className="spinner" style={{ margin: "0 auto" }} />
                </td>
              </tr>
            ) : visible.length === 0 ? (
              <tr>
                <td
                  colSpan={12}
                  style={{
                    padding:   40,
                    textAlign: "center",
                    color:     "var(--text-muted)",
                    fontSize:  13,
                  }}
                >
                  {t.annexe.noRows}
                </td>
              </tr>
            ) : (
              visible.map((row, idx) => {
                const isCat  = row.type === "cat"
                const isSel  = selected.has(row.rowId)
                const rest   = calcRest(row)
                const total  = calcPrixTotal(row)
                const restColor =
                  isCat ? "var(--text-muted)" :
                  rest === 0 ? "var(--ok-text)" :
                  "var(--pending-text)"

                return (
                  <tr
                    key={row.rowId}
                    style={{
                      background:   isSel
                        ? "var(--row-selected)"
                        : isCat
                          ? "var(--cat-bg)"
                          : idx % 2 === 0
                            ? "var(--row-odd)"
                            : "var(--row-even)",
                      borderBottom: "0.5px solid var(--border-light)",
                      borderLeft:   isCat
                        ? "3px solid var(--cat-border)"
                        : rest === 0
                          ? "3px solid var(--ok-border)"
                          : rest > 0 && row.qte01 > 0
                            ? "3px solid var(--pending-border)"
                            : "3px solid var(--border)",
                    }}
                  >
                    {/* Checkbox */}
                    {isAdmin && (
                      <td style={{ padding: "6px 0", textAlign: "center" }}>
                        <input
                          type="checkbox"
                          checked={isSel}
                          onChange={() => {
                            const s = new Set(selected)
                            isSel ? s.delete(row.rowId) : s.add(row.rowId)
                            setSelected(s)
                          }}
                        />
                      </td>
                    )}

                    {/* N° */}
                    <td style={{ padding: "5px 10px", textAlign: "right" }}>
                      {isAdmin ? (
                        <EditCell
                          value={row.num}
                          onSave={v => updateField(row.rowId, "num", v)}
                          numeric={false}
                          readonly={false}
                        />
                      ) : (
                        <span style={{
                          fontSize: 12,
                          color:    isCat ? "var(--cat-text)" : "var(--text-sub)",
                        }}>
                          {row.num}
                        </span>
                      )}
                    </td>

                    {/* Designation */}
                    <td style={{
                      padding:   "5px 10px",
                      textAlign: "left",
                      color:     isCat ? "var(--cat-text)" : "var(--text)",
                      fontWeight: isCat ? 600 : 400,
                      minWidth:  200,
                    }}>
                      {isAdmin ? (
                        <EditCell
                          value={row.designation}
                          onSave={v => updateField(row.rowId, "designation", v)}
                          numeric={false}
                          readonly={false}
                        />
                      ) : (
                        <span style={{ fontSize: 12 }}>{row.designation}</span>
                      )}
                    </td>

                    {/* Unite */}
                    <td style={{ padding: "5px 10px", textAlign: "right" }}>
                      {isAdmin && !isCat ? (
                        <EditCell
                          value={row.unite}
                          onSave={v => updateField(row.rowId, "unite", v)}
                          numeric={false}
                          readonly={false}
                        />
                      ) : (
                        <span style={{ fontSize: 12, color: "var(--text-sub)" }}>
                          {row.unite}
                        </span>
                      )}
                    </td>

                    {/* Numeric fields */}
                    {(["qte", "qte01", "qte02", "qte03"] as const).map(field => (
                      <td key={field} style={{ padding: "5px 10px", textAlign: "right" }}>
                        {!isCat && (isAdmin ? (
                          <EditCell
                            value={row[field]}
                            onSave={v => updateField(row.rowId, field, v)}
                            numeric={true}
                            readonly={false}
                          />
                        ) : (
                          <span style={{ fontSize: 12, color: "var(--text)" }}>
                            {fmt(row[field])}
                          </span>
                        ))}
                      </td>
                    ))}

                    {/* Rest — always readonly, auto-calculated */}
                    <td style={{
                      padding:    "5px 10px",
                      textAlign:  "right",
                      color:      restColor,
                      fontWeight: !isCat && rest === 0 ? 500 : 400,
                      fontSize:   12,
                    }}>
                      {!isCat ? fmt(rest) : ""}
                    </td>

                    {/* Prix U */}
                    <td style={{ padding: "5px 10px", textAlign: "right" }}>
                      {!isCat && (isAdmin ? (
                        <EditCell
                          value={row.prixU}
                          onSave={v => updateField(row.rowId, "prixU", v)}
                          numeric={true}
                          readonly={false}
                        />
                      ) : (
                        <span style={{ fontSize: 12, color: "var(--text)" }}>
                          {fmt(row.prixU)}
                        </span>
                      ))}
                    </td>

                    {/* Prix Total — always readonly, auto-calculated */}
                    <td style={{
                      padding:    "5px 10px",
                      textAlign:  "right",
                      fontSize:   12,
                      color:      "var(--text)",
                      fontWeight: 500,
                    }}>
                      {!isCat ? fmt(total) : ""}
                    </td>

                    {/* Move buttons */}
                    {isAdmin && (
                      <td style={{ padding: "4px 8px", textAlign: "center" }}>
                        <div style={{
                          display:       "flex",
                          flexDirection: "column",
                          gap:           1,
                        }}>
                          <button
                            onClick={() => moveRow(row.rowId, -1)}
                            style={{
                              background: "none",
                              border:     "none",
                              color:      "var(--text-muted)",
                              cursor:     "pointer",
                              fontSize:   10,
                              padding:    "1px 4px",
                              lineHeight: 1,
                            }}
                          >
                            ▲
                          </button>
                          <button
                            onClick={() => moveRow(row.rowId, 1)}
                            style={{
                              background: "none",
                              border:     "none",
                              color:      "var(--text-muted)",
                              cursor:     "pointer",
                              fontSize:   10,
                              padding:    "1px 4px",
                              lineHeight: 1,
                            }}
                          >
                            ▼
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* FOOTER TOTALS */}
      <div style={{
        borderTop:   "0.5px solid var(--border)",
        padding:     "10px 16px",
        display:     "flex",
        alignItems:  "center",
        gap:         28,
        flexWrap:    "wrap",
        background:  "var(--surface)",
        boxShadow:   "var(--shadow-top)",
      }}>
        {[
          { label: t.annexe.articles,       value: items.length,            color: "var(--text)"          },
          { label: t.annexe.totalOrdered,   value: fmt(totalOrdered),       color: "var(--text)"          },
          { label: t.annexe.totalDelivered, value: fmt(totalDel),           color: "var(--ok-text)"       },
          { label: t.annexe.totalRemaining, value: fmt(totalRest),          color: "var(--pending-text)"  },
        ].map(s => (
          <div key={s.label}>
            <div style={{
              fontSize:      10,
              color:         "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.07em",
            }}>
              {s.label}
            </div>
            <div style={{
              fontSize:   15,
              fontWeight: 600,
              color:      s.color,
            }}>
              {s.value}
            </div>
          </div>
        ))}

        <div style={{ marginLeft: "auto", textAlign: "right" }}>
          <div style={{
            fontSize:      10,
            color:         "var(--text-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.07em",
          }}>
            {t.annexe.grandTotal}
          </div>
          <div style={{
            fontSize:   20,
            fontWeight: 700,
            color:      "var(--text)",
            letterSpacing: "-0.02em",
          }}>
            {fmt(grandTotal)} {t.common.currency}
          </div>
        </div>
      </div>
    </div>
  )
}
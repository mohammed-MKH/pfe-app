import * as XLSX from "xlsx"
import type { AnnexeRow } from "@/types"
import { calcRest, calcPrixTotal } from "@/types/annexe"

export function exportToExcel(rows: AnnexeRow[], title: string) {
  const headers = [
    "N°", "Désignation", "Unité", "Qté",
    "Qté Dem. 01", "Qté Dem. 02", "Qté Dem. 03",
    "Restant", "Prix U.", "Prix Total"
  ]

  const data: (string | number)[][] = [headers]

  rows.forEach(row => {
    const rest  = row.type === "cat" ? "" : calcRest(row)
    const total = row.type === "cat" ? "" : calcPrixTotal(row)
    data.push([
      row.num,
      row.designation,
      row.unite,
      row.type === "cat" ? "" : row.qte,
      row.type === "cat" ? "" : row.qte01,
      row.type === "cat" ? "" : row.qte02,
      row.type === "cat" ? "" : row.qte03,
      rest,
      row.type === "cat" ? "" : row.prixU,
      total,
    ])
  })

  // Grand total row
  const grandTotal = rows
    .filter(r => r.type === "item")
    .reduce((s, r) => s + calcPrixTotal(r), 0)

  data.push(["", "TOTAL GÉNÉRAL", "", "", "", "", "", "", "", grandTotal])

  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.aoa_to_sheet(data)

  // Column widths
  ws["!cols"] = [
    { wch: 8 }, { wch: 65 }, { wch: 8 }, { wch: 8 },
    { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 10 },
    { wch: 12 }, { wch: 14 },
  ]

  XLSX.utils.book_append_sheet(wb, ws, title.slice(0, 31))
  XLSX.writeFile(wb, `${title}.xlsx`)
}

export function importFromExcel(
  file: File,
  annexeId: string,
  adminId: string,
  updatedBy: string
): Promise<AnnexeRow[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const wb   = XLSX.read(e.target!.result, { type: "binary" })
        const ws   = wb.Sheets[wb.SheetNames[0]]
        const data = XLSX.utils.sheet_to_json<string[]>(ws, {
          header: 1,
          defval: "",
        })

        const imported: AnnexeRow[] = data
          .slice(1) // skip header row
          .filter((r: any) => r[1]) // must have designation
          .map((r: any, i: number) => {
            const num  = String(r[0] || "")
            const isCat =
              String(r[2] || "").toUpperCase() === "F" ||
              String(r[1] || "").toUpperCase().startsWith("FOURNITURE")

            return {
              rowId:       `row_${Date.now()}_${i}`,
              adminId,
              annexeId,
              type:        isCat ? "cat" : "item",
              num,
              designation: String(r[1] || ""),
              unite:       (r[2] || "U") as "U" | "m" | "F",
              qte:         Number(r[3])  || 0,
              qte01:       Number(r[4])  || 0,
              qte02:       Number(r[5])  || 0,
              qte03:       Number(r[6])  || 0,
              prixU:       Number(r[8])  || 0,
              order:       i,
              updatedBy,
              updatedAt:   Date.now(),
            } as AnnexeRow
          })

        resolve(imported)
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = reject
    reader.readAsBinaryString(file)
  })
}
"use client"

import { useState, useEffect } from "react"
import {
  getAnnexesByAdmin,
  getAnnexeRows,
  setAnnexe,
  setAnnexeRow,
  updateAnnexeRow,
  deleteAnnexeRow,
  deleteAnnexe,
} from "@/lib/firestore"
import type { Annexe, AnnexeRow } from "@/types"
import { useAuth } from "@/hooks/useAuth"

export function useAnnexe(annexeId: string | null) {
  const { appUser }                         = useAuth()
  const [annexes, setAnnexes]               = useState<Annexe[]>([])
  const [rows,    setRows]                  = useState<AnnexeRow[]>([])
  const [loading, setLoading]               = useState(true)
  const [saving,  setSaving]                = useState(false)

  // Load annexes list
  useEffect(() => {
    if (!appUser) return
    getAnnexesByAdmin(appUser.adminId)
      .then(data => {
        setAnnexes(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [appUser])

  // Load rows when annexeId changes
  useEffect(() => {
    if (!appUser || !annexeId) return
    setLoading(true)
    getAnnexeRows(annexeId, appUser.adminId)
      .then(data => {
        setRows(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [appUser, annexeId])

  async function createAnnexe(title: string): Promise<string> {
    if (!appUser) throw new Error("Not logged in")
    const id = `anx_${Date.now()}`
    const annexe: Annexe = {
      annexeId:    id,
      adminId:     appUser.adminId,
      title,
      description: "",
      createdBy:   appUser.uid,
      createdAt:   Date.now(),
      sharedWith:  ["manager"],
      isLocked:    false,
    }
    await setAnnexe(annexe)
    setAnnexes(prev => [...prev, annexe])
    return id
  }

  async function removeAnnexe(annexeId: string): Promise<void> {
    await deleteAnnexe(annexeId)
    setAnnexes(prev => prev.filter(a => a.annexeId !== annexeId))
    setRows([])
  }

  async function saveRow(row: AnnexeRow) {
    setSaving(true)
    await setAnnexeRow(row)
    setRows(prev => {
      const exists = prev.find(r => r.rowId === row.rowId)
      if (exists) return prev.map(r => r.rowId === row.rowId ? row : r)
      return [...prev, row]
    })
    setSaving(false)
  }

  async function removeRow(rowId: string) {
    await deleteAnnexeRow(rowId)
    setRows(prev => prev.filter(r => r.rowId !== rowId))
  }

  async function importRows(newRows: AnnexeRow[]) {
    setSaving(true)
    for (const row of newRows) {
      await setAnnexeRow(row)
    }
    setRows(newRows)
    setSaving(false)
  }

  return {
    annexes,
    rows,
    loading,
    saving,
    createAnnexe,
    removeAnnexe,
    saveRow,
    removeRow,
    importRows,
    setRows,
    setAnnexes,
  }
}
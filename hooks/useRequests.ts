"use client"

import { useState, useEffect } from "react"
import {
  getRequestsByAdmin,
  getRequestsByWorker,
  setRequest,
  updateRequest,
  deleteRequest,
} from "@/lib/firestore"
import type { MaterialRequest } from "@/types"
import { useAuth } from "@/hooks/useAuth"

export function useRequests() {
  const { appUser }                         = useAuth()
  const [requests, setRequests]             = useState<MaterialRequest[]>([])
  const [loading,  setLoading]              = useState(true)

  useEffect(() => {
    if (!appUser) return
    async function load() {
      try {
        let data: MaterialRequest[]
        if (appUser!.role === "worker") {
          data = await getRequestsByWorker(appUser!.uid)
        } else {
          data = await getRequestsByAdmin(appUser!.adminId)
        }
        setRequests(data)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [appUser])

  async function create(params: {
    assignedTo:     string
    assignedToName: string
    name:           string
    quantity:       number
    unite:          string
    deadline:       number | null
    notes:          string
  }): Promise<string> {
    if (!appUser) throw new Error("Not logged in")
    const requestId = `req_${Date.now()}_${Math.random().toString(36).slice(2)}`
    const req: MaterialRequest = {
      requestId,
      adminId:        appUser.adminId,
      createdBy:      appUser.uid,
      createdByName:  appUser.displayName,
      assignedTo:     params.assignedTo,
      assignedToName: params.assignedToName,
      name:           params.name,
      quantity:       params.quantity,
      unite:          params.unite,
      deadline:       params.deadline,
      notes:          params.notes,
      status:         "pending",
      fulfilledAt:    null,
      fulfilledNotes: "",
      reviewedBy:     null,
      createdAt:      Date.now(),
      updatedAt:      Date.now(),
    }
    await setRequest(req)
    setRequests(prev => [req, ...prev])
    return requestId
  }

  async function fulfill(requestId: string, notes: string) {
    await updateRequest(requestId, {
      status:         "fulfilled",
      fulfilledAt:    Date.now(),
      fulfilledNotes: notes,
    })
    setRequests(prev =>
      prev.map(r =>
        r.requestId === requestId
          ? { ...r, status: "fulfilled", fulfilledAt: Date.now(), fulfilledNotes: notes }
          : r
      )
    )
  }

  async function validate(
    requestId: string,
    status: "validated" | "rejected",
    reviewedBy: string
  ) {
    await updateRequest(requestId, { status, reviewedBy })
    setRequests(prev =>
      prev.map(r =>
        r.requestId === requestId
          ? { ...r, status, reviewedBy }
          : r
      )
    )
  }

  async function remove(requestId: string) {
    await deleteRequest(requestId)
    setRequests(prev => prev.filter(r => r.requestId !== requestId))
  }

  return { requests, loading, create, fulfill, validate, remove }
}
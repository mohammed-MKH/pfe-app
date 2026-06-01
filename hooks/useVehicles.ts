"use client"

import { useState, useEffect } from "react"
import {
  getVehiclesByAdmin,
  getTripsByAdmin,
  getTripsByDriver,
  getDemandsByAdmin,
  getDemandsByWorker,
  setVehicle,
  updateVehicle,
  deleteVehicle,
  setTrip,
  updateTrip,
  deleteTrip,
  setDemand,
  updateDemand,
} from "@/lib/firestore"
import type { Vehicle, VehicleTrip, VehicleDemand } from "@/types"
import { useAuth } from "@/hooks/useAuth"

export function useVehicles() {
  const { appUser }                     = useAuth()
  const [vehicles,  setVehicles]        = useState<Vehicle[]>([])
  const [trips,     setTrips]           = useState<VehicleTrip[]>([])
  const [demands,   setDemands]         = useState<VehicleDemand[]>([])
  const [loading,   setLoading]         = useState(true)

  useEffect(() => {
    if (!appUser) return
    async function load() {
      try {
        const v = await getVehiclesByAdmin(appUser!.adminId)
        setVehicles(v)
        if (appUser!.role === "worker") {
          const [t, d] = await Promise.all([
            getTripsByDriver(appUser!.uid),
            getDemandsByWorker(appUser!.uid),
          ])
          setTrips(t)
          setDemands(d)
        } else {
          const [t, d] = await Promise.all([
            getTripsByAdmin(appUser!.adminId),
            getDemandsByAdmin(appUser!.adminId),
          ])
          setTrips(t)
          setDemands(d)
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [appUser])

  // ── VEHICLES ────────────────────────────────────────────────────────────

  async function addVehicle(params: {
    name:     string
    plate:    string
    type:     "company" | "personal"
    brand:    string
    model:    string
    year:     string
    location: string
    notes:    string
  }): Promise<string> {
    if (!appUser) throw new Error("Not logged in")
    const vehicleId = `veh_${Date.now()}_${Math.random().toString(36).slice(2)}`
    const vehicle: Vehicle = {
      vehicleId,
      adminId:      appUser.adminId,
      name:         params.name,
      plate:        params.plate,
      type:         params.type,
      brand:        params.brand,
      model:        params.model,
      year:         params.year,
      status:       "available",
      assignedTo:   null,
      assignedName: null,
      assignedAt:   null,
      location:     params.location,
      notes:        params.notes,
      createdBy:    appUser.uid,
      createdAt:    Date.now(),
    }
    await setVehicle(vehicle)
    setVehicles(prev => [...prev, vehicle])
    return vehicleId
  }

  async function assignVehicle(
    vehicleId: string,
    uid: string,
    name: string
  ) {
    await updateVehicle(vehicleId, {
      assignedTo:   uid,
      assignedName: name,
      assignedAt:   Date.now(),
      status:       "assigned",
    })
    setVehicles(prev =>
      prev.map(v =>
        v.vehicleId === vehicleId
          ? { ...v, assignedTo: uid, assignedName: name, assignedAt: Date.now(), status: "assigned" }
          : v
      )
    )
  }

  async function unassignVehicle(vehicleId: string) {
    await updateVehicle(vehicleId, {
      assignedTo:   null,
      assignedName: null,
      assignedAt:   null,
      status:       "available",
    })
    setVehicles(prev =>
      prev.map(v =>
        v.vehicleId === vehicleId
          ? { ...v, assignedTo: null, assignedName: null, assignedAt: null, status: "available" }
          : v
      )
    )
  }

  async function removeVehicle(vehicleId: string) {
    await deleteVehicle(vehicleId)
    setVehicles(prev => prev.filter(v => v.vehicleId !== vehicleId))
  }

  // ── TRIPS ────────────────────────────────────────────────────────────────

  async function addTrip(params: {
    vehicleId:     string
    date:          number
    destination:   string
    departure:     string
    distanceKm:    number
    fuelCost:      number
    tollCost:      number
    otherCost:     number
    paymentMethod: "cash" | "card" | "jawaz" | "autoroute"
    cardRef:       string
    notes:         string
  }): Promise<string> {
    if (!appUser) throw new Error("Not logged in")
    const tripId = `trip_${Date.now()}_${Math.random().toString(36).slice(2)}`
    const trip: VehicleTrip = {
      tripId,
      vehicleId:     params.vehicleId,
      adminId:       appUser.adminId,
      driverId:      appUser.uid,
      driverName:    appUser.displayName,
      date:          params.date,
      destination:   params.destination,
      departure:     params.departure,
      distanceKm:    params.distanceKm,
      fuelCost:      params.fuelCost,
      tollCost:      params.tollCost,
      otherCost:     params.otherCost,
      paymentMethod: params.paymentMethod,
      cardRef:       params.cardRef,
      notes:         params.notes,
      status:        "pending",
      reviewedBy:    null,
      createdAt:     Date.now(),
    }
    await setTrip(trip)
    setTrips(prev => [trip, ...prev])
    return tripId
  }

  async function reviewTrip(
    tripId: string,
    status: "approved" | "rejected",
    reviewedBy: string
  ) {
    await updateTrip(tripId, { status, reviewedBy })
    setTrips(prev =>
      prev.map(t =>
        t.tripId === tripId ? { ...t, status, reviewedBy } : t
      )
    )
  }

  async function removeTrip(tripId: string) {
    await deleteTrip(tripId)
    setTrips(prev => prev.filter(t => t.tripId !== tripId))
  }

  // ── DEMANDS ──────────────────────────────────────────────────────────────

  async function addDemand(params: {
    vehicleId:   string
    date:        number
    destination: string
    reason:      string
  }): Promise<string> {
    if (!appUser) throw new Error("Not logged in")
    const demandId = `dem_${Date.now()}_${Math.random().toString(36).slice(2)}`
    const demand: VehicleDemand = {
      demandId,
      vehicleId:     params.vehicleId,
      adminId:       appUser.adminId,
      requestedBy:   appUser.uid,
      requesterName: appUser.displayName,
      date:          params.date,
      destination:   params.destination,
      reason:        params.reason,
      status:        "pending",
      reviewedBy:    null,
      createdAt:     Date.now(),
    }
    await setDemand(demand)
    setDemands(prev => [demand, ...prev])
    return demandId
  }

  async function reviewDemand(
    demandId: string,
    status: "approved" | "rejected",
    reviewedBy: string
  ) {
    await updateDemand(demandId, { status, reviewedBy })
    setDemands(prev =>
      prev.map(d =>
        d.demandId === demandId ? { ...d, status, reviewedBy } : d
      )
    )
  }

  return {
    vehicles,
    trips,
    demands,
    loading,
    addVehicle,
    assignVehicle,
    unassignVehicle,
    removeVehicle,
    addTrip,
    reviewTrip,
    removeTrip,
    addDemand,
    reviewDemand,
  }
}
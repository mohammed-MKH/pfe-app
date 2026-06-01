import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore"
import { db } from "./firebase"
import type {
  AppUser, Admin, Product, AnnexeRow, Annexe, Message
} from "@/types"

// ── USERS ─────────────────────────────────────────────────────────────────

export async function getUser(uid: string): Promise<AppUser | null> {
  const snap = await getDoc(doc(db, "users", uid))
  return snap.exists() ? (snap.data() as AppUser) : null
}

export async function setUser(user: AppUser): Promise<void> {
  await setDoc(doc(db, "users", user.uid), user)
}

export async function updateUser(
  uid: string,
  data: Partial<AppUser>
): Promise<void> {
  await updateDoc(doc(db, "users", uid), data)
}

export async function getUsersByAdmin(adminId: string): Promise<AppUser[]> {
  const q = query(
    collection(db, "users"),
    where("adminId", "==", adminId)
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => d.data() as AppUser)
}

// ── ADMINS ────────────────────────────────────────────────────────────────

export async function getAdmin(adminId: string): Promise<Admin | null> {
  const snap = await getDoc(doc(db, "admins", adminId))
  return snap.exists() ? (snap.data() as Admin) : null
}

export async function getAllAdmins(): Promise<Admin[]> {
  const snap = await getDocs(collection(db, "admins"))
  return snap.docs.map(d => d.data() as Admin)
}

export async function setAdmin(admin: Admin): Promise<void> {
  await setDoc(doc(db, "admins", admin.adminId), admin)
}

export async function updateAdmin(
  adminId: string,
  data: Partial<Admin>
): Promise<void> {
  await updateDoc(doc(db, "admins", adminId), data)
}

// ── PRODUCTS ──────────────────────────────────────────────────────────────

export async function getProductsByAdmin(adminId: string): Promise<Product[]> {
  const q = query(
    collection(db, "products"),
    where("adminId", "==", adminId),
    orderBy("createdAt", "desc")
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => d.data() as Product)
}

export async function getProductsByUser(uid: string): Promise<Product[]> {
  const q = query(
    collection(db, "products"),
    where("submittedBy", "==", uid),
    orderBy("createdAt", "desc")
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => d.data() as Product)
}

export async function setProduct(product: Product): Promise<void> {
  await setDoc(doc(db, "products", product.productId), product)
}

export async function updateProduct(
  productId: string,
  data: Partial<Product>
): Promise<void> {
  await updateDoc(doc(db, "products", productId), {
    ...data,
    updatedAt: Date.now(),
  })
}

export async function deleteProduct(productId: string): Promise<void> {
  await deleteDoc(doc(db, "products", productId))
}

// ── MESSAGES ─────────────────────────────────────────────────────────────

export function subscribeMessages(
  adminId: string,
  callback: (messages: Message[]) => void
) {
  const q = query(
    collection(db, "messages"),
    where("adminId", "==", adminId),
    orderBy("createdAt", "asc")
  )
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => d.data() as Message))
  })
}

export async function sendMessage(message: Message): Promise<void> {
  await setDoc(doc(db, "messages", message.messageId), message)
}

export async function deleteMessage(messageId: string): Promise<void> {
  await deleteDoc(doc(db, "messages", messageId))
}

export async function editMessage(
  messageId: string,
  text: string
): Promise<void> {
  await updateDoc(doc(db, "messages", messageId), {
    text,
    edited: true,
  })
}

// ── ANNEXE ────────────────────────────────────────────────────────────────

export async function getAnnexesByAdmin(adminId: string): Promise<Annexe[]> {
  const q = query(
    collection(db, "annexes"),
    where("adminId", "==", adminId)
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => d.data() as Annexe)
}

export async function setAnnexe(annexe: Annexe): Promise<void> {
  await setDoc(doc(db, "annexes", annexe.annexeId), annexe)
}

export async function deleteAnnexe(annexeId: string): Promise<void> {
  await deleteDoc(doc(db, "annexes", annexeId))
  const q = query(
    collection(db, "annexeRows"),
    where("annexeId", "==", annexeId)
  )
  const snap = await getDocs(q)
  await Promise.all(snap.docs.map(d => deleteDoc(d.ref)))
}

export async function getAnnexeRows(
  annexeId: string,
  adminId: string
): Promise<AnnexeRow[]> {
  const q = query(
    collection(db, "annexeRows"),
    where("annexeId", "==", annexeId),
    where("adminId", "==", adminId),
    orderBy("order", "asc")
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => d.data() as AnnexeRow)
}

export async function setAnnexeRow(row: AnnexeRow): Promise<void> {
  await setDoc(doc(db, "annexeRows", row.rowId), row)
}

export async function updateAnnexeRow(
  rowId: string,
  data: Partial<AnnexeRow>
): Promise<void> {
  await updateDoc(doc(db, "annexeRows", rowId), {
    ...data,
    updatedAt: Date.now(),
  })
}

export async function deleteAnnexeRow(rowId: string): Promise<void> {
  await deleteDoc(doc(db, "annexeRows", rowId))
}

// ── ROLE SWITCH ───────────────────────────────────────────────────────────

export async function switchUserRole(
  uid: string,
  newRole: "admin" | "manager" | "worker"
): Promise<void> {
  await updateDoc(doc(db, "users", uid), { role: newRole })
}

// ── MATERIAL REQUESTS ─────────────────────────────────────────────────────

import type { MaterialRequest } from "@/types"
import type { Vehicle, VehicleTrip, VehicleDemand } from "@/types"
import type { Conversation } from "@/types"

export async function getRequestsByAdmin(adminId: string): Promise<MaterialRequest[]> {
  const q = query(
    collection(db, "requests"),
    where("adminId", "==", adminId),
    orderBy("createdAt", "desc")
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => d.data() as MaterialRequest)
}

export async function getRequestsByWorker(uid: string): Promise<MaterialRequest[]> {
  const q = query(
    collection(db, "requests"),
    where("assignedTo", "==", uid),
    orderBy("createdAt", "desc")
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => d.data() as MaterialRequest)
}

export async function setRequest(req: MaterialRequest): Promise<void> {
  await setDoc(doc(db, "requests", req.requestId), req)
}

export async function updateRequest(
  requestId: string,
  data: Partial<MaterialRequest>
): Promise<void> {
  await updateDoc(doc(db, "requests", requestId), {
    ...data, updatedAt: Date.now(),
  })
}

export async function deleteRequest(requestId: string): Promise<void> {
  await deleteDoc(doc(db, "requests", requestId))
}

// ── VEHICLES ──────────────────────────────────────────────────────────────

export async function getVehiclesByAdmin(adminId: string): Promise<Vehicle[]> {
  const q = query(collection(db, "vehicles"), where("adminId", "==", adminId))
  const snap = await getDocs(q)
  return snap.docs.map(d => d.data() as Vehicle)
}

export async function setVehicle(vehicle: Vehicle): Promise<void> {
  await setDoc(doc(db, "vehicles", vehicle.vehicleId), vehicle)
}

export async function updateVehicle(
  vehicleId: string,
  data: Partial<Vehicle>
): Promise<void> {
  await updateDoc(doc(db, "vehicles", vehicleId), data)
}

export async function deleteVehicle(vehicleId: string): Promise<void> {
  await deleteDoc(doc(db, "vehicles", vehicleId))
}

export async function getTripsByAdmin(adminId: string): Promise<VehicleTrip[]> {
  const q = query(
    collection(db, "vehicleTrips"),
    where("adminId", "==", adminId),
    orderBy("createdAt", "desc")
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => d.data() as VehicleTrip)
}

export async function getTripsByDriver(uid: string): Promise<VehicleTrip[]> {
  const q = query(
    collection(db, "vehicleTrips"),
    where("driverId", "==", uid),
    orderBy("createdAt", "desc")
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => d.data() as VehicleTrip)
}

export async function setTrip(trip: VehicleTrip): Promise<void> {
  await setDoc(doc(db, "vehicleTrips", trip.tripId), trip)
}

export async function updateTrip(
  tripId: string,
  data: Partial<VehicleTrip>
): Promise<void> {
  await updateDoc(doc(db, "vehicleTrips", tripId), data)
}

export async function deleteTrip(tripId: string): Promise<void> {
  await deleteDoc(doc(db, "vehicleTrips", tripId))
}

export async function getDemandsByAdmin(adminId: string): Promise<VehicleDemand[]> {
  const q = query(
    collection(db, "vehicleDemands"),
    where("adminId", "==", adminId),
    orderBy("createdAt", "desc")
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => d.data() as VehicleDemand)
}

export async function getDemandsByWorker(uid: string): Promise<VehicleDemand[]> {
  const q = query(
    collection(db, "vehicleDemands"),
    where("requestedBy", "==", uid),
    orderBy("createdAt", "desc")
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => d.data() as VehicleDemand)
}

export async function setDemand(demand: VehicleDemand): Promise<void> {
  await setDoc(doc(db, "vehicleDemands", demand.demandId), demand)
}

export async function updateDemand(
  demandId: string,
  data: Partial<VehicleDemand>
): Promise<void> {
  await updateDoc(doc(db, "vehicleDemands", demandId), data)
}

// ── CONVERSATIONS ─────────────────────────────────────────────────────────

export async function getConversationsByUser(
  uid: string,
  adminId: string
): Promise<Conversation[]> {
  const q = query(
    collection(db, "conversations"),
    where("adminId", "==", adminId),
    where("members", "array-contains", uid)
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => d.data() as Conversation)
}

export async function setConversation(conv: Conversation): Promise<void> {
  await setDoc(doc(db, "conversations", conv.conversationId), conv)
}

export async function updateConversation(
  conversationId: string,
  data: Partial<Conversation>
): Promise<void> {
  await updateDoc(doc(db, "conversations", conversationId), data)
}

export async function deleteConversation(conversationId: string): Promise<void> {
  await deleteDoc(doc(db, "conversations", conversationId))
}

export function subscribeConversationMessages(
  conversationId: string,
  callback: (messages: Message[]) => void
) {
  const q = query(
    collection(db, "messages"),
    where("conversationId", "==", conversationId),
    orderBy("createdAt", "asc")
  )
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => d.data() as Message))
  })
}
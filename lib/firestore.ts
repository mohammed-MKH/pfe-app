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
import type { AppUser, Admin, Product, AnnexeRow, Annexe, Message } from "@/types"

export async function getUser(uid: string): Promise<AppUser | null> {
  const snap = await getDoc(doc(db, "users", uid))
  return snap.exists() ? (snap.data() as AppUser) : null
}

export async function setUser(user: AppUser): Promise<void> {
  await setDoc(doc(db, "users", user.uid), user)
}

export async function updateUser(uid: string, data: Partial<AppUser>): Promise<void> {
  await updateDoc(doc(db, "users", uid), data)
}

export async function getUsersByAdmin(adminId: string): Promise<AppUser[]> {
  const q = query(collection(db, "users"), where("adminId", "==", adminId))
  const snap = await getDocs(q)
  return snap.docs.map(d => d.data() as AppUser)
}

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

export async function updateAdmin(adminId: string, data: Partial<Admin>): Promise<void> {
  await updateDoc(doc(db, "admins", adminId), data)
}

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

export async function updateProduct(productId: string, data: Partial<Product>): Promise<void> {
  await updateDoc(doc(db, "products", productId), {
    ...data,
    updatedAt: Date.now(),
  })
}

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

export async function getAnnexesByAdmin(adminId: string): Promise<Annexe[]> {
  const q = query(
    collection(db, "annexes"),
    where("adminId", "==", adminId)
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => d.data() as Annexe)
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

export async function setAnnexe(annexe: Annexe): Promise<void> {
  await setDoc(doc(db, "annexes", annexe.annexeId), annexe)
}

export async function deleteAnnexe(annexeId: string): Promise<void> {
  await deleteDoc(doc(db, "annexes", annexeId))
}
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage"
import { storage } from "./firebase"

export async function uploadProductPhoto(
  adminId: string,
  productId: string,
  file: File
): Promise<string> {
  const path = `products/${adminId}/${productId}/${Date.now()}_${file.name}`
  const r = ref(storage, path)
  await uploadBytes(r, file)
  return getDownloadURL(r)
}

export async function uploadMessagePhoto(
  adminId: string,
  messageId: string,
  file: File
): Promise<string> {
  const path = `messages/${adminId}/${messageId}/${Date.now()}_${file.name}`
  const r = ref(storage, path)
  await uploadBytes(r, file)
  return getDownloadURL(r)
}

export async function uploadAvatar(uid: string, file: File): Promise<string> {
  const path = `avatars/${uid}/${Date.now()}_${file.name}`
  const r = ref(storage, path)
  await uploadBytes(r, file)
  return getDownloadURL(r)
}

export async function deleteFile(url: string): Promise<void> {
  try {
    const r = ref(storage, url)
    await deleteObject(r)
  } catch {
    // File already deleted or not found — ignore
  }
}
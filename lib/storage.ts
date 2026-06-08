const CLOUD_NAME    = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!

async function uploadToCloudinary(file: File, folder: string): Promise<string> {
  const formData = new FormData()
  formData.append("file", file)
  formData.append("upload_preset", UPLOAD_PRESET)
  formData.append("folder", folder)

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: "POST", body: formData }
  )
  if (!res.ok) throw new Error("Upload failed")
  const data = await res.json()
  return data.secure_url
}

export async function uploadMessagePhoto(
  adminId:   string,
  messageId: string,
  file:      File
): Promise<string> {
  return uploadToCloudinary(file, `messages/${adminId}`)
}

export async function uploadProductPhoto(
  adminId:   string,
  productId: string,
  file:      File
): Promise<string> {
  return uploadToCloudinary(file, `products/${adminId}`)
}

export async function uploadAvatar(uid: string, file: File): Promise<string> {
  return uploadToCloudinary(file, `avatars/${uid}`)
}

export async function uploadLogo(adminId: string, file: File): Promise<string> {
  return uploadToCloudinary(file, `logos/${adminId}`)
}

export async function deleteFile(_url: string): Promise<void> {
  // Cloudinary deletion requires server-side — skipped
}
'use server'

import { auth } from "@/lib/auth"
import { cloudinary } from "@/lib/cloudinary"

export async function deleteCloudinaryImage(publicId: string) {
  const session = await auth()
  if (!session?.user) {
    throw new Error("Unauthorized")
  }

  try {
    await cloudinary.uploader.destroy(publicId)
    return { success: true }
  } catch (error) {
    console.error("Failed to delete from Cloudinary:", error)
    return { success: false, error: "Failed to delete image" }
  }
}

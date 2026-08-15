import { auth } from "@/lib/auth"
import { cloudinary } from "@/lib/cloudinary"
import { NextResponse } from "next/server"

export const POST = auth(async (req) => {
  if (!req.auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const folder = body.folder || "lunawat/general"
  
  const timestamp = Math.round(new Date().getTime() / 1000)

  try {
    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp,
        folder,
      },
      process.env.CLOUDINARY_API_SECRET!
    )

    return NextResponse.json({
      timestamp,
      signature,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      folder,
    })
  } catch (error) {
    console.error("Cloudinary sign error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
})

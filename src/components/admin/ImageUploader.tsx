'use client'

import React, { useState, useRef } from "react"
import { Image as ImageIcon, Loader2, X, UploadCloud } from "lucide-react"
import { deleteCloudinaryImage } from "@/actions/cloudinary"

interface ImageUploaderProps {
  label?: string
  value?: string // The Cloudinary URL or publicId
  publicId?: string
  folder?: string
  onChange: (url: string, publicId: string) => void
  onRemove?: () => void
  className?: string
  aspectRatio?: string
}

export function ImageUploader({ 
  label, 
  value, 
  publicId,
  folder = "lunawat/general", 
  onChange, 
  onRemove,
  className = "",
  aspectRatio = "video" // for UI preview purposes
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setError(null)

    try {
      // 1. Get signature
      const signRes = await fetch("/api/cloudinary/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder })
      })

      if (!signRes.ok) throw new Error("Failed to get upload signature")
      
      const { signature, timestamp, cloudName, apiKey, folder: signedFolder } = await signRes.json()

      // 2. Upload to Cloudinary
      const formData = new FormData()
      formData.append("file", file)
      formData.append("api_key", apiKey)
      formData.append("timestamp", timestamp.toString())
      formData.append("signature", signature)
      formData.append("folder", signedFolder)

      const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: formData
      })

      if (!uploadRes.ok) throw new Error("Failed to upload image")

      const data = await uploadRes.json()
      
      onChange(data.secure_url, data.public_id)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleRemove = async () => {
    if (publicId && window.confirm("Delete this image?")) {
      try {
        await deleteCloudinaryImage(publicId)
      } catch (err) {
        console.error("Failed to delete image:", err)
        // Note: we might want to still remove it from the form even if cloud delete fails
      }
    }
    onRemove?.()
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {label && <label className="block text-sm font-medium text-zinc-900">{label}</label>}
      
      {value ? (
        <div className="relative group overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50 aspect-video flex items-center justify-center">
          {/* If the value is a full URL, we can just render it. If we have a publicId, we can use CldImage for optimization if we want, but since it's admin preview, a normal img tag is fine. */}
          <img src={value} alt="Uploaded preview" className="w-full h-full object-contain" />
          
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 bg-white text-black rounded-full hover:scale-105 transition-transform"
              title="Replace image"
            >
              <UploadCloud size={18} />
            </button>
            {onRemove && (
              <button
                type="button"
                onClick={handleRemove}
                className="p-2 bg-red-500 text-white rounded-full hover:scale-105 transition-transform"
                title="Remove image"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="w-full aspect-video border-2 border-dashed border-zinc-300 rounded-xl flex flex-col items-center justify-center gap-2 text-zinc-500 hover:text-black hover:border-black hover:bg-zinc-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUploading ? (
            <>
              <Loader2 className="animate-spin" size={24} />
              <span className="text-sm font-medium">Uploading...</span>
            </>
          ) : (
            <>
              <ImageIcon size={24} />
              <span className="text-sm font-medium">Click to upload image</span>
            </>
          )}
        </button>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
    </div>
  )
}

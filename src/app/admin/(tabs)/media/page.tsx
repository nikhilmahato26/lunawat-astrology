import { prisma } from "@/lib/prisma"
import { MediaForm } from "./MediaForm"

export default async function MediaTab() {
  const images = await prisma.galleryItem.findMany({
    orderBy: { order: 'asc' }
  })
  
  const videos = await prisma.video.findMany({
    orderBy: { order: 'asc' }
  })

  return (
    <div>
      <h2 className="text-2xl font-black mb-6">Media & Gallery</h2>
      <MediaForm initialImages={images} initialVideos={videos} />
    </div>
  )
}

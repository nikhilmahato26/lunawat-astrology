'use client'

import { useState, useTransition } from "react"
import { RepeatableList } from "@/components/admin/RepeatableList"
import { ImageUploader } from "@/components/admin/ImageUploader"
import { TextField, SaveBar } from "@/components/admin/ui"
import { updateMedia } from "@/actions/settings"
import { Trash2 } from "lucide-react"

type ImageItem = {
  imageUrl: string
  publicId: string
}

type VideoItem = {
  youtubeUrl: string
  videoId: string
  title: string
}

function extractYouTubeId(url: string) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

export function MediaForm({ initialImages, initialVideos }: { initialImages: any[], initialVideos: any[] }) {
  const [images, setImages] = useState<ImageItem[]>(
    initialImages.map(img => ({ imageUrl: img.imageUrl, publicId: img.publicId }))
  )
  const [videos, setVideos] = useState<VideoItem[]>(
    initialVideos.map(vid => ({ youtubeUrl: vid.youtubeUrl, videoId: vid.videoId, title: vid.title || "" }))
  )
  const [isPending, startTransition] = useTransition()
  
  const isDirty = 
    JSON.stringify(images) !== JSON.stringify(initialImages.map(img => ({ imageUrl: img.imageUrl, publicId: img.publicId }))) ||
    JSON.stringify(videos) !== JSON.stringify(initialVideos.map(vid => ({ youtubeUrl: vid.youtubeUrl, videoId: vid.videoId, title: vid.title || "" })))

  const handleSave = () => {
    startTransition(async () => {
      await updateMedia({ images, videos })
    })
  }

  return (
    <div className="max-w-3xl pb-24 space-y-8">
      {/* Images Section */}
      <div className="bg-zinc-50 border border-zinc-200 p-6 rounded-2xl">
        <h3 className="font-bold text-lg mb-4">Gallery Images</h3>
        <p className="text-sm text-zinc-500 mb-6">Upload images to display in the gallery section.</p>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
          {images.map((img, index) => (
            <div key={index} className="relative group aspect-square rounded-xl overflow-hidden border border-zinc-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.imageUrl} alt="Gallery item" className="object-cover w-full h-full" />
              <button 
                onClick={() => setImages(images.filter((_, i) => i !== index))}
                className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
        
        <ImageUploader 
          value="" 
          onChange={(url, publicId) => {
            if (url && publicId) {
              setImages([...images, { imageUrl: url, publicId }])
            }
          }}
          label="Upload New Image"
        />
      </div>

      {/* Videos Section */}
      <div className="bg-zinc-50 border border-zinc-200 p-6 rounded-2xl">
        <h3 className="font-bold text-lg mb-4">YouTube Videos</h3>
        <p className="text-sm text-zinc-500 mb-6">Add links to your YouTube videos.</p>

        <RepeatableList
          items={videos}
          onChange={setVideos}
          addButtonText="Add Video"
          newItemFactory={() => ({ youtubeUrl: "", videoId: "", title: "" })}
          renderItem={(video, index, update) => (
            <div className="space-y-4 pt-1">
              <TextField
                label="YouTube URL"
                value={video.youtubeUrl}
                onChange={(e) => {
                  const url = e.target.value
                  update(index, { ...video, youtubeUrl: url, videoId: extractYouTubeId(url) || "" })
                }}
                placeholder="https://www.youtube.com/watch?v=..."
              />
              {video.videoId && (
                <div className="aspect-video w-full max-w-sm rounded-lg overflow-hidden border border-zinc-200">
                  <iframe 
                    width="100%" 
                    height="100%" 
                    src={`https://www.youtube.com/embed/${video.videoId}`} 
                    title="YouTube video player" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                  ></iframe>
                </div>
              )}
            </div>
          )}
        />
      </div>

      <SaveBar isDirty={isDirty} isPending={isPending} onSave={handleSave} />
    </div>
  )
}

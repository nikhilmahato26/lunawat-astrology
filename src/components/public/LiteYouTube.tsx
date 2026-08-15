'use client'

import { useState } from "react"
import { Play } from "lucide-react"

export function LiteYouTube({ videoId, title = "YouTube Video" }: { videoId: string, title?: string }) {
  const [isPlaying, setIsPlaying] = useState(false)

  if (isPlaying) {
    return (
      <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-lg">
        <iframe
          width="100%"
          height="100%"
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
          title={title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
    )
  }

  return (
    <div 
      className="aspect-video w-full rounded-2xl overflow-hidden relative cursor-pointer group bg-zinc-900 shadow-lg"
      onClick={() => setIsPlaying(true)}
    >
      <img
        src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
        alt={title}
        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300"
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center text-white shadow-xl shadow-red-600/30 group-hover:scale-110 group-hover:bg-red-500 transition-all duration-300">
          <Play size={32} className="ml-1" fill="currentColor" />
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState } from "react"
import { FadeIn } from "./FadeIn"
import { X } from "lucide-react"

type GalleryItem = {
  id: string
  imageUrl: string
  caption?: string | null
}

export function GalleryGrid({ gallery }: { gallery: GalleryItem[] }) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {gallery.map((img, i) => (
          <FadeIn key={img.id} delay={i * 0.1}>
            <button 
              onClick={() => setSelectedImage(img.imageUrl)}
              className="block aspect-square w-full rounded-3xl overflow-hidden shadow-lg shadow-orange-900/5 bg-brand-cream relative group cursor-pointer border-none p-0 focus:outline-none focus:ring-4 focus:ring-brand-orange/50"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.imageUrl} alt={img.caption || "Gallery Image"} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                <span className="opacity-0 group-hover:opacity-100 bg-white/90 text-brand-brown text-sm font-bold py-2 px-4 rounded-full shadow-lg transition-opacity duration-300 transform scale-95 group-hover:scale-100">
                  View Full
                </span>
              </div>
            </button>
          </FadeIn>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 md:p-8 backdrop-blur-sm transition-opacity"
          onClick={() => setSelectedImage(null)}
        >
          <button 
            className="absolute top-6 right-6 text-white/70 hover:text-white bg-black/50 hover:bg-black/80 rounded-full p-2 transition-all focus:outline-none"
            onClick={() => setSelectedImage(null)}
          >
            <X size={32} />
          </button>
          
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={selectedImage} 
            alt="Fullscreen preview" 
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" 
            onClick={(e) => e.stopPropagation()} 
          />
        </div>
      )}
    </>
  )
}

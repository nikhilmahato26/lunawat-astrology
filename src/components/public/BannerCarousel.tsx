'use client'

import { useEffect, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface BannerItem {
  id: string
  imageUrl: string
  title: string | null
  subtitle: string | null
  linkUrl: string | null
}

// Fallback ratio used only until the active banner's real image has loaded and reported
// its natural size — after that the container snaps to the image's true aspect ratio
// instead of a fixed box that would crop it.
const FALLBACK_RATIO = 21 / 9

export function BannerCarousel({ banners }: { banners: BannerItem[] }) {
  const [index, setIndex] = useState(0)
  const [ratios, setRatios] = useState<Record<string, number>>({})

  useEffect(() => {
    if (banners.length < 2) return
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % banners.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [banners.length])

  if (banners.length === 0) return null

  const goTo = (i: number) => setIndex((i + banners.length) % banners.length)

  const activeRatio = ratios[banners[index].id] ?? FALLBACK_RATIO

  return (
    <div
      className="relative w-full rounded-[2rem] overflow-hidden shadow-2xl shadow-brand-orange/10 transition-[aspect-ratio] duration-300"
      style={{ aspectRatio: activeRatio }}
    >
      {banners.map((banner, i) => {
        const content = (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={banner.imageUrl}
              alt={banner.title || "Banner"}
              className="absolute inset-0 w-full h-full object-contain"
              onLoad={(e) => {
                const { naturalWidth, naturalHeight } = e.currentTarget
                if (!naturalWidth || !naturalHeight) return
                setRatios((prev) =>
                  prev[banner.id] ? prev : { ...prev, [banner.id]: naturalWidth / naturalHeight }
                )
              }}
            />
            {(banner.title || banner.subtitle) && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent flex flex-col justify-end p-6 md:p-12">
                {banner.title && (
                  <h3 className="font-serif text-2xl md:text-4xl font-bold text-white mb-2 leading-tight">{banner.title}</h3>
                )}
                {banner.subtitle && (
                  <p className="text-white/90 text-sm md:text-lg font-medium max-w-xl">{banner.subtitle}</p>
                )}
              </div>
            )}
          </>
        )

        return (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-opacity duration-700 ${i === index ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
          >
            {banner.linkUrl ? (
              <a href={banner.linkUrl} className="block absolute inset-0">
                {content}
              </a>
            ) : (
              <div className="absolute inset-0">{content}</div>
            )}
          </div>
        )
      })}

      {banners.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => goTo(index - 1)}
            aria-label="Previous banner"
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-colors"
          >
            <ChevronLeft size={20} className="text-brand-brown" />
          </button>
          <button
            type="button"
            onClick={() => goTo(index + 1)}
            aria-label="Next banner"
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-colors"
          >
            <ChevronRight size={20} className="text-brand-brown" />
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {banners.map((banner, i) => (
              <button
                key={banner.id}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Go to banner ${i + 1}`}
                className={`h-2 rounded-full transition-all ${i === index ? 'w-8 bg-white' : 'w-2 bg-white/50 hover:bg-white/80'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

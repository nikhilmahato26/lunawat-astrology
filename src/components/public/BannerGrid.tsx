interface BannerItem {
  id: string
  imageUrl: string
  title: string | null
  subtitle: string | null
  linkUrl: string | null
}

// Static layout — no carousel/auto-rotate. Two columns on desktop, one per row on mobile.
// Each image keeps its true aspect ratio (w-full h-auto, no cropping) instead of being
// forced into a fixed box.
export function BannerGrid({ banners }: { banners: BannerItem[] }) {
  if (banners.length === 0) return null

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {banners.map((banner) => {
        const content = (
          <div className="relative rounded-[2rem] overflow-hidden shadow-2xl shadow-brand-orange/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={banner.imageUrl}
              alt={banner.title || "Banner"}
              className="block w-full h-auto"
            />
            {(banner.title || banner.subtitle) && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent flex flex-col justify-end p-6 md:p-8">
                {banner.title && (
                  <h3 className="font-serif text-xl md:text-2xl font-bold text-white mb-1 leading-tight">{banner.title}</h3>
                )}
                {banner.subtitle && (
                  <p className="text-white/90 text-sm font-medium">{banner.subtitle}</p>
                )}
              </div>
            )}
          </div>
        )

        return banner.linkUrl ? (
          <a key={banner.id} href={banner.linkUrl} className="block">
            {content}
          </a>
        ) : (
          <div key={banner.id}>{content}</div>
        )
      })}
    </div>
  )
}

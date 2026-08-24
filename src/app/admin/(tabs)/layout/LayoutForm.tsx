'use client'

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { GripVertical, Eye, EyeOff } from "lucide-react"
import { SaveBar } from "@/components/admin/ui"
import { updateSiteSettings } from "@/actions/settings"

export const SECTION_META: Record<string, string> = {
  stats: "Stats Counters",
  whyChoose: "Why Choose Me",
  about: "About",
  services: "Services / Pricing",
  certifications: "Certifications",
  banners: "Banners",
  testimonials: "Testimonials",
  gallery: "Gallery",
  videos: "Videos",
  faq: "FAQ",
  cta: "Call-to-Action Band",
}

type Visibility = Record<string, boolean>

export function LayoutForm({
  initialOrder,
  initialVisibility,
}: {
  initialOrder: string[]
  initialVisibility: Visibility
}) {
  const [order, setOrder] = useState<string[]>(initialOrder)
  const [visibility, setVisibility] = useState<Visibility>(initialVisibility)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  // Baseline updates after a successful save — comparing against the props directly would
  // leave isDirty stuck true forever post-save, since props on an already-mounted client
  // component never update themselves.
  const [saved, setSaved] = useState({ order: initialOrder, visibility: initialVisibility })

  const isDirty =
    JSON.stringify(order) !== JSON.stringify(saved.order) ||
    JSON.stringify(visibility) !== JSON.stringify(saved.visibility)

  const handleSave = () => {
    startTransition(async () => {
      await updateSiteSettings({
        sectionOrder: order,
        showStats: visibility.stats,
        showWhyChoose: visibility.whyChoose,
        showAbout: visibility.about,
        showServices: visibility.services,
        showCertifications: visibility.certifications,
        showBanners: visibility.banners,
        showTestimonials: visibility.testimonials,
        showGallery: visibility.gallery,
        showVideos: visibility.videos,
        showFaq: visibility.faq,
        showCta: visibility.cta,
      })
      setSaved({ order, visibility })
      router.refresh()
    })
  }

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return
    const next = [...order]
    const [moved] = next.splice(draggedIndex, 1)
    next.splice(index, 0, moved)
    setOrder(next)
    setDraggedIndex(index)
  }

  const handleDragEnd = () => setDraggedIndex(null)

  const toggleVisible = (key: string) => {
    setVisibility((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="max-w-2xl pb-24">
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold mb-1">Homepage Sections</h2>
          <p className="text-zinc-500 text-sm">
            Drag to reorder, or hide a section entirely. Hero, Contact, and the Footer are always fixed at the top and bottom.
          </p>
        </div>

        <div className="border border-zinc-200 rounded-xl overflow-hidden bg-zinc-50">
          <div className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-zinc-400 bg-white border-b border-zinc-200">
            Hero — fixed
          </div>

          {order.map((key, index) => {
            const visible = visibility[key] ?? true
            return (
              <div
                key={key}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`flex items-center gap-3 px-4 py-3 bg-white border-b border-zinc-100 last:border-0 transition-opacity ${
                  draggedIndex === index ? 'opacity-50' : 'opacity-100'
                } ${!visible ? 'bg-zinc-50' : ''}`}
              >
                <div className="cursor-grab active:cursor-grabbing text-zinc-400">
                  <GripVertical size={18} />
                </div>
                <span className={`flex-1 text-sm font-medium ${visible ? 'text-zinc-900' : 'text-zinc-400 line-through'}`}>
                  {SECTION_META[key] || key}
                </span>
                <button
                  type="button"
                  onClick={() => toggleVisible(key)}
                  aria-label={visible ? `Hide ${SECTION_META[key]}` : `Show ${SECTION_META[key]}`}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    visible
                      ? 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                      : 'bg-zinc-800 text-white hover:bg-zinc-700'
                  }`}
                >
                  {visible ? <Eye size={14} /> : <EyeOff size={14} />}
                  {visible ? 'Visible' : 'Hidden'}
                </button>
              </div>
            )
          })}

          <div className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-zinc-400 bg-white border-t border-zinc-200">
            Contact &amp; Footer — fixed
          </div>
        </div>
      </section>

      <SaveBar isDirty={isDirty} isPending={isPending} onSave={handleSave} />
    </div>
  )
}

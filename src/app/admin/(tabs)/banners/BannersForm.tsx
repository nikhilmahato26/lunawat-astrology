'use client'

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { TextField, SaveBar, ToggleSwitch } from "@/components/admin/ui"
import { RepeatableList } from "@/components/admin/RepeatableList"
import { ImageUploader } from "@/components/admin/ImageUploader"
import { updateBanners } from "@/actions/settings"
import type { Banner } from "@prisma/client"

type BannerItem = {
  id: string
  imageUrl: string
  publicId: string
  title: string
  subtitle: string
  linkUrl: string
  isActive: boolean
}

function toItem(b: Banner): BannerItem {
  return {
    id: b.id,
    imageUrl: b.imageUrl,
    publicId: b.publicId,
    title: b.title ?? "",
    subtitle: b.subtitle ?? "",
    linkUrl: b.linkUrl ?? "",
    isActive: b.isActive,
  }
}

export function BannersForm({ initialBanners }: { initialBanners: Banner[] }) {
  const initialItems = initialBanners.map(toItem)
  const [banners, setBanners] = useState<BannerItem[]>(initialItems)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  // Baseline updates after a successful save — comparing against the props directly would
  // leave isDirty stuck true forever post-save, since props on an already-mounted client
  // component never update themselves.
  const [saved, setSaved] = useState(initialItems)

  const isDirty = JSON.stringify(banners) !== JSON.stringify(saved)

  const handleSave = () => {
    startTransition(async () => {
      await updateBanners(banners)
      setSaved(banners)
      router.refresh()
    })
  }

  const renderBanner = (banner: BannerItem, index: number, updateItem: (idx: number, b: BannerItem) => void) => (
    <div className="space-y-4 pt-1">
      <ImageUploader
        value={banner.imageUrl}
        publicId={banner.publicId}
        folder="lunawat/banners"
        aspectRatio="video"
        onChange={(url, publicId) => updateItem(index, { ...banner, imageUrl: url, publicId })}
        onRemove={() => updateItem(index, { ...banner, imageUrl: "", publicId: "" })}
      />

      <div className="grid grid-cols-2 gap-4">
        <TextField
          label="Title (Optional)"
          value={banner.title}
          onChange={(e) => updateItem(index, { ...banner, title: e.target.value })}
        />
        <TextField
          label="Subtitle (Optional)"
          value={banner.subtitle}
          onChange={(e) => updateItem(index, { ...banner, subtitle: e.target.value })}
        />
      </div>

      <TextField
        label="Link URL (Optional)"
        value={banner.linkUrl}
        onChange={(e) => updateItem(index, { ...banner, linkUrl: e.target.value })}
        hint="Where the banner goes when clicked, e.g. /#services or https://wa.me/..."
      />

      <ToggleSwitch
        label="Active"
        checked={banner.isActive}
        onChange={(checked) => updateItem(index, { ...banner, isActive: checked })}
      />
    </div>
  )

  return (
    <div className="max-w-3xl pb-24">
      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-bold mb-1">Homepage Banners</h2>
          <p className="text-zinc-500 text-sm mb-4">
            Big promotional images shown near the top of your landing page. Drag to reorder — the first active banner shows first.
          </p>
        </div>

        <RepeatableList
          items={banners}
          onChange={setBanners}
          renderItem={renderBanner}
          addButtonText="Add Banner"
          newItemFactory={() => ({
            id: crypto.randomUUID(),
            imageUrl: "",
            publicId: "",
            title: "",
            subtitle: "",
            linkUrl: "",
            isActive: true,
          })}
        />
      </section>

      <SaveBar isDirty={isDirty} isPending={isPending} onSave={handleSave} />
    </div>
  )
}

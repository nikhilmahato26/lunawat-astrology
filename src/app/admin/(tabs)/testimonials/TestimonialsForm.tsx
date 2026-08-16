'use client'

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { TextField, TextArea, SaveBar, ToggleSwitch } from "@/components/admin/ui"
import { RepeatableList } from "@/components/admin/RepeatableList"
import { ImageUploader } from "@/components/admin/ImageUploader"
import { updateTestimonials } from "@/actions/settings"
import type { Testimonial } from "@prisma/client"

type TestimonialItem = {
  id: string
  name: string
  location: string
  rating: number
  message: string
  imageUrl: string
  isActive: boolean
}

function toItem(t: Testimonial): TestimonialItem {
  return {
    id: t.id,
    name: t.name,
    location: t.location ?? "",
    rating: t.rating,
    message: t.message,
    imageUrl: t.imageUrl ?? "",
    isActive: t.isActive,
  }
}

export function TestimonialsForm({ initialTestimonials }: { initialTestimonials: Testimonial[] }) {
  const initialItems = initialTestimonials.map(toItem)
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>(initialItems)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  // Baseline updates after a successful save — comparing against the props directly would
  // leave isDirty stuck true forever post-save, since props on an already-mounted client
  // component never update themselves.
  const [saved, setSaved] = useState(initialItems)

  const isDirty = JSON.stringify(testimonials) !== JSON.stringify(saved)

  const handleSave = () => {
    startTransition(async () => {
      await updateTestimonials(testimonials)
      setSaved(testimonials)
      router.refresh()
    })
  }

  const renderTestimonial = (t: TestimonialItem, index: number, updateItem: (idx: number, t: TestimonialItem) => void) => (
    <div className="space-y-4 pt-1">
      <div className="flex items-end gap-4">
        <div className="flex-1">
          <TextField
            label="Client Name"
            value={t.name}
            onChange={(e) => updateItem(index, { ...t, name: e.target.value })}
          />
        </div>
        <div className="pb-1">
          <ToggleSwitch
            label="Active"
            checked={t.isActive}
            onChange={(checked) => updateItem(index, { ...t, isActive: checked })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <TextField
          label="Location (Optional)"
          value={t.location}
          onChange={(e) => updateItem(index, { ...t, location: e.target.value })}
        />
        <TextField
          label="Rating (1-5)"
          type="number"
          min={1}
          max={5}
          value={t.rating}
          onChange={(e) => updateItem(index, { ...t, rating: Number(e.target.value) })}
        />
      </div>

      <TextArea
        label="Testimonial Message"
        value={t.message}
        onChange={(e) => updateItem(index, { ...t, message: e.target.value })}
        placeholder="What did the client say about their consultation?"
        rows={3}
      />

      <ImageUploader
        label="Photo (Optional)"
        value={t.imageUrl}
        folder="lunawat/testimonials"
        aspectRatio="square"
        onChange={(url) => updateItem(index, { ...t, imageUrl: url })}
        onRemove={() => updateItem(index, { ...t, imageUrl: "" })}
      />
    </div>
  )

  return (
    <div className="max-w-3xl pb-24">
      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-bold mb-1">Client Testimonials</h2>
          <p className="text-zinc-500 text-sm mb-4">
            Shown in the Testimonials section on your homepage. Drag to reorder.
          </p>
        </div>

        <RepeatableList
          items={testimonials}
          onChange={setTestimonials}
          renderItem={renderTestimonial}
          addButtonText="Add Testimonial"
          newItemFactory={() => ({
            id: crypto.randomUUID(),
            name: "",
            location: "",
            rating: 5,
            message: "",
            imageUrl: "",
            isActive: true,
          })}
        />
      </section>

      <SaveBar isDirty={isDirty} isPending={isPending} onSave={handleSave} />
    </div>
  )
}

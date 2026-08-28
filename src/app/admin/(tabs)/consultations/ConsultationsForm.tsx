'use client'

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { X } from "lucide-react"
import { TextField, TextArea, SaveBar, ToggleSwitch } from "@/components/admin/ui"
import { RepeatableList } from "@/components/admin/RepeatableList"
import { updateServices, updateSiteSettings } from "@/actions/settings"
import type { Service } from "@prisma/client"

// The only allowed Mode values — stored verbatim as the display label, no separate
// enum/transformation, so what the admin picks is exactly what shows on the site.
export const MODE_OPTIONS = ["Normal", "VIP", "In-Person", "Phone Call", "Video Call", "Custom"] as const

const BOOKING_FIELD_OPTIONS: { key: string; label: string }[] = [
  { key: "email",     label: "Email" },
  { key: "category",  label: "Category (what is this about)" },
  { key: "dob",       label: "Date of Birth" },
  { key: "tob",       label: "Time of Birth" },
  { key: "pob",       label: "Place of Birth" },
  { key: "education", label: "Education / Qualification" },
  { key: "address",   label: "Address / City" },
  { key: "message",   label: "Your Concern (message)" },
]

const selectClass =
  "w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black bg-white text-sm"

// Same look as selectClass but without `w-full`, so it can be sized by its flex container
// instead — appending `w-28` alongside `w-full` doesn't work: both are valid Tailwind
// utilities and whichever lands later in the generated stylesheet wins, not whichever is
// written last in the className string.
const compactSelectClass =
  "px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black bg-white text-sm"

export function ConsultationsForm({
  initialServices,
  enablePaymentGateway: initialEnablePaymentGateway,
  initialBookingFields,
  initialCategories,
  initialDiscountBadgeFormat,
}: {
  initialServices: Service[]
  enablePaymentGateway: boolean
  initialBookingFields: string[]
  initialCategories: string[]
  initialDiscountBadgeFormat: string
}) {
  const [services, setServices] = useState<Service[]>(initialServices)
  const [enablePaymentGateway, setEnablePaymentGateway] = useState(initialEnablePaymentGateway)
  const [bookingFields, setBookingFields] = useState<string[]>(initialBookingFields)
  const [categories, setCategories] = useState<string[]>(initialCategories)
  const [newCategory, setNewCategory] = useState("")
  const [discountBadgeFormat, setDiscountBadgeFormat] = useState(initialDiscountBadgeFormat)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  // The "saved" baseline starts as the server-rendered props, but — unlike the props
  // themselves — it updates the moment a save succeeds. Comparing against the raw props
  // would leave isDirty (and the Save bar) stuck true forever after a real, successful
  // save, since props from an already-mounted client component never update on their own.
  const [saved, setSaved] = useState({
    services: initialServices,
    enablePaymentGateway: initialEnablePaymentGateway,
    bookingFields: initialBookingFields,
    categories: initialCategories,
    discountBadgeFormat: initialDiscountBadgeFormat,
  })

  const isDirty =
    JSON.stringify(services) !== JSON.stringify(saved.services) ||
    enablePaymentGateway !== saved.enablePaymentGateway ||
    JSON.stringify(bookingFields) !== JSON.stringify(saved.bookingFields) ||
    JSON.stringify(categories) !== JSON.stringify(saved.categories) ||
    discountBadgeFormat !== saved.discountBadgeFormat

  const handleSave = () => {
    startTransition(async () => {
      await Promise.all([
        updateServices(services),
        updateSiteSettings({ enablePaymentGateway, bookingFields, consultationCategories: categories, discountBadgeFormat }),
      ])
      setSaved({ services, enablePaymentGateway, bookingFields, categories, discountBadgeFormat })
      router.refresh()
    })
  }

  const toggleBookingField = (key: string, checked: boolean) => {
    setBookingFields((prev) =>
      checked ? [...prev, key] : prev.filter((f) => f !== key)
    )
  }

  const addCategory = () => {
    const trimmed = newCategory.trim()
    if (!trimmed || categories.includes(trimmed)) {
      setNewCategory("")
      return
    }
    setCategories((prev) => [...prev, trimmed])
    setNewCategory("")
  }

  const removeCategory = (name: string) => {
    setCategories((prev) => prev.filter((c) => c !== name))
  }

  const renderService = (service: Service, index: number, updateItem: (idx: number, s: Service) => void) => {
    return (
      <div className="space-y-5 pt-1">
        {/* ── Title + Active ── */}
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <TextField
              label="Service Title"
              value={service.title}
              onChange={(e) => updateItem(index, { ...service, title: e.target.value })}
            />
          </div>
          <div className="pb-1">
            <ToggleSwitch
              label="Active"
              checked={service.isActive}
              onChange={(checked) => updateItem(index, { ...service, isActive: checked })}
            />
          </div>
        </div>

        {/* ── Mode ── */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-zinc-900">Mode</label>
          <select
            value={service.mode}
            onChange={(e) => updateItem(index, { ...service, mode: e.target.value })}
            className={selectClass}
          >
            {MODE_OPTIONS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        {/* ── Price + Original ── */}
        <div className="grid grid-cols-2 gap-4">
          <TextField
            label="Price (₹)"
            type="number"
            value={service.price}
            onChange={(e) => updateItem(index, { ...service, price: Number(e.target.value) })}
          />
          <TextField
            label="Original Price (₹)"
            type="number"
            value={service.originalPrice ?? ""}
            onChange={(e) =>
              updateItem(index, {
                ...service,
                originalPrice: e.target.value ? Number(e.target.value) : null,
              })
            }
            hint="Optional strike-through — also drives the auto discount badge"
          />
        </div>

        {/* ── Duration ── */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-zinc-900">Duration</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={service.durationMin ?? ""}
              onChange={(e) => updateItem(index, { ...service, durationMin: Number(e.target.value) })}
              className="flex-1 min-w-0 px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            />
            <select
              value={service.durationUnit}
              onChange={(e) => updateItem(index, { ...service, durationUnit: e.target.value })}
              className={`${compactSelectClass} w-28 shrink-0`}
            >
              <option value="MIN">mins</option>
              <option value="HR">hr</option>
            </select>
          </div>
        </div>

        {/* ── Description ── */}
        <TextArea
          label="Description"
          value={service.description ?? ""}
          onChange={(e) => updateItem(index, { ...service, description: e.target.value })}
          placeholder="Brief description shown on the booking page…"
          rows={3}
        />

        {/* ── Popular toggle ── */}
        <ToggleSwitch
          label="Mark as Popular"
          checked={service.isPopular}
          onChange={(checked) => updateItem(index, { ...service, isPopular: checked })}
        />
      </div>
    )
  }

  return (
    <div className="max-w-3xl pb-24 space-y-10">

      {/* ── Global Booking Settings ── */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold mb-1">Booking Settings</h2>
          <p className="text-zinc-500 text-sm">Configure the payment mode and which fields appear on every booking form.</p>
        </div>

        <div className="border border-zinc-200 rounded-lg px-4 bg-zinc-50">
          <ToggleSwitch
            label="Enable Payment Gateway"
            hint="On: bookings pay online via Razorpay. Off: bookings redirect to WhatsApp."
            checked={enablePaymentGateway}
            onChange={setEnablePaymentGateway}
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-zinc-900">
            Discount Badge Format
            <span className="ml-2 text-xs text-zinc-400 font-normal">
              (any service with an Original Price gets an auto-computed badge — pick how it reads)
            </span>
          </label>
          <select
            value={discountBadgeFormat}
            onChange={(e) => setDiscountBadgeFormat(e.target.value)}
            className={selectClass}
          >
            <option value="PERCENT">Percent off — e.g. 20% OFF</option>
            <option value="FLAT">Flat amount off — e.g. ₹400 OFF</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-zinc-900">
            Booking Form Fields
            <span className="ml-2 text-xs text-zinc-400 font-normal">
              (applies to all services)
            </span>
          </label>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1 bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-3">
            {BOOKING_FIELD_OPTIONS.map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2 py-1 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={bookingFields.includes(key)}
                  onChange={(e) => toggleBookingField(key, e.target.checked)}
                  className="h-4 w-4 rounded border-zinc-300 accent-black"
                />
                <span className="text-sm text-zinc-700">{label}</span>
              </label>
            ))}
          </div>
          <p className="text-xs text-zinc-400">Unchecked fields are hidden from the booking form.</p>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-zinc-900">
            Consultation Categories
            <span className="ml-2 text-xs text-zinc-400 font-normal">
              (options shown in the booking form&apos;s Category field)
            </span>
          </label>
          <div className="bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-3 space-y-3">
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <span
                  key={cat}
                  className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-white border border-zinc-300 rounded-full text-zinc-700"
                >
                  {cat}
                  <button
                    type="button"
                    onClick={() => removeCategory(cat)}
                    className="text-zinc-400 hover:text-red-600 transition-colors"
                    aria-label={`Remove ${cat}`}
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
              {categories.length === 0 && (
                <span className="text-xs text-zinc-400">No categories yet — add one below.</span>
              )}
            </div>
            <div className="flex gap-2">
              <input
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    addCategory()
                  }
                }}
                placeholder="e.g. Numerology"
                className="flex-1 px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-sm bg-white"
              />
              <button
                type="button"
                onClick={addCategory}
                className="px-4 py-2 text-sm font-medium bg-black text-white rounded-md hover:bg-zinc-800 transition-colors"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Services ── */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold mb-1">Services &amp; Pricing</h2>
          <p className="text-zinc-500 text-sm">Manage the consultations you offer. Drag to reorder.</p>
        </div>

        <RepeatableList
          items={services}
          onChange={setServices}
          renderItem={renderService}
          addButtonText="Add New Service"
          newItemFactory={() =>
            ({
              id: crypto.randomUUID(),
              title: "New Consultation",
              mode: "Video Call",
              price: 500,
              originalPrice: null,
              durationMin: 30,
              durationUnit: "MIN",
              description: null,
              isPopular: false,
              isActive: true,
              order: 0,
              createdAt: new Date(),
              updatedAt: new Date(),
            } as Service)
          }
        />
      </section>

      <SaveBar isDirty={isDirty} isPending={isPending} onSave={handleSave} />
    </div>
  )
}

'use client'

import { useState, useTransition } from "react"
import { X } from "lucide-react"
import { TextField, TextArea, SaveBar, ToggleSwitch } from "@/components/admin/ui"
import { RepeatableList } from "@/components/admin/RepeatableList"
import { updateServices, updateSiteSettings } from "@/actions/settings"
import type { Service } from "@prisma/client"

const BOOKING_FIELD_OPTIONS: { key: string; label: string }[] = [
  { key: "email",    label: "Email" },
  { key: "category", label: "Category (what is this about)" },
  { key: "dob",     label: "Date of Birth" },
  { key: "tob",     label: "Time of Birth" },
  { key: "pob",     label: "Place of Birth" },
  { key: "message", label: "Your Concern (message)" },
]

const selectClass =
  "w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black bg-white text-sm"

export function ConsultationsForm({
  initialServices,
  enablePaymentGateway: initialEnablePaymentGateway,
  initialBookingFields,
  initialCategories,
}: {
  initialServices: Service[]
  enablePaymentGateway: boolean
  initialBookingFields: string[]
  initialCategories: string[]
}) {
  const [services, setServices] = useState<Service[]>(initialServices)
  const [enablePaymentGateway, setEnablePaymentGateway] = useState(initialEnablePaymentGateway)
  const [bookingFields, setBookingFields] = useState<string[]>(initialBookingFields)
  const [categories, setCategories] = useState<string[]>(initialCategories)
  const [newCategory, setNewCategory] = useState("")
  const [isPending, startTransition] = useTransition()

  const isDirty =
    JSON.stringify(services) !== JSON.stringify(initialServices) ||
    enablePaymentGateway !== initialEnablePaymentGateway ||
    JSON.stringify(bookingFields) !== JSON.stringify(initialBookingFields) ||
    JSON.stringify(categories) !== JSON.stringify(initialCategories)

  const handleSave = () => {
    startTransition(async () => {
      await Promise.all([
        updateServices(services),
        updateSiteSettings({ enablePaymentGateway, bookingFields, consultationCategories: categories }),
      ])
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
            onChange={(e) => updateItem(index, { ...service, mode: e.target.value as Service["mode"] })}
            className={selectClass}
          >
            <option value="VIDEO_CALL">Video Call</option>
            <option value="PHONE_CALL">Phone Call</option>
            <option value="IN_PERSON">In Person</option>
            <option value="CHAT">Chat</option>
          </select>
        </div>

        {/* ── Price + Original + Duration ── */}
        <div className="grid grid-cols-3 gap-4">
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
            hint="Optional strike-through"
          />
          <TextField
            label="Duration (mins)"
            type="number"
            value={service.durationMin ?? ""}
            onChange={(e) => updateItem(index, { ...service, durationMin: Number(e.target.value) })}
          />
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
              mode: "VIDEO_CALL",
              price: 500,
              originalPrice: null,
              durationMin: 30,
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

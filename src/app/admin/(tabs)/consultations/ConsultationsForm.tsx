'use client'

import { useState, useTransition } from "react"
import { TextField, SaveBar, ToggleSwitch } from "@/components/admin/ui"
import { RepeatableList } from "@/components/admin/RepeatableList"
import { updateServices, updateSiteSettings } from "@/actions/settings"
import type { Service } from "@prisma/client"

export function ConsultationsForm({ initialServices, enablePaymentGateway: initialEnablePaymentGateway }: { initialServices: Service[], enablePaymentGateway: boolean }) {
  const [services, setServices] = useState<Service[]>(initialServices)
  const [enablePaymentGateway, setEnablePaymentGateway] = useState(initialEnablePaymentGateway)
  const [isPending, startTransition] = useTransition()

  // A simple deep compare to check if dirty
  const isDirty = JSON.stringify(services) !== JSON.stringify(initialServices) || enablePaymentGateway !== initialEnablePaymentGateway

  const handleSave = () => {
    startTransition(async () => {
      await Promise.all([
        updateServices(services),
        updateSiteSettings({ enablePaymentGateway }),
      ])
    })
  }

  const renderService = (service: Service, index: number, updateItem: (idx: number, s: Service) => void) => {
    return (
      <div className="space-y-4 pt-1">
        <TextField 
          label="Service Title" 
          value={service.title} 
          onChange={(e) => updateItem(index, { ...service, title: e.target.value })} 
        />
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <TextField 
            label="Price (₹)" 
            type="number"
            value={service.price} 
            onChange={(e) => updateItem(index, { ...service, price: Number(e.target.value) })} 
          />
          <TextField 
            label="Original Price (₹)" 
            type="number"
            value={service.originalPrice || ""} 
            onChange={(e) => updateItem(index, { ...service, originalPrice: e.target.value ? Number(e.target.value) : null })} 
            hint="Optional strike-through"
          />
          <TextField 
            label="Duration (mins)" 
            type="number"
            value={service.durationMin || ""} 
            onChange={(e) => updateItem(index, { ...service, durationMin: Number(e.target.value) })} 
          />
          <div>
            <label className="block text-sm font-medium text-zinc-900 mb-1">Mode</label>
            <select 
              value={service.mode}
              onChange={(e) => updateItem(index, { ...service, mode: e.target.value as any })}
              className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black bg-white"
            >
              <option value="VIDEO_CALL">Video Call</option>
              <option value="PHONE_CALL">Phone Call</option>
              <option value="IN_PERSON">In Person</option>
              <option value="CHAT">Chat</option>
            </select>
          </div>
        </div>

        <ToggleSwitch 
          label="Mark as Popular" 
          checked={service.isPopular} 
          onChange={(checked) => updateItem(index, { ...service, isPopular: checked })}
        />
      </div>
    )
  }

  return (
    <div className="max-w-3xl pb-24">
      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-bold mb-1">Services & Pricing</h2>
          <p className="text-zinc-500 text-sm mb-4">Manage the consultations you offer. Drag to reorder.</p>
        </div>

        <div className="border border-zinc-200 rounded-lg px-4 bg-zinc-50">
          <ToggleSwitch
            label="Enable Payment Gateway"
            hint="On: bookings pay online via Razorpay. Off: bookings redirect to WhatsApp."
            checked={enablePaymentGateway}
            onChange={setEnablePaymentGateway}
          />
        </div>

        <RepeatableList
          items={services}
          onChange={setServices}
          renderItem={renderService}
          addButtonText="Add New Service"
          newItemFactory={() => ({
            id: crypto.randomUUID(), // temp id for React key
            title: "New Consultation",
            mode: "VIDEO_CALL",
            price: 500,
            originalPrice: null,
            durationMin: 30,
            description: null,
            isPopular: false,
            order: 0,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
          } as Service)}
        />
      </section>

      <SaveBar isDirty={isDirty} isPending={isPending} onSave={handleSave} />
    </div>
  )
}

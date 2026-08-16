'use client'

import { useState } from "react"

// Native <input type="time"> renders as AM/PM or 24-hour depending on the
// visitor's OS/browser locale, which we can't control. This picker always
// shows AM/PM, and stores/emits a plain 24-hour "HH:mm" string so it's a
// drop-in for existing form/state code that expects that format.

interface TimeInput12hProps {
  /** Uncontrolled usage: renders a hidden input with this name for FormData submission. */
  name?: string
  /** Controlled value, 24-hour "HH:mm". Omit for uncontrolled usage. */
  value?: string
  /** Initial value for uncontrolled usage. */
  defaultValue?: string
  /** Called with the new 24-hour "HH:mm" string whenever the picker changes. */
  onChange?: (value: string) => void
  required?: boolean
  className?: string
}

const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"))
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"))

function to12h(value: string) {
  if (!value) return { hour: "", minute: "", period: "AM" as "AM" | "PM" }
  const [hStr, mStr] = value.split(":")
  let h = parseInt(hStr, 10)
  const period: "AM" | "PM" = h >= 12 ? "PM" : "AM"
  h = h % 12
  if (h === 0) h = 12
  return { hour: String(h).padStart(2, "0"), minute: mStr ?? "00", period }
}

function to24h(hour: string, minute: string, period: "AM" | "PM") {
  if (!hour || !minute) return ""
  let h = parseInt(hour, 10) % 12
  if (period === "PM") h += 12
  return `${String(h).padStart(2, "0")}:${minute}`
}

export function TimeInput12h({ name, value, defaultValue, onChange, required, className = "" }: TimeInput12hProps) {
  const isControlled = value !== undefined
  const [internal, setInternal] = useState(() => to12h(defaultValue ?? ""))

  const current = isControlled ? to12h(value ?? "") : internal

  const update = (next: Partial<{ hour: string; minute: string; period: "AM" | "PM" }>) => {
    const merged = { ...current, ...next }
    if (!isControlled) setInternal(merged)
    onChange?.(to24h(merged.hour, merged.minute, merged.period))
  }

  const selectClass = className || "px-2 py-2 border border-zinc-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-black"

  return (
    <div className="flex items-center gap-1.5">
      <select
        aria-label="Hour"
        required={required}
        value={current.hour}
        onChange={(e) => update({ hour: e.target.value })}
        className={selectClass}
      >
        <option value="" disabled>HH</option>
        {HOURS.map((h) => (
          <option key={h} value={h}>{h}</option>
        ))}
      </select>
      <span className="text-zinc-500">:</span>
      <select
        aria-label="Minute"
        required={required}
        value={current.minute}
        onChange={(e) => update({ minute: e.target.value })}
        className={selectClass}
      >
        <option value="" disabled>MM</option>
        {MINUTES.map((m) => (
          <option key={m} value={m}>{m}</option>
        ))}
      </select>
      <select
        aria-label="AM or PM"
        required={required}
        value={current.period}
        onChange={(e) => update({ period: e.target.value as "AM" | "PM" })}
        className={selectClass}
      >
        <option value="AM">AM</option>
        <option value="PM">PM</option>
      </select>
      {name && <input type="hidden" name={name} value={to24h(current.hour, current.minute, current.period)} />}
    </div>
  )
}

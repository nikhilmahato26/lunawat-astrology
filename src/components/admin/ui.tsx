import React from "react"
import { LucideIcon } from "lucide-react"
import { TimeInput12h } from "@/components/ui/TimeInput12h"

interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  hint?: string
}

export function TextField({ label, hint, className = "", ...props }: TextFieldProps) {
  return (
    <div className={`space-y-1 ${className}`}>
      <label className="block text-sm font-medium text-zinc-900">{label}</label>
      <input
        className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
        {...props}
      />
      {hint && <p className="text-xs text-zinc-500">{hint}</p>}
    </div>
  )
}

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  hint?: string
}

export function TextArea({ label, hint, className = "", ...props }: TextAreaProps) {
  return (
    <div className={`space-y-1 ${className}`}>
      <label className="block text-sm font-medium text-zinc-900">{label}</label>
      <textarea
        className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black min-h-[100px]"
        {...props}
      />
      {hint && <p className="text-xs text-zinc-500">{hint}</p>}
    </div>
  )
}

export function NumberField({ label, hint, className = "", ...props }: TextFieldProps) {
  return (
    <div className={`space-y-1 ${className}`}>
      <label className="block text-sm font-medium text-zinc-900">{label}</label>
      <input
        type="number"
        className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
        {...props}
      />
      {hint && <p className="text-xs text-zinc-500">{hint}</p>}
    </div>
  )
}

interface TimeFieldProps {
  label: string
  hint?: string
  className?: string
  value?: string
  onChange?: (e: { target: { value: string } }) => void
  required?: boolean
}

export function TimeField({ label, hint, className = "", value, onChange, required }: TimeFieldProps) {
  return (
    <div className={`space-y-1 ${className}`}>
      <label className="block text-sm font-medium text-zinc-900">{label}</label>
      <TimeInput12h
        value={value}
        required={required}
        onChange={(next) => onChange?.({ target: { value: next } })}
      />
      {hint && <p className="text-xs text-zinc-500">{hint}</p>}
    </div>
  )
}

interface ToggleSwitchProps {
  label: string
  hint?: string
  checked: boolean
  onChange: (checked: boolean) => void
  name?: string
}

export function ToggleSwitch({ label, hint, checked, onChange, name }: ToggleSwitchProps) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex flex-col">
        <span className="text-sm font-medium text-zinc-900">{label}</span>
        {hint && <span className="text-xs text-zinc-500">{hint}</span>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 ${
          checked ? 'bg-black' : 'bg-zinc-200'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
      {name && <input type="hidden" name={name} value={checked ? "true" : "false"} />}
    </div>
  )
}

interface SuggestionChipsProps {
  suggestions: string[]
  onSelect: (value: string) => void
}

export function SuggestionChips({ suggestions, onSelect }: SuggestionChipsProps) {
  if (!suggestions || suggestions.length === 0) return null
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {suggestions.map((suggestion, idx) => (
        <button
          key={idx}
          type="button"
          onClick={() => onSelect(suggestion)}
          className="px-3 py-1 text-xs font-medium bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-full transition-colors"
        >
          {suggestion}
        </button>
      ))}
    </div>
  )
}

import { Save } from "lucide-react"

export function SaveBar({ isDirty, isPending, onSave }: { isDirty: boolean, isPending: boolean, onSave?: () => void }) {
  if (!isDirty && !isPending) return null
  
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-zinc-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <span className="text-sm font-medium text-zinc-600">Unsaved changes</span>
        <button
          type="submit"
          onClick={onSave}
          disabled={isPending}
          className="inline-flex items-center gap-2 bg-black text-white px-6 py-2 rounded-lg font-medium hover:bg-zinc-800 disabled:opacity-70 transition-colors"
        >
          <Save size={16} />
          {isPending ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  )
}

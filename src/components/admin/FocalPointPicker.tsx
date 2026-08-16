'use client'

import { useCallback, useRef, useState } from "react"

interface FocalPointPickerProps {
  imageUrl: string
  value: string // CSS object-position, e.g. "50% 50%"
  onChange: (value: string) => void
}

// Lets the admin click/drag on the hero photo to choose which part of it stays visible
// once it's cropped into the (square) hero frame on the live site.
export function FocalPointPicker({ imageUrl, value, onChange }: FocalPointPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [dragging, setDragging] = useState(false)

  const [xStr, yStr] = value.split(" ")
  const x = parseFloat(xStr) || 50
  const y = parseFloat(yStr) || 50

  const updateFromPoint = useCallback(
    (clientX: number, clientY: number) => {
      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return
      const relX = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100))
      const relY = Math.min(100, Math.max(0, ((clientY - rect.top) / rect.height) * 100))
      onChange(`${relX.toFixed(0)}% ${relY.toFixed(0)}%`)
    },
    [onChange]
  )

  if (!imageUrl) return null

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-zinc-900">
        Image Focus Point
        <span className="ml-2 text-xs text-zinc-400 font-normal">
          (click or drag to choose which part of the photo shows in the hero frame)
        </span>
      </label>
      <div
        ref={containerRef}
        className="relative w-40 h-40 rounded-2xl overflow-hidden border border-zinc-300 cursor-crosshair select-none touch-none"
        onPointerDown={(e) => {
          setDragging(true)
          updateFromPoint(e.clientX, e.clientY)
          ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
        }}
        onPointerMove={(e) => {
          if (dragging) updateFromPoint(e.clientX, e.clientY)
        }}
        onPointerUp={() => setDragging(false)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt="Hero focus preview"
          className="w-full h-full object-cover pointer-events-none"
          style={{ objectPosition: value }}
        />
        <div
          className="absolute w-4 h-4 rounded-full bg-white border-2 border-black shadow-md -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{ left: `${x}%`, top: `${y}%` }}
        />
      </div>
    </div>
  )
}

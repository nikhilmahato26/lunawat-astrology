'use client'

import React, { useState } from "react"
import { GripVertical, Trash2, Plus } from "lucide-react"

interface RepeatableListProps<T> {
  items: T[]
  onChange: (items: T[]) => void
  renderItem: (item: T, index: number, updateItem: (index: number, updated: T) => void) => React.ReactNode
  newItemFactory: () => T
  addButtonText?: string
}

export function RepeatableList<T>({ items, onChange, renderItem, newItemFactory, addButtonText = "Add Item" }: RepeatableListProps<T>) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    const newItems = [...items]
    const draggedItem = newItems[draggedIndex]
    
    // Remove dragged item
    newItems.splice(draggedIndex, 1)
    // Insert at new index
    newItems.splice(index, 0, draggedItem)
    
    onChange(newItems)
    setDraggedIndex(index)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  const handleRemove = (index: number) => {
    const newItems = [...items]
    newItems.splice(index, 1)
    onChange(newItems)
  }

  const updateItem = (index: number, updated: T) => {
    const newItems = [...items]
    newItems[index] = updated
    onChange(newItems)
  }

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div 
          key={index} // In a real app, use a unique ID from the item if available
          className={`flex gap-3 p-4 bg-white border border-zinc-200 rounded-xl transition-all ${
            draggedIndex === index ? 'opacity-50' : 'opacity-100'
          }`}
          draggable
          onDragStart={(e) => handleDragStart(e, index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragEnd={handleDragEnd}
        >
          <div className="cursor-grab active:cursor-grabbing text-zinc-400 pt-2">
            <GripVertical size={20} />
          </div>
          <div className="flex-1">
            {renderItem(item, index, updateItem)}
          </div>
          <button
            type="button"
            onClick={() => handleRemove(index)}
            className="text-zinc-400 hover:text-red-500 transition-colors p-2 h-fit"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={() => onChange([...items, newItemFactory()])}
        className="w-full py-4 border-2 border-dashed border-zinc-200 rounded-xl text-zinc-500 font-medium hover:border-zinc-300 hover:text-black transition-colors flex items-center justify-center gap-2"
      >
        <Plus size={18} />
        {addButtonText}
      </button>
    </div>
  )
}

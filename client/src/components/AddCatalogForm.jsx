"use client"

import { useState, useEffect } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"

export default function AddCatalogForm({ onSave, onCancel, initial }) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [color, setColor] = useState("#3B82F6")

  // Initialize form with initial values when component mounts or initial changes
  useEffect(() => {
    if (initial) {
      setName(initial.name || "")
      setDescription(initial.description || "")
      setColor(initial.color || "#3B82F6")
    } else {
      // Reset form for new catalog
      setName("")
      setDescription("")
      setColor("#3B82F6")
    }
  }, [initial])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({ name, description, color })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Catalog Name</Label>
        <Input
          id="name"
          placeholder="Enter catalog name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Enter catalog description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="color">Color</Label>
        <div className="flex items-center space-x-2">
          <input
            type="color"
            id="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-12 h-10 rounded border"
          />
          <Input value={color} onChange={(e) => setColor(e.target.value)} placeholder="#3B82F6" className="flex-1" />
        </div>
      </div>
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{initial ? "Update" : "Create"} Catalog</Button>
      </div>
    </form>
  )
}

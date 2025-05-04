"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { X, Upload, ImageIcon } from "lucide-react"

export function ImageUpload({ images, onUpload, onRemove, maxImages = 5 }) {
  const fileInputRef = useRef(null)
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleChange = (e) => {
    e.preventDefault()

    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files)
    }
  }

  const handleFiles = (files) => {
    if (images.length >= maxImages) return

    const file = files[0]

    // Check if file is an image
    if (!file.type.match("image.*")) return

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) return

    onUpload(file)
  }

  const handleButtonClick = () => {
    fileInputRef.current.click()
  }

  return (
    <div className="space-y-4">
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {images.map((image, index) => (
            <Card key={index} className="relative overflow-hidden aspect-square">
              <img
                src={image.preview || "/placeholder.svg"}
                alt={`Product image ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-6 w-6"
                onClick={() => onRemove(index)}
              >
                <X className="h-4 w-4" />
              </Button>
              {index === 0 && (
                <span className="absolute bottom-0 left-0 right-0 bg-primary text-primary-foreground text-xs py-1 text-center">
                  Main Image
                </span>
              )}
            </Card>
          ))}
        </div>
      )}

      {images.length < maxImages && (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center ${
            dragActive ? "border-primary bg-primary/10" : "border-muted-foreground/25"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleChange} className="hidden" />

          <div className="flex flex-col items-center justify-center gap-4">
            <div className="rounded-full bg-muted p-4">
              {dragActive ? (
                <Upload className="h-8 w-8 text-primary" />
              ) : (
                <ImageIcon className="h-8 w-8 text-muted-foreground" />
              )}
            </div>

            <div>
              <p className="text-sm font-medium">
                {dragActive ? "Drop the image here" : "Drag and drop an image here"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">PNG, JPG or WEBP (max. 5MB)</p>
            </div>

            <Button type="button" variant="outline" onClick={handleButtonClick}>
              Select Image
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

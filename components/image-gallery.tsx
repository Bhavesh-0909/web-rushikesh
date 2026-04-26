"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ImageGalleryProps {
  images: string[]
  isOpen: boolean
  onClose: () => void
  initialIndex?: number
}

const ImageGallery = ({ images, isOpen, onClose, initialIndex = 0 }: ImageGalleryProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)

  useEffect(() => {
    setCurrentIndex(initialIndex)
  }, [initialIndex])

  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll when gallery is open
      document.body.style.overflow = "hidden"
    } else {
      // Restore body scroll when gallery is closed
      document.body.style.overflow = "unset"
    }

    // Cleanup function to restore scroll on unmount
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      switch (e.key) {
        case "Escape":
          onClose()
          break
        case "ArrowLeft":
          e.preventDefault()
          prevImage()
          break
        case "ArrowRight":
          e.preventDefault()
          nextImage()
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, currentIndex])

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const goToImage = (index: number) => {
    setCurrentIndex(index)
  }

  if (!isOpen || images.length === 0) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/95 z-50 flex flex-col"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        {/* Header with close button and counter */}
        <div className="flex justify-between items-center p-4 z-10">
          <div className="text-white text-sm bg-black/50 px-3 py-1 rounded-full">
            {currentIndex + 1} / {images.length}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20"
            onClick={(e) => {
              e.stopPropagation()
              onClose()
            }}
          >
            <X className="h-6 w-6" />
          </Button>
        </div>

        {/* Main image container */}
        <div className="flex-1 flex items-center justify-center relative px-4 pb-20">
          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 z-10"
                onClick={(e) => {
                  e.stopPropagation()
                  prevImage()
                }}
              >
                <ChevronLeft className="h-8 w-8" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 z-10"
                onClick={(e) => {
                  e.stopPropagation()
                  nextImage()
                }}
              >
                <ChevronRight className="h-8 w-8" />
              </Button>
            </>
          )}

          {/* Main Image */}
          <motion.div
            className="relative max-w-full max-h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <img
              src={images[currentIndex] || "/placeholder.svg"}
              alt={`Gallery image ${currentIndex + 1}`}
              className="max-w-full max-h-full object-contain rounded-lg"
              style={{ maxHeight: "calc(100vh - 200px)" }}
            />
          </motion.div>
        </div>

        {/* Thumbnail Navigation */}
        {images.length > 1 && (
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="flex justify-center">
              <div className="flex space-x-2 max-w-full overflow-x-auto scrollbar-hide px-4 py-2">
                <div className="flex space-x-2 min-w-max">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation()
                        goToImage(index)
                      }}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                        index === currentIndex
                          ? "border-white scale-110 shadow-lg"
                          : "border-white/30 hover:border-white/60 hover:scale-105"
                      }`}
                    >
                      <img
                        src={image || "/placeholder.svg"}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Touch/Swipe indicators for mobile */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white/60 text-xs hidden sm:block">
          Use ← → keys or click arrows to navigate
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export default ImageGallery
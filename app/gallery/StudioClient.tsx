"use client";

import { motion } from 'motion/react';
import { GridPattern } from '@/components/ui/grid-pattern';
import { cn } from '@/lib/utils';
import ImageGallery from "@/components/image-gallery"
import { useState } from 'react';

const StudioClient = ({studioImages}: {studioImages: string[]}) => {
  const [galleryOpen, setGalleryOpen] = useState(false)
  const [galleryIndex, setGalleryIndex] = useState(0)

  const getImageUrl = (src: string) => {
    if (!src) return "/placeholder.svg"
    return src.startsWith("http") ? src : `/${src}`
  }
  return (
    <main className="min-h-screen bg-brand-background pt-32 pb-24 px-6 md:px-12 relative">
      <GridPattern 
        squares={[
          [4, 4],
          [5, 1],
          [8, 2],
          [5, 3],
          [5, 5],
          [10, 10],
          [12, 15],
          [15, 10],
          [10, 15],
          [15, 10],
          [10, 15],
          [15, 10],
        ]}
        className={cn(
          "[mask-image:linear-gradient(to_bottom,white_80%,transparent)]",
          "fixed inset-0 z-0 w-screen h-screen opacity-50 pointer-events-none"
        )} 
      />
      <div className="max-w-7xl mx-auto relative z-10">
        <header className="mb-20 text-center">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-[1px] w-12 bg-brand-border" />
            <span className="text-brand-green text-[10px] uppercase tracking-[0.6em] font-bold">Behind the scenes</span>
            <div className="h-[1px] w-12 bg-brand-border" />
          </div>
          <h1 className="text-6xl md:text-8xl font-display font-medium tracking-tighter uppercase leading-[0.8]">
            THE <span className="text-brand-green italic serif">GALLERY</span>
          </h1>
          <p className="mt-8 text-brand-text/50 max-w-xl mx-auto uppercase tracking-widest text-[10px] font-bold">
            A visual archive of process, materiality, and architectural exploration.
          </p>
        </header>

        <div className="columns-2 sm:columns-2 md:columns-3 lg:columns-4 gap-1 sm:gap-6 space-y-4 sm:space-y-6">
          {studioImages.map((src, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: (i % 4) * 0.1, duration: 0.8 }}
              viewport={{ once: true }}
              className="relative group rounded-3xl overflow-hidden cursor-none"
              onClick={() => {
                setGalleryIndex(i)
                setGalleryOpen(true)
              }}
            >
              <img 
                src={`${getImageUrl(src)}${src.includes('?') ? '&' : '?'}auto=format&fit=crop&q=80&w=800`} 
                alt={`Gallery image ${i + 1}`} 
                className="w-full h-auto object-cover transition-all duration-700 brightness-90 group-hover:brightness-100 group-hover:scale-110"
                loading="lazy"
                decoding="async"
              />
              
              <div className="absolute inset-0 bg-brand-green/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>
          ))}
        </div>
        
        <ImageGallery 
          images={studioImages.map(img => `${getImageUrl(img)}${img.includes('?') ? '&' : '?'}auto=format&fit=crop&q=90&w=1920`)} 
          isOpen={galleryOpen}
          onClose={() => setGalleryOpen(false)}
          initialIndex={galleryIndex}
        />
      </div>
    </main>
  );
};

export default StudioClient;
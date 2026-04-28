"use client"

import { useEffect, useState, useMemo, useRef } from "react"
import { motion } from "motion/react"
import ImageGallery from "@/components/image-gallery"
import { Button } from "@/components/ui/button"
import { createSlug } from "@/lib/utils"
import Link from "next/link"
import { User, Camera, Building, Share2, Check } from "lucide-react"
import { toast } from "sonner"
import { Navbar } from "@/components/Navbar"
import { getProjectDetail } from "@/app/project/actions"

interface Project {
  id: number
  title: string
  description: string
  location: string
  year: number | string
  category: string
  hero_image: string
  images: string[]
  client: string
  area: string
  status: string
  architect: string
  photographer: string
  subtitle?: string
  content?: Array<{
    type: "text" | "image"
    content: string
    src?: string
    caption?: string
  }>
  created_at: string
  updated_at: string
}

export default function ProjectDetailClient({ idParam }: { idParam: string }) {
  const [project, setProject] = useState<Project | null>(null)
  const [relatedProjects, setRelatedProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [galleryOpen, setGalleryOpen] = useState(false)
  const [galleryIndex, setGalleryIndex] = useState(0)
  const [copied, setCopied] = useState(false)

  const copyTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true)
        setError(null)

        const result = await getProjectDetail(idParam)

        if (!result?.project) {
          setError("Project not found.")
          return
        }

        setProject(result.project)
        setRelatedProjects(result.relatedProjects ?? [])
      } catch (err) {
        console.error("Error fetching project:", err)
        setError("Failed to load project details.")
      } finally {
        setLoading(false)
      }
    }

    fetchProject()
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [idParam])

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current)
    }
  }, [])

  const allImages = useMemo(() => {
    if (!project) return []
    return [project.hero_image, ...(project.images || [])].filter(Boolean) as string[]
  }, [project])

  const openGallery = (index = 0) => {
    setGalleryIndex(index)
    setGalleryOpen(true)
  }

  const handleShare = async () => {
    if (!project) return
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      toast.success("Link copied to clipboard!")
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current)
      copyTimeoutRef.current = setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Unable to share project")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-brand-green border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[10px] uppercase tracking-[0.4em] font-bold opacity-30">Loading Masterpiece</p>
        </div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-brand-background flex flex-col items-center justify-center text-brand-text space-y-4">
        <h2 className="text-2xl font-display uppercase tracking-tighter">
          {error === "Project not found." ? "Project Not Found" : "Something Went Wrong"}
        </h2>
        <p className="opacity-50">{error ?? "Unknown error"}</p>
        {error !== "Project not found." && (
          <Button onClick={() => window.location.reload()} variant="outline">
            Try Again
          </Button>
        )}
        <Link href="/projects">
          <Button variant="ghost" className="text-[10px] uppercase tracking-widest">
            ← Back to Projects
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-brand-background text-brand-text">
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-[100svh] w-full overflow-hidden flex flex-col justify-end">
        <motion.div
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute inset-0"
        >
          <img
            src={project.hero_image}
            alt={project.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/30" />
        </motion.div>

        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-brand-background to-transparent z-10" />

        <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-24 pb-24 z-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mb-12"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="h-[1px] w-12 bg-brand-green" />
              <span className="text-white text-[10px] uppercase tracking-[0.4em] font-bold drop-shadow-md">
                {project.category}
              </span>
            </div>
            <h1 className="text-5xl md:text-9xl font-display font-medium text-white tracking-tighter uppercase leading-[0.8] mb-8 drop-shadow-xl">
              {project.title}
            </h1>
            {project.subtitle && (
              <p className="text-xl md:text-3xl text-white/90 font-display font-light italic max-w-2xl drop-shadow-md">
                {project.subtitle}
              </p>
            )}
          </motion.div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-6 py-24">
        {/* Project Info Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-32 p-10 glass rounded-[40px] border border-brand-border/30 shadow-sm">
          <div>
            <p className="text-[9px] uppercase tracking-widest opacity-40 font-bold mb-2">Location</p>
            <p className="text-xs uppercase font-bold tracking-widest">{project.location}</p>
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-widest opacity-40 font-bold mb-2">Year</p>
            <p className="text-xs uppercase font-bold tracking-widest">{project.year}</p>
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-widest opacity-40 font-bold mb-2">Area</p>
            <p className="text-xs uppercase font-bold tracking-widest">{project.area}</p>
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-widest opacity-40 font-bold mb-2">Status</p>
            <p className="text-xs uppercase font-bold tracking-widest text-brand-green">{project.status}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-24">
          {/* Main Description */}
          <div className="lg:col-span-8 space-y-16">
            <div className="prose prose-brand max-w-none">
              <p className="text-xl md:text-2xl font-display font-light leading-relaxed text-brand-text/80 first-letter:text-5xl first-letter:font-bold first-letter:text-brand-green first-letter:mr-3 first-letter:float-left">
                {project.description}
              </p>
            </div>

            {project.content && project.content.length > 0 && (
              <div className="space-y-24">
                {project.content.map((block, idx) => (
                  <motion.div
                    key={`content-block-${idx}`}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="space-y-8"
                  >
                    {block.type === "text" && (
                      <p className="text-lg md:text-xl text-brand-text/70 leading-relaxed font-light">
                        {block.content}
                      </p>
                    )}
                    {block.type === "image" && (
                      <div className="space-y-4">
                        <div className="rounded-[40px] overflow-hidden border border-brand-border/30 shadow-sm group">
                          <img
                            src={block.src}
                            alt={block.caption || "Project visual"}
                            className="w-full h-auto transition-transform duration-1000 group-hover:scale-105"
                            loading="lazy"
                          />
                        </div>
                        {block.caption && (
                          <p className="text-center text-[9px] uppercase tracking-[0.3em] opacity-40 font-bold">
                            {block.caption}
                          </p>
                        )}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}

            {/* Gallery */}
            <div className="pt-24 border-t border-brand-border/30">
              <div className="flex items-center justify-between mb-12">
                <h3 className="text-3xl font-display uppercase tracking-tighter">
                  Project <span className="text-brand-green italic">Gallery</span>
                </h3>
                <Button
                  variant="ghost"
                  onClick={() => openGallery(0)}
                  className="text-[10px] uppercase tracking-widest font-bold text-brand-green hover:bg-brand-green/10"
                >
                  View All {allImages.length} Images
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {allImages.slice(1, 3).map((img, i) => (
                  <div
                    key={`gallery-preview-${i}`}
                    className="aspect-square rounded-[32px] overflow-hidden cursor-pointer group"
                    onClick={() => openGallery(i + 1)}
                  >
                    <img
                      src={img}
                      alt={`Gallery preview ${i + 1}`}
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-12 h-fit lg:sticky lg:top-32">
            <div className="p-10 glass rounded-[48px] border border-brand-border/30 space-y-12">
              <div className="space-y-8">
                <h4 className="text-[10px] uppercase tracking-[0.4em] font-bold text-brand-green">Credits</h4>
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <User size={16} className="text-brand-green/40" />
                    <div>
                      <p className="text-[9px] uppercase opacity-40 font-bold">Principal Architect</p>
                      <p className="text-xs font-bold uppercase">{project.architect}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Camera size={16} className="text-brand-green/40" />
                    <div>
                      <p className="text-[9px] uppercase opacity-40 font-bold">Photography</p>
                      <p className="text-xs font-bold uppercase">{project.photographer || "TBA"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Building size={16} className="text-brand-green/40" />
                    <div>
                      <p className="text-[9px] uppercase opacity-40 font-bold">Client</p>
                      <p className="text-xs font-bold uppercase">{project.client}</p>
                    </div>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleShare}
                className="w-full h-16 rounded-full bg-brand-text text-white hover:bg-brand-green transition-all uppercase text-[10px] tracking-[0.3em] font-bold shadow-xl"
              >
                {copied ? <Check size={16} /> : <Share2 size={16} className="mr-3" />}
                {copied ? "Copied" : "Share Project"}
              </Button>
            </div>

            {relatedProjects.length > 0 && (
              <div className="space-y-8">
                <h4 className="text-[10px] uppercase tracking-[0.4em] font-bold opacity-30 px-6">Similar Works</h4>
                <div className="space-y-4">
                  {relatedProjects.map(rp => (
                    <Link
                      key={rp.id}
                      href={`/project/${createSlug(rp.title)}`}
                      className="flex items-center gap-4 p-4 rounded-3xl hover:bg-brand-green/5 transition-all group"
                    >
                      <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0">
                        <img
                          src={rp.hero_image}
                          alt={rp.title}
                          className="w-full h-full object-cover transition-transform group-hover:scale-110"
                          loading="lazy"
                        />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-[10px] uppercase font-bold tracking-widest truncate">{rp.title}</p>
                        <p className="text-[9px] uppercase opacity-40 font-bold">{rp.category}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <ImageGallery
        images={allImages}
        isOpen={galleryOpen}
        onClose={() => setGalleryOpen(false)}
        initialIndex={galleryIndex}
      />
    </div>
  )
}
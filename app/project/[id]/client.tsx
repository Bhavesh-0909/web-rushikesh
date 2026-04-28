"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import ImageGallery from "@/components/image-gallery"
import ProjectMap from "@/components/project-map"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@supabase/supabase-js"
import { createSlug } from "@/lib/utils"
import Link from "next/link"
import { ArrowLeft, MapPin, Calendar, User, Camera, Building, Tag, Share2, Check, ExternalLink } from "lucide-react"
import { toast } from "sonner"
import AdminEditControls from "@/components/admin-edit-controls"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

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
  latitude?: number
  longitude?: number
  youtube_walkthrough_heading?: string
  youtube_walkthrough_link?: string
  created_at: string
  updated_at: string
}

export default function ProjectDetailClient({ idParam }: { idParam: string }) {
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [galleryOpen, setGalleryOpen] = useState(false)
  const [galleryIndex, setGalleryIndex] = useState(0)
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (sessionStorage.getItem("admin_auth") === "true") {
      setIsAdmin(true)
    }
  }, [])

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true)
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        
        let foundProject: Project | null = null;
        const slugParam = idParam;

        if (url && key) {
          const sb = createClient(url, key, { auth: { persistSession: false } })
          const { data: projects, error: fetchError } = await sb.from("projects").select("*")

          if (projects && projects.length > 0) {
            foundProject = projects.find((p) => createSlug(p.title) === slugParam)
            if (!foundProject && !isNaN(Number(slugParam))) {
              foundProject = projects.find((p) => p.id === Number(slugParam))
            }
          }
        }

        if (!foundProject) {
          // Fallback to hardcoded sample data
          foundProject = FALLBACK_PROJECT_DETAIL.find(p => createSlug(p.title) === slugParam);
          if (!foundProject) {
            // Default to the first sample if nothing matches
            foundProject = FALLBACK_PROJECT_DETAIL[0];
          }
        }

        setProject(foundProject)
      } catch (err: any) {
        console.error("Error fetching project:", err)
        // Even on error, try fallback
        const fallback = FALLBACK_PROJECT_DETAIL.find(p => createSlug(p.idParam) === idParam) || FALLBACK_PROJECT_DETAIL[0];
        setProject(fallback);
      } finally {
        setLoading(false)
      }
    }

    fetchProject()
  }, [idParam])

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ ease: "linear", duration: 1, repeat: Number.POSITIVE_INFINITY }}
          className="h-16 w-16 border-t-4 border-blue-500 rounded-full animate-spin"
        ></motion.div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">Error loading project</h1>
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  if (!project) {
    return null
  }

  const getImageUrl = (imagePath: string | undefined) => {
    if (!imagePath) return "/default-preview.png"
    return imagePath.startsWith("http") ? imagePath : `/${imagePath}`
  }

  const absoluteUrl = (path: string) => {
    const host = window.location.host
    const protocol = window.location.protocol
    const cleaned = path.startsWith("/") ? path : `/${path}`
    return `${protocol}//${host}${cleaned}`
  }

  const shareProject = () => {
    const url = absoluteUrl(`/projects/${createSlug(project.title)}`)
    navigator.clipboard.writeText(url)
    toast.success("Project link copied to clipboard!")
  }

  return (
    <div className="min-h-screen bg-brand-background text-brand-text">
      <main className="max-w-7xl mx-auto px-6 py-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <div className="flex items-center justify-between mb-12">
            <Link href="/project" className="group flex items-center text-[10px] uppercase tracking-[0.4em] font-bold text-brand-text/40 hover:text-brand-green transition-colors">
              <ArrowLeft className="mr-4 h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Back to Projects
            </Link>
            
            {isAdmin && project && (
              <div className="relative group h-10 w-24">
                <AdminEditControls 
                  isVisible={true} 
                  itemId={project.id} 
                  itemType="project"
                  onDelete={() => router.push("/project")}
                  onEdit={() => router.push("/youcantseeme")}
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            <div className="lg:col-span-8">
              <header className="mb-12">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-[1px] w-8 bg-brand-green" />
                  <span className="text-brand-green text-[10px] uppercase tracking-[0.4em] font-bold">{project.category}</span>
                </div>
                <h1 className="text-5xl md:text-7xl font-display font-medium tracking-tighter mb-4 uppercase">
                  {project.title} <span className="text-brand-green italic">.</span>
                </h1>
                {project.subtitle && <p className="text-xl text-brand-text/60 italic font-serif">{project.subtitle}</p>}
              </header>

              <div className="mb-16">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {project.images.map((img, i) => (
                    <div 
                      key={i} 
                      className={cn(
                        "relative cursor-pointer overflow-hidden rounded-3xl group shadow-sm hover:shadow-xl transition-all duration-700",
                        i === 0 ? "md:col-span-2 aspect-[16/9]" : "aspect-[4/3]"
                      )}
                      onClick={() => {
                        setGalleryIndex(i)
                        setGalleryOpen(true)
                      }}
                    >
                      <img 
                        src={getImageUrl(img)} 
                        alt={`${project.title} ${i + 1}`} 
                        className="object-cover w-full h-full transition-transform duration-1000 group-hover:scale-105" 
                      />
                      <div className="absolute inset-0 bg-brand-green/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  ))}
                </div>
                <ImageGallery 
                  images={project.images.map(getImageUrl)} 
                  isOpen={galleryOpen}
                  onClose={() => setGalleryOpen(false)}
                  initialIndex={galleryIndex}
                />
              </div>

              <div className="space-y-12">
                <div className="prose prose-brand max-w-none text-brand-text/80 leading-relaxed text-lg" dangerouslySetInnerHTML={{ __html: project.description }}></div>

                {project.content && project.content.length > 0 && (
                  <div className="space-y-16">
                    {project.content.map((item, index) => (
                      <div key={index} className="space-y-6">
                        {item.type === "text" && (
                          <p className="text-brand-text/70 leading-relaxed text-lg whitespace-pre-wrap">{item.content}</p>
                        )}
                        {item.type === "image" && (
                          <figure className="space-y-4">
                            <div className="overflow-hidden rounded-3xl border border-brand-border/50">
                              <img
                                src={getImageUrl(item.src) || "/placeholder.svg"}
                                alt={item.caption || `Image ${index + 1}`}
                                className="w-full h-auto"
                              />
                            </div>
                            {item.caption && (
                              <figcaption className="text-center text-[10px] uppercase tracking-widest text-brand-text/40">
                                {item.caption}
                              </figcaption>
                            )}
                          </figure>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {project.youtube_walkthrough_link && (
                  <div className="pt-12 border-t border-brand-border/50">
                    <h2 className="text-3xl font-display font-medium uppercase tracking-tighter mb-8">
                      {project.youtube_walkthrough_heading || "Project"} <span className="text-brand-green italic">Walkthrough</span>
                    </h2>
                    <div className="aspect-video rounded-3xl overflow-hidden border border-brand-border/50 shadow-lg">
                      <iframe
                        src={`https://www.youtube.com/embed/${project.youtube_walkthrough_link.includes("v=") ? project.youtube_walkthrough_link.split("v=")[1] : project.youtube_walkthrough_link.split("/").pop()}`}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                      ></iframe>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="lg:col-span-4 lg:sticky lg:top-32 lg:h-fit"
            >
              <div className="glass rounded-[40px] p-10 space-y-10">
                <div className="space-y-6">
                  <h3 className="text-xs uppercase tracking-[0.4em] font-bold text-brand-green">Specifications</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-3 border-b border-brand-border/30">
                      <div className="flex items-center gap-3">
                        <Tag className="h-4 w-4 text-brand-green/60" />
                        <span className="text-[10px] uppercase tracking-widest text-brand-text/50">Category</span>
                      </div>
                      <span className="text-[11px] font-bold uppercase">{project.category}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-brand-border/30">
                      <div className="flex items-center gap-3">
                        <Building className="h-4 w-4 text-brand-green/60" />
                        <span className="text-[10px] uppercase tracking-widest text-brand-text/50">Area</span>
                      </div>
                      <span className="text-[11px] font-bold uppercase">{project.area}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-brand-border/30">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-brand-green/60" />
                        <span className="text-[10px] uppercase tracking-widest text-brand-text/50">Year</span>
                      </div>
                      <span className="text-[11px] font-bold uppercase">{project.year}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-brand-border/30">
                      <div className="flex items-center gap-3">
                        <User className="h-4 w-4 text-brand-green/60" />
                        <span className="text-[10px] uppercase tracking-widest text-brand-text/50">Client</span>
                      </div>
                      <span className="text-[11px] font-bold uppercase">{project.client}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-brand-border/30">
                      <div className="flex items-center gap-3">
                        <MapPin className="h-4 w-4 text-brand-green/60" />
                        <span className="text-[10px] uppercase tracking-widest text-brand-text/50">Location</span>
                      </div>
                      <span className="text-[11px] font-bold uppercase">{project.location}</span>
                    </div>
                    <div className="flex justify-between items-center py-3">
                      <div className="flex items-center gap-3">
                        <Check className="h-4 w-4 text-brand-green/60" />
                        <span className="text-[10px] uppercase tracking-widest text-brand-text/50">Status</span>
                      </div>
                      <span className="text-[11px] font-bold uppercase text-brand-green">{project.status}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-xs uppercase tracking-[0.4em] font-bold text-brand-green">Collaborators</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-3 border-b border-brand-border/30">
                      <div className="flex items-center gap-3">
                        <User className="h-4 w-4 text-brand-green/60" />
                        <span className="text-[10px] uppercase tracking-widest text-brand-text/50">Architect</span>
                      </div>
                      <span className="text-[11px] font-bold uppercase">{project.architect}</span>
                    </div>
                    <div className="flex justify-between items-center py-3">
                      <div className="flex items-center gap-3">
                        <Camera className="h-4 w-4 text-brand-green/60" />
                        <span className="text-[10px] uppercase tracking-widest text-brand-text/50">Photographer</span>
                      </div>
                      <span className="text-[11px] font-bold uppercase">{project.photographer}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <Button 
                    onClick={shareProject} 
                    className="w-full h-14 rounded-full bg-brand-text text-white hover:bg-brand-green transition-all flex items-center justify-center gap-3 group"
                  >
                    <Share2 className="h-4 w-4 group-hover:scale-110 transition-transform" /> 
                    <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Share Project</span>
                  </Button>
                </div>

                {project.latitude && project.longitude && (
                  <div className="space-y-6 pt-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs uppercase tracking-[0.4em] font-bold text-brand-green">Location</h3>
                      <button 
                        onClick={() => window.open(`https://www.google.com/maps?q=${project.latitude},${project.longitude}`, "_blank")}
                        className="text-[9px] uppercase tracking-widest font-bold flex items-center gap-2 text-brand-text/40 hover:text-brand-green transition-colors"
                      >
                        Open Maps <ExternalLink className="h-3 w-3" />
                      </button>
                    </div>
                    <div className="rounded-3xl overflow-hidden border border-brand-border/50 h-64 grayscale hover:grayscale-0 transition-all duration-700 shadow-sm">
                      <ProjectMap 
                        latitude={project.latitude} 
                        longitude={project.longitude} 
                        location={project.location}
                        projectTitle={project.title}
                      />
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}

const FALLBACK_PROJECT_DETAIL: any[] = [
  {
    id: 1,
    title: 'THE CRYSTAL RESIDENCE',
    subtitle: 'Luxury Living Redefined',
    category: 'Residential',
    location: 'Mumbai, India',
    year: '2024',
    area: '4,500 sq ft',
    client: 'Oberoi Group',
    status: 'Completed',
    architect: 'Rushikesh Sutar',
    photographer: 'Aman Singh',
    hero_image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=2000',
    description: 'A masterpiece of contemporary residential architecture, The Crystal Residence blends seamless indoor-outdoor living with sustainable design principles. The structure features high-performance glass facades that offer panoramic city views while maintaining thermal efficiency.',
    images: [
      'https://images.unsplash.com/photo-1600607687940-4e5a994e5373?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1600566753190-17f0bb2a6c3e?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=1200'
    ],
    content: [
      {
        type: 'text',
        content: 'The design philosophy centers around the concept of transparency and light. Every room is positioned to maximize natural ventilation, reducing the carbon footprint of the home significantly.'
      },
      {
        type: 'image',
        src: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=1200',
        caption: 'The grand living space with double-height ceilings.'
      },
      {
        type: 'text',
        content: 'The materials used include locally sourced stone and reclaimed wood, giving the modern structure a warm, organic feel.'
      }
    ],
    latitude: 19.0760,
    longitude: 72.8777,
    youtube_walkthrough_link: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
  }
];
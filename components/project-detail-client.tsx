"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import ImageGallery from "@/components/image-gallery"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { supabase, isSupabaseAvailable } from "@/lib/supabase"
import { createSlug, cn } from "@/lib/utils"
import Link from "next/link"
import { ArrowLeft, Calendar, User, Camera, Building, Tag, Share2, Check, ArrowRight } from "lucide-react"
import { toast } from "sonner"
import { Navbar } from "@/components/Navbar"

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

  const fetchProject = async () => {
    try {
      setLoading(true)
      let foundProject: Project | null = null;
      const identifier = idParam;

      if (isSupabaseAvailable()) {
        const { data: projects, error: fetchError } = await supabase!.from("projects").select("*")
        if (projects) {
          foundProject = projects.find((p) => createSlug(p.title) === identifier)
          if (!foundProject && !isNaN(Number(identifier))) {
            foundProject = projects.find((p) => p.id === Number(identifier))
          }
          
          const otherProjects = projects.filter((p) => !foundProject || p.id !== foundProject.id)
          const shuffled = otherProjects.sort(() => 0.5 - Math.random())
          setRelatedProjects(shuffled.slice(0, 3))
        }
      }

      if (!foundProject) {
        foundProject = FALLBACK_PROJECT_DETAIL.find(p => createSlug(p.title) === identifier);
        if (!foundProject) {
          foundProject = FALLBACK_PROJECT_DETAIL[0];
        }
        setRelatedProjects(FALLBACK_PROJECT_DETAIL.filter(p => p.id !== foundProject?.id).slice(0, 3));
      }

      setProject(foundProject)
      setError(null)
    } catch (err) {
      console.error("Error fetching project:", err)
      setProject(FALLBACK_PROJECT_DETAIL[0]);
      setError(null);
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    fetchProject()
    window.scrollTo(0, 0)
  }, [idParam])

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
      setTimeout(() => setCopied(false), 2000)
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

  if (!project) return null

  const allImages = [project.hero_image, ...(project.images || [])].filter(Boolean) as string[]

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
              <span className="text-white text-[10px] uppercase tracking-[0.4em] font-bold drop-shadow-md">{project.category}</span>
            </div>
            <h1 className="text-5xl md:text-9xl font-display font-medium text-white tracking-tighter uppercase leading-[0.8] mb-8 drop-shadow-xl">
              {project.title}
            </h1>
            {project.subtitle && (
              <p className="text-xl md:text-3xl text-white/90 font-display font-light italic max-w-2xl drop-shadow-md">{project.subtitle}</p>
            )}
          </motion.div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-6 py-24">
        {/* Project Info Bar in the scrollable area */}
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

            {/* Dynamic Content Blocks */}
            {project.content && project.content.length > 0 && (
              <div className="space-y-24">
                {project.content.map((block, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="space-y-8"
                  >
                    {block.type === "text" && (
                      <p className="text-lg md:text-xl text-brand-text/70 leading-relaxed font-light">{block.content}</p>
                    )}
                    {block.type === "image" && (
                      <div className="space-y-4">
                        <div className="rounded-[40px] overflow-hidden border border-brand-border/30 shadow-sm group">
                          <img 
                            src={block.src} 
                            alt={block.caption || "Project visual"} 
                            className="w-full h-auto transition-transform duration-1000 group-hover:scale-105"
                          />
                        </div>
                        {block.caption && (
                          <p className="text-center text-[9px] uppercase tracking-[0.3em] opacity-40 font-bold">{block.caption}</p>
                        )}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}

            {/* Image Grid / Gallery Trigger */}
            <div className="pt-24 border-t border-brand-border/30">
              <div className="flex items-center justify-between mb-12">
                <h3 className="text-3xl font-display uppercase tracking-tighter">Project <span className="text-brand-green italic">Gallery</span></h3>
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
                    key={i} 
                    className="aspect-square rounded-[32px] overflow-hidden cursor-pointer group"
                    onClick={() => openGallery(i + 1)}
                  >
                    <img 
                      src={img} 
                      alt="Gallery" 
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
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

            {/* Related Projects */}
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
                        <img src={rp.hero_image} alt={rp.title} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
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
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];
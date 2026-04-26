"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import ImageGallery from "@/components/image-gallery"
import ProjectMap from "@/components/project-map"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase, isSupabaseAvailable } from "@/lib/supabase"
import { createSlug } from "@/lib/utils"
import Link from "next/link"
import { ArrowLeft, MapPin, Calendar, User, Camera, Building, Tag, Share2, Check } from "lucide-react"
import { toast } from "sonner"

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
  const [relatedProjects, setRelatedProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [galleryOpen, setGalleryOpen] = useState(false)
  const [galleryIndex, setGalleryIndex] = useState(0)
  const [copied, setCopied] = useState(false)

  const DOMAIN = "https://hariomarchitects.vercel.app"

    const fetchProject = async () => {
    try {
      setLoading(true)
      if (!isSupabaseAvailable()) {
        setError("Database connection not available")
        return
      }
      const identifier = idParam
      const { data: projects, error: fetchError } = await supabase!.from("projects").select("*")
      if (fetchError) throw fetchError

      let foundProject = projects?.find((p) => createSlug(p.title) === identifier)
      if (!foundProject && !isNaN(Number(identifier))) {
        foundProject = projects?.find((p) => p.id === Number(identifier))
      }
      if (!foundProject) {
        setError("Project not found")
        return
      }
      setProject(foundProject)

      if (projects) {
        const otherProjects = projects.filter((p) => p.id !== foundProject.id)
        const shuffled = otherProjects.sort(() => 0.5 - Math.random())
        setRelatedProjects(shuffled.slice(0, 3))
      }
    } catch (err) {
      console.error("Error fetching project:", err)
      setError("Failed to load project")
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    fetchProject()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idParam])



  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return null
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}`
    }
    return null
  }

  const openGallery = (index = 0) => {
    setGalleryIndex(index)
    setGalleryOpen(true)
  }

  const handleShare = async () => {
    if (!project) return
    const shareData = {
      title: `${project.title} - Hariom Jangid Architects`,
      url: window.location.href,
    }
    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData)
        toast.success("Project shared successfully!")
      } else {
        await navigator.clipboard.writeText(window.location.href)
        setCopied(true)
        toast.success("Project link copied to clipboard!")
        setTimeout(() => setCopied(false), 2000)
      }
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        try {
          await navigator.clipboard.writeText(window.location.href)
          setCopied(true)
          toast.success("Project link copied to clipboard!")
          setTimeout(() => setCopied(false), 2000)
        } catch {
          toast.error("Unable to share project")
        }
      }
    }
  }

  const getAbsoluteImageUrl = (p: Project | null) => {
    if (!p) return `${DOMAIN}/default-preview.png`
    if (p.hero_image) {
      return p.hero_image.startsWith("http")
        ? p.hero_image
        : `${DOMAIN}${p.hero_image.startsWith("/") ? "" : "/"}${p.hero_image}`
    }
    if (p.images && p.images.length > 0) {
      const firstImage = p.images[0]
      return firstImage.startsWith("http")
        ? firstImage
        : `${DOMAIN}${firstImage.startsWith("/") ? "" : "/"}${firstImage}`
    }
    return `${DOMAIN}/default-preview.png`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white overflow-x-hidden">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh] pt-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading project...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-white overflow-x-hidden">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh] pt-20">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Project Not Found</h1>
            <p className="text-gray-600 mb-6">{error || "The project you're looking for doesn't exist."}</p>
            <Link href="/projects">
              <Button>← Back to Projects</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  const allImages = [project.hero_image, ...(project.images || [])].filter(Boolean) as string[]
  const embedUrl = project.youtube_walkthrough_link ? getYouTubeEmbedUrl(project.youtube_walkthrough_link) : null
  const absoluteImageUrl = getAbsoluteImageUrl(project)
  const overlayDescription = project.subtitle || project.description

  const galleryDescription = project.category?.toLowerCase().includes("interior")
    ? "Interior details and finishes from the project"
    : "Site photos and design visuals from the project"

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Full Screen Hero Section */}
      <div className="relative h-[100svh] w-full overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${project.hero_image || "/placeholder.svg?height=1080&width=1920"})`,
          }}
        >
          <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* Navigation Overlay */}
        <div className="absolute top-0 left-0 right-0 z-40">
          <Navigation />
        </div>

        {/* Back Button - Top Left */}
        <div className="absolute top-28 left-4 md:left-6 z-30">
          <Link href="/projects">
            <Button variant="ghost" className="text-white hover:bg-white/20 backdrop-blur-sm border border-white/20">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Projects
            </Button>
          </Link>
        </div>

        {/* Share Button - Top Right */}
        <div className="absolute top-28 right-4 md:right-6 z-30">
          <Button
            onClick={handleShare}
            variant="ghost"
            className="text-white hover:bg-white/20 backdrop-blur-sm border border-white/20"
          >
            {copied ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Copied!
              </>
            ) : (
              <>
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </>
            )}
          </Button>
        </div>

        {/* Project Title - left aligned on all screens with responsive padding */}
        <div className="absolute bottom-12 left-4 md:left-12 z-20 text-left max-w-2xl pr-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-light text-white mb-4 leading-tight">
              {project.title}
            </h1>
            {overlayDescription && <p className="text-lg md:text-2xl text-white/90 font-light">{overlayDescription}</p>}
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
          <div className="animate-bounce">
            <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="bg-white">
        {/* Main Content Grid */}
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-12">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <p className="text-lg text-gray-700 leading-relaxed">{project.description}</p>
              </motion.div>

              {project.content && project.content.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                  className="space-y-8"
                >
                  {project.content.map((block, index) => (
                    <div key={index}>
                      {block.type === "text" && (
                        <p className="text-gray-700 leading-relaxed text-lg">{block.content}</p>
                      )}
                      {block.type === "image" && block.src && (
                        <div className="space-y-2">
                          <img
                            src={block.src || "/placeholder.svg"}
                            alt={block.caption || "Project image"}
                            className="w-full rounded-lg shadow-lg cursor-pointer hover:shadow-xl transition-shadow duration-300"
                            onClick={() => {
                              const imageIndex = allImages.findIndex((img) => img === block.src)
                              openGallery(imageIndex >= 0 ? imageIndex : 0)
                            }}
                          />
                          {block.caption && <p className="text-center text-gray-500 italic text-sm">{block.caption}</p>}
                        </div>
                      )}
                    </div>
                  ))}
                </motion.div>
              )}

              {project.youtube_walkthrough_heading && project.youtube_walkthrough_link && (
                <motion.section
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                  className="space-y-6"
                >
                  <h2 className="text-3xl font-light text-gray-900">{project.youtube_walkthrough_heading}</h2>
                  <div className="relative aspect-video rounded-lg overflow-hidden shadow-xl">
                    {embedUrl ? (
                      <iframe
                        src={embedUrl}
                        title={`${project.title} - ${project.youtube_walkthrough_heading}`}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <div className="text-center">
                          <p className="text-gray-600 mb-4">Unable to embed video</p>
                          <a
                            href={project.youtube_walkthrough_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                          >
                            <span className="mr-2">▶</span>
                            Watch on YouTube
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.section>
              )}
            </div>

            {/* Right Column */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="sticky top-8 space-y-6"
              >
                <Badge className="bg-violet-100 text-violet-700 hover:bg-violet-200">{project.category}</Badge>

                <Card className="shadow-lg border-0 bg-white">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl font-semibold text-gray-900">Project Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {project.architect && (
                      <div className="flex items-start space-x-3">
                        <User className="h-5 w-5 text-violet-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 mb-1">Architects</p>
                          <p className="text-gray-600">{project.architect}</p>
                        </div>
                      </div>
                    )}

                    {project.location && (
                      <div className="flex items-start space-x-3">
                        <MapPin className="h-5 w-5 text-violet-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 mb-1">Location</p>
                          <p className="text-gray-600">{project.location}</p>
                        </div>
                      </div>
                    )}

                    {project.year && (
                      <div className="flex items-start space-x-3">
                        <Calendar className="h-5 w-5 text-violet-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 mb-1">Year</p>
                          <p className="text-gray-600">{project.year}</p>
                        </div>
                      </div>
                    )}

                    {project.area && (
                      <div className="flex items-start space-x-3">
                        <Tag className="h-5 w-5 text-violet-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 mb-1">Area</p>
                          <p className="text-gray-600">{project.area}</p>
                        </div>
                      </div>
                    )}

                    {project.photographer && (
                      <div className="flex items-start space-x-3">
                        <Camera className="h-5 w-5 text-violet-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 mb-1">Photography</p>
                          <p className="text-gray-600">{project.photographer}</p>
                        </div>
                      </div>
                    )}

                    {project.status && (
                      <div className="flex items-start space-x-3">
                        <Building className="h-5 w-5 text-violet-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 mb-1">Status</p>
                          <p className="text-gray-600">{project.status}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-violet-50 border-violet-200">
                  <CardContent className="p-6 text-center">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Contact for Details</h4>
                    <Link href="/contact">
                      <Button className="bg-violet-600 hover:bg-violet-700 text-white px-6">Get in Touch</Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Project Gallery Section (AFTER Project Information) */}
        {allImages.length > 1 && (
          <section className="py-16 px-4">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {allImages.slice(0, 4).map((image, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="relative aspect-square overflow-hidden rounded-lg cursor-pointer group"
                    onClick={() => openGallery(index)}
                  >
                    <img
                      src={image || "/placeholder.svg"}
                      alt={`${project.title} - Image ${index + 1}`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                  </motion.div>
                ))}
              </div>

              <div className="text-center">
                <p className="text-gray-500 italic text-sm mb-4">{galleryDescription}</p>
                {allImages.length > 4 && (
                  <Button
                    onClick={() => openGallery(0)}
                    variant="outline"
                    className="hover:bg-violet-50 hover:border-violet-300"
                  >
                    View All {allImages.length} Photos
                  </Button>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Location Section */}
        {project.location && (
          <section className="py-16">
            <div className="max-w-7xl mx-auto px-4">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl font-light text-gray-900 mb-8">Project Location</h2>
                <p className="text-gray-600 mb-8 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-violet-600" />
                  {project.location}
                </p>
                <ProjectMap
                  latitude={project.latitude}
                  longitude={project.longitude}
                  location={project.location}
                  projectTitle={project.title}
                />
              </motion.div>
            </div>
          </section>
        )}

        {/* Related Projects Section */}
        {relatedProjects.length > 0 && (
          <section className="py-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl font-light text-gray-900 text-center mb-12">Related Projects</h2>
                <div className="grid md:grid-cols-3 gap-8">
                  {relatedProjects.map((relatedProject, index) => (
                    <motion.div
                      key={relatedProject.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <Link href={`/projects/${createSlug(relatedProject.title)}`}>
                        <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer group">
                          <div className="relative overflow-hidden">
                            <img
                              src={relatedProject.hero_image || "/placeholder.svg?height=300&width=400"}
                              alt={relatedProject.title}
                              className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                          </div>
                          <div className="p-6">
                            <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-violet-600 transition-colors duration-300">
                              {relatedProject.title}
                            </h3>
                            <p className="text-gray-600 text-sm mb-2">{relatedProject.category}</p>
                            <p className="text-gray-500 text-sm line-clamp-2">{relatedProject.description}</p>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>

                <div className="text-center mt-12">
                  <Link href="/projects">
                    <Button
                      variant="outline"
                      size="lg"
                      className="px-8 hover:bg-violet-50 hover:border-violet-300 bg-transparent"
                    >
                      View All Projects
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </div>
          </section>
        )}
      </div>

      <ImageGallery
        images={allImages}
        isOpen={galleryOpen}
        onClose={() => setGalleryOpen(false)}
        initialIndex={galleryIndex}
      />

      <Footer />
    </div>
  )
}
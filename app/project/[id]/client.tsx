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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true)
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        const sb = createClient(url, key, { auth: { persistSession: false } })

        const { data: projects, error: fetchError } = await sb.from("projects").select("*")

        if (fetchError) {
          throw fetchError
        }

        if (!projects || projects.length === 0) {
          throw new Error("No projects found.")
        }

        let foundProject: Project | null = null
        const slugParam = idParam

        foundProject = projects.find((p) => createSlug(p.title) === slugParam)

        if (!foundProject && !isNaN(Number(slugParam))) {
          foundProject = projects.find((p) => p.id === Number(slugParam))
        }

        if (!foundProject) {
          throw new Error("Project not found.")
        }

        setProject(foundProject)
      } catch (err: any) {
        console.error("Error fetching project:", err)
        setError(err.message || "An unknown error occurred.")
        toast.error("Failed to load project details.")
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
    <div className="min-h-screen bg-background text-foreground">
      <main className="container mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <Link href="/projects" className="text-primary hover:underline flex items-center mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Projects
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card className="overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-4xl font-bold">{project.title}</CardTitle>
                  {project.subtitle && <p className="text-lg text-muted-foreground mt-2">{project.subtitle}</p>}
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <ImageGallery images={project.images.map(getImageUrl)} />
                  </div>

                  <div className="space-y-6">
                    <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: project.description }}></div>

                    {project.content && project.content.length > 0 && (
                      <div>
                        <h2 className="text-2xl font-semibold mb-4">Project Details</h2>
                        <div className="space-y-4">
                          {project.content.map((item, index) => (
                            <div key={index}>
                              {item.type === "text" && <p>{item.content}</p>}
                              {item.type === "image" && (
                                <div className="text-center">
                                  <img
                                    src={getImageUrl(item.src) || "/placeholder.svg"}
                                    alt={item.caption || `Image ${index + 1}`}
                                    className="max-w-full h-auto rounded-lg shadow-md mx-auto"
                                  />
                                  {item.caption && <p className="text-sm text-muted-foreground mt-2">{item.caption}</p>}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {project.youtube_walkthrough_link && (
                      <div className="mt-8">
                        <h2 className="text-2xl font-semibold mb-4">
                          {project.youtube_walkthrough_heading || "Video Walkthrough"}
                        </h2>
                        <div className="aspect-w-16 aspect-h-9">
                          <iframe
                            src={`https://www.youtube.com/embed/${project.youtube_walkthrough_link.split("v=")[1]}`}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="w-full h-full rounded-lg shadow-md"
                          ></iframe>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="lg:col-span-1 lg:sticky lg:top-24 lg:h-fit"
            >
              <Card>
                <CardHeader>
                  <CardTitle>Project Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center">
                    <Tag className="mr-2 h-4 w-4 text-primary" />
                    <p className="text-muted-foreground">
                      Category: <span className="text-foreground font-medium">{project.category}</span>
                    </p>
                  </div>
                  <div className="flex items-center">
                    <Building className="mr-2 h-4 w-4 text-primary" />
                    <p className="text-muted-foreground">
                      Area: <span className="text-foreground font-medium">{project.area}</span>
                    </p>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4 text-primary" />
                    <p className="text-muted-foreground">
                      Year: <span className="text-foreground font-medium">{project.year}</span>
                    </p>
                  </div>
                  <div className="flex items-center">
                    <User className="mr-2 h-4 w-4 text-primary" />
                    <p className="text-muted-foreground">
                      Client: <span className="text-foreground font-medium">{project.client}</span>
                    </p>
                  </div>
                  <div className="flex items-center">
                    <User className="mr-2 h-4 w-4 text-primary" />
                    <p className="text-muted-foreground">
                      Architect: <span className="text-foreground font-medium">{project.architect}</span>
                    </p>
                  </div>
                  <div className="flex items-center">
                    <Camera className="mr-2 h-4 w-4 text-primary" />
                    <p className="text-muted-foreground">
                      Photographer: <span className="text-foreground font-medium">{project.photographer}</span>
                    </p>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="mr-2 h-4 w-4 text-primary" />
                    <p className="text-muted-foreground">
                      Location: <span className="text-foreground font-medium">{project.location}</span>
                    </p>
                  </div>
                  <div className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-primary" />
                    <p className="text-muted-foreground">
                      Status: <span className="text-foreground font-medium">{project.status}</span>
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="mt-8">
                <CardHeader>
                  <CardTitle>Share Project</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button onClick={shareProject} className="w-full">
                    <Share2 className="mr-2 h-4 w-4" /> Share Link
                  </Button>
                </CardContent>
              </Card>

              {project.latitude && project.longitude && (
                <Card className="mt-8">
                  <CardHeader>
                    <CardTitle>Project Location</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ProjectMap lat={project.latitude} lng={project.longitude} />
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import AdminControls from "@/components/admin-controls"
import AdminEditControls from "@/components/admin-edit-controls"
import { supabase, type Project } from "@/lib/supabase"
import { createSlug } from "@/lib/utils"
import { Filter, Calendar, Clock } from "lucide-react"
type SortOption = "recent" | "oldest" | "year-desc" | "year-asc"

export default function ClientProjectsPage() {
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [sortBy, setSortBy] = useState<SortOption>("year-desc") // default to Year (Newest)
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdminControls, setShowAdminControls] = useState(false)

  const fetchProjects = async () => {
    try {
      if (supabase) {
        const { data, error } = await supabase.from("projects").select("*").order("created_at", { ascending: false })
        if (error) throw error
        setProjects(data || [])
      } else {
        setProjects([])
      }
    } catch (error) {
      console.error("Error fetching projects:", error)
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    fetchProjects()

    // Ctrl+D toggles Admin controls
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key.toLowerCase() === "d") {
        event.preventDefault()
        const password = prompt("Enter admin password:")
        if (password === "hahaharry") {
          setShowAdminControls((prev) => !prev)
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  

  // Categories that exist in data
  const categories = useMemo(() => {
    const order = ["Residential", "Commercial", "Interior", "Sustainable", "Public", "Hospitality"]
    const present = Array.from(new Set(projects.map((p) => p.category).filter(Boolean)))
    const inOrder = order.filter((c) => present.includes(c))
    const extras = present.filter((c) => !order.includes(c))
    return ["All", ...inOrder, ...extras]
  }, [projects])

  const getSortedProjects = (items: Project[]) => {
    const sorted = [...items]
    switch (sortBy) {
      case "recent":
        return sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      case "oldest":
        return sorted.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      case "year-desc":
        return sorted.sort((a, b) => Number(b.year) - Number(a.year))
      case "year-asc":
        return sorted.sort((a, b) => Number(a.year) - Number(b.year))
      default:
        return sorted
    }
  }

  const filteredProjects =
    selectedCategory === "All"
      ? getSortedProjects(projects)
      : getSortedProjects(projects.filter((project) => project.category === selectedCategory))

  const handleProjectAdded = () => fetchProjects()
  const handleProjectDeleted = () => fetchProjects()

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-violet-600"></div>
          <p className="mt-4 text-gray-600">{"Loading projects..."}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      
      {/* Optional admin add panel */}
      <AdminControls onDataUpdated={handleProjectAdded} />

      {/* Hero */}
      <section className="pt-24 pb-16 px-4 max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="text-violet-600 text-sm font-medium tracking-wider uppercase mb-4 block">{"Our Work"}</span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-light text-gray-900 mb-6 leading-tight">
            {"Featured Projects"}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {
              "Explore our diverse portfolio of architectural projects spanning residential, commercial, and public spaces."
            }
          </p>
        </motion.div>

        {/* Centered Filters and Sort */}
        <motion.div
          className="flex flex-col items-center gap-6 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Category chips */}
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                className={`${
                  selectedCategory === category
                    ? "bg-violet-600 text-white hover:bg-violet-700"
                    : "border-violet-600 text-violet-700 hover:bg-violet-50"
                }`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Sort control */}
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-violet-300 px-3 py-2 text-sm text-violet-700 flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">{"Sort by"}</span>
            </div>
            <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
              <SelectTrigger className="w-56 border-violet-400">
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="year-desc">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>{"Year (Newest)"}</span>
                  </div>
                </SelectItem>
                <SelectItem value="year-asc">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>{"Year (Oldest)"}</span>
                  </div>
                </SelectItem>
                <SelectItem value="recent">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>{"Recently Added"}</span>
                  </div>
                </SelectItem>
                <SelectItem value="oldest">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>{"Oldest First"}</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {/* Projects Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {filteredProjects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <div className="relative group">
                <Link href={`/projects/${createSlug(project.title)}`}>
                  <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer h-full">
                    <div className="relative">
                      <img
                        src={project.hero_image || "/placeholder.svg?height=320&width=640&query=project-hero"}
                        alt={project.title}
                        className="w-full h-64 object-cover group-hover:scale-[1.02] transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      {project.featured && (
                        <span className="absolute top-4 left-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                          Featured
                        </span>
                      )}
                    </div>
                    <CardContent className="p-6 flex flex-col gap-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-violet-700 font-medium">{project.category}</span>
                        <span className="text-gray-500">{project.year}</span>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 group-hover:text-violet-700 transition-colors">
                        {project.title}
                      </h3>
                      {project.location && <p className="text-gray-600 text-sm">{project.location}</p>}
                      <p className="text-gray-700 leading-relaxed">{project.description}</p>
                      <div className="pt-2">
                      </div>
                    </CardContent>
                  </Card>
                </Link>

                <AdminEditControls
                  isVisible={showAdminControls}
                  itemId={project.id}
                  itemType="project"
                  onDelete={handleProjectDeleted}
                />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">{"No projects found in this category."}</p>
          </div>
        )}
      </section>
    </div>
  )
}
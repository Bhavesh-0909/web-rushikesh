"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import AdminEditControls from "@/components/admin-edit-controls"
import { type Project } from "@/lib/supabase"
import { getProjects } from "./actions"
import { createSlug, cn } from "@/lib/utils"
import { Filter, Calendar, Clock, ArrowRight } from "lucide-react"
import { GridPattern } from "@/components/ui/grid-pattern"
type SortOption = "recent" | "oldest" | "year-desc" | "year-asc"

export default function ClientProjectsPage() {
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [sortBy, setSortBy] = useState<SortOption>("year-desc") // default to Year (Newest)
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const data = await getProjects()
      setProjects(data || [])
    } catch (error) {
      console.error("Error fetching projects:", error)
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    fetchProjects()

    if (sessionStorage.getItem("admin_auth") === "true") {
      setIsAdmin(true)
    }
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
      <div className="min-h-screen bg-brand-background flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ ease: "linear", duration: 1, repeat: Infinity }}
          className="h-12 w-12 border-t-2 border-brand-green rounded-full"
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-brand-background text-brand-text overflow-x-hidden pt-32 pb-20 px-6 relative">
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
      <section className="max-w-7xl mx-auto relative z-10">
        <motion.div
          className="text-center mb-24"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-[1px] w-12 bg-brand-border" />
            <span className="text-brand-green text-[10px] uppercase tracking-[0.4em] font-bold">The Portfolio</span>
            <div className="h-[1px] w-12 bg-brand-border" />
          </div>
          <h1 className="text-6xl md:text-8xl font-display font-medium tracking-tighter mb-8 uppercase">
            Curated <span className="text-brand-green italic">Works</span>
          </h1>
          <p className="text-brand-text/50 max-w-2xl mx-auto text-lg italic font-serif">
            "A collection of architectural visions brought to life through sustainable design and meticulous craftsmanship."
          </p>
        </motion.div>

        <motion.div
          className="flex flex-col items-center gap-8 mb-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <button
                key={category}
                className={cn(
                  "px-8 py-3 rounded-full text-[10px] uppercase tracking-[0.2em] font-bold transition-all duration-300 glass",
                  selectedCategory === category 
                    ? "bg-brand-green text-white" 
                    : "hover:bg-brand-green hover:text-white"
                )}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <div className="glass px-4 py-2 rounded-full text-[9px] uppercase tracking-widest font-bold flex items-center gap-2 opacity-60">
              <Filter className="h-3 w-3" /> Sort By
            </div>
            <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
              <SelectTrigger className="w-48 bg-transparent border-brand-border rounded-full text-[10px] uppercase tracking-widest font-bold h-10">
                <SelectValue placeholder="Sort..." />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-brand-border">
                <SelectItem value="year-desc">Year (Newest)</SelectItem>
                <SelectItem value="year-asc">Year (Oldest)</SelectItem>
                <SelectItem value="recent">Recently Added</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {filteredProjects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="group relative"
            >
              {isAdmin && (
                <AdminEditControls 
                  isVisible={true} 
                  itemId={project.id} 
                  itemType="project"
                  onDelete={handleProjectDeleted}
                />
              )}

              <Link href={`/project/${createSlug(project.title)}`}>
                <div className="bg-white/50 backdrop-blur-sm border border-brand-border/30 rounded-[40px] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-700 h-full">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={project.hero_image || "/placeholder.svg"}
                      alt={project.title}
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-brand-green/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                      <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-brand-green scale-50 group-hover:scale-100 transition-transform duration-500">
                        <ArrowRight size={20} />
                      </div>
                    </div>
                  </div>
                  <div className="p-10">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-brand-green">{project.category}</span>
                      <span className="text-[10px] uppercase tracking-widest font-bold opacity-30">{project.year}</span>
                    </div>
                    <h3 className="text-2xl font-display font-medium uppercase tracking-tighter mb-4 leading-none">
                      {project.title}
                    </h3>
                    <p className="text-[11px] uppercase tracking-widest text-brand-text/40">{project.location}</p>
                  </div>
                </div>
              </Link>
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
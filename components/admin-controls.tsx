"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import {
  supabase,
  type Project,
  type GalleryItem,
  type InstagramPost,
  type Testimonial,
} from "@/lib/supabase"
import { toast } from "sonner"
import { X, Plus, Edit, Trash2, MapPin, ExternalLink, Video as Youtube, Star, Award, BookOpen, BadgeCheck, Shield, Upload } from "lucide-react"
import ImageUpload from "@/components/ImageUpload"

interface AdminControlsProps {
  onDataUpdated?: () => void
}

export default function AdminControls({ onDataUpdated }: AdminControlsProps) {
  const [showAdminPanel, setShowAdminPanel] = useState(false)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [password, setPassword] = useState("")
  const [activeTab, setActiveTab] = useState("projects")
  const [operation, setOperation] = useState<"add" | "update" | "delete">("add")

  // Data states
  const [projects, setProjects] = useState<Project[]>([])
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([])
  const [instagramPosts, setInstagramPosts] = useState<InstagramPost[]>([])
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])

  // Form states
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [projectForm, setProjectForm] = useState<{
    title: string;
    subtitle: string;
    category: string;
    location: string;
    year: string;
    area: string;
    photographer: string;
    client: string;
    hero_image: string;
    description: string;
    images: string[];
    content: Array<{
      type: "text" | "image";
      content?: string;
      src?: string;
      caption?: string;
    }>;
    youtube_walkthrough_heading: string;
    youtube_walkthrough_link: string;
    featured: boolean;
  }>({
    title: "",
    subtitle: "",
    category: "",
    location: "",
    year: "",
    area: "",
    photographer: "",
    client: "",
    hero_image: "",
    description: "",
    images: [""],
    content: [{ type: "text", content: "" }],
    youtube_walkthrough_heading: "",
    youtube_walkthrough_link: "",
    featured: false,
  })

  const [designForm, setDesignForm] = useState({
    title: "",
    category: "",
    image: "",
    description: "",
  })

  const [instagramForm, setInstagramForm] = useState({
    image: "",
    likes: 0,
    comments: 0,
    post_link: "",
    post_date: "",
    caption: "",
  })

  const [testimonialForm, setTestimonialForm] = useState({
    name: "",
    role: "",
    company: "",
    image: "",
    rating: 5,
    text: "",
    featured: false,
  })

  const [achievementForm, setAchievementForm] = useState({
    title: "",
    organization: "",
    year: "",
    category: "award" as "award" | "certification" | "publication",
    icon: "Award",
    description: "",
    image: "",
    certificate_url: "",
    featured: false,
  })

  const [publicationForm, setPublicationForm] = useState({
    title: "",
    journal: "",
    date: "",
    author: "Rushikesh Sutar",
    image: "",
    description: "",
    link: "",
    featured: false,
  })

  useEffect(() => {
    fetchAllData()
  }, [])

  const handlePasswordSubmit = () => {
    // Logic moved to entry page
  }

  const fetchAllData = async () => {
    if (!supabase) return
    try {
        const [projectsRes, galleryRes, instagramRes, testimonialsRes] =
        await Promise.all([
          supabase.from("projects").select("*").order("created_at", { ascending: false }),
          supabase.from("gallery").select("*").order("created_at", { ascending: false }),
          supabase.from("instagram_posts").select("*").order("created_at", { ascending: false }),
          supabase.from("testimonials").select("*").order("created_at", { ascending: false }),
        ])
 
      if (projectsRes.data) setProjects(projectsRes.data)
      if (galleryRes.data) setGalleryItems(galleryRes.data)
      if (instagramRes.data) setInstagramPosts(instagramRes.data)
      if (testimonialsRes.data) setTestimonials(testimonialsRes.data)
    } catch (error) {
      console.error("Error fetching data:", error)
    }
  }

  const resetForms = () => {
    setProjectForm({
      title: "",
      subtitle: "",
      category: "",
      location: "",
      year: "",
      area: "",
      photographer: "",
      client: "",
      hero_image: "",
      description: "",
      images: [""],
      content: [{ type: "text", content: "" }],
      youtube_walkthrough_heading: "",
      youtube_walkthrough_link: "",
      featured: false,
    })
    setDesignForm({ title: "", category: "", image: "", description: "" })
    setInstagramForm({ image: "", likes: 0, comments: 0, post_link: "", post_date: "", caption: "" })
    setTestimonialForm({ name: "", role: "", company: "", image: "", rating: 5, text: "", featured: false })
    setAchievementForm({
      title: "",
      organization: "",
      year: "",
      category: "award",
      icon: "Award",
      description: "",
      image: "",
      certificate_url: "",
      featured: false,
    })
    setPublicationForm({
      title: "",
      journal: "",
      date: "",
      author: "Hariom Jangid",
      image: "",
      description: "",
      link: "",
      featured: false,
    })
    setSelectedItem(null)
  }

  const handleEdit = (item: any, type: string) => {
    setSelectedItem(item)
    setOperation("update")

    switch (type) {
      case "projects":
        setProjectForm({
          title: item.title || "",
          subtitle: item.subtitle || "",
          category: item.category || "",
          location: item.location || "",
          year: item.year || "",
          area: item.area || "",
          photographer: item.photographer || "",
          client: item.client || "",
          hero_image: item.hero_image || "",
          description: item.description || "",
          images: item.images && item.images.length > 0 ? item.images : [""],
          content: item.content && item.content.length > 0 ? item.content : [{ type: "text", content: "" }],
          youtube_walkthrough_heading: item.youtube_walkthrough_heading || "",
          youtube_walkthrough_link: item.youtube_walkthrough_link || "",
          featured: item.featured || false,
        })
        setActiveTab("projects")
        break
      case "gallery":
        setDesignForm({
          title: item.title || "",
          category: item.category || "",
          image: item.image || "",
          description: item.description || "",
        })
        setActiveTab("gallery")
        break
      case "instagram":
        setInstagramForm({
          image: item.image || "",
          likes: item.likes || 0,
          comments: item.comments || 0,
          post_link: item.post_link || "",
          post_date: item.post_date || "",
          caption: item.caption || "",
        })
        setActiveTab("instagram")
        break
      case "testimonials":
        setTestimonialForm({
          name: item.name || "",
          role: item.role || "",
          company: item.company || "",
          image: item.image || "",
          rating: item.rating || 5,
          text: item.text || "",
          featured: item.featured || false,
        })
        setActiveTab("testimonials")
        break
    }
  }

  const handleDelete = async (id: number, table: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return
    if (!supabase) return

    try {
      const { error } = await supabase.from(table).delete().eq("id", id)
      if (error) throw error

      toast.success("Item deleted successfully!")
      fetchAllData()
      onDataUpdated?.()
    } catch (error) {
      toast.error("Error deleting item")
      console.error(error)
    }
  }

  const handleSubmit = async (type: string) => {
    if (!supabase) return

    try {
      let data: any
      let table: string

      switch (type) {
        case "projects":
          data = {
            ...projectForm,
            images: projectForm.images.filter((img) => img.trim() !== ""),
            content: projectForm.content.filter(
              (block) =>
                (block.type === "text" && block.content?.trim()) || (block.type === "image" && (block as any).src?.trim()),
            ),
            youtube_walkthrough_heading: projectForm.youtube_walkthrough_heading || null,
            youtube_walkthrough_link: projectForm.youtube_walkthrough_link || null,
          }
          table = "projects"
          break
        case "gallery":
          data = designForm
          table = "gallery"
          break
        case "instagram":
          data = instagramForm
          table = "instagram_posts"
          break
        case "testimonials":
          data = testimonialForm
          table = "testimonials"
          break
        default:
          return
      }

      let result
      if (operation === "update" && selectedItem) {
        result = await supabase.from(table).update(data).eq("id", selectedItem.id)
      } else {
        result = await supabase.from(table).insert([data])
      }

      if (result.error) throw result.error

      toast.success(`${type} ${operation === "update" ? "updated" : "added"} successfully!`)
      resetForms()
      setOperation("add")
      fetchAllData()
      onDataUpdated?.()
    } catch (error) {
      toast.error(`Error ${operation === "update" ? "updating" : "adding"} ${type}`)
      console.error(error)
    }
  }

  const addImageField = () => {
    setProjectForm((prev) => ({
      ...prev,
      images: [...prev.images, ""],
    }))
  }

  const updateImageField = (index: number, value: string) => {
    setProjectForm((prev) => ({
      ...prev,
      images: prev.images.map((img, i) => (i === index ? value : img)),
    }))
  }

  const removeImageField = (index: number) => {
    setProjectForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }))
  }

  const addContentBlock = (type: "text" | "image") => {
    setProjectForm((prev) => ({
      ...prev,
      content: [
        ...prev.content,
        {
          type,
          content: type === "text" ? "" : undefined,
          src: type === "image" ? "" : undefined,
          caption: type === "image" ? "" : undefined,
        },
      ],
    }))
  }

  const updateContentBlock = (index: number, field: string, value: string) => {
    setProjectForm((prev) => ({
      ...prev,
      content: prev.content.map((block, i) => (i === index ? { ...block, [field]: value } : block)),
    }))
  }

  const removeContentBlock = (index: number) => {
    setProjectForm((prev) => ({
      ...prev,
      content: prev.content.filter((_, i) => i !== index),
    }))
  }


  const extractYouTubeVideoId = (url: string) => {
    const regex = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/
    const match = url.match(regex)
    return match ? match[1] : null
  }

  const previewYouTubeVideo = () => {
    if (projectForm.youtube_walkthrough_link) {
      const videoId = extractYouTubeVideoId(projectForm.youtube_walkthrough_link)
      if (videoId) {
        window.open(`https://www.youtube.com/watch?v=${videoId}`, "_blank")
      } else {
        toast.error("Invalid YouTube URL")
      }
    }
  }

  const renderItemsList = (items: any[], type: string) => (
    <div className="space-y-4">
      {items.map((item) => (
        <Card key={item.id} className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h4 className="font-medium">{item.title || item.name}</h4>
                {item.featured && (
                  <span className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
                    <Star className="h-3 w-3 mr-1" />
                    Featured
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500">
                {item.category || item.role || item.journal || item.organization} • {item.year || item.date}
              </p>
              {item.youtube_walkthrough_link && (
                <p className="text-xs text-red-600 mt-1">
                  <Youtube className="h-3 w-3 inline mr-1" />
                  YouTube Walkthrough Available
                </p>
              )}
            </div>
            <div className="flex space-x-2">
              <Button size="sm" variant="outline" onClick={() => handleEdit(item, type)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  handleDelete(
                    item.id,
                    type === "gallery" ? "gallery" : type === "instagram" ? "instagram_posts" : type,
                  )
                }
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )

  return (
    <div className="w-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6 mb-8 bg-brand-background/50 p-1 rounded-2xl border border-brand-border">
          <TabsTrigger value="projects" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-brand-green data-[state=active]:shadow-sm">Projects</TabsTrigger>
          <TabsTrigger value="gallery" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-brand-green data-[state=active]:shadow-sm">Gallery</TabsTrigger>
          <TabsTrigger value="instagram" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-brand-green data-[state=active]:shadow-sm">Instagram</TabsTrigger>
          <TabsTrigger value="testimonials" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-brand-green data-[state=active]:shadow-sm">Testimonials</TabsTrigger>
          <TabsTrigger value="approve" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-brand-green data-[state=active]:shadow-sm">Approve Emp</TabsTrigger>
          <TabsTrigger value="manage" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-brand-green data-[state=active]:shadow-sm">Manage Emp</TabsTrigger>
        </TabsList>

            {/* Common operation toggles */}
            <div className="flex space-x-2 my-4">
                      <Button 
                        variant={operation === "add" ? "default" : "outline"}
                        className={operation === "add" ? "bg-brand-green hover:bg-brand-green/90 text-white rounded-full px-6" : "rounded-full px-6 border-brand-border hover:text-brand-green"}
                        onClick={() => {
                          setOperation("add")
                          resetForms()
                        }}
                      >
                        Add New
                      </Button>
                      <Button 
                        variant={operation === "update" ? "default" : "outline"} 
                        className={operation === "update" ? "bg-brand-green hover:bg-brand-green/90 text-white rounded-full px-6" : "rounded-full px-6 border-brand-border hover:text-brand-green"}
                        onClick={() => setOperation("update")}
                      >
                        Update
                      </Button>
                      <Button 
                        variant={operation === "delete" ? "default" : "outline"} 
                        className={operation === "delete" ? "bg-brand-green hover:bg-brand-green/90 text-white rounded-full px-6" : "rounded-full px-6 border-brand-border hover:text-brand-green"}
                        onClick={() => setOperation("delete")}
                      >
                        Delete
                      </Button>
              <Button 
                variant="outline" 
                className="rounded-full px-6 border-brand-border hover:text-brand-green"
                onClick={fetchAllData}
              >
                Refresh
              </Button>
            </div>

            {/* Projects Tab */}
            <TabsContent value="projects" className="space-y-4">
              {operation === "delete" ? (
                renderItemsList(projects as any[], "projects")
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">Title *</Label>
                      <Input
                        id="title"
                        value={projectForm.title}
                        onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setProjectForm((prev) => ({ ...prev, title: e.target.value }))}
                        placeholder="Project title"
                      />
                    </div>
                    <div>
                      <Label htmlFor="subtitle">Subtitle</Label>
                      <Input
                        id="subtitle"
                        value={projectForm.subtitle}
                        onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setProjectForm((prev) => ({ ...prev, subtitle: e.target.value }))}
                        placeholder="Project subtitle"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="category">Category *</Label>
                      <Select
                        value={projectForm.category}
                        onValueChange={(value: string) => setProjectForm((prev) => ({ ...prev, category: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Residential">Residential</SelectItem>
                          <SelectItem value="Commercial">Commercial</SelectItem>
                          <SelectItem value="Interior">Interior</SelectItem>
                          <SelectItem value="Sustainable">Sustainable</SelectItem>
                          <SelectItem value="Public">Public</SelectItem>
                          <SelectItem value="Hospitality">Hospitality</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="location">Location *</Label>
                      <Input
                        id="location"
                        value={projectForm.location}
                        onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setProjectForm((prev) => ({ ...prev, location: e.target.value }))}
                        placeholder="City, Country"
                      />
                    </div>
                    <div>
                      <Label htmlFor="year">Year *</Label>
                      <Input
                        id="year"
                        value={projectForm.year}
                        onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setProjectForm((prev) => ({ ...prev, year: e.target.value }))}
                        placeholder="2024"
                      />
                    </div>
                  </div>

                  {/* Featured Project Option */}
                  <div className="border rounded-lg p-4 bg-violet-50">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="project-featured"
                        checked={projectForm.featured}
                        onCheckedChange={(checked: boolean | "indeterminate") => setProjectForm((prev) => ({ ...prev, featured: !!checked }))}
                      />
                      <Label htmlFor="project-featured" className="text-base font-medium flex items-center">
                        <Star className="h-5 w-5 mr-2 text-violet-600" />
                        Featured Project
                      </Label>
                    </div>
                    <p className="text-sm text-gray-600 mt-2 ml-7">
                      Featured projects will be highlighted on the homepage and in project listings
                    </p>
                  </div>

                  {/* YouTube Walkthrough */}
                  <div className="border rounded-lg p-4 bg-red-50">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <Label className="text-base font-medium flex items-center">
                          <Youtube className="h-5 w-5 mr-2 text-red-600" />
                          YouTube Walkthrough
                        </Label>
                        <p className="text-sm text-gray-600">Add a YouTube video walkthrough for this project</p>
                      </div>
                      {projectForm.youtube_walkthrough_link && (
                        <Button type="button" variant="outline" size="sm" onClick={previewYouTubeVideo}>
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Preview Video
                        </Button>
                      )}
                    </div>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="youtube_heading">Video Section Heading</Label>
                        <Input
                          id="youtube_heading"
                          value={projectForm.youtube_walkthrough_heading}
                          onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                            setProjectForm((prev) => ({ ...prev, youtube_walkthrough_heading: e.target.value }))
                          }
                          placeholder="e.g., Project Walkthrough"
                        />
                      </div>
                      <div>
                        <Label htmlFor="youtube_link">YouTube Video URL</Label>
                        <Input
                          id="youtube_link"
                          value={projectForm.youtube_walkthrough_link}
                          onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                            setProjectForm((prev) => ({ ...prev, youtube_walkthrough_link: e.target.value }))
                          }
                          placeholder="https://www.youtube.com/watch?v=VIDEO_ID"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Meta */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="area">Area</Label>
                      <Input
                        id="area"
                        value={projectForm.area}
                        onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setProjectForm((prev) => ({ ...prev, area: e.target.value }))}
                        placeholder="1,500 m²"
                      />
                    </div>
                    <div>
                      <Label htmlFor="photographer">Photographer</Label>
                      <Input
                        id="photographer"
                        value={projectForm.photographer}
                        onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setProjectForm((prev) => ({ ...prev, photographer: e.target.value }))}
                        placeholder="Photographer name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="client">Client</Label>
                      <Input
                        id="client"
                        value={projectForm.client}
                        onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setProjectForm((prev) => ({ ...prev, client: e.target.value }))}
                        placeholder="Client name"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="hero_image">Hero Image *</Label>
                    <ImageUpload
                      value={projectForm.hero_image}
                      onChange={(url: string) => setProjectForm((prev) => ({ ...prev, hero_image: url }))}
                      onRemove={() => setProjectForm((prev) => ({ ...prev, hero_image: "" }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={projectForm.description}
                      onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setProjectForm((prev) => ({ ...prev, description: e.target.value }))}
                      placeholder="Project description"
                      rows={3}
                    />
                  </div>

                  {/* Images */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Project Images</Label>
                      <Button type="button" variant="outline" size="sm" onClick={addImageField}>
                        <Plus className="w-4 h-4 mr-1" />
                        Add Image
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {projectForm.images.map((image, index) => (
                        <div key={index} className="flex gap-2 items-start">
                          <ImageUpload
                            value={image}
                            onChange={(url: string) => updateImageField(index, url)}
                            onRemove={() => updateImageField(index, "")}
                          />
                          {projectForm.images.length > 1 && (
                            <Button type="button" variant="outline" size="sm" onClick={() => removeImageField(index)} className="mt-1">
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Content Blocks */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Content Blocks</Label>
                      <div className="space-x-2">
                        <Button type="button" variant="outline" size="sm" onClick={() => addContentBlock("text")}>
                          Add Text
                        </Button>
                        <Button type="button" variant="outline" size="sm" onClick={() => addContentBlock("image")}>
                          Add Image
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-4">
                      {projectForm.content.map((block, index) => (
                        <div key={index} className="border p-4 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium capitalize">{block.type} Block</span>
                            <Button type="button" variant="outline" size="sm" onClick={() => removeContentBlock(index)}>
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                          {block.type === "text" ? (
                            <Textarea
                              value={block.content || ""}
                              onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => updateContentBlock(index, "content", e.target.value)}
                              placeholder="Enter text content"
                              rows={3}
                            />
                          ) : (
                            <div className="space-y-2">
                              <ImageUpload
                                value={(block as any).src || ""}
                                onChange={(url: string) => updateContentBlock(index, "src", url)}
                                onRemove={() => updateContentBlock(index, "src", "")}
                              />
                              <Input
                                value={(block as any).caption || ""}
                                onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => updateContentBlock(index, "caption", e.target.value)}
                                placeholder="Image caption"
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        resetForms()
                        setOperation("add")
                      }}
                    >
                      Cancel
                    </Button>
                    <Button onClick={() => handleSubmit("projects")} className="bg-brand-green hover:bg-brand-green/90 text-white rounded-full px-8 h-12">
                      {operation === "update" ? "Update" : "Add"} Project
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Gallery Tab */}
            <TabsContent value="gallery" className="space-y-4">
              {operation === "delete" ? (
                renderItemsList(galleryItems as any[], "gallery")
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="galleryTitle">Title *</Label>
                      <Input
                        id="galleryTitle"
                        value={designForm.title}
                        onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setDesignForm((p) => ({ ...p, title: e.target.value }))}
                        placeholder="Gallery title"
                      />
                    </div>
                    <div>
                      <Label htmlFor="galleryCategory">Category *</Label>
                      <Select
                        value={designForm.category}
                        onValueChange={(v: string) => setDesignForm((p) => ({ ...p, category: v }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Residential">Residential</SelectItem>
                          <SelectItem value="Commercial">Commercial</SelectItem>
                          <SelectItem value="Interior">Interior</SelectItem>
                          <SelectItem value="Sustainable">Sustainable</SelectItem>
                          <SelectItem value="Public">Public</SelectItem>
                          <SelectItem value="Furniture">Furniture</SelectItem>
                          <SelectItem value="Concept">Concept</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="galleryImage">Image *</Label>
                    <ImageUpload
                      value={designForm.image}
                      onChange={(url: string) => setDesignForm((p) => ({ ...p, image: url }))}
                      onRemove={() => setDesignForm((p) => ({ ...p, image: "" }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="galleryDescription">Description</Label>
                    <Textarea
                      id="galleryDescription"
                      rows={3}
                      value={designForm.description}
                      onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setDesignForm((p) => ({ ...p, description: e.target.value }))}
                      placeholder="Short description"
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={resetForms}>
                      Cancel
                    </Button>
                    <Button onClick={() => handleSubmit("gallery")} className="bg-brand-green hover:bg-brand-green/90 text-white rounded-full px-8 h-12">
                      {operation === "update" ? "Update" : "Add"} Gallery Item
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Instagram Tab */}
            <TabsContent value="instagram" className="space-y-4">
              {operation === "delete" ? (
                renderItemsList(instagramPosts as any[], "instagram")
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="instaImage">Post Image *</Label>
                      <ImageUpload
                        value={instagramForm.image}
                        onChange={(url: string) => setInstagramForm((p) => ({ ...p, image: url }))}
                        onRemove={() => setInstagramForm((p) => ({ ...p, image: "" }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="instaLink">Post Link</Label>
                      <Input
                        id="instaLink"
                        value={instagramForm.post_link}
                        onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setInstagramForm((p) => ({ ...p, post_link: e.target.value }))}
                        placeholder="https://instagram.com/p/XYZ"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="instaLikes">Likes</Label>
                      <Input
                        id="instaLikes"
                        type="number"
                        value={instagramForm.likes}
                        onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setInstagramForm((p) => ({ ...p, likes: Number(e.target.value) }))}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="instaComments">Comments</Label>
                      <Input
                        id="instaComments"
                        type="number"
                        value={instagramForm.comments}
                        onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setInstagramForm((p) => ({ ...p, comments: Number(e.target.value) }))}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="instaDate">Post Date</Label>
                      <Input
                        id="instaDate"
                        type="date"
                        value={instagramForm.post_date}
                        onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setInstagramForm((p) => ({ ...p, post_date: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="instaCaption">Caption</Label>
                    <Textarea
                      id="instaCaption"
                      rows={3}
                      value={instagramForm.caption}
                      onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setInstagramForm((p) => ({ ...p, caption: e.target.value }))}
                      placeholder="Write a caption..."
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={resetForms}>
                      Cancel
                    </Button>
                    <Button onClick={() => handleSubmit("instagram")} className="bg-brand-green hover:bg-brand-green/90 text-white rounded-full px-8 h-12">
                      {operation === "update" ? "Update" : "Add"} Post
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Testimonials Tab */}
            <TabsContent value="testimonials" className="space-y-4">
              {operation === "delete" ? (
                renderItemsList(testimonials as any[], "testimonials")
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="tName">Name *</Label>
                      <Input
                        id="tName"
                        value={testimonialForm.name}
                        onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setTestimonialForm((p) => ({ ...p, name: e.target.value }))}
                        placeholder="Full name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="tRole">Role</Label>
                      <Input
                        id="tRole"
                        value={testimonialForm.role}
                        onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setTestimonialForm((p) => ({ ...p, role: e.target.value }))}
                        placeholder="Role / Title"
                      />
                    </div>
                    <div>
                      <Label htmlFor="tCompany">Company</Label>
                      <Input
                        id="tCompany"
                        value={testimonialForm.company}
                        onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setTestimonialForm((p) => ({ ...p, company: e.target.value }))}
                        placeholder="Company"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2">
                      <Label htmlFor="tImage">Author Image</Label>
                      <ImageUpload
                        value={testimonialForm.image || ""}
                        onChange={(url: string) => setTestimonialForm((p) => ({ ...p, image: url }))}
                        onRemove={() => setTestimonialForm((p) => ({ ...p, image: "" }))}
                      />
                    </div>
                    <div>
                      <Label>Rating</Label>
                      <Select
                        value={String(testimonialForm.rating)}
                        onValueChange={(v: string) => setTestimonialForm((p) => ({ ...p, rating: Number(v) }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Rating" />
                        </SelectTrigger>
                        <SelectContent>
                          {[5, 4, 3, 2, 1].map((r) => (
                            <SelectItem key={r} value={String(r)}>
                              {r}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4 bg-violet-50">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="tFeatured"
                        checked={testimonialForm.featured}
                        onCheckedChange={(c: boolean | "indeterminate") => setTestimonialForm((p) => ({ ...p, featured: !!c }))}
                      />
                      <Label htmlFor="tFeatured" className="text-base font-medium flex items-center">
                        <Star className="h-5 w-5 mr-2 text-violet-600" />
                        Featured Testimonial
                      </Label>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="tText">Testimonial *</Label>
                    <Textarea
                      id="tText"
                      rows={4}
                      value={testimonialForm.text}
                      onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setTestimonialForm((p) => ({ ...p, text: e.target.value }))}
                      placeholder="What did the client say?"
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={resetForms}>
                      Cancel
                    </Button>
                    <Button onClick={() => handleSubmit("testimonials")} className="bg-brand-green hover:bg-brand-green/90 text-white rounded-full px-8 h-12">
                      {operation === "update" ? "Update" : "Add"} Testimonial
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Employee Tabs */}
            <TabsContent value="approve" className="space-y-4">
              <div className="bg-white/50 backdrop-blur-sm border border-dashed border-brand-border rounded-3xl p-12 text-center">
                <div className="bg-brand-green/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-brand-green" />
                </div>
                <h3 className="text-xl font-medium mb-2">Approve Employees</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  New registrations will appear here for verification. This section is currently under development.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="manage" className="space-y-4">
              <div className="bg-white/50 backdrop-blur-sm border border-dashed border-brand-border rounded-3xl p-12 text-center">
                <div className="bg-brand-green/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-brand-green" />
                </div>
                <h3 className="text-xl font-medium mb-2">Manage Employees</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  Directory of all approved team members. This section is currently under development.
                </p>
              </div>
            </TabsContent>
      </Tabs>
    </div>
  )
}

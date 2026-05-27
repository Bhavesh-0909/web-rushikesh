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
  type Employee,
} from "@/lib/supabase"
import { toast } from "sonner"
import { X, Plus, Edit, Trash2, MapPin, ExternalLink, Video as Youtube, Star, Award, BookOpen, BadgeCheck, Shield, Upload, Calendar, Settings, DollarSign, UserCheck, UserX, CheckCircle, Trash, RefreshCw, AlertTriangle, Eye } from "lucide-react"
import ImageUpload from "@/components/ImageUpload"
import { Badge } from "@/components/ui/badge"
import {
  getAllProfiles,
  updateProfileStatus,
  toggleProfileDisabled,
  getSalaryStructure,
  updateSalaryStructure,
  getAttendanceForAdmin,
  adminMarkAttendance,
  generateAllPayslipsForMonth,
  addSalaryComponent
} from "@/lib/employee-db"

const getDaysInMonth = (year: number, month: number) => new Date(year, month, 0).getDate();

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
  const [employees, setEmployees] = useState<Employee[]>([])

  // Employee Portal admin states
  const [portalEmployees, setPortalEmployees] = useState<any[]>([])
  const [portalLoading, setPortalLoading] = useState(false)
  const [activePortalSubTab, setActivePortalSubTab] = useState<"pending" | "employees" | "attendance" | "payslips">("employees")
  const [selectedPortalEmployee, setSelectedPortalEmployee] = useState<any>(null)
  const [salaryStructure, setSalaryStructure] = useState<any[]>([])
  const [showSalaryStructureDialog, setShowSalaryStructureDialog] = useState(false)
  
  // Portal Attendance states
  const [selectedPortalDate, setSelectedPortalDate] = useState<string>(new Date().toISOString().split("T")[0])
  const [portalAttendance, setPortalAttendance] = useState<any[]>([])
  
  // Portal Payslips states
  const [selectedPayslipMonth, setSelectedPayslipMonth] = useState<number>(new Date().getMonth() + 1)
  const [selectedPayslipYear, setSelectedPayslipYear] = useState<number>(new Date().getFullYear())
  const [generatingPayslips, setGeneratingPayslips] = useState(false)
  
  // Custom salary component form states
  const [newComponentName, setNewComponentName] = useState("")
  const [newComponentType, setNewComponentType] = useState<"earning" | "deduction">("earning")
  const [newComponentAttendance, setNewComponentAttendance] = useState(false)
  const [addingComponent, setAddingComponent] = useState(false)

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

  const [employeeForm, setEmployeeForm] = useState({
    name: "",
    role: "",
    imageurl: "",
    description: "",
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
    fetchPortalData()
  }, [])

  const fetchPortalData = async () => {
    setPortalLoading(true)
    try {
      const res = await getAllProfiles()
      if (res.success && res.profiles) {
        setPortalEmployees(res.profiles)
      }
      
      // Fetch attendance for selected date
      await fetchPortalAttendance(selectedPortalDate)
    } catch (err) {
      console.error(err)
    } finally {
      setPortalLoading(false)
    }
  }

  const fetchPortalAttendance = async (dateStr: string) => {
    const res = await getAttendanceForAdmin(dateStr)
    if (res.success && res.records) {
      setPortalAttendance(res.records)
    }
  }

  const handlePortalStatusChange = async (profileId: number, status: "pending" | "approved" | "rejected") => {
    const res = await updateProfileStatus(profileId, status)
    if (res.success) {
      toast.success(`Employee request ${status} successfully!`)
      fetchPortalData()
    } else {
      toast.error(res.error || "Failed to update employee status.")
    }
  }

  const handlePortalToggleDisabled = async (profileId: number, currentDisabled: boolean) => {
    const res = await toggleProfileDisabled(profileId, !currentDisabled)
    if (res.success) {
      toast.success(`Employee access ${!currentDisabled ? "disabled" : "enabled"} successfully!`)
      fetchPortalData()
    } else {
      toast.error(res.error || "Failed to update employee access.")
    }
  }

  const handleOpenSalaryStructure = async (emp: any) => {
    setSelectedPortalEmployee(emp)
    const res = await getSalaryStructure(emp.id)
    if (res.success && res.structure) {
      setSalaryStructure(res.structure)
      setShowSalaryStructureDialog(true)
    } else {
      toast.error("Failed to load employee salary structure.")
    }
  }

  const handleSaveSalaryStructure = async () => {
    if (!selectedPortalEmployee) return
    
    const updates = salaryStructure.map(comp => ({
      componentId: comp.componentId,
      amount: parseFloat(comp.amount) || 0
    }))
    
    const res = await updateSalaryStructure(selectedPortalEmployee.id, updates)
    if (res.success) {
      toast.success("Salary structure saved successfully!")
      setShowSalaryStructureDialog(false)
    } else {
      toast.error(res.error || "Failed to save salary structure.")
    }
  }

  const handleAddNewComponent = async () => {
    if (!newComponentName.trim()) {
      toast.error("Please enter a component name.")
      return
    }

    setAddingComponent(true)
    try {
      const res = await addSalaryComponent(
        newComponentName.trim(),
        newComponentType,
        newComponentAttendance
      )

      if (res.success) {
        toast.success(`Salary category "${newComponentName}" added successfully!`)
        setNewComponentName("")
        setNewComponentAttendance(false)
        
        // Refresh currently selected employee's salary structure (self-heals the dialog!)
        if (selectedPortalEmployee) {
          const structRes = await getSalaryStructure(selectedPortalEmployee.id)
          if (structRes.success && structRes.structure) {
            setSalaryStructure(structRes.structure)
          }
        }
      } else {
        toast.error(res.error || "Failed to create category.")
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred.")
    } finally {
      setAddingComponent(false)
    }
  }

  const handleAdminMarkAttendance = async (empId: number, status: string) => {
    const res = await adminMarkAttendance(empId, selectedPortalDate, status)
    if (res.success) {
      toast.success("Attendance updated successfully!")
      fetchPortalAttendance(selectedPortalDate)
    } else {
      toast.error(res.error || "Failed to update attendance.")
    }
  }

  const handleGeneratePayslips = async () => {
    setGeneratingPayslips(true)
    try {
      const res = await generateAllPayslipsForMonth(selectedPayslipYear, selectedPayslipMonth)
      if (res.success) {
        toast.success(`Payslips generated successfully for ${selectedPayslipYear}-${String(selectedPayslipMonth).padStart(2, "0")}!`)
      } else {
        toast.error(res.error || "Failed to generate payslips.")
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred.")
    } finally {
      setGeneratingPayslips(false)
    }
  }

  const handlePasswordSubmit = () => {
    // Logic moved to entry page
  }

  const fetchAllData = async () => {
    if (!supabase) return
    try {
      const [projectsRes, galleryRes, instagramRes, testimonialsRes, employeesRes] =
        await Promise.all([
          supabase.from("projects").select("*").order("created_at", { ascending: false }),
          supabase.from("gallery").select("*").order("created_at", { ascending: false }),
          supabase.from("instagram_posts").select("*").order("created_at", { ascending: false }),
          supabase.from("testimonials").select("*").order("created_at", { ascending: false }),
          supabase.from("employees").select("*").order("created_at", { ascending: false }),
        ])

      if (projectsRes.data) setProjects(projectsRes.data)
      if (galleryRes.data) setGalleryItems(galleryRes.data)
      if (instagramRes.data) setInstagramPosts(instagramRes.data)
      if (testimonialsRes.data) setTestimonials(testimonialsRes.data)
      if (employeesRes.data) setEmployees(employeesRes.data)
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
    setEmployeeForm({ name: "", role: "", imageurl: "", description: "" })
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
      case "employees":
        setEmployeeForm({
          name: item.name || "",
          role: item.role || "",
          imageurl: item.imageurl || "",
          description: item.description || "",
        })
        setActiveTab("approve")
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
        case "employees":
          data = employeeForm
          table = "employees"
          break
        default:
          return
      }

      let result
      if (operation === "update" && selectedItem) {
        result = await supabase.from(table).update(data).eq("id", selectedItem.id)

        if (table === "projects") {
          const oldImages = selectedItem.images || []
          for (const d of data.images) {
            if (!oldImages.includes(d)) {
              await supabase.from("gallery").insert({
                title: data.title,
                category: data.category,
                image: d,
                description: data.description,
              })
            }
          }
          for (const d of oldImages) {
            if (!data.images.includes(d)) {
              await supabase.from("gallery").delete().eq("image", d)
            }
          }
        }
      } else {
        result = await supabase.from(table).insert([data])

        if (table === "projects") {
          for (const d of data.images) {
            await supabase.from("gallery").insert({
              title: data.title,
              category: data.category,
              image: d,
              description: data.description,
            })
          }
        }
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
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Approved Employees</h2>
            {operation !== "add" || selectedItem ? (
              <Button onClick={resetForms} variant="outline">
                Back to List
              </Button>
            ) : null}
          </div>

          {!selectedItem && operation === "add" ? (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl border border-brand-border shadow-sm">
                <h3 className="text-lg font-medium mb-4">Add New Employee</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="eName">Name *</Label>
                      <Input
                        id="eName"
                        value={employeeForm.name}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmployeeForm((p) => ({ ...p, name: e.target.value }))}
                        placeholder="Employee Name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="eRole">Role *</Label>
                      <Input
                        id="eRole"
                        value={employeeForm.role}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmployeeForm((p) => ({ ...p, role: e.target.value }))}
                        placeholder="Role / Title"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="eImage">Employee Image *</Label>
                    <ImageUpload
                      value={employeeForm.imageurl || ""}
                      onChange={(url: string) => setEmployeeForm((p) => ({ ...p, imageurl: url }))}
                      onRemove={() => setEmployeeForm((p) => ({ ...p, imageurl: "" }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="eDesc">Description</Label>
                    <Textarea
                      id="eDesc"
                      rows={3}
                      value={employeeForm.description}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEmployeeForm((p) => ({ ...p, description: e.target.value }))}
                      placeholder="Brief bio or description..."
                    />
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button onClick={() => handleSubmit("employees")} className="bg-brand-green hover:bg-brand-green/90 text-white rounded-full px-8">
                      Add Employee
                    </Button>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Current Employees</h3>
                {employees.length === 0 ? (
                  <p className="text-gray-500">No employees found.</p>
                ) : (
                  renderItemsList(employees, "employees")
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-xl border border-brand-border shadow-sm space-y-4">
              <h3 className="text-lg font-medium mb-4">Edit Employee</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="euName">Name *</Label>
                  <Input
                    id="euName"
                    value={employeeForm.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmployeeForm((p) => ({ ...p, name: e.target.value }))}
                    placeholder="Employee Name"
                  />
                </div>
                <div>
                  <Label htmlFor="euRole">Role *</Label>
                  <Input
                    id="euRole"
                    value={employeeForm.role}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmployeeForm((p) => ({ ...p, role: e.target.value }))}
                    placeholder="Role / Title"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="euImage">Employee Image *</Label>
                <ImageUpload
                  value={employeeForm.imageurl || ""}
                  onChange={(url: string) => setEmployeeForm((p) => ({ ...p, imageurl: url }))}
                  onRemove={() => setEmployeeForm((p) => ({ ...p, imageurl: "" }))}
                />
              </div>

              <div>
                <Label htmlFor="euDesc">Description</Label>
                <Textarea
                  id="euDesc"
                  rows={3}
                  value={employeeForm.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEmployeeForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Brief bio or description..."
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={resetForms}>
                  Cancel
                </Button>
                <Button onClick={() => handleSubmit("employees")} className="bg-brand-green hover:bg-brand-green/90 text-white rounded-full px-8">
                  Update Employee
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="manage" className="space-y-6">
          
          {/* Sub Navigation Tabs */}
          <div className="flex flex-wrap gap-2 border-b border-brand-border pb-4 mb-4">
            <Button
              variant={activePortalSubTab === "employees" ? "default" : "outline"}
              onClick={() => setActivePortalSubTab("employees")}
              className={`rounded-full px-5 text-xs ${activePortalSubTab === "employees" ? "bg-brand-green hover:bg-brand-green/90 text-white" : "border-brand-border hover:text-brand-green"}`}
            >
              Approved Employees ({portalEmployees.filter(e => e.approval_status === "approved").length})
            </Button>
            <Button
              variant={activePortalSubTab === "pending" ? "default" : "outline"}
              onClick={() => setActivePortalSubTab("pending")}
              className={`rounded-full px-5 text-xs ${activePortalSubTab === "pending" ? "bg-brand-green hover:bg-brand-green/90 text-white" : "border-brand-border hover:text-brand-green"}`}
            >
              Pending Requests ({portalEmployees.filter(e => e.approval_status === "pending").length})
            </Button>
            <Button
              variant={activePortalSubTab === "attendance" ? "default" : "outline"}
              onClick={() => setActivePortalSubTab("attendance")}
              className={`rounded-full px-5 text-xs ${activePortalSubTab === "attendance" ? "bg-brand-green hover:bg-brand-green/90 text-white" : "border-brand-border hover:text-brand-green"}`}
            >
              Attendance Board
            </Button>
            <Button
              variant={activePortalSubTab === "payslips" ? "default" : "outline"}
              onClick={() => setActivePortalSubTab("payslips")}
              className={`rounded-full px-5 text-xs ${activePortalSubTab === "payslips" ? "bg-brand-green hover:bg-brand-green/90 text-white" : "border-brand-border hover:text-brand-green"}`}
            >
              Payslips Generator
            </Button>
            <Button
              variant="outline"
              onClick={fetchPortalData}
              className="rounded-full px-4 text-xs border-brand-border text-gray-500 hover:text-brand-green ml-auto"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Reload Portal
            </Button>
          </div>

          {/* Sub Tab: APPROVED EMPLOYEES */}
          {activePortalSubTab === "employees" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-medium">Approved Portal Employees</h3>
                <p className="text-xs text-gray-500">Configure salary structures and toggle portal access.</p>
              </div>

              {portalEmployees.filter(e => e.approval_status === "approved").length === 0 ? (
                <div className="bg-white/50 border border-brand-border rounded-3xl p-12 text-center text-gray-500">
                  No approved portal employees found. Go to "Pending Requests" to approve registered accounts.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {portalEmployees.filter(e => e.approval_status === "approved").map((emp) => (
                    <Card key={emp.id} className="p-5 bg-white border border-brand-border hover:shadow-md transition-all rounded-2xl relative overflow-hidden">
                      {emp.disabled && (
                        <div className="absolute top-0 left-0 w-full h-1 bg-red-500" />
                      )}
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-base">{emp.full_name}</h4>
                            {emp.disabled ? (
                              <span className="bg-red-50 text-red-700 text-[9px] font-bold px-2 py-0.5 rounded border border-red-200">Disabled</span>
                            ) : (
                              <span className="bg-emerald-50 text-emerald-700 text-[9px] font-bold px-2 py-0.5 rounded border border-emerald-200">Active</span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-1 font-mono">{emp.employee_id} &bull; {emp.role}</p>
                          <p className="text-xs text-gray-400 mt-1">{emp.email} {emp.phone ? `| ${emp.phone}` : ""}</p>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleOpenSalaryStructure(emp)}
                            className="bg-brand-green hover:bg-brand-green/90 text-white rounded-full text-xs"
                          >
                            <DollarSign className="h-3 w-3 mr-1" />
                            Salary Structure
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePortalToggleDisabled(emp.id, emp.disabled)}
                            className={`rounded-full text-xs border-brand-border ${emp.disabled ? "hover:bg-emerald-50 hover:text-emerald-700" : "hover:bg-red-50 hover:text-red-600"}`}
                          >
                            {emp.disabled ? (
                              <>
                                <UserCheck className="h-3 w-3 mr-1" />
                                Enable Access
                              </>
                            ) : (
                              <>
                                <UserX className="h-3 w-3 mr-1" />
                                Disable Access
                              </>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePortalStatusChange(emp.id, "pending")}
                            className="rounded-full text-xs text-gray-500 border-brand-border hover:bg-gray-50"
                          >
                            Move back to Pending
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Sub Tab: PENDING REQUESTS */}
          {activePortalSubTab === "pending" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-medium">Pending Signup Requests</h3>
                <p className="text-xs text-gray-500">Approve or reject employee accounts waiting for access.</p>
              </div>

              {portalEmployees.filter(e => e.approval_status === "pending").length === 0 ? (
                <div className="bg-white/50 border border-brand-border rounded-3xl p-12 text-center text-gray-400 text-sm">
                  No pending employee registration requests found.
                </div>
              ) : (
                <div className="space-y-3">
                  {portalEmployees.filter(e => e.approval_status === "pending").map((emp) => (
                    <Card key={emp.id} className="p-5 bg-white border border-brand-border hover:shadow-md transition-all rounded-2xl">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                          <h4 className="font-semibold text-base">{emp.full_name}</h4>
                          <p className="text-xs text-brand-green mt-1 font-bold">Requested Role: {emp.role}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Employee ID: <code className="bg-gray-100 px-1 py-0.5 rounded font-mono text-[11px]">{emp.employee_id}</code> &bull; Email: {emp.email}
                          </p>
                          {emp.phone && <p className="text-xs text-gray-400 mt-0.5">Phone: {emp.phone}</p>}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handlePortalStatusChange(emp.id, "approved")}
                            className="bg-brand-green hover:bg-brand-green/90 text-white rounded-full text-xs h-10 px-5"
                          >
                            <UserCheck className="h-3.5 w-3.5 mr-1" />
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => handlePortalStatusChange(emp.id, "rejected")}
                            className="rounded-full text-xs h-10 px-5 text-red-600 border-brand-border hover:bg-red-50 hover:text-red-700"
                          >
                            <UserX className="h-3.5 w-3.5 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Sub Tab: ATTENDANCE BOARD */}
          {activePortalSubTab === "attendance" && (
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
                <div>
                  <h3 className="text-lg font-medium">Daily Attendance Board</h3>
                  <p className="text-xs text-gray-500">Monitor and manually edit employee daily attendance logs.</p>
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="adminDate" className="text-xs font-semibold text-gray-600 whitespace-nowrap">Selected Date:</Label>
                  <Input
                    id="adminDate"
                    type="date"
                    value={selectedPortalDate}
                    onChange={(e) => {
                      setSelectedPortalDate(e.target.value)
                      fetchPortalAttendance(e.target.value)
                    }}
                    className="h-10 rounded-xl bg-white border-brand-border"
                  />
                </div>
              </div>

              {portalEmployees.filter(e => e.approval_status === "approved").length === 0 ? (
                <div className="bg-white/50 border border-brand-border rounded-3xl p-12 text-center text-gray-400">
                  No approved employees to show attendance for.
                </div>
              ) : (
                <Card className="bg-white border border-brand-border rounded-3xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-brand-border bg-gray-50/50">
                          <th className="p-4 font-semibold text-brand-text/50 uppercase tracking-wider">Employee</th>
                          <th className="p-4 font-semibold text-brand-text/50 uppercase tracking-wider">Employee ID</th>
                          <th className="p-4 font-semibold text-brand-text/50 uppercase tracking-wider">Status</th>
                          <th className="p-4 font-semibold text-brand-text/50 uppercase tracking-wider">Check-in Time</th>
                          <th className="p-4 font-semibold text-brand-text/50 uppercase tracking-wider text-right">Manual Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {portalEmployees.filter(e => e.approval_status === "approved").map((emp) => {
                          const record = portalAttendance.find(r => r.employee_profile_id === emp.id)
                          return (
                            <tr key={emp.id} className="border-b border-brand-border hover:bg-gray-50/50 transition-colors">
                              <td className="p-4">
                                <span className="font-semibold text-brand-text block">{emp.full_name}</span>
                                <span className="text-[10px] text-gray-400">{emp.role}</span>
                              </td>
                              <td className="p-4 font-mono text-gray-500">{emp.employee_id}</td>
                              <td className="p-4">
                                {record ? (
                                  <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold border ${
                                    record.status === "present"
                                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                      : record.status === "late"
                                      ? "bg-amber-50 text-amber-700 border-amber-200"
                                      : "bg-red-50 text-red-700 border-red-200"
                                  }`}>
                                    {record.status}
                                  </span>
                                ) : (
                                  <span className="bg-gray-50 text-gray-400 text-[10px] font-bold px-2 py-0.5 rounded border border-gray-200">Not Checked In (Absent)</span>
                                )}
                              </td>
                              <td className="p-4 text-gray-500">
                                {record ? new Date(record.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "N/A"}
                              </td>
                              <td className="p-4 text-right">
                                <Select
                                  value={record ? record.status : "absent"}
                                  onValueChange={(val) => handleAdminMarkAttendance(emp.id, val)}
                                >
                                  <SelectTrigger className="h-8 rounded-xl bg-white border-brand-border text-xs w-32 inline-flex">
                                    <SelectValue placeholder="Action" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="present">Mark Present</SelectItem>
                                    <SelectItem value="late">Mark Late</SelectItem>
                                    <SelectItem value="half_day">Mark Half Day</SelectItem>
                                    <SelectItem value="absent">Mark Absent</SelectItem>
                                    {record && <SelectItem value="delete">Remove Log</SelectItem>}
                                  </SelectContent>
                                </Select>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* Sub Tab: PAYSLIPS GENERATOR */}
          {activePortalSubTab === "payslips" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h3 className="text-lg font-medium">Monthly Payslips Generator</h3>
                  <p className="text-xs text-gray-500">Calculate and generate monthly payslips for all active approved employees.</p>
                </div>
              </div>

              <Card className="bg-white border border-brand-border rounded-3xl p-6 md:p-8 max-w-xl">
                <h4 className="font-semibold text-base mb-4 flex items-center gap-1.5">
                  <Settings className="h-5 w-5 text-brand-green" />
                  Select Billing Period
                </h4>
                <p className="text-xs text-gray-500 leading-relaxed mb-6">
                  Select a month and year to generate/update payslips. This process calculates hours, incorporates attendance scaling for specific components (like Basic Salary and Travel Allowance), and applies fixed components/deductions for all approved employees.
                </p>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <Label htmlFor="payMonth" className="text-xs font-semibold text-gray-600">Month</Label>
                    <Select
                      value={String(selectedPayslipMonth)}
                      onValueChange={(val) => setSelectedPayslipMonth(parseInt(val))}
                    >
                      <SelectTrigger id="payMonth" className="h-11 rounded-xl bg-white border-brand-border mt-1">
                        <SelectValue placeholder="Month" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                          <SelectItem key={m} value={String(m)}>
                            {new Date(2000, m - 1, 1).toLocaleString('default', { month: 'long' })}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="payYear" className="text-xs font-semibold text-gray-600">Year</Label>
                    <Select
                      value={String(selectedPayslipYear)}
                      onValueChange={(val) => setSelectedPayslipYear(parseInt(val))}
                    >
                      <SelectTrigger id="payYear" className="h-11 rounded-xl bg-white border-brand-border mt-1">
                        <SelectValue placeholder="Year" />
                      </SelectTrigger>
                      <SelectContent>
                        {[2024, 2025, 2026, 2027].map((y) => (
                          <SelectItem key={y} value={String(y)}>
                            {y}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="bg-brand-green/5 border border-brand-green/10 rounded-2xl p-4 text-xs text-brand-green mb-6 flex gap-3">
                  <AlertTriangle className="h-5 w-5 shrink-0 text-brand-green" />
                  <div>
                    <span className="font-semibold block mb-0.5">Automated Calculation Scale</span>
                    Payslip formulas automatically retrieve total present logs (treating half days as 0.5 present) and divide them by the actual days in the selected month ({getDaysInMonth(selectedPayslipYear, selectedPayslipMonth)} calendar days).
                  </div>
                </div>

                <Button
                  onClick={handleGeneratePayslips}
                  disabled={generatingPayslips || portalEmployees.filter(e => e.approval_status === "approved").length === 0}
                  className="w-full h-12 rounded-2xl bg-brand-green hover:bg-brand-green/90 text-white flex items-center justify-center gap-2"
                >
                  {generatingPayslips ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      Generating Payslips...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Generate Payslips for {new Date(2000, selectedPayslipMonth - 1, 1).toLocaleString('default', { month: 'short' })} {selectedPayslipYear}
                    </>
                  )}
                </Button>
              </Card>
            </div>
          )}

          {/* EDIT SALARY STRUCTURE DIALOG */}
          <Dialog open={showSalaryStructureDialog} onOpenChange={setShowSalaryStructureDialog}>
            <DialogContent className="max-w-md rounded-3xl p-6 bg-white/95 backdrop-blur-md">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold uppercase tracking-tight text-brand-text">
                  Salary Structure: <span className="text-brand-green italic">{selectedPortalEmployee?.full_name}</span>
                </DialogTitle>
                <p className="text-xs text-gray-500">Configure base salary components and deductions.</p>
              </DialogHeader>
              <div className="space-y-4 my-4 max-h-[250px] overflow-y-auto pr-2" data-lenis-prevent="true">
                {salaryStructure.length === 0 ? (
                  <p className="text-center text-xs text-gray-400">No components seeded yet.</p>
                ) : (
                  salaryStructure.map((comp, idx) => (
                    <div key={comp.id || idx} className="space-y-1 pb-3 border-b border-gray-100 last:border-b-0">
                      <div className="flex justify-between items-center">
                        <Label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                          {comp.name}
                          <Badge variant="outline" className={`text-[8px] px-1 py-0.2 ${comp.type === "earning" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-red-50 text-red-700 border-red-100"}`}>
                            {comp.type}
                          </Badge>
                        </Label>
                        <span className="text-[10px] text-gray-400">
                          {comp.attendanceBased ? "Attendance scaling" : "Fixed component"}
                        </span>
                      </div>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400">₹</span>
                        <Input
                          type="number"
                          value={comp.amount}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0
                            setSalaryStructure(prev => prev.map((item, i) => i === idx ? { ...item, amount: val } : item))
                          }}
                          className="pl-7 h-10 rounded-xl bg-white border-brand-border text-xs font-semibold"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Add Custom Salary Category Section */}
              <div className="border-t pt-4 mt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-brand-green mb-3 flex items-center gap-1">
                  <Plus className="h-3.5 w-3.5" />
                  Add Custom Category
                </h4>
                <div className="space-y-3 bg-gray-50/70 p-3 rounded-2xl border border-gray-100">
                  <div>
                    <Label htmlFor="newCompName" className="text-[10px] font-semibold text-gray-500">Category Name *</Label>
                    <Input
                      id="newCompName"
                      placeholder="e.g. Medical Allowance"
                      value={newComponentName}
                      onChange={(e) => setNewComponentName(e.target.value)}
                      className="h-8 rounded-xl bg-white border-brand-border text-xs mt-1"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Select
                        value={newComponentType}
                        onValueChange={(val: "earning" | "deduction") => setNewComponentType(val)}
                      >
                        <SelectTrigger className="h-8 rounded-xl bg-white border-brand-border text-xs w-full">
                          <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="earning">Earning</SelectItem>
                          <SelectItem value="deduction">Deduction</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-2 pl-2">
                      <Checkbox
                        id="newCompAttendance"
                        checked={newComponentAttendance}
                        onCheckedChange={(checked) => setNewComponentAttendance(!!checked)}
                      />
                      <Label htmlFor="newCompAttendance" className="text-[10px] font-semibold text-gray-600 cursor-none select-none">
                        Attendance scaled
                      </Label>
                    </div>
                  </div>
                  <Button
                    onClick={handleAddNewComponent}
                    disabled={addingComponent}
                    size="sm"
                    className="w-full bg-brand-green hover:bg-brand-green/90 text-white rounded-full text-xs h-8"
                  >
                    {addingComponent ? "Adding Category..." : "Create Category"}
                  </Button>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t mt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowSalaryStructureDialog(false)}
                  className="rounded-full text-xs h-10 px-5 border-brand-border hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveSalaryStructure}
                  className="bg-brand-green hover:bg-brand-green/90 text-white rounded-full text-xs h-10 px-6"
                >
                  Save Structure
                </Button>
              </div>
            </DialogContent>
          </Dialog>

        </TabsContent>
      </Tabs>
    </div>
  )
}

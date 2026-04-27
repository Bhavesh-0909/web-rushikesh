"use client"
import { Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

interface AdminEditControlsProps {
  isVisible: boolean
  itemId: number
  itemType: "project" | "gallery" | "instagram_posts" | "testimonials"
  onDelete?: () => void
  onEdit?: () => void
}

export default function AdminEditControls({ isVisible, itemId, itemType, onDelete, onEdit }: AdminEditControlsProps) {
  if (!isVisible) return null

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this item?")) return
    if (!supabase) {
      toast.error("Supabase is not available")
      return
    }

    try {
      const { error } = await supabase.from(itemType).delete().eq("id", itemId)

      if (error) throw error

      toast.success("Item deleted successfully!")
      onDelete?.()
    } catch (error) {
      toast.error("Error deleting item")
      console.error(error)
    }
  }

  const handleEdit = () => {
    // For now, just show a toast. You can implement edit functionality later
    toast.info("Edit functionality coming soon!")
    onEdit?.()
  }

  return (
    <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30">
      <Button 
        size="sm" 
        variant="secondary" 
        className="h-10 w-10 p-0 bg-white/80 backdrop-blur-md border border-brand-border hover:bg-white hover:text-brand-green rounded-full shadow-lg transition-all" 
        onClick={handleEdit}
      >
        <Edit className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant="destructive"
        className="h-10 w-10 p-0 bg-red-500/80 backdrop-blur-md hover:bg-red-600 rounded-full shadow-lg transition-all"
        onClick={handleDelete}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}

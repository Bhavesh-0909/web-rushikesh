"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react"

interface ImageUploadProps {
  value: string
  onChange: (url: string) => void
  onRemove: () => void
  label?: string
}

export default function ImageUpload({ value, onChange, onRemove, label }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!e.target.files || e.target.files.length === 0) {
        return
      }

      if (!supabase) {
        toast.error("Supabase client not initialized")
        return
      }

      setUploading(true)
      const file = e.target.files[0]
      const fileExt = file.name.split(".").pop()
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError, data } = await supabase.storage
        .from("images")
        .upload(filePath, file)

      if (uploadError) {
        throw uploadError
      }

      const { data: { publicUrl } } = supabase.storage
        .from("images")
        .getPublicUrl(filePath)

      onChange(publicUrl)
      toast.success("Image uploaded successfully!")
    } catch (error: any) {
      toast.error(error.message || "Error uploading image")
      console.error("Upload error:", error)
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  return (
    <div className="space-y-2 w-full">
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      
      <div className="flex flex-col gap-4">
        {value ? (
          <div className="relative group aspect-video w-full max-w-[300px] rounded-xl overflow-hidden border border-brand-border bg-gray-50">
            <img 
              src={value} 
              alt="Uploaded" 
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={onRemove}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="group relative aspect-video w-full max-w-[300px] rounded-xl border-2 border-dashed border-brand-border hover:border-brand-green/50 bg-gray-50/50 hover:bg-brand-green/5 transition-all cursor-pointer flex flex-col items-center justify-center gap-2"
          >
            {uploading ? (
              <Loader2 className="h-8 w-8 animate-spin text-brand-green" />
            ) : (
              <>
                <div className="p-3 rounded-full bg-white shadow-sm border border-brand-border group-hover:border-brand-green/30 group-hover:text-brand-green transition-colors">
                  <Upload className="h-5 w-5" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-900">Click to upload</p>
                  <p className="text-xs text-gray-500">PNG, JPG, WebP up to 5MB</p>
                </div>
              </>
            )}
          </div>
        )}

        <div className="flex gap-2">
          <Input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Or paste image URL here..."
            className="flex-1 rounded-xl"
          />
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleUpload}
            accept="image/*"
            className="hidden"
            disabled={uploading}
          />
        </div>
      </div>
    </div>
  )
}

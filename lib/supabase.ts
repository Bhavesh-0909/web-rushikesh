import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Create a fallback client that won't break the app if env vars are missing
export const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null

// Helper function to check if Supabase is available
export const isSupabaseAvailable = () => {
  return supabase !== null
}

export interface Project {
  id: number
  title: string
  subtitle?: string
  description: string
  category: string
  location: string
  year: string | number
  area?: string
  architect: string
  photographer?: string
  client?: string
  status: string
  hero_image?: string
  images: string[]
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
  featured?: boolean // NEW: show on home if true
  created_at: string
  updated_at: string
}

export interface GalleryItem {
  id: number
  title: string
  category: string
  image: string
  description?: string
  created_at: string
  updated_at: string
}

export interface InstagramPost {
  id: number
  image: string
  likes: number
  comments: number
  post_link?: string
  post_date: string
  caption?: string
  created_at: string
  updated_at: string
}

export interface Testimonial {
  id: number
  name: string
  role: string
  company: string
  image?: string
  rating: number
  text: string
  featured: boolean
  created_at: string
  updated_at: string
}
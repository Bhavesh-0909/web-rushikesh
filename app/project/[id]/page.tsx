import type { Metadata } from "next"
import { headers } from "next/headers"
import ProjectDetailClient from "@/components/project-detail-client"
import { createClient } from "@supabase/supabase-js"
import { createSlug } from "@/lib/utils"

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

type Params = { id: string }

export const revalidate = 60

function absoluteUrl(path: string) {
  const hdrs = headers()
  const proto = hdrs.get("x-forwarded-proto") || "https"
  const host = hdrs.get("host") || "localhost:3000"
  const cleaned = path.startsWith("/") ? path : `/${path}`
  return `${proto}://${host}${cleaned}`
}

async function fetchProjectForMeta(param: string) {
  const url = process.env.SUPABASE_URL!
  const key = process.env.SUPABASE_ANON_KEY!
  const sb = createClient(url, key, { auth: { persistSession: false } })
  const { data: projects } = await sb.from("projects").select("*")
  if (!projects || projects.length === 0) return null

  let found = projects.find((p) => createSlug(p.title) === param)
  if (!found && !isNaN(Number(param))) {
    found = projects.find((p) => p.id === Number(param))
  }
  return found || null
}

// IMPORTANT: We intentionally omit description fields to avoid extra text in previews.
// Platforms like WhatsApp will render the image thumbnail and the link only.
export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  try {
    const project = await fetchProjectForMeta(params.id)
    const siteName = "Hariom Jangid Architects"

    if (!project) {
      const url = absoluteUrl(`/projects/${params.id}`)
      return {
        title: `Project — ${siteName}`,
        alternates: { canonical: url },
        openGraph: {
          type: "website",
          url,
          title: `Project — ${siteName}`,
          images: [{ url: absoluteUrl("/default-preview.png"), width: 1200, height: 630 }],
          siteName,
        },
        twitter: {
          card: "summary_large_image",
          title: `Project — ${siteName}`,
          images: [absoluteUrl("/default-preview.png")],
        },
      }
    }

    const pageUrl = absoluteUrl(`/projects/${createSlug(project.title)}`)
    const hero = project.hero_image
      ? project.hero_image.startsWith("http")
        ? project.hero_image
        : absoluteUrl(project.hero_image.startsWith("/") ? project.hero_image : `/${project.hero_image}`)
      : project.images && project.images.length > 0
        ? project.images[0].startsWith("http")
          ? project.images[0]
          : absoluteUrl(project.images[0].startsWith("/") ? project.images[0] : `/${project.images[0]}`)
        : absoluteUrl("/default-preview.png")

    return {
      title: `${project.title} — ${siteName}`,
      alternates: { canonical: pageUrl },
      openGraph: {
        type: "website",
        url: pageUrl,
        title: project.title,
        images: [{ url: hero, width: 1200, height: 630, alt: project.title }],
        siteName,
        locale: "en_US",
      },
      twitter: {
        card: "summary_large_image",
        title: project.title,
        images: [hero],
        creator: "@hariomjangid",
        site: "@hariomjangid",
      },
    }
  } catch {
    const url = absoluteUrl(`/projects/${params.id}`)
    return {
      title: "Project — Hariom Jangid Architects",
      alternates: { canonical: url },
      openGraph: {
        type: "website",
        url,
        title: "Project — Hariom Jangid Architects",
        images: [{ url: absoluteUrl("/default-preview.png"), width: 1200, height: 630 }],
        siteName: "Hariom Jangid Architects",
      },
      twitter: {
        card: "summary_large_image",
        title: "Project — Hariom Jangid Architects",
        images: [absoluteUrl("/default-preview.png")],
      },
    }
  }
}

export default function Page({ params }: { params: Params }) {
  return <ProjectDetailClient idParam={params.id} />
}
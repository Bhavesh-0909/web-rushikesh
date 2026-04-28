import type { Metadata } from "next"
import { headers } from "next/headers"
import ProjectDetailClient from "@/components/project-detail-client"
import { createSlug } from "@/lib/utils"
import { getProjectDetail } from "@/app/project/actions"

// ... (Project interface stays the same)

type Params = Promise<{ id: string }>  // ✅ Params is now a Promise

export const revalidate = 60

async function absoluteUrl(path: string) {
  const hdrs = await headers()
  const proto = hdrs.get("x-forwarded-proto") || "https"
  const host = hdrs.get("host") || "localhost:3000"
  const cleaned = path.startsWith("/") ? path : `/${path}`
  return `${proto}://${host}${cleaned}`
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params  // ✅ await the whole params object
  try {
    const { project } = await getProjectDetail(id)
    const siteName = "Rushikesh Sutar & Associates"

    if (!project) {
      const url = await absoluteUrl(`/projects/${id}`)
      return {
        title: `Project — ${siteName}`,
        alternates: { canonical: url },
        openGraph: {
          type: "website",
          url,
          title: `Project — ${siteName}`,
          images: [{ url: await absoluteUrl("/default-preview.png"), width: 1200, height: 630 }],
          siteName,
        },
        twitter: {
          card: "summary_large_image",
          title: `Project — ${siteName}`,
          images: [await absoluteUrl("/default-preview.png")],
        },
      }
    }

    const pageUrl = await absoluteUrl(`/projects/${createSlug(project.title)}`)
    const hero = project.hero_image
      ? project.hero_image.startsWith("http")
        ? project.hero_image
        : await absoluteUrl(project.hero_image.startsWith("/") ? project.hero_image : `/${project.hero_image}`)
      : project.images?.length
        ? project.images[0].startsWith("http")
          ? project.images[0]
          : await absoluteUrl(project.images[0].startsWith("/") ? project.images[0] : `/${project.images[0]}`)
        : await absoluteUrl("/default-preview.png")

    return {
      title: `${project.title} | ${siteName}`,
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
      },
    }
  } catch {
    const url = await absoluteUrl(`/projects/${id}`)
    const siteName = "Rushikesh Sutar & Associates"
    return {
      title: `Project | ${siteName}`,
      alternates: { canonical: url },
      openGraph: {
        type: "website",
        url,
        title: `Project | ${siteName}`,
        images: [{ url: await absoluteUrl("/default-preview.png"), width: 1200, height: 630 }],
        siteName,
      },
      twitter: {
        card: "summary_large_image",
        title: `Project | ${siteName}`,
        images: [await absoluteUrl("/default-preview.png")],
      },
    }
  }
}

export default async function Page({ params }: { params: Params }) {
  const { id } = await params  // ✅ await the whole object, then destructure
  return <ProjectDetailClient idParam={id} />
}
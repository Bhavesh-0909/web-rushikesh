"use server"

import { prisma } from "@/lib/prisma"
import { Project } from "@/lib/supabase"
import { createSlug } from "@/lib/utils"

export async function getProjects(): Promise<Project[]> {
  try {
    const data = await prisma.projects.findMany({
      orderBy: { created_at: "desc" },
    })

    return data.map((project) => ({
      ...project,
      id: Number(project.id),
      created_at: project.created_at?.toISOString() || new Date().toISOString(),
      updated_at: project.updated_at?.toISOString() || new Date().toISOString(),
      content: (project.content as any) || [],
      // Handle required fields in Project interface that are not in Prisma schema
      status: "Completed",
      architect: "Rushikesh",
    })) as unknown as Project[]
  } catch (error) {
    console.error("Error fetching projects from DB:", error)
    return []
  }
}

export async function getRecentProjects(limit: number = 3): Promise<Project[]> {
  try {
    const data = await prisma.projects.findMany({
      orderBy: { created_at: "desc" },
      take: limit,
    })

    return data.map((project) => ({
      ...project,
      id: Number(project.id),
      created_at: project.created_at?.toISOString() || new Date().toISOString(),
      updated_at: project.updated_at?.toISOString() || new Date().toISOString(),
      content: (project.content as any) || [],
      // Handle required fields in Project interface that are not in Prisma schema
      status: "Completed",
      architect: "Rushikesh",
    })) as unknown as Project[]
  } catch (error) {
    console.error("Error fetching recent projects from DB:", error)
    return []
  }
}

export async function getProjectDetail(idParam: string): Promise<{ project: Project | null; relatedProjects: Project[] }> {
  // Fetch all projects and find the one whose slugified title matches idParam
  console.log(idParam);
  const data = await prisma.projects.findMany();

  if (!data?.length) return { project: null, relatedProjects: [] }

  const project = data.find(p => createSlug(p.title) === idParam) ?? null

  const relatedProjects = project
    ? data
      .filter(p => p.id !== project.id && p.category === project.category)
      .slice(0, 3)
    : []

  const mapProject = (p: any) => ({
    ...p,
    id: Number(p.id),
    created_at: p.created_at?.toISOString() || new Date().toISOString(),
    updated_at: p.updated_at?.toISOString() || new Date().toISOString(),
    content: (p.content as any) || [],
    status: p.status || "Completed",
    architect: p.architect || "Rushikesh Sutar",
  }) as unknown as Project;

  return { 
    project: project ? mapProject(project) : null, 
    relatedProjects: relatedProjects.map(mapProject) 
  }
}

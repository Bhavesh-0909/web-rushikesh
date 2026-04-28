"use server"

import { prisma } from "@/lib/prisma"
import { Project } from "@/lib/supabase"

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

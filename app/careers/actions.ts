"use server"

import { prisma } from "@/lib/prisma"

export async function getJobs() {
  try {
    const data = await prisma.jobs.findMany({
      where: { is_active: true },
      orderBy: { created_at: "desc" },
    })

    return data.map(job => ({
      ...job,
      id: Number(job.id),
      created_at: job.created_at?.toISOString() || new Date().toISOString(),
      updated_at: job.updated_at?.toISOString() || new Date().toISOString(),
    }))
  } catch (error) {
    console.error("Error fetching jobs from DB:", error)
    return []
  }
}

export async function getJobById(id: string) {
  try {
    if (!id) return null;

    const data = await prisma.jobs.findUnique({
      where: { id: BigInt(id) },
    })

    if (!data) return null;

    return {
      ...data,
      id: Number(data.id),
      created_at: data.created_at?.toISOString() || new Date().toISOString(),
      updated_at: data.updated_at?.toISOString() || new Date().toISOString(),
    }
  } catch (error) {
    console.error("Error fetching job detail from DB:", error)
    return null
  }
}

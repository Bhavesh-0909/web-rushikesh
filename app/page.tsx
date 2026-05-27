import HomePage from "@/components/page/HomePage";
import { prisma } from "@/lib/prisma";

export default async function Home() {
  const [projects, testimonials, teamMembers] = await Promise.all([
    prisma.projects.findMany({
      take: 3,
      orderBy: { created_at: "desc" }
    }),
    prisma.testimonials.findMany({
      take: 3,
      where: { featured: true },
      orderBy: { created_at: "desc" }
    }),
    prisma.employees.findMany({
      take: 3,
      orderBy: { id: "asc" }
    })
  ]);

  const serializedProjects = projects.map((p: any) => ({
    ...p,
    id: Number(p.id),
    created_at: p.created_at?.toISOString() || new Date().toISOString(),
    updated_at: p.updated_at?.toISOString() || new Date().toISOString(),
    content: (p.content as any) || [],
    status: "Completed",
    architect: "Rushikesh",
  }));

  const serializedTestimonials = testimonials.map((t: any) => ({
    ...t,
    id: Number(t.id),
    created_at: t.created_at?.toISOString() || new Date().toISOString(),
    updated_at: t.updated_at?.toISOString() || new Date().toISOString(),
  }));

  const serializedTeamMembers = teamMembers.map((t: any) => ({
    ...t,
    id: Number(t.id),
    created_at: t.created_at?.toISOString() || new Date().toISOString(),
    updated_at: t.updated_at?.toISOString() || new Date().toISOString(),
  }));

  return (
    <HomePage 
      projects={serializedProjects} 
      testimonials={serializedTestimonials} 
      teamMembers={serializedTeamMembers} 
    />
  );
}

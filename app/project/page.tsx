import type { Metadata } from "next"
import ClientProjectsPage from "./client-page"

export const metadata: Metadata = { title: "Projects" }

export default function ProjectsPage() {
  return <ClientProjectsPage />
}
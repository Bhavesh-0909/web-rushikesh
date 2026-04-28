import { prisma } from '@/lib/prisma'
import StudioClient from './StudioClient'

export default async function Page() {
  const images = await prisma.gallery.findMany()
  const studioImages = images.map((item) => item.image)

  return <StudioClient studioImages={studioImages} />
}
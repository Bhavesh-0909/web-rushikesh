import { prisma } from '@/lib/prisma'
import StudioClient from './StudioClient'

export default async function Page() {
  const images = await prisma.images.findMany()
  const studioImages = images.map((item) => item.url)

  return <StudioClient studioImages={studioImages} />
}
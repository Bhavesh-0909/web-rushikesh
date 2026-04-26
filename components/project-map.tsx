"use client"

import { MapPin, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProjectMapProps {
  latitude?: number
  longitude?: number
  /**
   * Human-readable place name, e.g. "Saphale, Maharashtra" or a venue name.
   * This is preferred over coordinates to show a name card in Google Maps.
   */
  location?: string
  projectTitle: string
  /**
   * Optional: paste the exact Google "Embed a map" iframe src here (the long
   * https://www.google.com/maps/embed?pb=... URL from Share → Embed a map).
   * When provided, this is used verbatim and will show the official name card.
   */
  embedSrcOverride?: string
  className?: string
}

function buildEmbedAndLink({
  location,
  latitude,
  longitude,
  embedSrcOverride,
}: {
  location?: string
  latitude?: number
  longitude?: number
  embedSrcOverride?: string
}) {
  // If the user pasted a full Embed URL (pb=...), use it verbatim.
  if (embedSrcOverride && embedSrcOverride.startsWith("http")) {
    // Build a click-through link that opens the same place in Google Maps.
    const fallbackQuery = location?.trim().length
      ? encodeURIComponent(location!)
      : typeof latitude === "number" && typeof longitude === "number"
        ? `${latitude},${longitude}`
        : ""
    const linkUrl = fallbackQuery
      ? `https://www.google.com/maps/search/?api=1&query=${fallbackQuery}`
      : embedSrcOverride
    return { embedUrl: embedSrcOverride, linkUrl }
  }

  const hasName = !!location && location.trim().length > 0
  const hasCoords =
    typeof latitude === "number" && !Number.isNaN(latitude) && typeof longitude === "number" && !Number.isNaN(longitude)

  // Prefer the human-readable place name so Google shows the place card.
  const query = hasName ? encodeURIComponent(location!.trim()) : hasCoords ? `${latitude},${longitude}` : "India"

  // Using q=... with output=embed shows a red pin, and if the query matches a place,
  // Google renders a name card instead of raw coordinates.
  const embedUrl = `https://www.google.com/maps?output=embed&q=${query}&hl=en&z=15`

  // Click-through URL opens the native Google Maps page for the same query.
  const linkUrl = `https://www.google.com/maps/search/?api=1&query=${query}`

  return { embedUrl, linkUrl }
}

export default function ProjectMap({
  latitude,
  longitude,
  location,
  projectTitle,
  embedSrcOverride,
  className,
}: ProjectMapProps) {
  const placeLabel = location?.trim() || ""
  const { embedUrl, linkUrl } = buildEmbedAndLink({
    location: placeLabel,
    latitude,
    longitude,
    embedSrcOverride,
  })

  return (
    <div className={cn("relative w-full h-96 rounded-xl overflow-hidden shadow-lg bg-white", className)}>
      {/* Non-interactive iframe so a single tap/click opens the full Google Maps view */}
      <iframe
        src={embedUrl}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title={`Map for ${projectTitle}${placeLabel ? ` • ${placeLabel}` : ""}`}
        className="w-full h-full block pointer-events-none"
      />

      {/* Click-through overlay to open Google Maps directly */}
      <a
        href={linkUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={placeLabel ? `Open ${placeLabel} in Google Maps` : "Open location in Google Maps"}
        className="absolute inset-0"
      >
        <span className="sr-only">Open in Google Maps</span>
      </a>

      {/* Top-left chip showing the place name with a pin icon */}
      {placeLabel ? (
        <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full bg-white/90 backdrop-blur px-3 py-2 text-sm text-gray-800 shadow">
          <MapPin className="h-4 w-4 text-rose-600" aria-hidden="true" />
          <span className="truncate max-w-[14rem]" title={placeLabel}>
            {placeLabel}
          </span>
        </div>
      ) : null}

      {/* Bottom-right button to open Google Maps explicitly */}
      <a
        href={linkUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute right-3 bottom-3 inline-flex items-center gap-2 rounded-full bg-[#6b46ff] text-white px-4 py-2 text-sm shadow hover:bg-[#5b38f6] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
      >
        <ExternalLink className="h-4 w-4" aria-hidden="true" />
        <span>Open in Google Maps</span>
      </a>
    </div>
  )
}
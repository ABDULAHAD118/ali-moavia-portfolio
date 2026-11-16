import { timingSafeEqual } from 'node:crypto'
import type { H3Event } from 'h3'

// Throws 401 unless the x-admin-token header matches NUXT_ADMIN_TOKEN. No token configured = editing disabled.
export function requireAdmin(event: H3Event) {
  const expected = useRuntimeConfig(event).adminToken
  const given = getHeader(event, 'x-admin-token') ?? ''
  if (!expected) throw createError({ statusCode: 401, statusMessage: 'Set NUXT_ADMIN_TOKEN to enable editing' })
  if (given.length !== expected.length || !timingSafeEqual(Buffer.from(given), Buffer.from(expected)))
    throw createError({ statusCode: 401, statusMessage: 'Invalid admin token' })
}

// Raster formats only: SVG is excluded because it can carry script.
export const IMAGE_TYPES: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' }

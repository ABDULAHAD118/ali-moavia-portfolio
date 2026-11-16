import { randomUUID } from 'node:crypto'

const MAX_BYTES = 4 * 1024 * 1024 // Vercel functions reject request bodies over 4.5 MB

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const file = (await readMultipartFormData(event))?.find(p => p.name === 'file' && p.filename)
  if (!file) throw createError({ statusCode: 400, statusMessage: 'No file uploaded' })
  const ext = IMAGE_TYPES[file.type ?? '']
  if (!ext) throw createError({ statusCode: 415, statusMessage: 'Use a JPG, PNG, WebP or GIF image' })
  if (file.data.length > MAX_BYTES) throw createError({ statusCode: 413, statusMessage: 'Image must be under 4 MB' })
  const name = `${randomUUID()}.${ext}`
  // base64 text works the same on every storage driver (files locally, Redis on Vercel)
  await useStorage('images').setItem(name, file.data.toString('base64'))
  return { url: `/uploads/${name}` }
})

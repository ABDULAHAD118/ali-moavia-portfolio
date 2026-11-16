import { randomUUID } from 'node:crypto'

const MAX_BYTES = 5 * 1024 * 1024

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const file = (await readMultipartFormData(event))?.find(p => p.name === 'file' && p.filename)
  if (!file) throw createError({ statusCode: 400, statusMessage: 'No file uploaded' })
  const ext = IMAGE_TYPES[file.type ?? '']
  if (!ext) throw createError({ statusCode: 415, statusMessage: 'Use a JPG, PNG, WebP or GIF image' })
  if (file.data.length > MAX_BYTES) throw createError({ statusCode: 413, statusMessage: 'Image must be under 5 MB' })
  const name = `${randomUUID()}.${ext}`
  await useStorage('uploads').setItemRaw(name, file.data)
  return { url: `/uploads/${name}` }
})

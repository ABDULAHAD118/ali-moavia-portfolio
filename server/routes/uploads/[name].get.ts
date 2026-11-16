const TYPES: Record<string, string> = Object.fromEntries(Object.entries(IMAGE_TYPES).map(([t, e]) => [e, t]))

export default defineEventHandler(async (event) => {
  const name = getRouterParam(event, 'name') ?? ''
  const m = /^[\w-]+\.(jpg|png|webp|gif)$/.exec(name)
  const data = m && await useStorage('images').getItem<string>(name)
  if (!m || !data) throw createError({ statusCode: 404, statusMessage: 'Not found' })
  setHeaders(event, { 'content-type': TYPES[m[1]!]!, 'cache-control': 'public, max-age=31536000, s-maxage=31536000, immutable', 'x-content-type-options': 'nosniff' })
  return Buffer.from(data, 'base64')
})

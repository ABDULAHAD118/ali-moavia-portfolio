export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const body = await readBody(event)
  if (!isValidPortfolio(body)) throw createError({ statusCode: 400, statusMessage: 'Invalid portfolio data' })
  await useStorage('data').setItem('portfolio', body)
  return { ok: true }
})

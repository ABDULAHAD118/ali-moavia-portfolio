export default defineEventHandler(async () => {
  const saved = await useStorage('data').getItem<Portfolio>('portfolio')
  return isValidPortfolio(saved) ? saved : DEFAULT_DATA
})

export default defineEventHandler(async () => {
  const saved = await useStorage('portfolio').getItem<Portfolio>('portfolio')
  return isValidPortfolio(saved) ? saved : DEFAULT_DATA
})

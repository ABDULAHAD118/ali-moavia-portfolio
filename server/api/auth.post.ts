// Lets the admin page check a token before showing the editor.
export default defineEventHandler((event) => {
  requireAdmin(event)
  return { ok: true }
})

export default defineEventHandler(async (event) => {
  const { user, admin } = await requireAdmin(event)
  return { user: { id: user.id, email: user.email }, admin }
})

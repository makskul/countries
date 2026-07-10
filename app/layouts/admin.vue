<script setup lang="ts">
const adminProfile = ref<{ user: { email?: string }; admin: { role: string } } | null>(null)

try {
  adminProfile.value = await useAdminFetch('/api/admin/me')
} catch {
  adminProfile.value = null
}

async function logout() {
  await useAdminFetch('/api/admin/logout', { method: 'POST' })
  const client = useSupabaseClient()
  await client.auth.signOut()
  await navigateTo('/admin/login')
}
</script>

<template>
  <div class="admin-layout">
    <aside class="admin-sidebar">
      <div class="admin-sidebar-brand">Triplandr Admin</div>
      <AdminSidebar />
      <div class="admin-sidebar-footer">
        <div v-if="adminProfile?.user.email" class="admin-user-email">
          {{ adminProfile.user.email }}
          <span v-if="adminProfile.admin.role"> · {{ adminProfile.admin.role }}</span>
        </div>
        <Button label="Выйти" severity="secondary" size="small" text @click="logout" />
      </div>
    </aside>
    <main class="admin-main">
      <slot />
    </main>
    <Toast />
  </div>
</template>

<style>
@import '~/assets/styles/admin.css';
</style>

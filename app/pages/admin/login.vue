<script setup lang="ts">
definePageMeta({
  layout: false,
  middleware: 'admin-auth',
})

useSeoMeta({ robots: 'noindex, nofollow' })

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function login() {
  error.value = ''
  loading.value = true
  try {
    await $fetch('/api/admin/login', {
      method: 'POST',
      body: { email: email.value, password: password.value },
      credentials: 'include',
    })
    await navigateTo('/admin')
  } catch (e: unknown) {
    const err = e as { data?: { message?: string }; message?: string }
    error.value = err.data?.message ?? err.message ?? 'Ошибка входа'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="admin-login-page">
    <div class="admin-login-card">
      <h1>Triplandr Admin</h1>
      <p class="admin-login-sub">Вход для модераторов и редакторов</p>
      <form @submit.prevent="login">
        <div class="admin-form-field">
          <label for="email">Email</label>
          <InputText id="email" v-model="email" type="email" class="w-full" required autocomplete="username" />
        </div>
        <div class="admin-form-field">
          <label for="password">Пароль</label>
          <Password id="password" v-model="password" class="w-full" input-class="w-full" :feedback="false" toggle-mask required autocomplete="current-password" />
        </div>
        <Message v-if="error" severity="error" :closable="false" class="mb-3">{{ error }}</Message>
        <Button type="submit" label="Войти" class="w-full" :loading="loading" />
      </form>
    </div>
  </div>
</template>

<style>
@import '~/assets/styles/admin.css';
</style>

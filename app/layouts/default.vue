<template>
  <div style="display: flex; flex-direction: column; min-height: 100vh">
    <AppNavbar />
    <main style="flex: 1">
      <slot />
    </main>
    <AppFooter />
  </div>
</template>

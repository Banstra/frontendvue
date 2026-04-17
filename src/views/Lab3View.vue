<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router';
</script>
<template>
  <nav class="nav">
    <RouterLink to="/">🏠 Главная</RouterLink>
    <RouterLink to="/printers">🖨 Принтеры</RouterLink>
    <RouterLink to="/filaments">🧵 Пластики</RouterLink>
    <RouterLink to="/models">📐 Модели</RouterLink>
  </nav>
  <main class="container">
    <RouterView />
  </main>
</template>
<style scoped>
.nav { display: flex; gap: 1rem; padding: 1rem; background: #1e293b; color: white; justify-content: center; flex-wrap: wrap; }
.nav a { color: #cbd5e1; text-decoration: none; padding: 0.5rem 1rem; border-radius: 4px; }
.nav a.router-link-active { background: #3b82f6; color: white; }
.container { max-width: 1200px; margin: 2rem auto; padding: 0 1rem; }
</style>

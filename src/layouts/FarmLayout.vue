<!-- src/layouts/FarmLayout.vue -->
<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div class="farm-app">
    <nav class="nav">
      <div class="nav-brand">🏭 3D Farm</div>
      <RouterLink to="/lab3" class="nav-link">🏠 Главная</RouterLink>
      <RouterLink to="/lab3/printers" class="nav-link">🖨 Принтеры</RouterLink>
      <RouterLink to="/lab3/filaments" class="nav-link">🧵 Пластики</RouterLink>
      <RouterLink to="/lab3/models" class="nav-link">📐 Модели</RouterLink>
    </nav>

    <main class="main-content">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.farm-app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.nav {
  display: flex;
  gap: 0.5rem;
  padding: 1rem 2rem;
  background: #1e293b;
  color: white;
  align-items: center;
  flex-wrap: wrap;
}

.nav-brand {
  font-weight: bold;
  font-size: 1.2rem;
  margin-right: 2rem;
}

.nav-link {
  color: #cbd5e1;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: all 0.2s;
}

.nav-link:hover {
  background: #334155;
  color: white;
}

.nav-link.router-link-active {
  background: #3b82f6;
  color: white;
}

.main-content {
  flex: 1;
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  width: 100%;
  box-sizing: border-box;
}

@media (max-width: 768px) {
  .nav {
    justify-content: center;
  }
  .nav-brand {
    margin-right: 0;
    width: 100%;
    text-align: center;
    margin-bottom: 0.5rem;
  }
  .main-content {
    padding: 1rem;
  }
}
</style>

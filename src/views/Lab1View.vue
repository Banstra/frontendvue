<!-- src/views/Lab1View.vue -->
<script setup lang="ts">
import Lab1Task1 from '@/components/Lab1/Lab1Task1.vue'
import Lab1Task2 from '@/components/Lab1/Lab1Task2.vue'
import Lab1Task3 from '@/components/Lab1/Lab1Task3.vue'
import Lab1Task4 from '@/components/Lab1/Lab1Task4.vue'
import Lab1Task5 from '@/components/Lab1/Lab1Task5.vue'
import Lab1Task6 from '@/components/Lab1/Lab1Task6.vue'
import Lab1Task7 from '@/components/Lab1/Lab1Task7.vue'
import Lab1Task8 from '@/components/Lab1/Lab1Task8.vue'
import Lab1Task9 from '@/components/Lab1/Lab1Task9.vue'
import Lab1Task10 from '@/components/Lab1/Lab1Task10.vue'
import Lab1Task11 from '@/components/Lab1/Lab1Task11.vue'
</script>

<template>
  <main class="lab1">
    <h1>🎓 Lab 1: Vue 3 + TypeScript</h1>
    <section class="tasks-grid">
      <Lab1Task1 />
      <Lab1Task2 />
      <Lab1Task3 />
      <Lab1Task4 />
      <Lab1Task5 />
      <Lab1Task6 />
      <Lab1Task7 />
      <Lab1Task8 />
      <Lab1Task9 />
      <Lab1Task10 />
      <Lab1Task11 />
    </section>
  </main>
</template>

<style scoped>
.lab1 {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}
.tasks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}
.task {
  padding: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}
.task h3 {
  margin: 0 0 1rem;
  font-size: 1.1rem;
}
.task input,
.task select,
.task textarea {
  width: 100%;
  padding: 0.4rem;
  margin: 0.2rem 0;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  box-sizing: border-box;
}
</style>

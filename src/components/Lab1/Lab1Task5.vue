<script setup lang="ts">
import { ref, computed } from 'vue'
import { getTriangleType, type TriangleType } from './tasks'

const a = ref(0), b = ref(0), c = ref(0)
const result = computed(() => getTriangleType(a.value, b.value, c.value))

const typeColors: Record<TriangleType, string> = {
  'разносторонний': '#3b82f6',
  'равнобедренный': '#8b5cf6',
  'равносторонний': '#22c55e',
  'невозможный': '#ef4444'
}
</script>

<template>
  <div class="task">
    <h3>Задача: Тип треугольника</h3>
    <div class="inputs">
      <input v-model.number="a" type="number" placeholder="Сторона A" />
      <input v-model.number="b" type="number" placeholder="Сторона B" />
      <input v-model.number="c" type="number" placeholder="Сторона C" />
    </div>
    <p :style="{ color: typeColors[result] }">Тип: <strong>{{ result }}</strong></p>
  </div>
</template>

<style scoped>
.inputs { display: flex; gap: 0.5rem; flex-wrap: wrap }
</style>

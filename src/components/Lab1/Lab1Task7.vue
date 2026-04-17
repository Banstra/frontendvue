<script setup lang="ts">
import { ref, computed } from 'vue'
import { euclideanDistance } from './tasks'

const vecA = ref('1,2,3')
const vecB = ref('4,5,6')
const result = computed(() => {
  try {
    const a = vecA.value.split(',').map(Number)
    const b = vecB.value.split(',').map(Number)
    return euclideanDistance(a, b).toFixed(3)
  } catch {
    return 'Ошибка ввода'
  }
})
</script>

<template>
  <div class="task">
    <h3>Задача: Евклидово расстояние</h3>
    <input v-model="vecA" placeholder="Вектор A (через запятую)" />
    <input v-model="vecB" placeholder="Вектор B (через запятую)" />
    <p>Расстояние: <strong>{{ result }}</strong></p>
  </div>
</template>

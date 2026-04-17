<script setup lang="ts">
import { ref, computed } from 'vue'
import { multiplyMatrices } from './tasks'

const matrixA = ref('1,2\n3,4')
const matrixB = ref('5,6\n7,8')

const parseMatrix = (str: string): number[][] =>
  str
    .trim()
    .split('\n')
    .map((row) => row.split(',').map(Number))

const result = computed(() => {
  try {
    const A = parseMatrix(matrixA.value)
    const B = parseMatrix(matrixB.value)
    const res = multiplyMatrices(A, B)
    return res ? res.map((row) => row.join(', ')).join('\n') : '❌ Нельзя умножить'
  } catch {
    return 'Ошибка формата'
  }
})
</script>

<template>
  <div class="task">
    <h3>Задача: Умножение матриц</h3>
    <textarea
      v-model="matrixA"
      placeholder="Матрица A (строки через \n, элементы через ,)"
      rows="3"
    />
    <textarea v-model="matrixB" placeholder="Матрица B" rows="3" />
    <pre class="result">{{ result }}</pre>
  </div>
</template>

<style scoped>
.result {
  padding: 0.5rem;
  border-radius: 4px;
  white-space: pre-wrap;
}
</style>

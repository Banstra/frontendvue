<script setup lang="ts">
import { ref, computed } from 'vue'
import { addVectors, type Vector2D } from './tasks'

const vectors = ref<Vector2D[]>([[0, 0], [0, 0]])

const addVector = () => {
  if (vectors.value.length < 10) vectors.value.push([0, 0])
}
const removeVector = (idx: number) => {
  if (vectors.value.length > 2) vectors.value.splice(idx, 1)
}
const updateVector = (idx: number, axis: 0 | 1, val: string) => {
  vectors.value[idx] = [
    axis === 0 ? parseFloat(val) || 0 : vectors.value[idx][0],
    axis === 1 ? parseFloat(val) || 0 : vectors.value[idx][1],
  ] as Vector2D
}

const result = computed(() => addVectors(...vectors.value))
</script>

<template>
  <div class="task">
    <h3>Задача: Сложение векторов</h3>
    <div v-for="(v, i) in vectors" :key="i" class="vector-row">
      <span>Вектор {{ i + 1 }}:</span>
      <input :value="v[0]" @input="e => updateVector(i, 0, (e.target as HTMLInputElement).value)" type="number" />
      <input :value="v[1]" @input="e => updateVector(i, 1, (e.target as HTMLInputElement).value)" type="number" />
      <button @click="removeVector(i)" v-if="vectors.length > 2">×</button>
    </div>
    <button @click="addVector">+ Добавить вектор</button>
    <p>Сумма: <strong>[{{ result[0] }}, {{ result[1] }}]</strong></p>
  </div>
</template>

<style scoped>
.vector-row { display: flex; gap: 0.3rem; align-items: center; margin: 0.3rem 0; flex-wrap: wrap; justify-content: flex-end;}
</style>

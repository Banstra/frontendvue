<script setup lang="ts">
import { ref, computed } from 'vue'
import { getGoldenSize, type GoldenUnit } from './tasks'

const value = ref(10)
const unit = ref<GoldenUnit>('em')
const result = computed(() => getGoldenSize(value.value, unit.value))
</script>

<template>
  <div class="task">
    <h3>Задача: Золотое сечение</h3>
    <input v-model.number="value" type="number" placeholder="Значение" />
    <select v-model="unit">
      <option value="em">em</option>
      <option value="rem">rem</option>
    </select>
    <p>Результат: <strong>{{ result }}</strong></p>
    <div :style="{ fontSize: result }" class="preview">Пример текста</div>
  </div>
</template>

<style scoped>
.preview { margin-top: 0.5rem; padding: 0.3rem; border-radius: 4px; }
</style>

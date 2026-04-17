<script setup lang="ts">
import { ref, computed } from 'vue'
import { convertTemp } from './tasks'

const value = ref(32)
const direction = ref<'toC' | 'toF'>('toC')
const result = computed(() => convertTemp(value.value, direction.value))
</script>

<template>
  <div class="task">
    <h3>Задача: Конвертация температуры</h3>
    <input v-model.number="value" type="number" placeholder="Температура" />
    <select v-model="direction">
      <option value="toC">°F → °C</option>
      <option value="toF">°C → °F</option>
    </select>
    <p>Результат: <strong>{{ result }}</strong></p>
  </div>
</template>

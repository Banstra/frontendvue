<!-- src/components/Lab1/Lab1Task1.vue -->
<script setup lang="ts">
import { ref, computed } from 'vue'
import { calculateArrivalTime } from './tasks'

const scheduleHour = ref<number>(0)
const delayHours = ref<number>(0)

const result = computed(() => calculateArrivalTime(scheduleHour.value, delayHours.value))
</script>

<template>
  <div class="task-1">
    <h3>Задача: Время прибытия</h3>
    <label>
      Час по расписанию (0-23):
      <input v-model.number="scheduleHour" type="number" min="0" max="23" />
    </label>
    <label>
      Опоздание (часы):
      <input v-model.number="delayHours" type="number" min="0" />
    </label>
    <p class="result">
      Новое время прибытия: <strong>{{ result }}:00</strong>
    </p>
  </div>
</template>

<style scoped>
.task-1 {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
}
.result {
  margin-top: 0.5rem;
  font-weight: 500;
}
</style>

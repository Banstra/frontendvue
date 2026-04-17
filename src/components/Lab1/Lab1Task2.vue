<script setup lang="ts">
import { ref, computed } from 'vue'
import { getInitials } from './tasks'

const fullName = ref('')
const result = computed(() => getInitials(fullName.value))
</script>

<template>
  <div class="task">
    <h3>Задача: Подпись</h3>
    <input v-model="fullName" placeholder="Фамилия Имя Отчество" />
    <p>Результат: <strong>{{ result || '—' }}</strong></p>
  </div>
</template>

<style scoped>
.task {
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

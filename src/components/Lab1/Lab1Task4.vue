<script setup lang="ts">
import { ref, computed } from 'vue'
import { isValidBrackets } from './tasks'

const brackets = ref('')
const result = computed(() => {
  const valid = isValidBrackets(brackets.value)
  return valid ? '✅ Валидно' : '❌ Не валидно'
})
</script>

<template>
  <div class="task">
    <h3>Задача: Скобки</h3>
    <input v-model="brackets" placeholder="(){}[]" />
    <p :class="{ ok: isValidBrackets(brackets), error: !isValidBrackets(brackets) }">
      {{ result }}
    </p>
  </div>
</template>

<style scoped>
.ok {
  color: #22c55e;
}
.error {
  color: #ef4444;
}
</style>

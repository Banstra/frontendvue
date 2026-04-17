<script setup lang="ts">
import { ref, computed } from 'vue'
import { getLastWordLength } from './tasks'

const text = ref('')
const result = computed(() => getLastWordLength(text.value))
</script>

<template>
  <div class="task">
    <h3>Задача: Длина последнего слова</h3>
    <input v-model="text" placeholder="Введите строку" />
    <p>Длина: <strong>{{ result }}</strong></p>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const a = ref<number>(1)
const b = ref<number>(2)

function sum(a: number, b: number) {
  return a + b
}

const computedSum = computed(() => sum(a.value, b.value))
</script>

<template>
  <section>
    <h2>Пример решения задач</h2>
    <form>
      <label>
        Первое число
        <input type="number" name="first-number" v-model.number="a" />
      </label>
      <label>
        Второе число
        <input type="number" name="second-number" v-model.number="b" />
      </label>
      <output for="first-number second-number" v-text="computedSum"></output>
    </form>
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { xyzToSRGB } from './tasks'

const x = ref(0.5),
  y = ref(0.5),
  z = ref(0.5)

const result = computed(() => {
  const [r, g, b] = xyzToSRGB([x.value, y.value, z.value])
  return {
    rgb: `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`,
    hex: `#${[r, g, b]
      .map((v) =>
        Math.round(v * 255)
          .toString(16)
          .padStart(2, '0'),
      )
      .join('')}`,
  }
})
</script>

<template>
  <div class="task">
    <h3>Задача: XYZ → sRGB</h3>
    <div class="inputs">
      <label>X: <input v-model.number="x" type="number" step="0.01" min="0" max="1" /></label>
      <label>Y: <input v-model.number="y" type="number" step="0.01" min="0" max="1" /></label>
      <label>Z: <input v-model.number="z" type="number" step="0.01" min="0" max="1" /></label>
    </div>
    <div class="preview" :style="{ background: result.rgb }"></div>
    <p>
      RGB: <strong>{{ result.rgb }}</strong>
    </p>
    <p>
      HEX: <strong>{{ result.hex }}</strong>
    </p>
  </div>
</template>

<style scoped>
.inputs {
  display: flex;
  gap: 0.5rem;
  margin: 0.5rem 0;
}
.preview {
  width: 100px;
  height: 50px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
</style>

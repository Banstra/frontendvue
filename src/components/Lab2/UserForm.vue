<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Degree, IUserDTO } from '@/domain/types'

const props = defineProps<{ role: 'student' | 'teacher' }>()

// ✅ Строгий тип вместо any
type CreateUserPayload = Omit<IUserDTO, 'id'>

const emit = defineEmits<{
  submit: [payload: CreateUserPayload]
}>()

const name = ref('')
const email = ref('')
const enrollmentYear = ref<number | ''>('')
const degree = ref<Degree>('none')
const isTeacher = ref(props.role === 'teacher')

watch(
  () => props.role,
  (val) => {
    isTeacher.value = val === 'teacher'
    enrollmentYear.value = ''
    degree.value = 'none'
  },
)

function handleSubmit() {
  if (!name.value || !email.value) return

  // ✅ Явный тип payload
  const payload: CreateUserPayload = {
    type: props.role,
    name: name.value.trim(),
    email: email.value.trim(),
  }

  if (isTeacher.value) {
    payload.degree = degree.value
  } else {
    payload.enrollmentYear = Number(enrollmentYear.value) || new Date().getFullYear()
  }

  emit('submit', payload)
  name.value = ''
  email.value = ''
  enrollmentYear.value = ''
  degree.value = 'none'
}

const degreeOptions: { value: Degree; label: string }[] = [
  { value: 'none', label: 'Без степени' },
  { value: 'candidate', label: 'Кандидат наук' },
  { value: 'doctor', label: 'Доктор наук' },
]
</script>

<template>
  <form @submit.prevent="handleSubmit" class="form">
    <h3>Добавить {{ role === 'student' ? 'Студента' : 'Преподавателя' }}</h3>

    <input
      v-model="name"
      placeholder="ФИО"
      required
      pattern="[\p{L}\p{M}\p{N}\s\.\-]+"
      title="Только буквы, цифры, пробелы, точки и дефисы"
    />

    <input v-model="email" type="email" placeholder="Email" required />

    <!-- Поле для преподавателя: выпадающий список степени -->
    <div v-if="isTeacher" class="field-group">
      <label for="degree">Учёная степень:</label>
      <select v-model="degree" id="degree" class="select">
        <option v-for="opt in degreeOptions" :key="opt.value" :value="opt.value">
          {{ opt.label }}
        </option>
      </select>
    </div>

    <!-- Поле для студента: год поступления -->
    <div v-else class="field-group">
      <label for="year">Год поступления:</label>
      <input
        v-model.number="enrollmentYear"
        id="year"
        type="number"
        :min="2000"
        :max="new Date().getFullYear() + 5"
        placeholder="2024"
      />
    </div>

    <button type="submit" class="btn-primary">Добавить</button>
  </form>
</template>

<style scoped>
.form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.field-group label {
  font-size: 0.875rem;
  color: #475569;
  font-weight: 500;
}

input,
select {
  padding: 0.5rem;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

input:focus,
select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.select {
  background: white;
  cursor: pointer;
}

.btn-primary {
  padding: 0.6rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-primary:hover {
  background: #2563eb;
}

.btn-primary:active {
  transform: translateY(1px);
}
</style>

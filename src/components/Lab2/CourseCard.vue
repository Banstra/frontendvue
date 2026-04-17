<script setup lang="ts">
import type { Course } from '@/domain/Course'
import type { User } from '@/domain/User'
import type { EntityId } from '@/domain/types.ts'

const props = defineProps<{
  course: Course
  users: User[]
}>()

// ✅ Обновляем типы событий
const emit = defineEmits<{
  publish: [id: EntityId]
  archive: [id: EntityId]
  delete: [id: EntityId]
  enroll: [courseId: EntityId, userId: EntityId]
  unenroll: [courseId: EntityId, userId: EntityId]
}>()

const availableUsers = props.users.filter(
  (u) => !props.course.studentIds?.includes(u.id) && !props.course.teacherIds?.includes(u.id),
)
</script>

<template>
  <article class="card">
    <header>
      <h3>{{ course.title }}</h3>
      <span class="status" :class="course.status">{{ course.status }}</span>
    </header>
    <p>Лимит: {{ course.studentLimit ?? '∞' }} | Студентов: {{ course.studentIds?.length ?? 0 }}</p>

    <div class="actions">
      <button @click="emit('publish', course.id)" :disabled="course.status !== 'draft'">
        📢 Опубликовать
      </button>
      <button @click="emit('archive', course.id)" :disabled="course.status !== 'active'">
        📦 Архив
      </button>
      <button @click="emit('delete', course.id)" class="danger">🗑 Удалить курс</button>
    </div>

    <div class="roster">
      <h4>Записать пользователя:</h4>
      <select
        @change="
          (e) => {
            const userId = (e.target as HTMLSelectElement).value
            if (userId) emit('enroll', course.id, userId)
            ;(e.target as HTMLSelectElement).value = ''
          }
        "
      >
        <option disabled selected>Выберите...</option>
        <option v-for="u in availableUsers" :key="u.id" :value="u.id">
          {{ u.name }} ({{ u.role }})
        </option>
      </select>
    </div>
  </article>
</template>

<style scoped>
.card {
  container-type: inline-size;
  padding: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}
@container (min-width: 300px) {
  .card {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }
}
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.status {
  font-size: 0.8rem;
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
}
.status.active {
  background: #dcfce7;
  color: #166534;
}
.status.draft {
  background: #fef3c7;
  color: #92400e;
}
.status.archived {
  background: #f1f5f9;
  color: #475569;
}
.actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}
button {
  padding: 0.4rem 0.6rem;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  cursor: pointer;
}
button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.danger {
  background: #fee2e2;
  color: #991b1b;
}
</style>

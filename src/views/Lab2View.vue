<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { repo } from '@/services/LmsRepository'
import { User, Teacher } from '../domain/User'
import { Course } from '../domain/Course'
import UserForm from '@/components/Lab2/UserForm.vue'
import CourseCard from '@/components/Lab2/CourseCard.vue'
import type { EntityId, IUserDTO } from '@/domain/types'

const loading = ref(true)
const newRole = ref<'student' | 'teacher'>('student')
const courseTitle = ref('')
const courseLimit = ref<number | undefined>(undefined)
const users = ref<User[]>([])
const courses = ref<Course[]>([])

onMounted(async () => {
  try {
    const [u, c] = await Promise.all([repo.getUsers(), repo.getCourses()])
    users.value = u
    courses.value = c
  } catch (err) {
    console.error('Failed to load data:', err)
  } finally {
    loading.value = false
  }
})

const sortedUsers = computed(() =>
  [...users.value].sort((a, b) => String(a.name).localeCompare(String(b.name))),
)

async function handleCreateUser(payload: Omit<IUserDTO, 'id'>) {
  try {
    const newUser = await repo.createUser(payload)
    users.value = [...users.value, newUser]
  } catch (err) {
    console.error('Failed to create user:', err)
  }
}
async function handleDeleteUser(id: EntityId) {
  await repo.deleteUser(id)
  users.value = users.value.filter((u) => u.id !== id)
  for (const c of courses.value) c.removeUser(id)
  courses.value = [...courses.value]
}

async function handleCreateCourse() {
  if (!courseTitle.value) return
  try {
    const newCourse = await repo.createCourse({
      title: courseTitle.value,
      studentLimit: courseLimit.value,
      status: 'draft',
      studentIds: [],
      teacherIds: [],
    })
    courses.value = [...courses.value, newCourse]
    courseTitle.value = ''
    courseLimit.value = undefined
  } catch (err) {
    console.error('Failed to create course:', err)
  }
}

async function handleCourseAction(action: 'publish' | 'archive' | 'delete', id: EntityId) {
  const c = courses.value.find((x) => x.id === id)
  if (!c) return

  try {
    if (action === 'publish' && typeof c.publish === 'function') c.publish()
    if (action === 'archive' && typeof c.archive === 'function') c.archive()

    if (action === 'delete') {
      await repo.deleteCourse(id)
      courses.value = courses.value.filter((x) => x.id !== id)
      return
    }

    await repo.updateCourse(c)

    courses.value = await repo.getCourses()
  } catch (err) {
    console.error(`Failed to ${action} course:`, err)
  }
}

async function handleEnroll(courseId: EntityId, userId: EntityId) {
  const c = courses.value.find((x) => x.id === courseId)
  const u = users.value.find((x) => x.id === userId)
  if (!c || !u) return

  c.addUser(u)
  await repo.updateCourse(c)
  courses.value = await repo.getCourses() // перезагрузка для статистики
}

async function handleUnenroll(courseId: EntityId, userId: EntityId) {
  // ✅
  const c = courses.value.find((x) => x.id === courseId)
  if (!c) return
  c.removeUser(userId)
  await repo.updateCourse(c)
  courses.value = await repo.getCourses()
}

// Статистика — считаем по ID-массивам:
const avgStudents = computed(() => {
  if (courses.value.length === 0) return '0.0'
  const total = courses.value.reduce((sum, c) => sum + (c.studentIds?.length ?? 0), 0)
  return (total / courses.value.length).toFixed(1)
})

const phdCount = computed(() => {
  let count = 0

  for (const course of courses.value) {
    const teacherIds = course.teacherIds || []

    for (const tid of teacherIds) {
      // ✅ Надёжное сравнение: приводим оба значения к строке
      const teacher = users.value.find((u) => String(u.id) === String(tid))

      if (teacher && 'degree' in teacher) {
        const degree = (teacher as Teacher).degree
        if (degree === 'candidate' || degree === 'doctor') {
          count++
        }
      }
    }
  }

  return count
})
</script>

<template>
  <main class="lab2">
    <h1>🎓 LMS: Управление курсами и пользователями</h1>

    <section class="dashboard" v-if="!loading">
      <div class="stats">
        <p>
          📊 Ср. кол-во студентов на курс: <strong>{{ avgStudents }}</strong>
        </p>
        <p>
          🎓 Кандидатов/Докторов наук на курсах: <strong>{{ phdCount }}</strong>
        </p>
      </div>

      <div class="grid">
        <aside class="panel">
          <UserForm :role="newRole" @submit="handleCreateUser" />
          <select v-model="newRole" class="role-switch">
            <option value="student">Студент</option>
            <option value="teacher">Преподаватель</option>
          </select>

          <h3>Пользователи (A-Z)</h3>
          <ul class="user-list">
            <li v-for="user in sortedUsers" :key="user.id" class="user-item">
              <span
                >{{ user.name }} <em>({{ user.role }})</em></span
              >
              <button @click="handleDeleteUser(user.id)" class="small-btn">×</button>
            </li>
          </ul>
        </aside>

        <div class="main-content">
          <div class="create-course">
            <input v-model="courseTitle" placeholder="Название курса" />
            <input
              v-model.number="courseLimit"
              type="number"
              placeholder="Лимит студентов (опц.)"
            />
            <button @click="handleCreateCourse">Создать курс</button>
          </div>

          <div class="courses-list">
            <CourseCard
              v-for="c in courses"
              :key="c.id"
              :course="c"
              :users="users"
              @publish="(id) => handleCourseAction('publish', id)"
              @archive="(id) => handleCourseAction('archive', id)"
              @delete="(id) => handleCourseAction('delete', id)"
              @enroll="handleEnroll"
              @unenroll="handleUnenroll"
            />
          </div>
        </div>
      </div>
    </section>
    <p v-else>⏳ Загрузка данных...</p>
  </main>
</template>

<style scoped>
.lab2 {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 1rem;
}
.stats {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  border-radius: 8px;
}
.grid {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 1.5rem;
}
.panel {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.user-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.user-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  border-bottom: 1px solid #e2e8f0;
}
.small-btn {
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  cursor: pointer;
}
.create-course {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}
input,
select,
button {
  padding: 0.5rem;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
}
button {
  background: #3b82f6;
  color: white;
  cursor: pointer;
}
.courses-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1rem;
}
@media (max-width: 768px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>

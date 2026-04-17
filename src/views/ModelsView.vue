<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { repo } from '@/services/lab3/FarmRepository'
import type { IModelDTO, IFigureDTO, IPrinterDTO, FilamentColor } from '@/domain/lab3/types'

// --- State ---
const models = ref<IModelDTO[]>([])
const figures = ref<IFigureDTO[]>([])
const printers = ref<IPrinterDTO[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

// UI State
const showForm = ref(false)
const sortBy = ref<'name' | 'date'>('name')

// Form State
const form = ref({
  name: '',
  perimeter: '',
  time: ''
})

// --- Lifecycle ---
onMounted(async () => {
  try {
    const [m, f, p] = await Promise.all([
      repo.models.getAll(),
      repo.figures.getAll(),
      repo.printers.getAll()
    ])
    models.value = m
    figures.value = f
    printers.value = p
  } catch (err) {
    error.value = '⚠️ Не удалось загрузить данные моделей. Проверьте соединение с json-server.'
    console.error(err)
  } finally {
    loading.value = false
  }
})

// --- Computed ---

// 1. Созданные (те, что еще не в очереди и не печатаются)
const createdModels = computed(() => {
  const busyIds = new Set<string>()

  // Собираем ID всех моделей, которые сейчас в работе у принтеров
  printers.value.forEach(p => {
    if (p.currentModelId) busyIds.add(p.currentModelId)
    p.queue.forEach(id => busyIds.add(id))
  })

  return models.value.filter(m => !busyIds.has(m.id))
})

// 2. В печати (те, что сейчас в currentModelId у принтеров)
const printingModels = computed(() => {
  return printers.value
    .filter(p => p.currentModelId)
    .map(p => {
      const model = models.value.find(m => m.id === p.currentModelId)
      if (!model) return null

      // Находим цвет пластика в этом принтере
      const filament = p.filamentId
        ? (window as any).filamentsCache?.find((f: any) => f.id === p.filamentId)?.color || 'TPU-Black'
        : 'TPU-Black' // Fallback цвет

      return { ...model, color: filament, printerName: p.name, progress: p.progress }
    })
    .filter(Boolean) as (IModelDTO & { color: string; printerName: string; progress: number })[]
})

// 3. Готовые фигурки
const finishedFigures = computed(() => {
  return figures.value
})

// Сортировка списка "Созданные"
const sortedCreatedModels = computed(() => {
  const list = [...createdModels.value]
  if (sortBy.value === 'name') {
    return list.sort((a, b) => a.name.localeCompare(b.name))
  }
  return list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
})

// --- Actions ---

async function handleCreate() {
  const p = Number(form.value.perimeter)
  const t = Number(form.value.time)

  if (p <= 0 || t <= 0 || !form.value.name.trim()) {
    alert('Пожалуйста, заполните корректно все поля (числа должны быть > 0)')
    return
  }

  try {
    const newModel = await repo.models.create({
      name: form.value.name.trim(),
      perimeter: p,
      time: t
    })
    models.value.unshift(newModel)
    showForm.value = false
    // Сброс формы
    form.value = { name: '', perimeter: '', time: '' }
  } catch (e) {
    alert('Ошибка при создании модели')
  }
}

async function handleCopy(model: IModelDTO) {
  try {
    // Создаем копию с суффиксом "(Копия)"
    const copy = await repo.models.create({
      name: `${model.name} (Копия)`,
      perimeter: model.perimeter,
      time: model.time
    })
    models.value.unshift(copy)
  } catch (e) {
    alert('Ошибка при копировании')
  }
}

async function handleDelete(id: string) {
  if (!confirm('Удалить модель?')) return
  try {
    await repo.models.delete(id)
    models.value = models.value.filter(m => m.id !== id)
  } catch (e) {
    alert('Ошибка при удалении')
  }
}

// Вспомогательная функция для цвета (маппинг строки в CSS класс/цвет)
function getColorStyle(color: string) {
  const colors: Record<string, string> = {
    'PLA-Red': '#ef4444',
    'ABS-Blue': '#3b82f6',
    'PETG-Green': '#22c55e',
    'TPU-Black': '#475569',
    'Nylon-White': '#e2e8f0'
  }
  return colors[color] || '#888'
}
</script>

<template>
  <div class="models-page">
    <header class="header">
      <h1>📐 Управление Моделями</h1>
      <div class="controls">
        <select v-model="sortBy">
          <option value="name">По имени</option>
          <option value="date">По дате</option>
        </select>
        <button @click="showForm = !showForm" class="btn-primary">
          {{ showForm ? 'Закрыть форму' : '+ Добавить модель' }}
        </button>
      </div>
    </header>

    <!-- Форма добавления -->
    <section v-if="showForm" class="form-panel">
      <h3>Новая модель</h3>
      <div class="form-grid">
        <input v-model="form.name" placeholder="Название модели" required />
        <input v-model.number="form.perimeter" type="number" min="1" placeholder="Длина периметра (м)" required />
        <input v-model.number="form.time" type="number" min="1" placeholder="Время печати (мин)" required />
      </div>
      <button @click="handleCreate" class="btn-primary" :disabled="!form.name || form.perimeter <= 0 || form.time <= 0">
        Сохранить
      </button>
    </section>

    <div v-if="loading" class="loader">Загрузка данных...</div>
    <div v-else class="columns">

      <!-- Колонка 1: Созданные (Очередь) -->
      <section class="column">
        <h2>📦 Созданные ({{ sortedCreatedModels.length }})</h2>
        <div v-if="sortedCreatedModels.length === 0" class="empty-msg">Нет доступных моделей</div>
        <ul class="list">
          <li v-for="m in sortedCreatedModels" :key="m.id" class="card">
            <div class="card-content">
              <h4>{{ m.name }}</h4>
              <p>Периметр: {{ m.perimeter }}м | Время: {{ m.time }}мин</p>
              <span class="date">{{ new Date(m.createdAt).toLocaleDateString() }}</span>
            </div>
            <div class="card-actions">
              <button @click="handleCopy(m)" title="Копировать">📋</button>
              <button @click="handleDelete(m.id)" class="btn-danger" title="Удалить">🗑</button>
            </div>
          </li>
        </ul>
      </section>

      <!-- Колонка 2: В печати -->
      <section class="column">
        <h2>🖨 В печати ({{ printingModels.length }})</h2>
        <div v-if="printingModels.length === 0" class="empty-msg">Ничего не печатается</div>
        <ul class="list">
          <li
            v-for="m in printingModels"
            :key="m.id"
            class="card printing"
            :style="{ borderLeft: `4px solid ${getColorStyle(m.color)}` }"
          >
            <div class="card-content">
              <h4>{{ m.name }}</h4>
              <p>Принтер: {{ m.printerName }}</p>
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: `${m.progress}%`, backgroundColor: getColorStyle(m.color) }"></div>
              </div>
              <span class="percent">{{ m.progress }}%</span>
            </div>
          </li>
        </ul>
      </section>

      <!-- Колонка 3: Готовые фигурки -->
      <section class="column">
        <h2>✅ Готовые фигурки ({{ finishedFigures.length }})</h2>
        <div v-if="finishedFigures.length === 0" class="empty-msg">Нет готовых фигурок</div>
        <ul class="list">
          <li
            v-for="f in finishedFigures"
            :key="f.id"
            class="card finished"
            :style="{ borderLeft: `4px solid ${getColorStyle(f.color)}` }"
          >
            <div class="card-content">
              <h4>{{ f.modelName }}</h4>
              <p>Цвет: {{ f.color }}</p>
              <span class="time-info">Готово: {{ new Date(f.endTime).toLocaleTimeString() }}</span>
            </div>
          </li>
        </ul>
      </section>

    </div>
  </div>
</template>

<style scoped>
.models-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.controls {
  display: flex;
  gap: 0.5rem;
}

.form-panel {
  background: #f8fafc;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.columns {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.column h2 {
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
  color: #334155;
  border-bottom: 2px solid #e2e8f0;
  padding-bottom: 0.3rem;
}

.empty-msg {
  color: #94a3b8;
  font-style: italic;
  padding: 1rem;
  text-align: center;
  background: #f1f5f9;
  border-radius: 4px;
}

.list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 0.75rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  container-type: inline-size; /* Для отзывчивости внутри карточки */
}

.card-content h4 {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
}

.card-content p {
  margin: 0;
  font-size: 0.85rem;
  color: #64748b;
}

.date, .time-info, .percent {
  font-size: 0.75rem;
  color: #94a3b8;
  display: block;
  margin-top: 0.25rem;
}

.card-actions {
  display: flex;
  gap: 0.25rem;
}

.card-actions button {
  background: none;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  cursor: pointer;
  padding: 0.2rem 0.4rem;
  transition: all 0.2s;
}

.card-actions button:hover {
  background: #f1f5f9;
  border-color: #94a3b8;
}

.btn-danger {
  color: #ef4444;
}

.btn-danger:hover {
  background: #fee2e2;
  border-color: #ef4444;
}

/* Стили для прогресс-бара */
.progress-bar {
  width: 100%;
  height: 6px;
  background: #e2e8f0;
  border-radius: 3px;
  margin-top: 0.5rem;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  transition: width 0.5s ease;
}

/* Кнопки общие */
.btn-primary {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.btn-primary:disabled {
  background: #94a3b8;
  cursor: not-allowed;
}

.loader {
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
  color: #64748b;
}

/* Адаптивность через container queries */
@container (max-width: 200px) {
  .card {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  .card-actions {
    align-self: flex-end;
  }
}
</style>

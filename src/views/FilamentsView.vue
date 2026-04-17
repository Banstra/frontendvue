<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { farmRepo } from '@/services/lab3/FarmRepository'
import type { IFilamentDTO, FilamentColor } from '@/domain/lab3/types'

const filaments = ref<IFilamentDTO[]>([])
const printers = ref<any[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const showForm = ref(false)

const COLORS: FilamentColor[] = [
  'PLA-Red',
  'ABS-Blue',
  'PETG-Green',
  'TPU-Black',
  'Nylon-White'
]

const form = ref({
  material: 'PLA',
  color: 'PLA-Red' as FilamentColor,
  length: 100
})

onMounted(async () => {
  await Promise.all([
    loadFilaments(),
    loadPrinters()
  ])
})

async function loadFilaments() {
  try {
    filaments.value = await farmRepo.filaments.getAll()
  } catch (err) {
    error.value = '⚠️ Не удалось загрузить пластики'
    console.error(err)
  } finally {
    loading.value = false
  }
}

async function loadPrinters() {
  try {
    printers.value = await farmRepo.printers.getAll()
  } catch (err) {
    console.error('Failed to load printers:', err)
  }
}

function resetForm() {
  form.value = { material: 'PLA', color: 'PLA-Red', length: 100 }
  showForm.value = false
}

async function handleSubmit() {
  if (form.value.length <= 0) {
    alert('Длина должна быть больше 0')
    return
  }

  try {
    await farmRepo.filaments.create(form.value)
    await loadFilaments()
    resetForm()
  } catch (err) {
    alert('Ошибка при создании')
    console.error(err)
  }
}

async function handleDelete(id: string) {
  const filament = filaments.value.find(f => f.id === id)
  if (!filament) return

  const printerWithFilament = printers.value.find(p => p.filamentId === id)
  if (printerWithFilament) {
    alert(`Нельзя удалить пластик "${filament.color}", пока он установлен в принтер "${printerWithFilament.name}". Сначала уберите пластик из принтера.`)
    return
  }

  if (!confirm('Удалить пластик?')) return

  try {
    await farmRepo.filaments.delete(id)
    await loadFilaments()
  } catch (err) {
    alert('Ошибка при удалении')
    console.error(err)
  }
}

function getPrinterName(filamentId: string): string | null {
  const printer = printers.value.find(p => p.filamentId === filamentId)
  return printer ? printer.name : null
}

function getColorClass(color: string): string {
  return color.toLowerCase().replace(/-/g, '-')
}
</script>

<template>
  <div class="filaments-view">
    <header class="header">
      <h1>🧵 Управление пластиками</h1>
      <button @click="showForm = !showForm" class="btn-primary">
        {{ showForm ? 'Закрыть' : '+ Добавить пластик' }}
      </button>
    </header>

    <!-- Форма добавления -->
    <section v-if="showForm" class="form-panel">
      <h3>Новая катушка пластика</h3>
      <div class="form-grid">
        <input
          v-model="form.material"
          placeholder="Материал (PLA, ABS, PETG...)"
          required
        />
        <select v-model="form.color" required>
          <option v-for="c in COLORS" :key="c" :value="c">
            {{ c }}
          </option>
        </select>
        <input
          v-model.number="form.length"
          type="number"
          min="1"
          placeholder="Длина нити (метры)"
          required
        />
      </div>
      <div class="form-actions">
        <button @click="handleSubmit" class="btn-primary" :disabled="form.length <= 0">
          Создать
        </button>
        <button @click="resetForm" class="btn-secondary">Отмена</button>
      </div>
    </section>

    <div v-if="loading" class="loader">Загрузка...</div>

    <div v-else-if="filaments.length === 0" class="empty-state">
      <p>Нет пластиков. Добавьте первую катушку!</p>
    </div>

    <div v-else class="filaments-grid">
      <div
        v-for="filament in filaments"
        :key="filament.id"
        class="filament-card"
        :class="{ busy: filament.printerId }"
      >
        <div class="filament-header">
          <span class="color-indicator" :class="getColorClass(filament.color)"></span>
          <h3>{{ filament.color }}</h3>
        </div>

        <div class="filament-info">
          <p><strong>Материал:</strong> {{ filament.material }}</p>
          <p><strong>Длина:</strong> {{ filament.length }} м</p>
          <p v-if="filament.printerId" class="busy-info">
            🔒 Установлен в: <strong>{{ getPrinterName(filament.id) }}</strong>
          </p>
        </div>

        <button
          @click="handleDelete(filament.id)"
          :disabled="!!filament.printerId"
          class="btn-delete"
          :title="filament.printerId ? 'Сначала уберите из принтера' : 'Удалить'"
        >
          🗑 Удалить
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.filaments-view {
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

.form-panel {
  background: #f8fafc;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.form-panel h3 {
  margin: 0 0 1rem 0;
  color: #1e293b;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1rem;
}

input, select {
  padding: 0.6rem;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 1rem;
}

.form-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-primary {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
}

.btn-primary:disabled {
  background: #cbd5e1;
  cursor: not-allowed;
}

.btn-secondary {
  background: #e2e8f0;
  color: #475569;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: #cbd5e1;
}

.filaments-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

.filament-card {
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  transition: all 0.2s;
}

.filament-card.busy {
  border-color: #f59e0b;
  background: #fffbeb;
}

.filament-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.color-indicator {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid #e2e8f0;
}

/* Цвета пластиков */
.color-indicator.pla-red { background: #ef4444; }
.color-indicator.abs-blue { background: #3b82f6; }
.color-indicator.petg-green { background: #22c55e; }
.color-indicator.tpu-black { background: #475569; }
.color-indicator.nylon-white {
  background: #e2e8f0;
  border-color: #94a3b8;
}

.filament-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #1e293b;
}

.filament-info {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-size: 0.9rem;
  color: #475569;
}

.filament-info strong {
  color: #1e293b;
}

.busy-info {
  color: #d97706;
  font-weight: 500;
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px dashed #fcd34d;
}

.btn-delete {
  margin-top: auto;
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid #fecaca;
  padding: 0.5rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-delete:hover:not(:disabled) {
  background: #fecaca;
  border-color: #ef4444;
}

.btn-delete:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #f1f5f9;
  border-color: #e2e8f0;
  color: #94a3b8;
}

.loader {
  text-align: center;
  padding: 3rem;
  color: #64748b;
  font-size: 1.1rem;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  background: #f8fafc;
  border-radius: 8px;
  color: #64748b;
}

@media (max-width: 640px) {
  .filaments-grid {
    grid-template-columns: 1fr;
  }
}
</style>

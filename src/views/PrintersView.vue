<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { farmRepo } from '@/services/lab3/FarmRepository'
import type { IPrinterDTO } from '@/domain/lab3/types'

const printers = ref<IPrinterDTO[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const showForm = ref(false)
const editingId = ref<string | null>(null)

const form = ref({
  brand: '',
  name: '',
  speed: 5
})

onMounted(async () => {
  await loadPrinters()
})

async function loadPrinters() {
  try {
    printers.value = await farmRepo.printers.getAll()
  } catch (err) {
    error.value = '⚠️ Не удалось загрузить принтеры'
    console.error(err)
  } finally {
    loading.value = false
  }
}

function resetForm() {
  form.value = { brand: '', name: '', speed: 5 }
  editingId.value = null
  showForm.value = false
}

async function handleSubmit() {
  if (!form.value.brand.trim() || !form.value.name.trim()) {
    alert('Заполните все поля')
    return
  }

  try {
    if (editingId.value) {
      await farmRepo.printers.update(editingId.value, form.value)
    } else {
      await farmRepo.printers.create(form.value)
    }
    await loadPrinters()
    resetForm()
  } catch (err) {
    alert('Ошибка при сохранении')
    console.error(err)
  }
}

function handleEdit(printer: IPrinterDTO) {
  form.value = {
    brand: printer.brand,
    name: printer.name,
    speed: printer.speed
  }
  editingId.value = printer.id
  showForm.value = true
}

async function handleDelete(id: string) {
  const printer = printers.value.find(p => p.id === id)
  if (!printer) return

  if (printer.status !== 'idle') {
    alert(`Нельзя удалить принтер "${printer.name}", пока он ${getStatusText(printer.status)}. Остановите печать и уберите пластик.`)
    return
  }

  if (printer.filamentId) {
    alert(`Нельзя удалить принтер "${printer.name}", пока в нём установлен пластик. Сначала уберите пластик.`)
    return
  }

  if (!confirm('Удалить принтер?')) return

  try {
    await farmRepo.printers.delete(id)
    await loadPrinters()
  } catch (err) {
    alert('Ошибка при удалении')
    console.error(err)
  }
}

function getStatusText(status: string): string {
  const texts: Record<string, string> = {
    idle: 'неактивен',
    printing: 'печатает',
    error: 'в ошибке',
    completed: 'завершил печать'
  }
  return texts[status] || status
}

const isPrinterBusy = (printer: IPrinterDTO) =>
  printer.status !== 'idle' || printer.filamentId
</script>

<template>
  <div class="printers-view">
    <header class="header">
      <h1>🖨 Управление принтерами</h1>
      <button @click="showForm = !showForm" class="btn-primary">
        {{ showForm ? 'Закрыть' : '+ Добавить принтер' }}
      </button>
    </header>

    <!-- Форма добавления/редактирования -->
    <section v-if="showForm" class="form-panel">
      <h3>{{ editingId ? 'Редактировать принтер' : 'Новый принтер' }}</h3>
      <div class="form-grid">
        <input
          v-model="form.brand"
          placeholder="Марка (например, Creality)"
          required
        />
        <input
          v-model="form.name"
          placeholder="Имя (например, Printer-1)"
          required
        />
        <input
          v-model.number="form.speed"
          type="number"
          min="1"
          max="20"
          placeholder="Скорость (%/сек)"
        />
      </div>
      <div class="form-actions">
        <button @click="handleSubmit" class="btn-primary">
          {{ editingId ? 'Сохранить' : 'Создать' }}
        </button>
        <button @click="resetForm" class="btn-secondary">Отмена</button>
      </div>
    </section>

    <div v-if="loading" class="loader">Загрузка...</div>

    <div v-else-if="printers.length === 0" class="empty-state">
      <p>Нет принтеров. Добавьте первый принтер!</p>
    </div>

    <div v-else class="printers-list">
      <div
        v-for="printer in printers"
        :key="printer.id"
        class="printer-item"
        :class="{ busy: isPrinterBusy(printer) }"
      >
        <div class="printer-info">
          <h3>{{ printer.brand }} {{ printer.name }}</h3>
          <div class="printer-meta">
            <span class="status" :class="printer.status">
              {{ getStatusText(printer.status) }}
            </span>
            <span>⚡ {{ printer.speed }}%/сек</span>
            <span v-if="printer.queue.length">📋 {{ printer.queue.length }} в очереди</span>
            <span v-if="printer.filamentId">🧵 Пластик установлен</span>
          </div>
        </div>
        <div class="printer-actions">
          <button
            @click="handleEdit(printer)"
            :disabled="isPrinterBusy(printer)"
            :title="isPrinterBusy(printer) ? 'Сначала освободите принтер' : 'Редактировать'"
          >
            ✏️
          </button>
          <button
            @click="handleDelete(printer.id)"
            :disabled="isPrinterBusy(printer)"
            :title="isPrinterBusy(printer) ? 'Сначала освободите принтер' : 'Удалить'"
            class="btn-danger"
          >
            🗑
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.printers-view {
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
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1rem;
}

input {
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

.btn-primary:hover {
  background: #2563eb;
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

.printers-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.printer-item {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  transition: all 0.2s;
}

.printer-item.busy {
  border-color: #f59e0b;
  background: #fffbeb;
}

.printer-info h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  color: #1e293b;
}

.printer-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  font-size: 0.875rem;
  color: #64748b;
}

.status {
  font-weight: 600;
  text-transform: capitalize;
}

.status.idle { color: #22c55e; }
.status.printing { color: #3b82f6; }
.status.error { color: #ef4444; }
.status.completed { color: #eab308; }

.printer-actions {
  display: flex;
  gap: 0.5rem;
}

.printer-actions button {
  background: none;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  padding: 0.4rem 0.6rem;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s;
}

.printer-actions button:hover:not(:disabled) {
  background: #f1f5f9;
  border-color: #94a3b8;
}

.printer-actions button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-danger {
  color: #ef4444;
}

.btn-danger:hover:not(:disabled) {
  background: #fee2e2;
  border-color: #ef4444;
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
  .printers-list {
    grid-template-columns: 1fr;
  }
  .printer-item {
    flex-direction: column;
    align-items: flex-start;
  }
  .printer-actions {
    align-self: flex-end;
  }
}
</style>

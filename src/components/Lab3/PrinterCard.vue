<script setup lang="ts">
import { computed } from 'vue'
import { Printer } from '@/domain/lab3/Printer'
import type { IFilamentDTO, IModelDTO } from '@/domain/lab3/types'

const props = defineProps<{
  printer: Printer
  filaments: IFilamentDTO[]
  models: IModelDTO[]
}>()

const emit = defineEmits<{
  runPrint: [printer: Printer]
  addToQueue: [printer: Printer, modelId: string]
  removeFromQueue: [printer: Printer, modelId: string]
  setFilament: [printer: Printer, filamentId: string | undefined]
}>()

const currentFilament = computed(() =>
  props.filaments.find(f => f.id === props.printer.filamentId)
)

const currentModel = computed(() =>
  props.models.find(m => m.id === props.printer.currentModelId)
)

const statusColors: Record<string, string> = {
  idle: '#22c55e',
  printing: '#3b82f6',
  error: '#ef4444',
  completed: '#eab308'
}

const statusLabels: Record<string, string> = {
  idle: 'Готов',
  printing: 'Печатает',
  error: 'Ошибка',
  completed: 'Завершён'
}
</script>

<template>
  <article class="printer-card" :class="printer.status">
    <header class="card-header">
      <div class="printer-info">
        <h3>{{ printer.brand }} {{ printer.name }}</h3>
        <span
          class="status-badge"
          :style="{ backgroundColor: statusColors[printer.status] }"
        >
          {{ statusLabels[printer.status] }}
        </span>
      </div>
      <div class="speed-info">
        ⚡ {{ printer.speed }}%/сек
      </div>
    </header>

    <!-- Ошибка -->
    <div v-if="printer.error" class="error-box">
      ⚠️ {{ printer.error }}
    </div>

    <!-- Текущий пластик -->
    <div class="filament-section">
      <label>🧵 Пластик:</label>
      <select
        :value="printer.filamentId || ''"
        @change="emit('setFilament', printer, ($event.target as HTMLSelectElement).value || undefined)"
        :disabled="printer.status === 'printing'"
      >
        <option value="">Не выбран</option>
        <option
          v-for="f in filaments.filter(x => !x.printerId || x.printerId === printer.id)"
          :key="f.id"
          :value="f.id"
        >
          {{ f.color }} ({{ f.length }}м)
        </option>
      </select>
      <span v-if="currentFilament" class="filament-color" :class="currentFilament.color.toLowerCase()"></span>
    </div>

    <!-- Прогресс печати -->
    <div v-if="printer.status === 'printing'" class="progress-section">
      <div class="progress-info">
        <span>{{ currentModel?.name || 'Печать...' }}</span>
        <span class="progress-percent">{{ printer.progress }}%</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: `${printer.progress}%` }"></div>
      </div>
    </div>

    <!-- Очередь -->
    <div class="queue-section">
      <h4>📋 Очередь ({{ printer.queue.length }})</h4>

      <!-- Добавление в очередь -->
      <div v-if="printer.status !== 'printing'" class="add-to-queue">
        <select
          @change="e => {
            const val = (e.target as HTMLSelectElement).value
            if (val) {
              emit('addToQueue', printer, val)
              ;(e.target as HTMLSelectElement).value = ''
            }
          }"
        >
          <option value="">+ Добавить модель</option>
          <option v-for="m in models" :key="m.id" :value="m.id">
            {{ m.name }} ({{ m.perimeter }}м)
          </option>
        </select>
      </div>

      <!-- Список очереди -->
      <ul v-if="printer.queue.length" class="queue-list">
        <li
          v-for="(modelId, idx) in printer.queue"
          :key="modelId"
          :class="{ current: idx === 0 && printer.status === 'printing' }"
        >
          <span class="queue-index">{{ idx + 1 }}.</span>
          <span class="model-name">{{ models.find(m => m.id === modelId)?.name }}</span>
          <button
            v-if="idx > 0 || printer.status !== 'printing'"
            @click="emit('removeFromQueue', printer, modelId)"
            class="remove-btn"
          >
            ×
          </button>
        </li>
      </ul>
      <p v-else class="empty-queue">Очередь пуста</p>
    </div>

    <!-- Кнопки управления -->
    <div class="actions">
      <button
        @click="emit('runPrint', printer)"
        :disabled="printer.status === 'printing' || !printer.filamentId || printer.queue.length === 0"
        class="btn-primary"
      >
        ▶ Запуск
      </button>
    </div>
  </article>
</template>

<style scoped>
.printer-card {
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  container-type: inline-size;
  transition: border-color 0.3s;
}

.printer-card.printing {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.printer-card.error {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.printer-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.printer-info h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #1e293b;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 500;
  color: white;
  text-transform: uppercase;
}

.speed-info {
  font-size: 0.875rem;
  color: #64748b;
  white-space: nowrap;
}

.error-box {
  background: #fee2e2;
  color: #991b1b;
  padding: 0.75rem;
  border-radius: 6px;
  font-weight: 500;
  border-left: 4px solid #ef4444;
}

.filament-section,
.queue-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filament-section label,
.queue-section h4 {
  font-size: 0.875rem;
  font-weight: 600;
  color: #475569;
  margin: 0;
}

select {
  padding: 0.5rem;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  background: white;
  font-size: 0.875rem;
  cursor: pointer;
}

select:disabled {
  background: #f1f5f9;
  cursor: not-allowed;
  opacity: 0.6;
}

.filament-color {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid #e2e8f0;
  margin-left: 0.5rem;
  vertical-align: middle;
}

.progress-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  font-weight: 500;
}

.progress-bar {
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #60a5fa);
  transition: width 0.5s ease;
}

.queue-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.queue-list li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: #f8fafc;
  border-radius: 6px;
  border-left: 3px solid #cbd5e1;
}

.queue-list li.current {
  border-left-color: #3b82f6;
  background: #eff6ff;
  font-weight: 500;
}

.queue-index {
  font-weight: 600;
  color: #64748b;
  min-width: 1.5rem;
}

.model-name {
  flex: 1;
  font-size: 0.875rem;
}

.remove-btn {
  background: none;
  border: none;
  color: #ef4444;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0 0.25rem;
  line-height: 1;
  transition: transform 0.2s;
}

.remove-btn:hover {
  transform: scale(1.2);
}

.empty-queue {
  color: #94a3b8;
  font-style: italic;
  font-size: 0.875rem;
  text-align: center;
  padding: 0.5rem;
}

.actions {
  margin-top: auto;
}

.btn-primary {
  width: 100%;
  padding: 0.75rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
  transform: translateY(-1px);
}

.btn-primary:disabled {
  background: #cbd5e1;
  cursor: not-allowed;
  opacity: 0.6;
}

@container (max-width: 300px) {
  .card-header {
    flex-direction: column;
  }
  .speed-info {
    align-self: flex-end;
  }
}
</style>

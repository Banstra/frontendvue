<!-- src/views/HomeView.vue -->
<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { farmRepo } from '@/services/lab3/FarmRepository'
import { Printer } from '@/domain/lab3/Printer'
import { Filament } from '@/domain/lab3/Filament'
import { PrintModel } from '@/domain/lab3/Model'
import type { IPrinterDTO, IFilamentDTO, IModelDTO } from '@/domain/lab3/types'
import PrinterCard from '@/components/Lab3/PrinterCard.vue'

const printers = ref<Printer[]>([])
const filaments = ref<IFilamentDTO[]>([])
const models = ref<IModelDTO[]>([])
const errors = ref<string[]>([])
const intervals = ref<number[]>([])

onMounted(async () => {
  await loadData()
  // Восстанавливаем активные печати
  printers.value.forEach(pr => {
    if (pr.status === 'printing' && pr.currentModelId) {
      resumePrint(pr)
    }
  })
})

onUnmounted(() => {
  intervals.value.forEach(clearInterval)
})

async function loadData() {
  try {
    const [p, f, m] = await Promise.all([
      farmRepo.printers.getAll(),
      farmRepo.filaments.getAll(),
      farmRepo.models.getAll()
    ])
    printers.value = p.map(d => new Printer(
      d.id, d.brand, d.name, d.speed, d.filamentId,
      d.queue, d.status, d.progress, d.error, d.currentModelId
    ))
    filaments.value = f
    models.value = m
  } catch (err) {
    errors.value.push('⚠️ Не удалось загрузить данные. Проверьте json-server.')
    console.error(err)
  }
}

function resumePrint(pr: Printer) {
  const iv = window.setInterval(async () => {
    pr.progress += pr.speed
    if (pr.progress >= 100) {
      pr.status = 'completed'
      pr.stopPrint()
      await farmRepo.printers.update(pr.id, { status: 'completed', progress: 100 })
      clearInterval(iv)
    } else {
      await farmRepo.printers.update(pr.id, { progress: pr.progress })
    }
  }, 1000)
  intervals.value.push(iv)
}

function runPrint(pr: Printer) {
  if (pr.queue.length === 0 || !pr.filamentId) return

  const modelId = pr.queue[0]
  const modelData = models.value.find(m => m.id === modelId)
  const filamentData = filaments.value.find(f => f.id === pr.filamentId)

  if (!modelData || !filamentData) return

  const model = new PrintModel(
    modelData.id, modelData.name,
    modelData.perimeter, modelData.time
  )
  const filament = new Filament(
    filamentData.id, filamentData.material,
    filamentData.color, filamentData.length
  )

  pr.startPrint(filament, model, async (err, figure) => {
    if (err) {
      errors.value.push(`🚨 ${err.message} (${err.figureInfo})`)
      await farmRepo.printers.update(pr.id, {
        status: 'error',
        error: err.message
      })
    } else if (figure) {
      await farmRepo.figures.create(figure)
      pr.queue.shift()
      await farmRepo.printers.update(pr.id, {
        queue: pr.queue,
        status: 'idle',
        progress: 0,
        currentModelId: undefined
      })
      await farmRepo.filaments.update(filament.id, { length: filament.length })
      await loadData() // Перезагружаем данные
    }
  })

  farmRepo.printers.update(pr.id, {
    status: 'printing',
    currentModelId: modelId
  })
}

function addToQueue(pr: Printer, modelId: string) {
  if (modelId) {
    pr.addToQueue(modelId)
    farmRepo.printers.update(pr.id, { queue: pr.queue })
  }
}

function removeFromQueue(pr: Printer, modelId: string) {
  pr.removeFromQueue(modelId)
  farmRepo.printers.update(pr.id, { queue: pr.queue })
}

function setFilament(pr: Printer, filamentId: string | undefined) {
  pr.filamentId = filamentId
  farmRepo.printers.update(pr.id, { filamentId: pr.filamentId })
}

const availableModels = computed(() => {
  const busyIds = new Set<string>()
  printers.value.forEach(p => {
    if (p.currentModelId) busyIds.add(p.currentModelId)
    p.queue.forEach(id => busyIds.add(id))
  })
  return models.value.filter(m => !busyIds.has(m.id))
})
</script>

<template>
  <div class="home-view">
    <h1>🏭 3D Ферма: Управление</h1>

    <div v-if="errors.length" class="alerts">
      <div v-for="(e, i) in errors" :key="i" class="alert error">
        {{ e }}
        <button @click="errors.splice(i, 1)" class="close-btn">×</button>
      </div>
    </div>

    <div class="printers-grid">
      <PrinterCard
        v-for="pr in printers"
        :key="pr.id"
        :printer="pr"
        :filaments="filaments"
        :models="availableModels"
        @run-print="runPrint"
        @add-to-queue="addToQueue"
        @remove-from-queue="removeFromQueue"
        @set-filament="setFilament"
      />
    </div>

    <div v-if="printers.length === 0" class="empty-state">
      <p>Нет принтеров. Добавьте их на странице <RouterLink to="/lab3/printers">Принтеры</RouterLink></p>
    </div>
  </div>
</template>

<style scoped>
.home-view {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.printers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.alerts {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.alert {
  padding: 0.75rem 1rem;
  border-radius: 6px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.alert.error {
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #991b1b;
  line-height: 1;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  background: #f8fafc;
  border-radius: 8px;
  color: #64748b;
}

.empty-state a {
  color: #3b82f6;
  font-weight: 500;
}

@media (max-width: 768px) {
  .printers-grid {
    grid-template-columns: 1fr;
  }
}
</style>

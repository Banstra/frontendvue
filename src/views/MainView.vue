<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { repo } from '@/services/lab3/FarmRepository';
import { Printer } from '@/domain/lab3/Printer';
import { Filament } from '@/domain/lab3/Filament';
import { PrintModel } from '@/domain/lab3/Model';
import type { IPrinterDTO, IFilamentDTO, IModelDTO } from '@/domain/lab3/types';

const printers = ref<Printer[]>([]);
const filaments = ref<IFilamentDTO[]>([]);
const models = ref<IModelDTO[]>([]);
const errors = ref<string[]>([]);
let intervals: number[] = [];

onMounted(async () => {
  try {
    const [p, f, m] = await Promise.all([repo.printers.getAll(), repo.filaments.getAll(), repo.models.getAll()]);
    printers.value = p.map(d => new Printer(d.id, d.brand, d.name, d.speed, d.filamentId, d.queue, d.status, d.progress, d.error, d.currentModelId));
    filaments.value = f;
    models.value = m;

    // Восстанавливаем активные печати
    printers.value.forEach(pr => {
      if (pr.status === 'printing' && pr.currentModelId) {
        resumePrint(pr);
      }
    });
  } catch { errors.value.push('⚠️ Не удалось загрузить данные. Проверьте json-server.'); }
});

onUnmounted(() => intervals.forEach(clearInterval));

function resumePrint(pr: Printer) {
  // Упрощённый ресум для демо: просто продолжаем тикать
  const iv = window.setInterval(() => {
    pr.progress += pr.speed;
    if (pr.progress >= 100) {
      pr.status = 'completed';
      pr.stopPrint();
      repo.printers.update(pr.id, { status: 'completed', progress: 100 });
    }
  }, 1000);
  intervals.push(iv);
}

function runPrint(pr: Printer) {
  if (pr.queue.length === 0 || !pr.filamentId) return;
  const modelId = pr.queue[0];
  const modelData = models.value.find(m => m.id === modelId);
  const filamentData = filaments.value.find(f => f.id === pr.filamentId);
  if (!modelData || !filamentData) return;

  const model = new PrintModel(modelData.id, modelData.name, modelData.perimeter, modelData.time);
  const filament = new Filament(filamentData.id, filamentData.material, filamentData.color, filamentData.length);

  pr.startPrint(filament, model, (err, figure) => {
    if (err) {
      errors.value.push(`🚨 ${err.message} (${err.figureInfo})`);
      repo.printers.update(pr.id, { status: 'error', error: err.message });
    } else if (figure) {
      repo.figures.create(figure);
      pr.queue.shift();
      repo.printers.update(pr.id, { queue: pr.queue, status: 'idle', progress: 0, currentModelId: undefined });
      // Обновляем пластик в БД
      repo.filaments.update(filament.id, { length: filament.length });
    }
  });

  repo.printers.update(pr.id, { status: 'printing', currentModelId: modelId });
}
</script>

<template>
  <h1>🏭 3D Ферма: Управление</h1>
  <div v-if="errors.length" class="alerts">
    <div v-for="(e, i) in errors" :key="i" class="alert error">{{ e }}</div>
  </div>

  <div class="grid">
    <div class="panel" v-for="pr in printers" :key="pr.id" container-type="inline-size">
      <h3>🖨 {{ pr.brand }} {{ pr.name }}</h3>
      <p>Статус: <span :class="pr.status">{{ pr.status }}</span> | Прогресс: {{ pr.progress }}%</p>

      <div v-if="pr.status === 'idle'" class="controls">
        <select v-model="pr.filamentId" @change="repo.printers.update(pr.id, { filamentId: pr.filamentId })">
          <option :value="undefined">Без пластика</option>
          <option v-for="f in filaments.filter(x => !x.printerId || x.printerId === pr.id)" :key="f.id" :value="f.id">
            {{ f.color }} ({{ f.length }}м)
          </option>
        </select>
        <select @change="e => { if(e.target.value) { pr.addToQueue(e.target.value); repo.printers.update(pr.id, { queue: pr.queue }); }}">
          <option value="">+ В очередь</option>
          <option v-for="m in models.filter(x => !printers.some(p => p.queue.includes(x.id)))" :key="m.id" :value="m.id">{{ m.name }}</option>
        </select>
        <button @click="runPrint(pr)" :disabled="!pr.filamentId || pr.queue.length === 0">▶ Запуск</button>
      </div>

      <ul v-if="pr.queue.length" class="queue">
        <li v-for="(mid, idx) in pr.queue" :key="mid">
          {{ idx === 0 ? '🔥 ' : '' }}{{ models.find(m => m.id === mid)?.name }}
          <button v-if="idx > 0" @click="pr.removeFromQueue(mid); repo.printers.update(pr.id, { queue: pr.queue })">×</button>
        </li>
        <li v-if="pr.currentModelId">⏳ Печать: {{ models.find(m => m.id === pr.currentModelId)?.name }}</li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1rem; }
.panel { container-type: inline-size; padding: 1rem; border: 1px solid #e2e8f0; border-radius: 8px; }
@container (min-width: 250px) { .controls { display: flex; flex-direction: column; gap: 0.5rem; } }
.queue { list-style: none; padding: 0; margin: 0.5rem 0; }
.queue li { display: flex; justify-content: space-between; padding: 0.3rem 0; border-bottom: 1px dashed #cbd5e1; }
.status.printing { color: #2563eb; font-weight: bold; }
.status.error { color: #dc2626; font-weight: bold; }
.alerts { margin-bottom: 1rem; }
.alert.error { background: #fee2e2; color: #991b1b; padding: 0.5rem; border-radius: 4px; margin-bottom: 0.5rem; }
</style>

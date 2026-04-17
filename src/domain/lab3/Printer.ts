import type { IPrinterDTO, FilamentColor } from './types';
import { Filament } from './Filament';
import { PrintModel } from './Model';
import { PrintError, FilamentBreakError, OverheatError, DetachmentError } from './errors';

export class Printer implements IPrinterDTO {
  constructor(
    public id: string, public brand: string, public name: string, public speed: number,
    public filamentId?: string, public queue: string[] = [],
    public status: 'idle' | 'printing' | 'error' | 'completed' = 'idle',
    public progress: number = 0, public error?: string, public currentModelId?: string
  ) {}

  private intervalId: number | null = null;

  startPrint(
    filament: Filament,
    model: PrintModel,
    onComplete: (err: PrintError | null, figure?: { modelName: string; color: FilamentColor; startTime: string; endTime: string }) => void
  ) {
    if (filament.length < model.perimeter) {
      onComplete(new Error('Недостаточно пластика'), undefined);
      return;
    }

    this.status = 'printing';
    this.progress = 0;
    this.currentModelId = model.id;
    this.error = undefined;

    this.intervalId = window.setInterval(() => {
      this.progress += this.speed;

      // Бросок кубика (5% шанс поломки на тик)
      if (Math.random() < 0.05) {
        const roll = Math.random();
        let err: PrintError;
        if (roll < 0.33) err = new FilamentBreakError(model.name, filament.length);
        else if (roll < 0.66) err = new OverheatError(model.name, filament.length);
        else err = new DetachmentError(model.name, filament.length);

        this.status = 'error';
        this.error = err.message;
        this.stopPrint();
        onComplete(err, undefined);
        return;
      }

      if (this.progress >= 100) {
        this.progress = 100;
        filament.decreaseLength(model.perimeter);
        const figure = {
          modelName: model.name,
          color: filament.color,
          startTime: new Date().toISOString(),
          endTime: new Date().toISOString()
        };
        this.status = 'completed';
        this.stopPrint();
        onComplete(null, figure);
      }
    }, 1000); // 1 тик = 1 секунда
  }

  stopPrint() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  addToQueue(modelId: string) { if (!this.queue.includes(modelId)) this.queue.push(modelId); }
  removeFromQueue(modelId: string) { this.queue = this.queue.filter(id => id !== modelId); }
}

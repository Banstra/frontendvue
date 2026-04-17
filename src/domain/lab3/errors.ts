export class PrintError extends Error {
  constructor(msg: string, public figureInfo: string, public remainingLength: number) {
    super(msg); this.name = 'PrintError';
  }
}
export class FilamentBreakError extends PrintError { constructor(f: string, r: number) { super('Обрыв нити', f, r); this.name = 'FilamentBreakError'; } }
export class OverheatError extends PrintError { constructor(f: string, r: number) { super('Перегрев принтера', f, r); this.name = 'OverheatError'; } }
export class DetachmentError extends PrintError { constructor(f: string, r: number) { super('Отклеилась модель', f, r); this.name = 'DetachmentError'; } }

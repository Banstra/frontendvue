import type { FilamentColor, IFilamentDTO } from './types';

export class Filament implements IFilamentDTO {
  constructor(
    public id: string, public material: string, public color: FilamentColor,
    public length: number, public printerId?: string
  ) {}

  decreaseLength(amount: number): boolean {
    if (amount <= 0 || this.length < amount) return false;
    this.length -= amount;
    return true;
  }
}

import type { IModelDTO } from './types';

export class PrintModel implements IModelDTO {
  constructor(
    public id: string, public name: string, public perimeter: number,
    public time: number, public createdAt: string = new Date().toISOString()
  ) {}
}

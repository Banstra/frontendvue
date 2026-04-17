// src/domain/lab3/types.ts
export type FilamentColor = 'PLA-Red' | 'ABS-Blue' | 'PETG-Green' | 'TPU-Black' | 'Nylon-White'
export type PrintStatus = 'idle' | 'printing' | 'error' | 'completed'

export interface IFilamentDTO {
  id: string
  material: string
  color: FilamentColor
  length: number
  printerId?: string
}

export interface IModelDTO {
  id: string
  name: string
  perimeter: number
  time: number
  createdAt: string
}

export interface IFigureDTO {
  id: string
  modelName: string
  color: FilamentColor
  startTime: string
  endTime: string
}

export interface IPrinterDTO {
  id: string
  brand: string
  name: string
  speed: number
  filamentId?: string
  queue: string[]
  status: PrintStatus
  progress: number
  error?: string
  currentModelId?: string
}

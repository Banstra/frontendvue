// src/services/lab3/FarmRepository.ts
import { typedFetch } from './api'
import type { IFilamentDTO, IModelDTO, IPrinterDTO, IFigureDTO } from '@/domain/lab3/types'

const API = 'http://localhost:3000'

export const farmRepo = {
  filaments: {
    getAll: () => typedFetch<IFilamentDTO[]>(`${API}/filaments`),
    create: (data: Omit<IFilamentDTO, 'id'>) =>
      typedFetch<IFilamentDTO>(`${API}/filaments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }),
    update: (id: string, data: Partial<IFilamentDTO>) =>
      typedFetch<IFilamentDTO>(`${API}/filaments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }),
    delete: (id: string) =>
      typedFetch<void>(`${API}/filaments/${id}`, { method: 'DELETE' })
  },

  printers: {
    getAll: () => typedFetch<IPrinterDTO[]>(`${API}/printers`),
    create: (data: Omit<IPrinterDTO, 'id'>) =>
      typedFetch<IPrinterDTO>(`${API}/printers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }),
    update: (id: string, data: Partial<IPrinterDTO>) =>
      typedFetch<IPrinterDTO>(`${API}/printers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }),
    delete: (id: string) =>
      typedFetch<void>(`${API}/printers/${id}`, { method: 'DELETE' })
  },

  models: {
    getAll: () => typedFetch<IModelDTO[]>(`${API}/models`),
    create: (data: Omit<IModelDTO, 'id'>) =>
      typedFetch<IModelDTO>(`${API}/models`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }),
    delete: (id: string) =>
      typedFetch<void>(`${API}/models/${id}`, { method: 'DELETE' })
  },

  figures: {
    getAll: () => typedFetch<IFigureDTO[]>(`${API}/figures`),
    create: (data: Omit<IFigureDTO, 'id'>) =>
      typedFetch<IFigureDTO>(`${API}/figures`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
  }
}

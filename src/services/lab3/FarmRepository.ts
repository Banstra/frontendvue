import { typedFetch } from './api';
import type { IFilamentDTO, IModelDTO, IPrinterDTO, IFigureDTO } from '@/domain/lab3/types';

const API = 'http://localhost:3000';

export const repo = {
  filaments: {
    getAll: () => typedFetch<IFilamentDTO[]>(`${API}/filaments`),
    create: (d: Omit<IFilamentDTO, 'id'>) => typedFetch<IFilamentDTO>(`${API}/filaments`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }),
    update: (id: string, d: Partial<IFilamentDTO>) => typedFetch<IFilamentDTO>(`${API}/filaments/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }),
    delete: (id: string) => typedFetch<void>(`${API}/filaments/${id}`, { method: 'DELETE' })
  },
  printers: {
    getAll: () => typedFetch<IPrinterDTO[]>(`${API}/printers`),
    create: (d: Omit<IPrinterDTO, 'id'>) => typedFetch<IPrinterDTO>(`${API}/printers`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }),
    update: (id: string, d: Partial<IPrinterDTO>) => typedFetch<IPrinterDTO>(`${API}/printers/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }),
    delete: (id: string) => typedFetch<void>(`${API}/printers/${id}`, { method: 'DELETE' })
  },
  models: {
    getAll: () => typedFetch<IModelDTO[]>(`${API}/models`),
    create: (d: Omit<IModelDTO, 'id'>) => typedFetch<IModelDTO>(`${API}/models`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }),
    delete: (id: string) => typedFetch<void>(`${API}/models/${id}`, { method: 'DELETE' })
  },
  figures: {
    getAll: () => typedFetch<IFigureDTO[]>(`${API}/figures`),
    create: (d: Omit<IFigureDTO, 'id'>) => typedFetch<IFigureDTO>(`${API}/figures`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) })
  }
};

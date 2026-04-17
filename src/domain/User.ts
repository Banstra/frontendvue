// src/domain/User.ts
import type { Degree, EntityId, IUserDTO } from './types'

export abstract class User {
  constructor(
    public readonly id: EntityId, // ✅
    public name: string,
    public email: string,
  ) {}
  abstract get role(): 'student' | 'teacher'
}

export class Student extends User {
  readonly role = 'student' as const
  constructor(
    id: EntityId, // ✅
    name: string,
    email: string,
    public enrollmentYear: number,
  ) {
    super(id, name, email)
  }
}

export class Teacher extends User {
  readonly role = 'teacher' as const
  constructor(
    id: EntityId, // ✅
    name: string,
    email: string,
    public degree: Degree = 'none',
  ) {
    super(id, name, email)
  }
}

// ✅ Фабрика принимает EntityId
export function createUserFromDTO(dto: IUserDTO): Student | Teacher {
  if (dto.type === 'student') {
    return new Student(dto.id, dto.name, dto.email, dto.enrollmentYear ?? new Date().getFullYear())
  }
  return new Teacher(dto.id, dto.name, dto.email, dto.degree ?? 'none')
}

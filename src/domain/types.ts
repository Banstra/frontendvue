// src/domain/types.ts

export type Degree = 'none' | 'candidate' | 'doctor'
export type CourseStatus = 'draft' | 'active' | 'archived'

// ✅ ID может быть string (json-server) или number (локально)
export type EntityId = string | number

export interface IUserDTO {
  id: EntityId
  name: string
  email: string
  type: 'student' | 'teacher'
  enrollmentYear?: number
  degree?: Degree
}

export interface ICourseDTO {
  id: EntityId
  title: string
  studentLimit?: number
  status: CourseStatus
  studentIds: EntityId[]
  teacherIds: EntityId[]
}

// src/domain/Course.ts
import type { CourseStatus, EntityId, ICourseDTO } from './types'
import { User, Student, Teacher } from './User'

export class Course {
  constructor(
    public readonly id: EntityId, // ✅
    public title: string,
    public studentLimit?: number,
    public status: CourseStatus = 'draft',
    public students: Student[] = [],
    public teachers: Teacher[] = [],
    public studentIds: EntityId[] = [], // ✅
    public teacherIds: EntityId[] = [], // ✅
  ) {}

  publish(): boolean {
    if (this.status !== 'draft') return false
    this.status = 'active'
    return true
  }

  archive(): boolean {
    if (this.status !== 'active') return false
    this.status = 'archived'
    return true
  }

  addUser(user: User): boolean {
    if (user instanceof Student && !this.students.find((s) => s.id === user.id)) {
      if (this.studentLimit && this.students.length >= this.studentLimit) return false
      this.students.push(user)
      if (!this.studentIds.includes(user.id)) this.studentIds.push(user.id)
      return true
    }
    if (user instanceof Teacher && !this.teachers.find((t) => t.id === user.id)) {
      this.teachers.push(user)
      if (!this.teacherIds.includes(user.id)) this.teacherIds.push(user.id)
      return true
    }
    return false
  }

  removeUser(userId: EntityId): boolean {
    // ✅
    const studentIdx = this.students.findIndex((s) => s.id === userId)
    if (studentIdx !== -1) {
      this.students.splice(studentIdx, 1)
      this.studentIds = this.studentIds.filter((id) => id !== userId)
      return true
    }

    const teacherIdx = this.teachers.findIndex((t) => t.id === userId)
    if (teacherIdx !== -1) {
      this.teachers.splice(teacherIdx, 1)
      this.teacherIds = this.teacherIds.filter((id) => id !== userId)
      return true
    }

    return false
  }
}

export function createCourseFromDTO(dto: ICourseDTO): Course {
  return new Course(
    dto.id, // ✅ EntityId
    dto.title,
    dto.studentLimit,
    dto.status,
    [], // students заполняются отдельно при необходимости
    [],
    dto.studentIds || [],
    dto.teacherIds || [],
  )
}

// src/services/LmsRepository.ts
import { typedFetch } from './api'
import { User, createUserFromDTO } from '@/domain/User'
import { Course, createCourseFromDTO } from '@/domain/Course'
import type { IUserDTO, ICourseDTO, EntityId } from '@/domain/types'

const API_BASE = 'http://localhost:3000'

export class LmsRepository {
  async getUsers(): Promise<User[]> {
    const dtos = await typedFetch<IUserDTO[]>(`${API_BASE}/users?_sort=name`)
    return dtos.map(createUserFromDTO)
  }

  async createUser(data: Omit<IUserDTO, 'id'>): Promise<User> {
    return typedFetch<User>(`${API_BASE}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
  }

  async deleteUser(id: EntityId): Promise<void> {
    // ✅
    await typedFetch<void>(`${API_BASE}/users/${id}`, { method: 'DELETE' })
  }

  async getCourses(): Promise<Course[]> {
    const dtos = await typedFetch<ICourseDTO[]>(`${API_BASE}/courses`)
    return dtos.map(createCourseFromDTO)
  }

  async createCourse(data: Omit<ICourseDTO, 'id'>): Promise<Course> {
    // ✅
    return typedFetch<Course>(`${API_BASE}/courses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
  }

  async deleteCourse(id: EntityId): Promise<void> {
    // ✅
    await typedFetch<void>(`${API_BASE}/courses/${id}`, { method: 'DELETE' })
  }

  async updateCourse(course: Course): Promise<Course> {
    const dto: ICourseDTO = {
      id: course.id,
      title: course.title,
      studentLimit: course.studentLimit,
      status: course.status,
      studentIds: course.studentIds,
      teacherIds: course.teacherIds,
    }
    return typedFetch<Course>(`${API_BASE}/courses/${course.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    })
  }
}

export const repo = new LmsRepository()

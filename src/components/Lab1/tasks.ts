// src/components/Lab1/tasks.ts

// === 1. Время прибытия ===
export function calculateArrivalTime(scheduleHour: number, delayHours: number): number {
  return (((scheduleHour + delayHours) % 24) + 24) % 24
}

// === 2. Подпись (инициалы) — ИСПРАВЛЕНО: проверка на undefined ===
export function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return ''
  if (parts.length === 1) return parts[0]! // non-null assertion: после filter(Boolean) точно есть

  const [lastName, firstName, patronymic] = parts
  const initials = [firstName?.[0], patronymic?.[0]].filter(Boolean).join('.')
  return initials ? `${lastName} ${initials}.` : lastName!
}

// === 3. Длина последнего слова ===
export function getLastWordLength(str: string): number {
  const trimmed = str.trim()
  if (!trimmed) return 0
  const words = trimmed.split(/\s+/)
  return words[words.length - 1]?.length ?? 0
}

// === 4. Валидные скобки ===
export function isValidBrackets(s: string): boolean {
  const stack: string[] = []
  const pairs: Record<string, string> = { ')': '(', '}': '{', ']': '[' }

  for (const char of s) {
    if (['(', '{', '['].includes(char)) {
      stack.push(char)
    } else if (char in pairs) {
      if (stack.pop() !== pairs[char]) return false
    }
  }
  return stack.length === 0
}

// === 5. Тип треугольника ===
export type TriangleType = 'разносторонний' | 'равнобедренный' | 'равносторонний' | 'невозможный'

export function getTriangleType(a: number, b: number, c: number): TriangleType {
  if (a <= 0 || b <= 0 || c <= 0) return 'невозможный'
  if (a + b <= c || a + c <= b || b + c <= a) return 'невозможный'
  if (a === b && b === c) return 'равносторонний'
  if (a === b || b === c || a === c) return 'равнобедренный'
  return 'разносторонний'
}

// === 6. Сложение векторов (2D) — ИСПРАВЛЕНО: типизация ===
export type Vector2D = readonly [number, number]

export function addVectors(...vectors: Vector2D[]): Vector2D {
  return vectors.reduce((acc: Vector2D, [x, y]) => [acc[0] + x, acc[1] + y] as const, [
    0, 0,
  ] as const)
}

// === 7. Евклидово расстояние — ИСПРАВЛЕНО: проверка индексов ===
export function euclideanDistance(a: readonly number[], b: readonly number[]): number {
  if (a.length !== b.length) throw new Error('Dimension mismatch')
  let sum = 0
  for (let i = 0; i < a.length; i++) {
    const diff = a[i]! - b[i]! // non-null assertion: длины равны, индексы валидны
    sum += diff * diff
  }
  return Math.sqrt(sum)
}

// === 8. Умножение матриц ===
export function multiplyMatrices(
  matrixA: readonly (readonly number[])[],
  matrixB: readonly (readonly number[])[],
): number[][] | null {
  const rowsA = matrixA.length
  const colsA = matrixA[0]?.length ?? 0
  const rowsB = matrixB.length
  const colsB = matrixB[0]?.length ?? 0

  if (colsA !== rowsB || rowsA === 0 || rowsB === 0) return null

  const result: number[][] = []
  for (let i = 0; i < rowsA; i++) {
    result[i] = []
    const rowA = matrixA[i]
    if (!rowA) continue
    for (let j = 0; j < colsB; j++) {
      let sum = 0
      for (let k = 0; k < colsA; k++) {
        const valA = rowA[k]
        const rowB = matrixB[k]
        const valB = rowB?.[j]
        if (valA === undefined || valB === undefined) return null
        sum += valA * valB
      }
      result[i]![j] = sum
    }
  }
  return result
}

// === 9. CIE XYZ → sRGB ===
export type XYZ = readonly [number, number, number]
export type RGB = readonly [number, number, number]

function linearToSRGB(channel: number): number {
  if (channel <= 0.0031308) return channel * 12.92
  return 1.055 * channel ** (1 / 2.4) - 0.055
}

export function xyzToSRGB([x, y, z]: XYZ): RGB {
  const rL = x * 3.2406 + y * -1.5372 + z * -0.4986
  const gL = x * -0.9689 + y * 1.8758 + z * 0.0415
  const bL = x * 0.0557 + y * -0.204 + z * 1.057

  return [
    Math.max(0, Math.min(1, linearToSRGB(rL))),
    Math.max(0, Math.min(1, linearToSRGB(gL))),
    Math.max(0, Math.min(1, linearToSRGB(bL))),
  ] as const
}

// === 10. Золотое сечение для CSS ===
export type GoldenUnit = 'em' | 'rem'
export type GoldenSize = `${number}${GoldenUnit}`
const FIBONACCI = [1, 2, 3, 5, 8, 13, 21] as const

export function getGoldenSize(value: number, unit: GoldenUnit = 'em'): GoldenSize {
  const closest = FIBONACCI.reduce((prev, curr) =>
    Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev,
  )
  return `${closest}${unit}` as GoldenSize
}

// === 11. Конвертация температуры (перегрузки) ===
export function convertTemp(value: number, direction: 'toC'): `${number} C`
export function convertTemp(value: number, direction: 'toF'): `${number} F`
export function convertTemp(
  value: number,
  direction: 'toC' | 'toF',
): `${number} C` | `${number} F` {
  if (direction === 'toC') {
    return `${Math.round(((value - 32) * 5) / 9)} C`
  }
  return `${Math.round((value * 9) / 5 + 32)} F`
}

// ✅ Исправленный хелпер: явно сужаем тип через if/else
export function convertTempSafe(value: number, direction: 'toC' | 'toF'): string {
  if (direction === 'toC') {
    return convertTemp(value, 'toC') // TS понимает, что здесь direction точно 'toC'
  }
  return convertTemp(value, 'toF') // TS понимает, что здесь direction точно 'toF'
}

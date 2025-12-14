import { neon } from "@neondatabase/serverless"

export const sql = neon(process.env.DATABASE_URL!)

export type Teacher = {
  id: number
  email: string
  password_hash: string
  name: string
  created_at: Date
}

export type Class = {
  id: number
  name: string
  teacher_id: number
  created_at: Date
  student_count?: number
}

export type Student = {
  id: number
  name: string
  nis: string | null
  class_id: number
  created_at: Date
  class_name?: string
}

export type GradeType = {
  id: number
  name: string
  weight: number | null
  class_id: number
  created_at: Date
}

export type Grade = {
  id: number
  student_id: number
  grade_type_id: number
  score: number
  created_at: Date
}

export type StudentWithGrades = Student & {
  grades: { [gradeTypeId: number]: number }
  average?: number
  weightedAverage?: number
}

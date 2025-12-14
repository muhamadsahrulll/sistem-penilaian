"use server"

import { sql } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function getStudentsByClass(classId: number) {
  const teacher = await getSession()
  if (!teacher) return []

  const result = await sql`
    SELECT s.* FROM students s
    JOIN classes c ON c.id = s.class_id
    WHERE s.class_id = ${classId} AND c.teacher_id = ${teacher.id}
    ORDER BY s.name
  `
  return result
}

export async function createStudent(formData: FormData) {
  const teacher = await getSession()
  if (!teacher) return { error: "Unauthorized" }

  const name = formData.get("name") as string
  const nis = formData.get("nis") as string
  const classId = Number.parseInt(formData.get("classId") as string)

  if (!name || !classId) return { error: "Nama dan kelas wajib diisi" }

  await sql`INSERT INTO students (name, nis, class_id) VALUES (${name}, ${nis || null}, ${classId})`
  revalidatePath(`/dashboard/classes/${classId}`)
  return { success: true }
}

export async function createStudentsBulk(classId: number, students: { name: string; nis?: string }[]) {
  const teacher = await getSession()
  if (!teacher) return { error: "Unauthorized" }

  for (const student of students) {
    if (student.name.trim()) {
      await sql`INSERT INTO students (name, nis, class_id) VALUES (${student.name.trim()}, ${student.nis?.trim() || null}, ${classId})`
    }
  }

  revalidatePath(`/dashboard/classes/${classId}`)
  return { success: true, count: students.filter((s) => s.name.trim()).length }
}

export async function deleteStudent(studentId: number, classId: number) {
  const teacher = await getSession()
  if (!teacher) return { error: "Unauthorized" }

  await sql`
    DELETE FROM students WHERE id = ${studentId} 
    AND class_id IN (SELECT id FROM classes WHERE teacher_id = ${teacher.id})
  `
  revalidatePath(`/dashboard/classes/${classId}`)
  return { success: true }
}

export async function getTotalStudents() {
  const teacher = await getSession()
  if (!teacher) return 0

  const result = await sql`
    SELECT COUNT(s.id) as total FROM students s
    JOIN classes c ON c.id = s.class_id
    WHERE c.teacher_id = ${teacher.id}
  `
  return Number.parseInt(result[0]?.total || "0")
}

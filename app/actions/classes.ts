"use server"

import { sql } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function getClasses() {
  const teacher = await getSession()
  if (!teacher) return []

  const result = await sql`
    SELECT c.*, COUNT(s.id) as student_count 
    FROM classes c 
    LEFT JOIN students s ON s.class_id = c.id 
    WHERE c.teacher_id = ${teacher.id}
    GROUP BY c.id 
    ORDER BY c.name
  `
  return result
}

export async function createClass(formData: FormData) {
  const teacher = await getSession()
  if (!teacher) return { error: "Unauthorized" }

  const name = formData.get("name") as string
  if (!name) return { error: "Nama kelas wajib diisi" }

  await sql`INSERT INTO classes (name, teacher_id) VALUES (${name}, ${teacher.id})`
  revalidatePath("/dashboard")
  return { success: true }
}

export async function deleteClass(classId: number) {
  const teacher = await getSession()
  if (!teacher) return { error: "Unauthorized" }

  await sql`DELETE FROM classes WHERE id = ${classId} AND teacher_id = ${teacher.id}`
  revalidatePath("/dashboard")
  return { success: true }
}

export async function getClassById(classId: number) {
  const teacher = await getSession()
  if (!teacher) return null

  const result = await sql`
    SELECT * FROM classes WHERE id = ${classId} AND teacher_id = ${teacher.id}
  `
  return result[0] || null
}

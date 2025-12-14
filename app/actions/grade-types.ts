"use server"

import { sql } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function getGradeTypesByClass(classId: number) {
  const teacher = await getSession()
  if (!teacher) return []

  const result = await sql`
    SELECT gt.* FROM grade_types gt
    JOIN classes c ON c.id = gt.class_id
    WHERE gt.class_id = ${classId} AND c.teacher_id = ${teacher.id}
    ORDER BY gt.name
  `
  return result
}

export async function createGradeType(formData: FormData) {
  const teacher = await getSession()
  if (!teacher) return { error: "Unauthorized" }

  const name = formData.get("name") as string
  const weight = formData.get("weight") as string
  const classId = Number.parseInt(formData.get("classId") as string)

  if (!name || !classId) return { error: "Nama jenis nilai wajib diisi" }

  const weightValue = weight ? Number.parseFloat(weight) : null

  await sql`INSERT INTO grade_types (name, weight, class_id) VALUES (${name}, ${weightValue}, ${classId})`
  revalidatePath(`/dashboard/classes/${classId}`)
  return { success: true }
}

export async function updateGradeType(gradeTypeId: number, name: string, weight: number | null, classId: number) {
  const teacher = await getSession()
  if (!teacher) return { error: "Unauthorized" }

  await sql`UPDATE grade_types SET name = ${name}, weight = ${weight} WHERE id = ${gradeTypeId}`
  revalidatePath(`/dashboard/classes/${classId}`)
  return { success: true }
}

export async function deleteGradeType(gradeTypeId: number, classId: number) {
  const teacher = await getSession()
  if (!teacher) return { error: "Unauthorized" }

  await sql`DELETE FROM grade_types WHERE id = ${gradeTypeId}`
  revalidatePath(`/dashboard/classes/${classId}`)
  return { success: true }
}

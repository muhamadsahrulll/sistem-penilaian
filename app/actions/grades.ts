"use server"

import { sql } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function getGradesByClass(classId: number) {
  const teacher = await getSession()
  if (!teacher) return []

  const result = await sql`
    SELECT g.* FROM grades g
    JOIN students s ON s.id = g.student_id
    JOIN classes c ON c.id = s.class_id
    WHERE s.class_id = ${classId} AND c.teacher_id = ${teacher.id}
  `
  return result
}

export async function saveGrade(studentId: number, gradeTypeId: number, score: number, classId: number) {
  const teacher = await getSession()
  if (!teacher) return { error: "Unauthorized" }

  await sql`
    INSERT INTO grades (student_id, grade_type_id, score)
    VALUES (${studentId}, ${gradeTypeId}, ${score})
    ON CONFLICT (student_id, grade_type_id)
    DO UPDATE SET score = ${score}
  `

  revalidatePath(`/dashboard/classes/${classId}`)
  return { success: true }
}

export async function saveGradesBulk(
  grades: { studentId: number; gradeTypeId: number; score: number }[],
  classId: number,
) {
  const teacher = await getSession()
  if (!teacher) return { error: "Unauthorized" }

  for (const grade of grades) {
    await sql`
      INSERT INTO grades (student_id, grade_type_id, score)
      VALUES (${grade.studentId}, ${grade.gradeTypeId}, ${grade.score})
      ON CONFLICT (student_id, grade_type_id)
      DO UPDATE SET score = ${grade.score}
    `
  }

  revalidatePath(`/dashboard/classes/${classId}`)
  return { success: true }
}

"use server"

import { sql } from "@/lib/db"
import { hashPassword, createSession, destroySession } from "@/lib/auth"
import { redirect } from "next/navigation"

export async function login(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { error: "Email dan password wajib diisi" }
  }

  const result = await sql`SELECT * FROM teachers WHERE email = ${email}`
  const teacher = result[0]

  if (!teacher) {
    return { error: "Email atau password salah" }
  }

  // Check if using SHA-256 hash or simple comparison
  const passwordHash = await hashPassword(password)
  const isValid = teacher.password_hash === passwordHash || teacher.password_hash === password

  if (!isValid) {
    return { error: "Email atau password salah" }
  }

  await createSession(teacher.id)
  redirect("/dashboard")
}

export async function logout() {
  await destroySession()
  redirect("/login")
}

export async function updatePassword(teacherId: number, newPassword: string) {
  const passwordHash = await hashPassword(newPassword)
  await sql`UPDATE teachers SET password_hash = ${passwordHash} WHERE id = ${teacherId}`
}

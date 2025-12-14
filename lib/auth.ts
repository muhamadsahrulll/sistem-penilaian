import { cookies } from "next/headers"
import { sql, type Teacher } from "./db"

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hash = await crypto.subtle.digest("SHA-256", data)
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password)
  return passwordHash === hash
}

export async function createSession(teacherId: number): Promise<string> {
  const sessionId = crypto.randomUUID()
  const cookieStore = await cookies()
  cookieStore.set("session", `${sessionId}:${teacherId}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 1 week
  })
  return sessionId
}

export async function getSession(): Promise<Teacher | null> {
  const cookieStore = await cookies()
  const session = cookieStore.get("session")

  if (!session?.value) return null

  const [, teacherId] = session.value.split(":")
  if (!teacherId) return null

  const result = await sql`SELECT * FROM teachers WHERE id = ${Number.parseInt(teacherId)}`
  return result[0] as Teacher | null
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete("session")
}

import type React from "react"
import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { DashboardNav } from "@/components/dashboard-nav"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()
  if (!session) redirect("/login")

  return (
    <div className="min-h-screen bg-secondary">
      <DashboardNav teacherName={session.name} />
      <main className="container mx-auto px-4 py-6">{children}</main>
    </div>
  )
}

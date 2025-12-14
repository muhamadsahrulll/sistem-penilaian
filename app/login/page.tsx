import { LoginForm } from "@/components/login-form"
import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function LoginPage() {
  const session = await getSession()
  if (session) redirect("/dashboard")

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">Sistem Penilaian</h1>
          <p className="text-muted-foreground mt-2">Masuk untuk mengelola nilai siswa</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}

import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Sistem Penilaian Sekolah",
  description: "Aplikasi manajemen nilai siswa untuk guru",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id">
      <body className={`font-sans antialiased`}>
        {children}
        <footer className="mt-8 border-t border-border/50 py-4 text-center text-sm text-gray-500">
          <div className="max-w-7xl mx-auto px-4">
            Dibuat oleh sahrulllxd · dukungan: <a href="https://saweria.co/sahrulllxd" target="_blank" rel="noopener noreferrer" className="text-primary underline">Saweria</a>
          </div>
        </footer>
        <Analytics />
      </body>
    </html>
  )
}

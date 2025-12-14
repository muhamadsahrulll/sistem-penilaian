"use client"

import { useState } from "react"
import type { Class, Student, GradeType, Grade } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileDown, FileText } from "lucide-react"

interface RaportViewProps {
  classData: Class
  students: Student[]
  gradeTypes: GradeType[]
  grades: Grade[]
  teacherName: string
}

export function RaportView({ classData, students, gradeTypes, grades, teacherName }: RaportViewProps) {
  const [loading, setLoading] = useState(false)

  // Build map of scores per student per grade type
  const scoresMap: Record<number, Record<number, number>> = {}
  grades.forEach((g: any) => {
    scoresMap[g.student_id] = scoresMap[g.student_id] || {}
    scoresMap[g.student_id][g.grade_type_id] = Number(g.score)
  })

  function studentAverage(studentId: number) {
    const records = scoresMap[studentId] || {}
    const values = Object.values(records).filter((v) => typeof v === "number")
    if (values.length === 0) return 0
    return values.reduce((s, v) => s + v, 0) / values.length
  }

  async function exportExcel() {
    setLoading(true)
    const XLSX = await import("xlsx")

    const header = ["No", "NIS/NISN", "Nama", "Kelas", ...gradeTypes.map((g) => g.name), "NA"]
    const data = students.map((s, idx) => {
      const row: any[] = []
      row.push(idx + 1)
      row.push(s.nis || "")
      row.push(s.name)
      row.push(classData.name)
      gradeTypes.forEach((gt) => {
        const val = scoresMap[s.id] && scoresMap[s.id][gt.id]
        row.push(typeof val === "number" ? Number(val.toFixed(1)) : "")
      })
      row.push(Number(studentAverage(s.id).toFixed(1)))
      return row
    })

    const ws = XLSX.utils.aoa_to_sheet([header, ...data])
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Raport")
    XLSX.writeFile(wb, `Raport_${classData.name.replace(/\s+/g, "_")}.xlsx`)

    setLoading(false)
  }

  async function exportStudentPdf(student: Student) {
    setLoading(true)
    const { jsPDF } = await import("jspdf")
    const doc = new jsPDF()

    // Header
    doc.setFontSize(14)
    doc.text("GLOBAL MULTIMEDIA", 14, 20)
    doc.setFontSize(10)
    doc.text(`Nama Peserta Didik: ${student.name}`, 14, 30)
    doc.text(`NISN: ${student.nis || "-"}`, 14, 36)
    doc.text(`Kelas: ${classData.name}`, 140, 30)
    doc.text(`Semester: -`, 140, 36)

    // Table header
    let y = 50
    const startX = 14
    const col1 = 10
    const col2 = 95
    const col3 = 40

    doc.setFontSize(9)
    doc.setFont("helvetica", "bold")
    doc.rect(startX, y - 6, col1, 8)
    doc.text("N", startX + 3, y)

    doc.rect(startX + col1, y - 6, col2, 8)
    doc.text("Mata Pelajaran", startX + col1 + 3, y)

    doc.rect(startX + col1 + col2, y - 6, col3, 8)
    doc.text("Nilai Akhir", startX + col1 + col2 + 3, y)

    doc.rect(startX + col1 + col2 + col3, y - 6, col3, 8)
    doc.text("Capaian Kompetensi", startX + col1 + col2 + col3 + 3, y)

    doc.setFont("helvetica", "normal")
    y += 10

    gradeTypes.forEach((gt: any, idx: number) => {
      if (y > 260) {
        doc.addPage()
        y = 20
      }
      const score = (scoresMap[student.id] && scoresMap[student.id][gt.id]) ?? "-"
      doc.rect(startX, y - 6, col1, 8)
      doc.text(String(idx + 1), startX + 3, y)

      doc.rect(startX + col1, y - 6, col2, 8)
      doc.text(gt.name.substring(0, 40), startX + col1 + 3, y)

      doc.rect(startX + col1 + col2, y - 6, col3, 8)
      doc.text(typeof score === "number" ? String(Number(score).toFixed(1)) : "-", startX + col1 + col2 + 3, y)

      doc.rect(startX + col1 + col2 + col3, y - 6, col3, 8)
      doc.text("", startX + col1 + col2 + col3 + 3, y)

      y += 8
    })

    // Attendance & Extracurricular placeholders
    y += 10
    doc.text("Ekstrakurikuler:", startX, y)
    doc.text("Keterangan:", startX + 60, y)

    y += 12
    doc.text("Ketidakhadiran:", startX, y)
    doc.text("Sakit: 0  Izin: 0  Tanpa Keterangan: 0", startX + 40, y)

    // Footer signatures
    y = 270
    doc.text("Mengetahui,", 14, y)
    doc.text("Orang Tua", 14, y + 40)
    doc.text("Wali Kelas", 140, y + 40)

    doc.save(`Raport_${student.name.replace(/\s+/g, "_")}.pdf`)
    setLoading(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Raport Kelas {classData.name}</h2>
          <p className="text-muted-foreground text-sm">Semua mata pelajaran akan ditampilkan di sini</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportExcel} disabled={loading}>
            <FileDown className="h-4 w-4 mr-2" /> Export Excel
          </Button>
        </div>
      </div>

      <div className="overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No</TableHead>
              <TableHead>NIS/NISN</TableHead>
              <TableHead>Nama</TableHead>
              <TableHead>Kelas</TableHead>
              {gradeTypes.map((gt) => (
                <TableHead key={gt.id}>{gt.name}</TableHead>
              ))}
              <TableHead>NA</TableHead>
              <TableHead>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((s, idx) => (
              <TableRow key={s.id}>
                <TableCell>{idx + 1}</TableCell>
                <TableCell>{s.nis || ""}</TableCell>
                <TableCell>{s.name}</TableCell>
                <TableCell>{classData.name}</TableCell>
                {gradeTypes.map((gt) => (
                  <TableCell key={gt.id}>{(scoresMap[s.id] && scoresMap[s.id][gt.id]) ?? "-"}</TableCell>
                ))}
                <TableCell>{Number(studentAverage(s.id).toFixed(1))}</TableCell>
                <TableCell>
                  <Button size="sm" variant="outline" onClick={() => exportStudentPdf(s)} disabled={loading}>
                    <FileText className="h-4 w-4 mr-2" /> PDF
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

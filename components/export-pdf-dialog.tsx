"use client"

import { useState } from "react"
import type { Class, Student, GradeType, Grade } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Loader2, FileDown } from "lucide-react"

interface ExportPdfDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  classData: Class
  students: Student[]
  gradeTypes: GradeType[]
  grades: Grade[]
  teacherName: string
}

export function ExportPdfDialog({
  open,
  onOpenChange,
  classData,
  students,
  gradeTypes,
  grades,
  teacherName,
}: ExportPdfDialogProps) {
  const [loading, setLoading] = useState(false)
  const [customTeacherName, setCustomTeacherName] = useState(teacherName)

  const hasWeights = gradeTypes.some((gt: any) => gt.weight !== null && gt.weight > 0)
  const totalWeight = gradeTypes.reduce((sum, gt: any) => sum + (gt.weight || 0), 0)

  // Build grades map
  const gradesMap: { [key: string]: number } = {}
  grades.forEach((g: any) => {
    gradesMap[`${g.student_id}-${g.grade_type_id}`] = Number.parseFloat(g.score)
  })

  function calculateAverages(studentId: number) {
    const studentGrades = gradeTypes.map((gt: any) => ({
      score: gradesMap[`${studentId}-${gt.id}`] || 0,
      weight: gt.weight || 0,
    }))

    const validGrades = studentGrades.filter((g) => g.score > 0)
    const simpleAvg = validGrades.length > 0 ? validGrades.reduce((sum, g) => sum + g.score, 0) / validGrades.length : 0

    let weightedAvg = 0
    if (hasWeights && totalWeight > 0) {
      weightedAvg = studentGrades.reduce((sum, g) => sum + (g.score * g.weight) / 100, 0)
    }

    return { simple: simpleAvg, weighted: weightedAvg }
  }

  async function generatePdf() {
    setLoading(true)

    // Dynamic import jsPDF
    const { jsPDF } = await import("jspdf")
    const doc = new jsPDF()

    // Title
    doc.setFontSize(16)
    doc.text("DAFTAR NILAI SISWA", 105, 20, { align: "center" })

    // Info
    doc.setFontSize(11)
    doc.text(`Kelas: ${classData.name}`, 14, 35)
    doc.text(`Guru: ${customTeacherName}`, 14, 42)
    doc.text(`Tanggal: ${new Date().toLocaleDateString("id-ID")}`, 14, 49)

    // Table header
    let y = 60
    const startX = 14
    let x = startX
    const colWidths = {
      no: 10,
      name: 45,
      grade: 20,
      avg: 20,
    }

    doc.setFontSize(9)
    doc.setFont("helvetica", "bold")

    // Draw header row
    doc.rect(x, y - 5, colWidths.no, 10)
    doc.text("No", x + 2, y + 2)
    x += colWidths.no

    doc.rect(x, y - 5, colWidths.name, 10)
    doc.text("Nama", x + 2, y + 2)
    x += colWidths.name

    gradeTypes.forEach((gt: any) => {
      doc.rect(x, y - 5, colWidths.grade, 10)
      const label = gt.weight ? `${gt.name}\n(${gt.weight}%)` : gt.name
      doc.text(gt.name.substring(0, 8), x + 2, y + 2)
      x += colWidths.grade
    })

    doc.rect(x, y - 5, colWidths.avg, 10)
    doc.text("Rata-rata", x + 1, y + 2)
    x += colWidths.avg

    if (hasWeights) {
      doc.rect(x, y - 5, colWidths.avg, 10)
      doc.text("N. Akhir", x + 1, y + 2)
    }

    // Draw data rows
    doc.setFont("helvetica", "normal")
    y += 10

    students.forEach((student: any, index) => {
      if (y > 270) {
        doc.addPage()
        y = 20
      }

      x = startX
      const averages = calculateAverages(student.id)

      doc.rect(x, y - 5, colWidths.no, 8)
      doc.text(String(index + 1), x + 2, y + 1)
      x += colWidths.no

      doc.rect(x, y - 5, colWidths.name, 8)
      doc.text(student.name.substring(0, 20), x + 2, y + 1)
      x += colWidths.name

      gradeTypes.forEach((gt: any) => {
        const score = gradesMap[`${student.id}-${gt.id}`]
        doc.rect(x, y - 5, colWidths.grade, 8)
        doc.text(score ? score.toFixed(1) : "-", x + 5, y + 1)
        x += colWidths.grade
      })

      doc.rect(x, y - 5, colWidths.avg, 8)
      doc.text(averages.simple.toFixed(1), x + 5, y + 1)
      x += colWidths.avg

      if (hasWeights) {
        doc.rect(x, y - 5, colWidths.avg, 8)
        doc.text(averages.weighted.toFixed(1), x + 5, y + 1)
      }

      y += 8
    })

    // Footer
    y += 20
    if (y > 250) {
      doc.addPage()
      y = 30
    }
    doc.text(`${customTeacherName}`, 150, y + 30)
    doc.text("____________________", 140, y + 35)
    doc.text("Guru Mata Pelajaran", 145, y + 42)

    // Save
    doc.save(`Nilai_${classData.name.replace(/\s+/g, "_")}.pdf`)
    setLoading(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export Nilai ke PDF</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Nama Guru</Label>
            <Input
              value={customTeacherName}
              onChange={(e) => setCustomTeacherName(e.target.value)}
              placeholder="Nama guru yang akan ditampilkan"
            />
          </div>
          <div className="p-4 bg-muted rounded-lg text-sm">
            <p className="font-medium mb-2">Akan diekspor:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Kelas: {classData.name}</li>
              <li>Jumlah Murid: {students.length}</li>
              <li>Jenis Nilai: {gradeTypes.length}</li>
              {hasWeights && <li>Termasuk nilai akhir berbobot</li>}
            </ul>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button onClick={generatePdf} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileDown className="h-4 w-4 mr-2" />}
              Export PDF
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

"use client"

import { useState, useMemo } from "react"
import type { Student, GradeType, Grade } from "@/lib/db"
import { saveGrade } from "@/app/actions/grades"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ClipboardList } from "lucide-react"

interface GradeInputProps {
  classId: number
  students: Student[]
  gradeTypes: GradeType[]
  grades: Grade[]
}

export function GradeInput({ classId, students, gradeTypes, grades }: GradeInputProps) {
  const [localGrades, setLocalGrades] = useState<{ [key: string]: number }>(() => {
    const initial: { [key: string]: number } = {}
    grades.forEach((g: any) => {
      initial[`${g.student_id}-${g.grade_type_id}`] = g.score
    })
    return initial
  })
  const [saving, setSaving] = useState<string | null>(null)

  const hasWeights = gradeTypes.some((gt: any) => gt.weight !== null && gt.weight > 0)
  const totalWeight = gradeTypes.reduce((sum, gt: any) => sum + (gt.weight || 0), 0)

  const studentAverages = useMemo(() => {
    const averages: { [studentId: number]: { simple: number; weighted: number } } = {}

    students.forEach((student: any) => {
      const studentGrades = gradeTypes.map((gt: any) => ({
        score: localGrades[`${student.id}-${gt.id}`] || 0,
        weight: gt.weight || 0,
      }))

      const validGrades = studentGrades.filter((g) => g.score > 0)

      // Simple average
      const simpleAvg =
        validGrades.length > 0 ? validGrades.reduce((sum, g) => sum + g.score, 0) / validGrades.length : 0

      // Weighted average
      let weightedAvg = 0
      if (hasWeights && totalWeight > 0) {
        weightedAvg = studentGrades.reduce((sum, g) => {
          return sum + (g.score * g.weight) / 100
        }, 0)
      }

      averages[student.id] = { simple: simpleAvg, weighted: weightedAvg }
    })

    return averages
  }, [students, gradeTypes, localGrades, hasWeights, totalWeight])

  async function handleGradeChange(studentId: number, gradeTypeId: number, value: string) {
    const score = Number.parseFloat(value) || 0
    const key = `${studentId}-${gradeTypeId}`

    setLocalGrades((prev) => ({ ...prev, [key]: score }))

    if (score >= 0 && score <= 100) {
      setSaving(key)
      await saveGrade(studentId, gradeTypeId, score, classId)
      setSaving(null)
    }
  }

  if (students.length === 0 || gradeTypes.length === 0) {
    return (
      <Card className="border-border/50">
        <CardContent className="py-12 text-center">
          <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Belum bisa input nilai</h3>
          <p className="text-muted-foreground">
            {students.length === 0
              ? "Tambahkan murid terlebih dahulu di tab Murid."
              : "Tambahkan jenis nilai terlebih dahulu di tab Jenis Nilai."}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-base">Input Nilai</CardTitle>
        {hasWeights && totalWeight !== 100 && (
          <p className="text-sm text-amber-600">Perhatian: Total bobot {totalWeight}% (seharusnya 100%)</p>
        )}
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12 sticky left-0 bg-background">No</TableHead>
                <TableHead className="min-w-[150px] sticky left-12 bg-background">Nama</TableHead>
                {gradeTypes.map((gt: any) => (
                  <TableHead key={gt.id} className="min-w-[100px] text-center">
                    <div>{gt.name}</div>
                    {gt.weight && <div className="text-xs text-muted-foreground font-normal">({gt.weight}%)</div>}
                  </TableHead>
                ))}
                <TableHead className="min-w-[80px] text-center">Rata-rata</TableHead>
                {hasWeights && <TableHead className="min-w-[100px] text-center">Nilai Akhir</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student: any, index) => (
                <TableRow key={student.id}>
                  <TableCell className="sticky left-0 bg-background">{index + 1}</TableCell>
                  <TableCell className="sticky left-12 bg-background font-medium">{student.name}</TableCell>
                  {gradeTypes.map((gt: any) => {
                    const key = `${student.id}-${gt.id}`
                    return (
                      <TableCell key={gt.id} className="p-1">
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          className={`w-20 text-center mx-auto ${saving === key ? "opacity-50" : ""}`}
                          value={localGrades[key] || ""}
                          onChange={(e) => handleGradeChange(student.id, gt.id, e.target.value)}
                          placeholder="-"
                        />
                      </TableCell>
                    )
                  })}
                  <TableCell className="text-center font-medium">
                    {studentAverages[student.id]?.simple.toFixed(1) || "-"}
                  </TableCell>
                  {hasWeights && (
                    <TableCell className="text-center font-bold text-primary">
                      {studentAverages[student.id]?.weighted.toFixed(1) || "-"}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

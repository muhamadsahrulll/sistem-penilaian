"use client"

import { useState } from "react"
import type { Class, Student, GradeType, Grade } from "@/lib/db"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ArrowLeft, FileDown } from "lucide-react"
import Link from "next/link"
import { StudentManagement } from "@/components/student-management"
import { GradeTypeManagement } from "@/components/grade-type-management"
import { GradeInput } from "@/components/grade-input"
import { ExportPdfDialog } from "@/components/export-pdf-dialog"

interface ClassDetailViewProps {
  classData: Class
  students: Student[]
  gradeTypes: GradeType[]
  grades: Grade[]
  teacherName: string
}

export function ClassDetailView({ classData, students, gradeTypes, grades, teacherName }: ClassDetailViewProps) {
  const [showExport, setShowExport] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/classes">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{classData.name}</h1>
            <p className="text-muted-foreground">{students.length} murid terdaftar</p>
          </div>
        </div>
        <Button onClick={() => setShowExport(true)} variant="outline">
          <FileDown className="h-4 w-4 mr-2" />
          Export PDF
        </Button>
      </div>

      <Tabs defaultValue="grades" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
          <TabsTrigger value="grades">Nilai</TabsTrigger>
          <TabsTrigger value="students">Murid</TabsTrigger>
          <TabsTrigger value="types">Jenis Nilai</TabsTrigger>
        </TabsList>

        <TabsContent value="grades">
          <GradeInput classId={classData.id} students={students} gradeTypes={gradeTypes} grades={grades} />
        </TabsContent>

        <TabsContent value="students">
          <StudentManagement classId={classData.id} students={students} />
        </TabsContent>

        <TabsContent value="types">
          <GradeTypeManagement classId={classData.id} gradeTypes={gradeTypes} />
        </TabsContent>
      </Tabs>

      <ExportPdfDialog
        open={showExport}
        onOpenChange={setShowExport}
        classData={classData}
        students={students}
        gradeTypes={gradeTypes}
        grades={grades}
        teacherName={teacherName}
      />
    </div>
  )
}

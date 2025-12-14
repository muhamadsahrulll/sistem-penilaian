import { getClassById } from "@/app/actions/classes"
import { getStudentsByClass } from "@/app/actions/students"
import { getGradeTypesByClass } from "@/app/actions/grade-types"
import { getGradesByClass } from "@/app/actions/grades"
import { notFound } from "next/navigation"
import { ClassDetailView } from "@/components/class-detail-view"
import { getSession } from "@/lib/auth"

interface ClassDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function ClassDetailPage({ params }: ClassDetailPageProps) {
  const { id } = await params
  const classId = Number.parseInt(id)

  const [classData, students, gradeTypes, grades, session] = await Promise.all([
    getClassById(classId),
    getStudentsByClass(classId),
    getGradeTypesByClass(classId),
    getGradesByClass(classId),
    getSession(),
  ])

  if (!classData) notFound()

  return (
    <ClassDetailView
      classData={classData}
      students={students}
      gradeTypes={gradeTypes}
      grades={grades}
      teacherName={session?.name || "Guru"}
    />
  )
}

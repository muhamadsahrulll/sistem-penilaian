import { getClasses } from "@/app/actions/classes"
import { ClassList } from "@/components/class-list"
import { AddClassDialog } from "@/components/add-class-dialog"

export default async function ClassesPage() {
  const classes = await getClasses()

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Daftar Kelas</h1>
          <p className="text-muted-foreground">Kelola kelas dan murid Anda</p>
        </div>
        <AddClassDialog />
      </div>

      <ClassList classes={classes} />
    </div>
  )
}

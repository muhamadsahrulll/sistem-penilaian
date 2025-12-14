"use client"

import { useState } from "react"
import type { Student } from "@/lib/db"
import { createStudent, createStudentsBulk, deleteStudent } from "@/app/actions/students"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Plus, Upload, Trash2, Users, Loader2, Download } from "lucide-react"

interface StudentManagementProps {
  classId: number
  students: Student[]
}

export function StudentManagement({ classId, students }: StudentManagementProps) {
  const [addOpen, setAddOpen] = useState(false)
  const [bulkOpen, setBulkOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [bulkText, setBulkText] = useState("")
  const [deleting, setDeleting] = useState<number | null>(null)

  async function handleAddStudent(formData: FormData) {
    setLoading(true)
    formData.append("classId", classId.toString())
    await createStudent(formData)
    setLoading(false)
    setAddOpen(false)
  }

  async function handleBulkAdd() {
    setLoading(true)
    const lines = bulkText.split("\n").filter((line) => line.trim())
    const studentsData = lines.map((line) => {
      const parts = line.split(",").map((p) => p.trim())
      return { name: parts[0], nis: parts[1] }
    })
    await createStudentsBulk(classId, studentsData)
    setLoading(false)
    setBulkOpen(false)
    setBulkText("")
  }

  async function handleDelete(studentId: number) {
    setDeleting(studentId)
    await deleteStudent(studentId, classId)
    setDeleting(null)
  }

  function downloadTemplate() {
    const template = "Nama Murid,NIS\nBudi Santoso,12345\nSiti Aminah,12346\nAhmad Rizki,12347"
    const blob = new Blob([template], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "template_murid.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Murid
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Murid Baru</DialogTitle>
            </DialogHeader>
            <form action={handleAddStudent} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Murid</Label>
                <Input id="name" name="name" placeholder="Nama lengkap" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nis">NIS (Opsional)</Label>
                <Input id="nis" name="nis" placeholder="Nomor Induk Siswa" />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Simpan
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={bulkOpen} onOpenChange={setBulkOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Import Bulk
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Import Murid Bulk</DialogTitle>
              <DialogDescription>Masukkan data murid dengan format: Nama,NIS (satu murid per baris)</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Button variant="outline" size="sm" onClick={downloadTemplate}>
                <Download className="h-4 w-4 mr-2" />
                Download Template
              </Button>
              <div className="space-y-2">
                <Label>Data Murid</Label>
                <Textarea
                  placeholder="Budi Santoso,12345&#10;Siti Aminah,12346&#10;Ahmad Rizki,12347"
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  rows={8}
                  className="font-mono text-sm"
                />
              </div>
              <p className="text-xs text-muted-foreground">Format: Nama Murid,NIS (NIS opsional)</p>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setBulkOpen(false)}>
                  Batal
                </Button>
                <Button onClick={handleBulkAdd} disabled={loading || !bulkText.trim()}>
                  {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Import
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {students.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Belum ada murid</h3>
            <p className="text-muted-foreground">Tambahkan murid satu per satu atau import bulk.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base">Daftar Murid ({students.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">No</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead>NIS</TableHead>
                    <TableHead className="w-20">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student: any, index) => (
                    <TableRow key={student.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell className="text-muted-foreground">{student.nis || "-"}</TableCell>
                      <TableCell>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              disabled={deleting === student.id}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Hapus Murid?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tindakan ini akan menghapus "{student.name}" beserta semua nilainya.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Batal</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(student.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Hapus
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

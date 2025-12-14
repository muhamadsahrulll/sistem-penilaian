"use client"

import { useState } from "react"
import type { GradeType } from "@/lib/db"
import { createGradeType, deleteGradeType, updateGradeType } from "@/app/actions/grade-types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
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
import { Plus, Trash2, ClipboardList, Loader2, Pencil } from "lucide-react"

interface GradeTypeManagementProps {
  classId: number
  gradeTypes: GradeType[]
}

export function GradeTypeManagement({ classId, gradeTypes }: GradeTypeManagementProps) {
  const [addOpen, setAddOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editingType, setEditingType] = useState<GradeType | null>(null)
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState<number | null>(null)

  const totalWeight = gradeTypes.reduce((sum, gt: any) => sum + (gt.weight || 0), 0)

  async function handleAdd(formData: FormData) {
    setLoading(true)
    formData.append("classId", classId.toString())
    await createGradeType(formData)
    setLoading(false)
    setAddOpen(false)
  }

  async function handleEdit(formData: FormData) {
    if (!editingType) return
    setLoading(true)
    const name = formData.get("name") as string
    const weight = formData.get("weight") as string
    await updateGradeType(editingType.id, name, weight ? Number.parseFloat(weight) : null, classId)
    setLoading(false)
    setEditOpen(false)
    setEditingType(null)
  }

  async function handleDelete(gradeTypeId: number) {
    setDeleting(gradeTypeId)
    await deleteGradeType(gradeTypeId, classId)
    setDeleting(null)
  }

  function openEdit(gradeType: GradeType) {
    setEditingType(gradeType)
    setEditOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Jenis Nilai
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Jenis Nilai</DialogTitle>
            </DialogHeader>
            <form action={handleAdd} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Jenis Nilai</Label>
                <Input id="name" name="name" placeholder="Contoh: Tugas, STS, SAS" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">Bobot % (Opsional)</Label>
                <Input id="weight" name="weight" type="number" min="0" max="100" step="0.01" placeholder="Contoh: 30" />
                <p className="text-xs text-muted-foreground">Kosongkan jika tidak ingin menggunakan bobot</p>
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

        {totalWeight > 0 && (
          <p className={`text-sm ${totalWeight === 100 ? "text-green-600" : "text-amber-600"}`}>
            Total Bobot: {totalWeight}%{totalWeight !== 100 && " (Harus 100%)"}
          </p>
        )}
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Jenis Nilai</DialogTitle>
          </DialogHeader>
          <form action={handleEdit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nama Jenis Nilai</Label>
              <Input id="edit-name" name="name" defaultValue={editingType?.name} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-weight">Bobot % (Opsional)</Label>
              <Input
                id="edit-weight"
                name="weight"
                type="number"
                min="0"
                max="100"
                step="0.01"
                defaultValue={editingType?.weight || ""}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
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

      {gradeTypes.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="py-12 text-center">
            <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Belum ada jenis nilai</h3>
            <p className="text-muted-foreground">Tambahkan jenis nilai seperti Tugas, STS, SAS, dll.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base">Daftar Jenis Nilai ({gradeTypes.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">No</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead>Bobot</TableHead>
                    <TableHead className="w-24">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {gradeTypes.map((gt: any, index) => (
                    <TableRow key={gt.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="font-medium">{gt.name}</TableCell>
                      <TableCell className="text-muted-foreground">{gt.weight ? `${gt.weight}%` : "-"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(gt)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                disabled={deleting === gt.id}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Hapus Jenis Nilai?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tindakan ini akan menghapus "{gt.name}" beserta semua nilai yang sudah diinput.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(gt.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Hapus
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
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

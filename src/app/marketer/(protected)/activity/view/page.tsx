'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { post } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Loader2 } from 'lucide-react'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const MySwal = withReactContent(Swal)

type Contact = {
  contactId: string
  name: string
  email: string
}

type Activity = {
  activityId: string
  name: string
  createdAt: string
  marketerId: string
  marketerName: string
  contacts: Contact[]
}

export default function ActivityViewPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const activityId = searchParams.get('id')

  const [activity, setActivity] = useState<Activity | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [editIndex, setEditIndex] = useState<number | null>(null)
  const [editName, setEditName] = useState('')
  const [editEmail, setEditEmail] = useState('')


  const pageSize = 10

  const fetchActivity = async () => {
    try {
      const res = await post<{ data: Activity; status: string }>('/activity/getbyactivityId', {
        activityId,
      })
      setActivity(res.data)
    } catch (err: any) {
      console.error('Failed to fetch activity:', err)
      await MySwal.fire({
        icon: 'error',
        title: 'Failed to fetch activity',
        text: err?.message || 'Something went wrong.',
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
      })

    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (activityId) fetchActivity()
  }, [activityId])

  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !activityId) return

    const formData = new FormData()
    formData.append('file', file)
    formData.append('activityId', activityId)

    try {
      const result = await post('/activity/upload', formData) // ✅ Pass formData directly

      if (result.status === 'success') {
        await MySwal.fire({
          icon: 'success',
          title: 'Contact Uploaded',
          text: result.message,
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
        })

        fetchActivity() // Refresh the activity data with new contacts
      } else {
        throw new Error(result.message)
      }
    } catch (err: any) {
      console.error('CSV Upload Error:', err)
      await MySwal.fire({
        icon: 'error',
        title: 'Upload Failed',
        text: err.message || 'Could not upload CSV.',
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
      })

    }
  }

  const handleAddContact = async () => {
    if (!newName || !newEmail || !activityId) return

    try {
      const result = await post('/activity/add', {
        activityId,
        name: newName,
        email: newEmail,
      })

      if (result.status === 'success') {
        await MySwal.fire({
          icon: 'success',
          title: 'Contact Added',
          text: result.message,
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
        })

        fetchActivity()
        setNewName('')
        setNewEmail('')
        setIsModalOpen(false)
      } else {
        throw new Error(result.message)
      }
    } catch (err: any) {
      console.error('Add Contact Error:', err)
      await MySwal.fire({
        icon: 'error',
        title: 'Add Contact Failed',
        text: err.message || 'Something went wrong.',
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
      })

    }
  }


  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin w-6 h-6 text-muted-foreground" />
      </div>
    )
  }

  if (!activity) {
    return (
      <div className="p-6 text-center text-muted-foreground bg-white rounded-lg shadow-sm border">
        <p className="text-lg font-medium">Activity not found.</p>
        <div className="mt-4">
          <Button variant="outline" onClick={() => router.back()}>
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  const paginatedContacts = activity.contacts.slice((page - 1) * pageSize, page * pageSize)
  const totalPages = Math.ceil(activity.contacts.length / pageSize)

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 bg-white rounded-lg shadow-sm border">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold text-gray-900">Activity Overview</h1>
        <p className="text-sm text-muted-foreground">Details and contacts for selected activity</p>
      </div>

      <Card>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-6">
          <div>
            <p className="text-sm text-muted-foreground">Activity Name</p>
            <p className="text-lg font-semibold">{activity.name}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Marketer</p>
            <p className="text-lg font-medium">{activity.marketerName}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Date Created</p>
            <p className="text-base">{new Date(activity.createdAt).toLocaleString()}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h2 className="text-xl font-semibold">Contacts</h2>
              <p className="text-sm text-muted-foreground">
                {activity.contacts.length} contact{activity.contacts.length !== 1 && 's'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsModalOpen(true)}>
                Add Entry
              </Button>

              <label htmlFor="csvUpload" className="cursor-pointer">
                <Button variant="outline" size="sm" asChild>
                  <span>Upload CSV</span>
                </Button>
                <input
                  type="file"
                  accept=".csv"
                  id="csvUpload"
                  onChange={handleCSVUpload}
                  className="hidden"
                />
              </label>
            </div>

          </div>

          {activity.contacts.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-1/3">Name</TableHead>
                    <TableHead className="w-1/3">Email</TableHead>
                    <TableHead className="w-1/3 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedContacts.map((contact, idx) => {
                    const globalIndex = (page - 1) * pageSize + idx

                    const isEditing = globalIndex === editIndex

                    return (
                      <TableRow key={globalIndex}>
                        <TableCell>
                          {isEditing ? (
                            <Input value={editName} className='bg-white' onChange={(e) => setEditName(e.target.value)} />
                          ) : (
                            contact.name
                          )}
                        </TableCell>
                        <TableCell>
                          {isEditing ? (
                            <Input value={editEmail} className='bg-white' onChange={(e) => setEditEmail(e.target.value)} />
                          ) : (
                            contact.email
                          )}
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          {isEditing ? (
                            <>
                              <Button
                                size="sm"
                                onClick={async () => {
                                  if (!editName || !editEmail || !activityId) return

                                  try {
                                    const res = await post('/activity/update-contact', {
                                      contactId: contact.contactId,
                                      name: editName,
                                      email: editEmail,
                                    })
                                    if (res.status === 'success') {
                                      await MySwal.fire({
                                        icon: 'success',
                                        title: 'Updated!',
                                        text: res.message,
                                        showConfirmButton: false,
                                        timer: 1500,
                                        timerProgressBar: true,
                                      })

                                      setEditIndex(null)
                                      fetchActivity()
                                    } else {
                                      throw new Error(res.message)
                                    }
                                  } catch (err: any) {
                                    await MySwal.fire({
                                      icon: 'error',
                                      title: 'Error',
                                      text: err.message || 'Update failed',
                                      showConfirmButton: false,
                                      timer: 1500,
                                      timerProgressBar: true,
                                    })

                                  }
                                }}
                              >
                                Save
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEditIndex(null)}
                              >
                                Cancel
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditIndex(globalIndex)
                                  setEditName(contact.name)
                                  setEditEmail(contact.email)
                                }}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={async () => {
                                  const confirm = await MySwal.fire({
                                    title: 'Delete contact?',
                                    text: 'This action cannot be undone.',
                                    icon: 'warning',
                                    showCancelButton: true,
                                    confirmButtonText: 'Delete',
                                  })
                                  if (confirm.isConfirmed) {
                                    try {
                                      const res = await post('/activity/delete-contact', {
                                        contactId: contact.contactId,
                                      })
                                      if (res.status === 'success') {
                                        fetchActivity()
                                      }
                                    } catch (err) {
                                      console.error(err)
                                    }
                                  }
                                }}
                              >
                                Delete
                              </Button>
                            </>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>

              <div className="flex items-center justify-end mt-6 space-x-4 text-sm">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <span className="text-muted-foreground">
                  Page <strong>{page}</strong> of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </>
          ) : (
            <p className="text-center text-muted-foreground">No contacts available.</p>
          )}
        </CardContent>
      </Card>

      <div className="text-right">
        <Button variant="outline" onClick={() => router.back()}>
          Back
        </Button>
      </div>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Contact</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={newName} onChange={(e) => setNewName(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleAddContact}>Add Contact</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}
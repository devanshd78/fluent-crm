'use client'

import { useEffect, useState } from 'react'
import Swal from 'sweetalert2'
import { get, post } from '@/lib/api'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  RadioGroup,
  RadioGroupItem,
} from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { Skeleton } from '@/components/ui/skeleton'

interface Marketer {
  marketerId: string
  name: string
  email: string
  phoneNumber: string
  role: string
  verifiedAt: string
  assignedMail: { user: string } | null
}

interface SmtpEmail {
  credentialsId: string
  email: string
}

export default function AdminMarketersPage() {
  const [marketers, setMarketers] = useState<Marketer[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const limit = 10
  const [totalPages, setTotalPages] = useState(1)

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
  const [selectedMarketer, setSelectedMarketer] = useState<Marketer | null>(null)
  const [smtpEmails, setSmtpEmails] = useState<SmtpEmail[]>([])
  const [selectedCredentialsId, setSelectedCredentialsId] = useState<string>('')
  const [smtpLoading, setSmtpLoading] = useState(false)

  useEffect(() => {
    const fetchMarketers = async () => {
      setLoading(true)
      try {
        const res = await get(`/admin/marketers/getlist?page=${page}&limit=${limit}`)
        setMarketers(res.data || [])
        setTotalPages(res.meta?.totalPages || 1)
      } catch {
        Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to fetch marketers' })
      } finally {
        setLoading(false)
      }
    }
    fetchMarketers()
  }, [page])

  useEffect(() => {
    if (!isAssignModalOpen) return
    const fetchSmtp = async () => {
      setSmtpLoading(true)
      try {
        const res = await get('/smtp/getall')
        const mapped: SmtpEmail[] = (res.data || []).map((item: any) => ({
          credentialsId: item.credentialID,
          email: item.user,
        }))
        setSmtpEmails(mapped)
      } catch {
        Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to load emails' })
      } finally {
        setSmtpLoading(false)
      }
    }
    fetchSmtp()
  }, [isAssignModalOpen])

  const openAssignModal = (marketer: Marketer) => {
    setSelectedMarketer(marketer)
    setSelectedCredentialsId('')
    setIsAssignModalOpen(true)
  }

  const handleAssign = async () => {
    if (!selectedCredentialsId || !selectedMarketer) {
      Swal.fire({ icon: 'warning', title: 'Missing selection', text: 'Select an email.' })
      return
    }
    try {
      await post('/admin/assignSmtp', {
        marketerId: selectedMarketer.marketerId,
        credentialId: selectedCredentialsId,
      })
      Swal.fire({ icon: 'success', title: 'Assigned!', text: 'SMTP email assigned.' })
      setIsAssignModalOpen(false)
      refreshList()
    } catch {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Assignment failed.' })
    }
  }

  const handleDelete = (marketer: Marketer) => {
    Swal.fire({
      title: `Delete ${marketer.name}?`,
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await post('/marketer/delete', { marketerId: marketer.marketerId })
          Swal.fire({ icon: 'success', title: 'Deleted!', text: `${marketer.name} removed.` })
          refreshList()
        } catch {
          Swal.fire({ icon: 'error', title: 'Error', text: 'Deletion failed.' })
        }
      }
    })
  }

  const refreshList = async () => {
    setLoading(true)
    try {
      const res = await get(`/admin/marketers/getlist?page=${page}&limit=${limit}`)
      setMarketers(res.data || [])
      setTotalPages(res.meta?.totalPages || 1)
    } catch {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to fetch marketers' })
    } finally {
      setLoading(false)
    }
  }

  const generatePageNumbers = () => {
    const pages: number[] = []
    for (let i = 1; i <= totalPages; i++) pages.push(i)
    return pages
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold text-gray-800">All Marketers</h1>
        <p className="text-sm text-gray-600">Manage SMTP assignments</p>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: limit }).map((_, i) => (
            <Skeleton key={i} className="h-10 rounded-md" />
          ))}
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="px-4 py-2 uppercase">Name</TableHead>
              <TableHead className="px-4 py-2 uppercase">Email</TableHead>
              <TableHead className="px-4 py-2 uppercase">Mobile</TableHead>
              <TableHead className="px-4 py-2 uppercase">Verified</TableHead>
              <TableHead className="px-4 py-2 uppercase">Assigned Email</TableHead>
              <TableHead className="px-4 py-2 uppercase">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {marketers.map((mt) => (
              <TableRow
                key={mt.marketerId}
                className="hover:bg-gray-50 odd:bg-white even:bg-gray-50"
              >
                <TableCell className="px-4 py-2">{mt.name}</TableCell>
                <TableCell className="px-4 py-2">{mt.email}</TableCell>
                <TableCell className="px-4 py-2">{mt.phoneNumber}</TableCell>
                <TableCell className="px-4 py-2">{new Date(mt.verifiedAt).toLocaleDateString()}</TableCell>
                <TableCell className="px-4 py-2">
                  {mt.assignedMail?.user ? (
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                      {mt.assignedMail.user}
                    </span>
                  ) : (
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                      Unassigned
                    </span>
                  )}
                </TableCell>
                <TableCell className="px-4 py-2 flex space-x-2">
                  <Button size="sm" variant="outline" onClick={() => openAssignModal(mt)}>
                    Assign
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(mt)}>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <div className="flex justify-center mt-4">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => { e.preventDefault(); if (page > 1) setPage(page - 1) }}
                className={page === 1 ? 'pointer-events-none opacity-50' : ''}
              />

            </PaginationItem>

            {generatePageNumbers().map((p) => (
              <PaginationItem key={p}>
                <PaginationLink
                  href="#"
                  onClick={(e) => { e.preventDefault(); setPage(p) }}
                  className={page === p ? 'bg-blue-600 text-white' : ''}
                >
                  {p}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => { e.preventDefault(); if (page < totalPages) setPage(page + 1) }}
                className={page === totalPages ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>

      {/* Assign Email Modal */}
      <Dialog open={isAssignModalOpen} onOpenChange={setIsAssignModalOpen}>
        <DialogContent className="max-w-md w-full">
          <DialogHeader>
            <DialogTitle className="text-lg font-medium">
              Assign SMTP Email to {selectedMarketer?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {smtpLoading ? (
              <Skeleton className="h-8 w-full rounded-md" />
            ) : (
              <RadioGroup onValueChange={setSelectedCredentialsId} value={selectedCredentialsId}>
                {smtpEmails.map((smtp) => (
                  <div key={smtp.credentialsId} className="flex items-center space-x-3">
                    <RadioGroupItem
                      value={smtp.credentialsId}
                      id={`smtp-${smtp.credentialsId}`}
                    />
                    <Label htmlFor={`smtp-${smtp.credentialsId}`} className="flex-1">
                      {smtp.email}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}
          </div>
          <DialogFooter className="space-x-2">
            <Button variant="outline" onClick={() => setIsAssignModalOpen(false)}>
              Cancel
            </Button>
            <Button disabled={!selectedCredentialsId} onClick={handleAssign}>
              Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
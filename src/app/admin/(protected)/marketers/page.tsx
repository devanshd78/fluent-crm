'use client'

import { useEffect, useState } from 'react'
import Swal from 'sweetalert2'
import { get } from '@/lib/api'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
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
}

export default function AdminMarketersPage() {
  const [marketers, setMarketers] = useState<Marketer[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const limit = 10
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    const fetchMarketers = async () => {
      setLoading(true)
      try {
        const res = await get(`/admin/marketers/getlist?page=${page}&limit=${limit}`)

        setMarketers(res.data || [])
        console.log(res.data);
        
        setTotalPages(res.meta?.totalPages || 1)
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to fetch marketers',
          confirmButtonText: 'OK',
        })
      } finally {
        setLoading(false)
      }
    }

    fetchMarketers()
  }, [page])

  // Helper to generate page numbers for pagination display (simplified)
  const generatePageNumbers = () => {
    const pages = []
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i)
    }
    return pages
  }

  return (
    <div className="space-y-6 bg-white p-6 rounded-lg shadow-md">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">All Marketers</h1>
        <p className="text-sm text-gray-600">List of marketers registered in the system.</p>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: limit }).map((_, i) => (
            <Skeleton key={i} className="h-10 rounded-md" />
          ))}
        </div>
      ) : marketers.length === 0 ? (
        <p className="text-gray-500">No marketers found.</p>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead>Marketer ID</TableHead>
                <TableHead>Verified At</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {marketers.map((marketer) => (
                <TableRow key={marketer.marketerId}>
                  <TableCell>{marketer.name}</TableCell>
                  <TableCell>{marketer.email}</TableCell>
                  <TableCell>{marketer.phoneNumber}</TableCell>
                  <TableCell>{marketer.marketerId}</TableCell>
                  <TableCell>{new Date(marketer.verifiedAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <span className="text-green-600 font-medium text-xs">active</span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex justify-center mt-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      if (page > 1) setPage(page - 1)
                    }}
                    aria-disabled={page === 1}
                    className={page === 1 ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>

                {generatePageNumbers().map((p) => (
                  <PaginationItem key={p}>
                    <PaginationLink
                      href="#"
                      aria-current={page === p ? 'page' : undefined}
                      onClick={(e) => {
                        e.preventDefault()
                        setPage(p)
                      }}
                      className={page === p ? 'bg-blue-600 text-white' : ''}
                    >
                      {p}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      if (page < totalPages) setPage(page + 1)
                    }}
                    aria-disabled={page === totalPages}
                    className={page === totalPages ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </>
      )}
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { get, post } from '@/lib/api'
import Swal from 'sweetalert2'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { BadgeCheck, XCircle, Hourglass } from 'lucide-react'

interface Marketer {
  name: string
  email: string
  phoneNumber: string
  marketerId: string
  createdAt: string
}

const MySwal = Swal

export default function MarketerStatusPage() {
  const [marketers, setMarketers] = useState<Marketer[]>([])
  const [pendingMarketers, setPendingMarketers] = useState<Marketer[]>([])
  const [loading, setLoading] = useState(true)
  const [pendingLoading, setPendingLoading] = useState(true)
  const [filter, setFilter] = useState<'approved' | 'rejected'>('approved')

  const fetchMarketersByStatus = async () => {
    setLoading(true)
    try {
      const res = await post('/admin/marketers/status', {
        isApproved: filter === 'approved' ? 1 : 0
      })
      setMarketers(res.data || [])
    } catch (err) {
      MySwal.fire('Error', 'Failed to fetch marketer list', 'error')
    } finally {
      setLoading(false)
    }
  }

  const fetchPendingMarketers = async () => {
    setPendingLoading(true)
    try {
      const res = await get('/admin/marketer-requests')
      setPendingMarketers(res.data || [])
    } catch (err) {
      MySwal.fire('Error', 'Failed to fetch pending marketers', 'error')
    } finally {
      setPendingLoading(false)
    }
  }

  const handleRequestAction = async (marketerId: string, action: 'approve' | 'reject') => {
    const confirm = await MySwal.fire({
      title: `Are you sure you want to ${action} this request?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: `Yes, ${action}`,
    })

    if (!confirm.isConfirmed) return

    try {
      await post(`/admin/marketer/${marketerId}/verify`, { action })
      MySwal.fire('Success', `Marketer ${action}d successfully.`, 'success')
      fetchPendingMarketers()
      fetchMarketersByStatus()
    } catch (err) {
      MySwal.fire('Error', `Failed to ${action} marketer.`, 'error')
    }
  }

  useEffect(() => {
    fetchMarketersByStatus()
  }, [filter])

  useEffect(() => {
    fetchPendingMarketers()
  }, [])

  return (
    <div className="space-y-6 bg-white p-6 rounded-lg shadow-md">
      {/* Pending Marketers */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Hourglass className="w-5 h-5 text-yellow-500" />
          <h2 className="text-xl font-semibold text-gray-800">Pending Marketer Requests</h2>
        </div>

        {pendingLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
        ) : pendingMarketers.length === 0 ? (
          <p className="text-gray-500 italic">No pending requests.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingMarketers.map((m) => (
              <Card key={m.marketerId} className="rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition">
                <CardContent className="p-4 space-y-3 text-sm">
                  <div>
                    <p className="font-medium text-gray-800">{m.name}</p>
                    <p className="text-xs text-gray-500">Email: {m.email}</p>
                    <p className="text-xs text-gray-500">Phone: {m.phoneNumber}</p>
                    <p className="text-xs text-gray-400">ID: {m.marketerId}</p>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleRequestAction(m.marketerId, 'approve')}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRequestAction(m.marketerId, 'reject')}
                    >
                      Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Approved / Rejected */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {filter === 'approved' ? 'Approved' : 'Rejected'} Marketers
            </h2>
            <p className="text-sm text-gray-600">
              Filtered list of {filter === 'approved' ? 'verified' : 'rejected'} marketers
            </p>
          </div>
          <div className="flex gap-2 mt-4 sm:mt-0">
            <Button
              variant={filter === 'approved' ? 'default' : 'outline'}
              onClick={() => setFilter('approved')}
            >
              <BadgeCheck className="w-4 h-4 mr-1" />
              Approved
            </Button>
            <Button
              variant={filter === 'rejected' ? 'default' : 'outline'}
              onClick={() => setFilter('rejected')}
            >
              <XCircle className="w-4 h-4 mr-1" />
              Rejected
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : marketers.length === 0 ? (
          <p className="text-gray-500 italic">No {filter} marketers found.</p>
        ) : (
          <div className="overflow-x-auto border rounded-lg">
            <table className="min-w-full text-sm divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 text-left text-xs font-semibold text-gray-600">Name</th>
                  <th className="p-3 text-left text-xs font-semibold text-gray-600">Email</th>
                  <th className="p-3 text-left text-xs font-semibold text-gray-600">Phone</th>
                  <th className="p-3 text-left text-xs font-semibold text-gray-600">Marketer ID</th>
                  <th className="p-3 text-left text-xs font-semibold text-gray-600">Created At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {marketers.map((m) => (
                  <tr key={m.marketerId} className="hover:bg-gray-50">
                    <td className="p-3 font-medium text-gray-800">{m.name}</td>
                    <td className="p-3 text-gray-600">{m.email}</td>
                    <td className="p-3 text-gray-600">{m.phoneNumber}</td>
                    <td className="p-3 text-gray-500">{m.marketerId}</td>
                    <td className="p-3 text-gray-500">{new Date(m.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}

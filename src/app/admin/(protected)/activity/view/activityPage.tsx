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

const MySwal = withReactContent(Swal)

type Contact = {
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
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (activityId) fetchActivity()
  }, [activityId])

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
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Contacts</h2>
            <p className="text-sm text-muted-foreground">
              {activity.contacts.length} contact{activity.contacts.length !== 1 && 's'}
            </p>
          </div>

          {activity.contacts.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-1/3">Name</TableHead>
                    <TableHead className="w-1/3">Email</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedContacts.map((contact, idx) => (
                    <TableRow key={idx} className="border-b">
                      <TableCell>{contact.name}</TableCell>
                      <TableCell>{contact.email}</TableCell>
                    </TableRow>
                  ))}
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
    </div>
  )
}

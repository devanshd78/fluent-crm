'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { get } from '@/lib/api'

import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useRouter } from 'next/navigation'

interface Campaign {
  campaignId: string
  activityId: string
  marketerId: string
  marketerName: string
  activityName: string
  contacts: { name: string; email: string }[]
  subject: string
  description: string
  sentAt: string
}

export default function AdminCampaignsPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const res = await get('/mail/getcampaigns')
        if (res?.status === 'success') {
          setCampaigns(res.data)
        } else {
          throw new Error(res?.message || 'Unexpected API response')
        }
      } catch (err) {
        console.error(err)
        toast.error('Failed to fetch campaigns')
      } finally {
        setLoading(false)
      }
    }
    fetchCampaigns()
  }, [])

  if (loading) {
    return (
      <div className="p-4">
        <Skeleton className="h-6 w-1/3 mb-4" />
        <Skeleton className="h-40 rounded-lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6 bg-white p-6 rounded-lg shadow-md">
      <h1 className="mb-2 text-2xl font-bold">Campaigns</h1>
      <p className="mb-6 text-sm text-gray-600">
        All mail campaigns you’ve sent
      </p>

      {campaigns.length === 0 ? (
        <p className="text-gray-500">No campaigns found.</p>
      ) : (
        <Table>
          <TableCaption>List of all sent campaigns</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Activity Name</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>No. of Emails</TableHead>
              <TableHead>Sent On</TableHead>
              <TableHead>By</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {campaigns.map(c => (
              <TableRow key={c.campaignId}>
                <TableCell>{c.activityName}</TableCell>
                <TableCell>{c.subject}</TableCell>
                <TableCell>{c.contacts.length}</TableCell>
                <TableCell>
                  {new Date(c.sentAt).toLocaleDateString()}
                </TableCell>
                <TableCell>{c.marketerName}</TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      router.push(`/admin/campaigns/view?id=${c.campaignId}`)
                    }
                  >
                    View
                  </Button>
                </TableCell>

              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
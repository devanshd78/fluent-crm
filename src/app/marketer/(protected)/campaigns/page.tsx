'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { get, post } from '@/lib/api'
import { useRouter } from 'next/navigation'

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
  const router = useRouter()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCampaignsByMarketer = async () => {
      const marketerId = localStorage.getItem('userId')
      if (!marketerId) {
        toast.error('Marketer ID not found.')
        setLoading(false)
        return
      }

      try {
        const res = await post('/mail/getcampaignsbymarketer', { marketerId })
        if (res?.status === 'success') {
          setCampaigns(res.data)
        } else {
          throw new Error(res?.message || 'Unexpected API response')
        }
      } catch (err) {
        console.error(err)
        toast.error('Failed to fetch your campaigns.')
      } finally {
        setLoading(false)
      }
    }

    fetchCampaignsByMarketer()
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
      {/* Header with Launch Mail button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Campaigns</h1>
          <p className="mt-1 text-sm text-gray-600">
            All mail campaigns you’ve sent
          </p>
        </div>
        <Button
          onClick={() => router.push('/marketer/campaigns/send')}
        >
          Launch Mail
        </Button>
      </div>

      {campaigns.length === 0 ? (
        <p className="text-gray-500">No campaigns found.</p>
      ) : (
        <Table>
          <TableCaption>List of your sent campaigns</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Activity Name</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>No. of Emails</TableHead>
              <TableHead>Sent On</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {campaigns.map((c) => (
              <TableRow key={c.campaignId}>
                <TableCell>{c.activityName}</TableCell>
                <TableCell>{c.subject}</TableCell>
                <TableCell>{c.contacts.length}</TableCell>
                <TableCell>
                  {new Date(c.sentAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      router.push(`/marketer/campaigns/view?id=${c.campaignId}`)
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

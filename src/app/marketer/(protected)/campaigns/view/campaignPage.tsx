// pages/campaigns/view.tsx
'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Swal from 'sweetalert2'
import { post } from '@/lib/api'

import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'

interface Contact {
  name: string
  email: string
}

interface Campaign {
  campaignId: string
  activityId: string
  marketerId: string
  marketerName: string
  activityName: string
  contacts: Contact[]
  subject: string
  description: string
  sentAt: string
  createdAt: string
  updatedAt: string
}

export default function ViewCampaignPage() {
  const searchParams = useSearchParams()
  const id = searchParams.get('id')  // ?id=campaignId

  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return

    const fetchCampaign = async () => {
      try {
        const res = await post('/mail/getcampaignbyid', { campaignId: id })
        if (res?.status === 'success') {
          setCampaign(res.data)
        } else {
          throw new Error(res?.message || 'Unexpected response')
        }
      } catch (err: any) {
        console.error(err)
        Swal.fire({
          icon: 'error',
          title: 'Load Failed',
          text: err.message || 'Unable to load campaign.'
        })
      } finally {
        setLoading(false)
      }
    }
    fetchCampaign()
  }, [id])

  if (loading) {
    return (
      <div className="p-8 animate-pulse">
        <Skeleton className="h-10 w-1/3 mb-6" />
        <Skeleton className="h-64 rounded-lg" />
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Campaign not found.</p>
      </div>
    )
  }

  return (
    <div className="mx-auto p-6 space-y-6 bg-white shadow-md rounded-lg">
      <h1 className="text-3xl font-bold text-gray-800">Campaign Details</h1>

      <Card>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
          <div>
            <p className="text-sm text-gray-500">Activity Name</p>
            <p className="font-medium">{campaign.activityName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Marketer</p>
            <p className="font-medium">
              {campaign.marketerName}
            </p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-sm text-gray-500">Subject</p>
            <p className="font-medium">{campaign.subject}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-sm text-gray-500">Description</p>
            <p className="whitespace-pre-wrap text-gray-700">
              {campaign.description}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Sent At</p>
            <p className="font-medium">
              {new Date(campaign.sentAt).toLocaleString()}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">
          Contacts ({campaign.contacts.length})
        </h2>
        <Table className="shadow-sm">
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {campaign.contacts.map((c, idx) => (
              <TableRow
                key={idx}
                className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
              >
                <TableCell>{c.name}</TableCell>
                <TableCell>{c.email}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
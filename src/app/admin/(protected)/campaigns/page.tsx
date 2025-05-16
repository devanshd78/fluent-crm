'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { get } from '@/lib/api'

interface Campaign {
  _id: string
  title: string
  status: 'active' | 'paused' | 'completed'
  leads: number
  startDate: string
}

export default function AdminCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const res = await get('/api/campaigns') // Replace with actual endpoint
        setCampaigns(res || [])
      } catch (err) {
        toast.error('Failed to fetch campaigns')
      } finally {
        setLoading(false)
      }
    }

    fetchCampaigns()
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Campaigns</h1>
        <p className="text-sm text-gray-600">Manage and monitor all running and past campaigns.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))
        ) : campaigns.length === 0 ? (
          <p className="text-gray-500">No campaigns found.</p>
        ) : (
          campaigns.map((campaign) => (
            <Card key={campaign._id} className="border shadow-sm hover:shadow-md transition">
              <CardContent className="p-4 space-y-1 text-sm">
                <h2 className="text-lg font-semibold text-gray-800">{campaign.title}</h2>
                <p>
                  <span className="font-medium text-gray-700">Leads:</span> {campaign.leads}
                </p>
                <p>
                  <span className="font-medium text-gray-700">Start Date:</span>{' '}
                  {new Date(campaign.startDate).toLocaleDateString()}
                </p>
                <p className={`font-medium text-sm ${campaign.status === 'active'
                    ? 'text-green-600'
                    : campaign.status === 'paused'
                      ? 'text-yellow-600'
                      : 'text-gray-500'
                  }`}>
                  {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

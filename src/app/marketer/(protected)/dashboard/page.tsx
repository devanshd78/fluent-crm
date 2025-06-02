'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import { post } from '@/lib/api'
import { Skeleton } from '@/components/ui/skeleton'
import { useRouter } from 'next/navigation'

interface DashboardData {
  name: string
  totalActivity: number
  totalCampaigns: number
}

export default function MarketerDashboard() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const router = useRouter()

  useEffect(() => {
    const fetchDashboard = async () => {
      const marketerId = localStorage.getItem('userId')
      if (!marketerId) {
        toast.error('Marketer ID not found. Please log in.')
        router.push('/marketer/login')
        return
      }

      try {
        setLoading(true)
        // Call your dashboard endpoint; it returns { name, totalActivity, totalCampaigns }
        const res = await post('/marketer/dashboard', { marketerId })
        if (res?.status === 'success') {
          setDashboard(res.data as DashboardData)
        } else {
          throw new Error(res?.message || 'Unexpected API response')
        }
      } catch (err) {
        console.error('Error fetching dashboard:', err)
        toast.error('Failed to load dashboard data.')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboard()
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white p-6 rounded-lg shadow flex flex-col sm:flex-row items-start sm:items-center justify-between">
          <div>
            {loading ? (
              <Skeleton className="h-8 w-1/3 mb-2 rounded" />
            ) : (
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome, {dashboard?.name} 👋
              </h1>
            )}
            {loading ? (
              <Skeleton className="h-4 w-1/2 rounded" />
            ) : (
              <p className="mt-1 text-gray-600">
                Here’s a summary of your current activity.
              </p>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="bg-white border border-gray-200 shadow hover:shadow-lg transition">
            <CardContent className="p-5">
              <h2 className="text-sm text-gray-500">Total Activities</h2>
              {loading ? (
                <Skeleton className="mt-2 h-8 w-16 rounded" />
              ) : (
                <p className="mt-2 text-3xl font-semibold text-gray-800">
                  {dashboard?.totalActivity ?? 0}
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow hover:shadow-lg transition">
            <CardContent className="p-5">
              <h2 className="text-sm text-gray-500">Total Campaigns</h2>
              {loading ? (
                <Skeleton className="mt-2 h-8 w-16 rounded" />
              ) : (
                <p className="mt-2 text-3xl font-semibold text-gray-800">
                  {dashboard?.totalCampaigns ?? 0}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

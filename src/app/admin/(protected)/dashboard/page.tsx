'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import { get } from '@/lib/api'
import { useRouter } from 'next/navigation'
import { Skeleton } from '@/components/ui/skeleton'

interface AdminDashboardData {
  totalMarketers: number
  totalActivity: number
  totalCampaigns: number
}

export default function AdminDashboard() {
  const [data, setData] = useState<AdminDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchAdminDashboard = async () => {
      const token = localStorage.getItem('token')
      if (!token) {
        toast.error('Unauthorized. Please log in.')
        router.push('/admin/login')
        return
      }

      try {
        setLoading(true)
        // Call the updated admin dashboard endpoint
        const res = await get('/admin/dashboard')
        if (res?.status === 'success') {
          setData(res.data as AdminDashboardData)
        } else {
          throw new Error(res?.message || 'Unexpected API response')
        }
      } catch (err) {
        console.error('Error fetching admin dashboard:', err)
        toast.error('Failed to load dashboard data.')
      } finally {
        setLoading(false)
      }
    }

    fetchAdminDashboard()
  }, [router])

  return (
    <div className="min-h-screen bg-white py-8 px-4 sm:px-6 lg:px-8 rounded-lg shadow">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white p-6 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between">
          <div>
            {loading ? (
              <Skeleton className="h-8 w-1/3 mb-2 rounded" />
            ) : (
              <h1 className="text-3xl font-bold text-gray-800">
                Welcome back, Admin 👋
              </h1>
            )}
            {loading ? (
              <Skeleton className="h-4 w-1/2 rounded" />
            ) : (
              <p className="mt-1 text-gray-600">
                Here’s your latest dashboard overview.
              </p>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Total Marketers Card */}
          <Card className="bg-white border shadow-sm hover:shadow-md transition">
            <CardContent className="p-5">
              <h2 className="text-sm text-gray-500">Total Marketers</h2>
              {loading ? (
                <Skeleton className="mt-2 h-8 w-16 rounded" />
              ) : (
                <p className="mt-2 text-3xl font-semibold text-gray-800">
                  {data?.totalMarketers ?? 0}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Total Activities Card */}
          <Card className="bg-white border shadow-sm hover:shadow-md transition">
            <CardContent className="p-5">
              <h2 className="text-sm text-gray-500">Total Activities</h2>
              {loading ? (
                <Skeleton className="mt-2 h-8 w-16 rounded" />
              ) : (
                <p className="mt-2 text-3xl font-semibold text-indigo-600">
                  {data?.totalActivity ?? 0}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Total Campaigns Card */}
          <Card className="bg-white border shadow-sm hover:shadow-md transition">
            <CardContent className="p-5">
              <h2 className="text-sm text-gray-500">Total Campaigns</h2>
              {loading ? (
                <Skeleton className="mt-2 h-8 w-16 rounded" />
              ) : (
                <p className="mt-2 text-3xl font-semibold text-green-600">
                  {data?.totalCampaigns ?? 0}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  // useEffect(() => {
  //   const token = localStorage.getItem('token')
  //   if (!token) {
  //     toast.error('Unauthorized. Please log in.')
  //     router.push('/admin/login')
  //   } else {
  //     // Simulate fetch user logic
  //     setUser({ name: 'Admin Jane' })
  //   }
  // }, [router])

  return (
    <div className="min-h-screen bg-white p-6 shadow-md rounded-lg">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Welcome back, {user?.name} 👋</h1>
          <p className="text-gray-600">Here’s your latest dashboard overview.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="bg-white border shadow-sm hover:shadow-md transition">
            <CardContent className="p-5">
              <h2 className="text-sm text-gray-500">Total Users</h2>
              <p className="text-3xl font-semibold text-gray-800">1,432</p>
            </CardContent>
          </Card>

          <Card className="bg-white border shadow-sm hover:shadow-md transition">
            <CardContent className="p-5">
              <h2 className="text-sm text-gray-500">Campaigns Created</h2>
              <p className="text-3xl font-semibold text-indigo-600">87</p>
            </CardContent>
          </Card>

          <Card className="bg-white border shadow-sm hover:shadow-md transition">
            <CardContent className="p-5">
              <h2 className="text-sm text-gray-500">Revenue Generated</h2>
              <p className="text-3xl font-semibold text-green-600">$24,300</p>
            </CardContent>
          </Card>
        </div>

        {/* Placeholder for Activity or Table */}
        <div className="bg-white rounded-xl border shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Recent Admin Activity</h3>
          <ul className="text-sm text-gray-600 space-y-2">
            <li>✅ Approved 3 marketer registrations</li>
            <li>📢 Created campaign template "Holiday Blast"</li>
            <li>📈 Exported performance report</li>
            <li>🔒 Updated admin security settings</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

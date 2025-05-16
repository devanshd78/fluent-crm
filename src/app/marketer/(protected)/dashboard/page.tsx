'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function MarketerDashboard() {
    const [user, setUser] = useState<any>(null)
    const router = useRouter()

    //   useEffect(() => {
    //     const token = localStorage.getItem('token')
    //     if (!token) {
    //       toast.error('Unauthorized. Please log in.')
    //       router.push('/marketer/login')
    //     } else {
    //       // Optionally decode or fetch marketer info
    //       setUser({ name: 'Marketer John' }) // Dummy name
    //     }
    //   }, [])

    return (
        <div className="min-h-screen bg-white p-6 shadow-md rounded-lg">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Welcome, {user?.name} 👋</h1>
                    <p className="text-gray-600">Here’s what’s happening with your campaigns today.</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Card className="bg-white border border-gray-200 shadow-md hover:shadow-lg transition">
                        <CardContent className="p-4">
                            <h2 className="text-sm text-gray-500">Total Campaigns</h2>
                            <p className="text-2xl font-semibold text-gray-800">12</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-white border border-gray-200 shadow-md hover:shadow-lg transition">
                        <CardContent className="p-4">
                            <h2 className="text-sm text-gray-500">Leads Generated</h2>
                            <p className="text-2xl font-semibold text-gray-800">238</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-white border border-gray-200 shadow-md hover:shadow-lg transition">
                        <CardContent className="p-4">
                            <h2 className="text-sm text-gray-500">Conversions</h2>
                            <p className="text-2xl font-semibold text-gray-800">57</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
                    <ul className="space-y-3 text-sm text-gray-700">
                        <li>📣 Campaign "<strong>Spring Sale</strong>" launched</li>
                        <li>👤 34 new leads acquired</li>
                        <li>✅ 10 conversions recorded yesterday</li>
                        <li>📊 Lead report generated</li>
                    </ul>
                </div>
            </div>
        </div>
    )
}

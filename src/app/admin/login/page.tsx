'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { post } from '@/lib/api'
import { toast } from 'sonner'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault()
  setLoading(true)

  try {
    const res = await post('/admin/login', { email, password })

    if (res?.token && res?.adminId) {
      localStorage.setItem('token', res.token)
      localStorage.setItem('adminId', res.adminId)
      toast.success('Welcome, Admin!')
      router.push('/admin/dashboard')
    } else {
      toast.error('Invalid admin credentials')
    }
  } catch (err) {
    toast.error('Server error during login')
  } finally {
    setLoading(false)
  }
}


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Admin Login</h1>
          <p className="text-sm text-gray-500 mt-1">Enter your credentials to access the dashboard</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <Input
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="rounded-lg"
            />
          </div>

          <Button
            type="submit"
            className="w-full rounded-lg text-white bg-gray-800 hover:bg-gray-700 transition"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </form>

        <p className="text-xs text-center text-gray-400 mt-6">
          This page is for Admins only
        </p>
      </div>
    </div>
  )
}

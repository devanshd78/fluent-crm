'use client'

import { useState, useEffect } from 'react'
import { get, post } from '@/lib/api'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

const MySwal = withReactContent(Swal)

interface MarketerData {
  marketerId: string
  name: string
  email: string
  phoneNumber?: string
  role?: string
  createdAt?: string
  user?: string
}

export default function ProfilePage() {
  // Full object from API
  const [marketer, setMarketer] = useState<MarketerData | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Editable fields
  const [name, setName] = useState<string>('')
  const [email, setEmail] = useState<string>('')
  const [phoneNumber, setPhoneNumber] = useState<string>('')
  const [password, setPassword] = useState<string>('') // New password field

  const [isEditing, setIsEditing] = useState<boolean>(false)

  const showSwal = (icon: 'success' | 'error', title: string) => {
    MySwal.fire({
      icon,
      title,
      timer: 1800,
      timerProgressBar: true,
      showConfirmButton: false,
      position: 'top',
    })
  }

  useEffect(() => {
    const marketerId = localStorage.getItem('userId')
    if (!marketerId) {
      setError('No marketer ID found in localStorage.')
      setLoading(false)
      return
    }

    const fetchMarketer = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await get(`/marketer/${marketerId}`)
        if (response?.data) {
          const data: MarketerData = response.data as MarketerData
          setMarketer(data)
          setName(data.name)
          setEmail(data.email)
          setPhoneNumber(data.phoneNumber || '')
        } else {
          throw new Error('Invalid payload')
        }
      } catch (err: any) {
        console.error('Error fetching marketer details:', err)
        setError('Could not load profile.')
        setMarketer(null)
      } finally {
        setLoading(false)
      }
    }

    fetchMarketer()
  }, [])

  const handleSave = async () => {
    if (!marketer) return
    if (!name.trim() || !email.trim()) {
      return showSwal('error', 'Name and Email cannot be empty.')
    }

    try {
      setLoading(true)
      // Build updated fields; include password only if non-empty
      const updatedFields: Record<string, string> = {
        name: name.trim(),
        email: email.trim(),
        phoneNumber: phoneNumber.trim(),
        marketerId: marketer.marketerId,
      }
      if (password.trim()) {
        updatedFields.password = password.trim()
      }

      const res = await post('/marketer/update', updatedFields)
      if (res.status === 'success' && res.data) {
        const newData: MarketerData = res.data as MarketerData
        setMarketer(newData)
        setName(newData.name)
        setEmail(newData.email)
        setPhoneNumber(newData.phoneNumber || '')
        setPassword('') // clear password field after successful update
        setIsEditing(false)
        showSwal('success', 'Profile updated successfully.')
      } else {
        throw new Error(res.message || 'Update failed')
      }
    } catch (err: any) {
      console.error('Error updating profile:', err)
      showSwal('error', err.response?.data?.message || 'Failed to save changes.')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    if (!marketer) return
    setName(marketer.name)
    setEmail(marketer.email)
    setPhoneNumber(marketer.phoneNumber || '')
    setPassword('')
    setIsEditing(false)
  }

  if (loading && !marketer) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <p className="text-gray-500">Loading profile…</p>
      </div>
    )
  }

  if (error && !marketer) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Profile Header Card */}
        <div className="bg-white shadow-sm rounded-lg p-6 flex items-center space-x-6 mb-8">
          <Avatar className="h-20 w-20 border-2 border-indigo-500">
            <AvatarFallback className="text-2xl">
              {marketer?.name?.charAt(0) ?? '?'}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">
              {marketer?.name}
            </h1>
            <p className="mt-1 text-gray-500">Role: {marketer?.role}</p>
            <p className="mt-1 text-gray-400 text-sm">
              Joined on:{' '}
              {marketer?.createdAt
                ? new Date(marketer.createdAt).toLocaleDateString()
                : '—'}
            </p>
          </div>
        </div>

        {/* Editable Fields Card */}
        <div className="bg-white shadow-sm rounded-lg divide-y divide-gray-200">
          {/* Card Body */}
          <div className="p-6 space-y-6">
            <div className="flex justify-end">
              {isEditing ? (
                <>
                  <Button
                    onClick={handleSave}
                    disabled={loading}
                    className="mr-2 bg-indigo-600 hover:bg-indigo-700"
                  >
                    {loading ? 'Saving…' : 'Save Changes'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)}>
                  Edit Profile
                </Button>
              )}
            </div>

            {/* Form Grid */}
            <div className="grid grid-cols-1 gap-y-6 gap-x-8 sm:grid-cols-2">
              {/* Name (editable) */}
              <div className="sm:col-span-2">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Name
                </label>
                <div className="mt-1">
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={!isEditing}
                    placeholder="Enter your name"
                    className={`w-full ${
                      isEditing
                        ? 'border-indigo-500 focus:ring-indigo-500'
                        : 'bg-gray-100'
                    }`}
                  />
                </div>
              </div>

              {/* Email (editable) */}
              <div className="sm:col-span-2">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <div className="mt-1">
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={!isEditing}
                    placeholder="Enter your email"
                    className={`w-full ${
                      isEditing
                        ? 'border-indigo-500 focus:ring-indigo-500'
                        : 'bg-gray-100'
                    }`}
                  />
                </div>
              </div>

              {/* Phone Number (editable) */}
              <div className="sm:col-span-2">
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700"
                >
                  Phone Number
                </label>
                <div className="mt-1">
                  <Input
                    id="phone"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    disabled={!isEditing}
                    placeholder="+91XXXXXXXXXX"
                    className={`w-full ${
                      isEditing
                        ? 'border-indigo-500 focus:ring-indigo-500'
                        : 'bg-gray-100'
                    }`}
                  />
                </div>
              </div>

              {/* Password (editable) */}
              <div className="sm:col-span-2">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <div className="mt-1">
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={!isEditing}
                    placeholder="Enter new password"
                    className={`w-full ${
                      isEditing
                        ? 'border-indigo-500 focus:ring-indigo-500'
                        : 'bg-gray-100'
                    }`}
                  />
                </div>
              </div>

              {/* Assigned Mail (read-only) */}
              <div className="sm:col-span-2">
                <label
                  htmlFor="assignedMail"
                  className="block text-sm font-medium text-gray-700"
                >
                  Assigned Mail
                </label>
                <div className="mt-1">
                  <Input
                    id="assignedMail"
                    value={marketer?.user || 'No Email is Assigned Yet.'}
                    disabled
                    className="w-full bg-gray-100"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

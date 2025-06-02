'use client'

import { useState, useEffect } from 'react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { get } from '@/lib/api'

interface MarketerData {
  _id: string
  name: string
  email: string
  phoneNumber?: string
  role?: string
  createdAt?: string
  updatedAt?: string
  marketerId?: string
  port?: number
  secure?: boolean
  smtpCredentialId?: string
  user?: string        // The “assigned mail”
  avatarUrl?: string
}

export default function TopBar() {
  const [marketer, setMarketer] = useState<MarketerData | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const marketerId = localStorage.getItem('userId')
    if (!marketerId) {
      setError('No marketer ID found')
      setLoading(false)
      return
    }

    const fetchMarketer = async () => {
      try {
        setLoading(true)
        setError(null)

        // Adjust the endpoint to your actual “getById” route:
        const response = await get(`/marketer/${marketerId}`)
        console.log('Fetched marketer details:', response.data)

        if (response?.data) {
          setMarketer(response.data as MarketerData)
        } else {
          throw new Error('Invalid payload')
        }
      } catch (err: any) {
        console.error('Error fetching marketer details:', err)
        setError('Could not load profile')
        setMarketer(null)
      } finally {
        setLoading(false)
      }
    }

    fetchMarketer()
  }, [])

  return (
    <header className="hidden md:flex items-center justify-between w-full h-16 px-6 bg-white border-b">
      <div />

      <div className="flex items-center space-x-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center space-x-2 p-2 rounded hover:bg-gray-100">
              {loading ? (
                <Avatar>
                  <AvatarFallback>?</AvatarFallback>
                </Avatar>
              ) : marketer?.avatarUrl ? (
                <Avatar>
                  <AvatarImage src={marketer.avatarUrl} alt={`${marketer.name} avatar`} />
                  <AvatarFallback>{marketer.name.charAt(0)}</AvatarFallback>
                </Avatar>
              ) : (
                <Avatar>
                  <AvatarFallback>{marketer?.name?.charAt(0) ?? '?'}</AvatarFallback>
                </Avatar>
              )}

              <span className="hidden lg:inline-block text-gray-800 font-medium">
                {loading ? 'Loading…' : marketer?.name ?? 'Unknown'}
              </span>
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-72 bg-white border border-gray-200 shadow-md rounded-lg overflow-hidden"
          >
            {/* Profile Header */}
            <div className="px-4 py-3 bg-gray-50 flex items-center space-x-3">
              {marketer ? (
                <>
                  <Avatar className="h-10 w-10">
                    {marketer.avatarUrl ? (
                      <AvatarImage src={marketer.avatarUrl} alt={`${marketer.name} avatar`} />
                    ) : (
                      <AvatarFallback>{marketer.name.charAt(0)}</AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-lg font-semibold text-gray-800">
                      {marketer.name}
                    </span>
                    <a
                      href="/marketer/profile"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      View Profile
                    </a>
                  </div>
                </>
              ) : loading ? (
                <p className="text-sm text-gray-500">Loading profile…</p>
              ) : (
                <p className="text-sm text-red-500">{error || 'No data'}</p>
              )}
            </div>

            <DropdownMenuSeparator />

            {/* Details Section */}
            <div className="max-h-60 overflow-y-auto">
              {loading ? (
                <div className="px-4 py-2">
                  <p className="text-sm text-gray-500">Fetching details…</p>
                </div>
              ) : error ? (
                <div className="px-4 py-2">
                  <p className="text-sm text-red-500">{error}</p>
                </div>
              ) : marketer ? (
                <>
                  <DropdownMenuLabel className="px-4 pt-2 text-xs text-gray-500 uppercase">
                    Details
                  </DropdownMenuLabel>
                  <DropdownMenuItem disabled className="px-4 pt-2 pb-1 text-sm text-gray-700">
                    <span className="font-medium">Name:</span> {marketer.name}
                  </DropdownMenuItem>
                  <DropdownMenuItem disabled className="px-4 pt-1 pb-1 text-sm text-gray-700">
                    <span className="font-medium">Email:</span> {marketer.email}
                  </DropdownMenuItem>
                  <DropdownMenuItem disabled className="px-4 pt-1 pb-1 text-sm text-gray-700">
                    <span className="font-medium">Assigned mail is –</span>{' '}
                    {marketer.user ?? (
                      <span className="text-gray-500 italic">None assigned</span>
                    )}
                  </DropdownMenuItem>
                  {marketer.phoneNumber && (
                    <DropdownMenuItem disabled className="px-4 pt-1 pb-1 text-sm text-gray-700">
                      <span className="font-medium">Phone:</span> {marketer.phoneNumber}
                    </DropdownMenuItem>
                  )}
                  {marketer.role && (
                    <DropdownMenuItem disabled className="px-4 pt-1 pb-1 text-sm text-gray-700">
                      <span className="font-medium">Role:</span> {marketer.role}
                    </DropdownMenuItem>
                  )}
                  {marketer.createdAt && (
                    <DropdownMenuItem disabled className="px-4 pt-1 pb-1 text-sm text-gray-700">
                      <span className="font-medium">Joined:</span>{' '}
                      {new Date(marketer.createdAt).toLocaleDateString()}
                    </DropdownMenuItem>
                  )}
                </>
              ) : (
                <div className="px-4 py-2">
                  <p className="text-sm text-gray-500">No profile data available.</p>
                </div>
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Dispatch, SetStateAction } from 'react'
import { cn } from '@/lib/utils'

const navItems = [
  { name: 'Dashboard', path: '/marketer/dashboard' },
  { name: 'Activity', path: '/marketer/activity' },
  { name: 'Campaigns', path: '/marketer/campaigns' },
  { name: 'Templates', path: '/marketer/templates' },
]

export default function MarketerSidebar({
  mobileOpen,
  setMobileOpen,
}: {
  mobileOpen: boolean
  setMobileOpen: Dispatch<SetStateAction<boolean>>
}) {
  const pathname = usePathname()

  return (
    <aside
      className={cn(
        'fixed top-0 left-0 h-full w-64 bg-white border-r shadow-sm z-30 transform transition-transform duration-200 ease-in-out flex flex-col',
        mobileOpen ? 'translate-x-0' : '-translate-x-full',
        'md:translate-x-0 md:static md:w-64 md:h-screen'
      )}
    >
      <div className="h-16 flex items-center justify-center border-b">
        <h2 className="text-xl font-bold text-green-700">Marketer Panel</h2>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            onClick={() => setMobileOpen(false)}
            className={cn(
              'block px-4 py-2 rounded-lg text-sm font-medium transition',
              pathname === item.path
                ? 'bg-green-100 text-green-600 font-semibold'
                : 'text-green-700 hover:bg-green-200'
            )}
          >
            {item.name}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t bg-green-50 md:mt-auto">
        <button
          onClick={() => {
            localStorage.removeItem('token')
            window.location.href = '/marketer/login'
          }}
          className="w-full text-left text-sm text-red-600 hover:underline"
        >
          Logout
        </button>
      </div>
    </aside>
  )
}

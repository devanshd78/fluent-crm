'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ReactNode, useState } from 'react'
import { cn } from '@/lib/utils'
import { Menu, X, ChevronDown, ChevronUp } from 'lucide-react'

const navItems = [
  { name: 'Dashboard', path: '/admin/dashboard' },
  { name: 'Activity', path: '/admin/activity' },
  { name: 'Marketers', path: '/admin/marketers' },
  { name: 'Campaigns', path: '/admin/campaigns' },
  { name: 'Requests', path: '/admin/requests' },
  {
    name: 'Settings',
    path: '/admin/settings',
    children: [
      { name: 'User Access', path: '/admin/settings/user-access' }
    ],
  },
]


export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

  const toggleSidebar = () => setMobileOpen(!mobileOpen)

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 w-full h-16 bg-white border-b z-20 flex items-center px-4 justify-between">
        <h2 className="text-xl font-bold text-gray-800">Admin Panel</h2>
        <button onClick={toggleSidebar}>
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 h-full w-64 bg-white border-r shadow-sm z-30 transform transition-transform duration-200 ease-in-out flex flex-col',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
          'md:translate-x-0 md:static md:w-64 md:h-screen'
        )}
      >
        <div className="h-16 flex items-center justify-center border-b">
          <h2 className="text-xl font-bold text-purple-800">Admin Panel</h2>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) =>
            !item.children ? (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'block px-4 py-2 rounded-lg text-sm font-medium transition hover:bg-purple-200',
                  pathname === item.path
                    ? 'bg-purple-100 text-purple-600'
                    : 'text-gray-700'
                )}
              >
                {item.name}
              </Link>
            ) : (
              <div key={item.name}>
                <button
                  onClick={() => setSettingsOpen(!settingsOpen)}
                  className="flex items-center justify-between w-full px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100"
                >
                  {item.name}
                  {settingsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                {settingsOpen && (
                  <div className="pl-6 mt-1 space-y-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.path}
                        href={child.path}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          'block px-3 py-1 rounded-md text-sm transition hover:bg-gray-100',
                          pathname === child.path
                            ? 'bg-gray-100 text-blue-600'
                            : 'text-gray-600'
                        )}
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )
          )}
        </nav>

        <div className="p-4 border-t md:mt-auto">
         

          <button
            onClick={() => {
              localStorage.removeItem('token')
              window.location.href = '/admin/login'
            }}
            className="w-full text-left text-sm text-red-600 hover:underline"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 pt-20 md:pt-6 overflow-y-auto w-full bg-purple-50">{children}</main>
    </div>
  )
}

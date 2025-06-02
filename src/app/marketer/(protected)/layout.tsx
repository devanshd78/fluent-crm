'use client'

import { ReactNode, useState } from 'react'
import MarketerSidebar from '@/app/components/marketerLayout'
import TopBar from '@/app/components/marketerTop'
import { Menu, X } from 'lucide-react'

export default function MarketerLayout({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  const toggleSidebar = () => setMobileOpen(!mobileOpen)

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 w-full h-16 bg-white border-b z-20 flex items-center px-4 justify-between">
        <h2 className="text-xl font-bold text-gray-800">Marketer Panel</h2>
        <button onClick={toggleSidebar}>
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <MarketerSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar (hidden on mobile) */}
        <div className="hidden md:block sticky top-0 z-10">
          <TopBar />
        </div>

        {/* Main Content */}
        <main className="flex-1 p-6 pt-6 md:pt-4 overflow-y-auto w-full">
          {children}
        </main>
      </div>
    </div>
  )
}

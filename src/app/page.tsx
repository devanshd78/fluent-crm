'use client'

import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  const handleLoginClick = () => {
    router.push('/marketer/login')
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-indigo-50 to-white">
      {/* Logo / Branding */}
      <div className="mb-12 flex flex-col items-center">
        {/* Replace with your own logo if you have one */}
        <div className="h-16 w-16 bg-indigo-600 rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-2xl">M</span>
        </div>
        <h1 className="mt-4 text-4xl font-extrabold text-gray-900">
          Welcome to Mail CRM
        </h1>
        <p className="mt-2 text-gray-600">
          Your hub for streamlined email campaigns
        </p>
      </div>

      {/* Login Button */}
      <button
        onClick={handleLoginClick}
        className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md shadow-md transition"
      >
        Marketer Login
      </button>

      {/* Optional: Add some footer or extra links */}
      <footer className="mt-16 text-gray-500 text-sm">
        © {new Date().getFullYear()} Mail CRM. All rights reserved.
      </footer>
    </div>
  )
}

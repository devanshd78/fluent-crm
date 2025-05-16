'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Swal from 'sweetalert2'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { post } from '@/lib/api'

export default function MarketerLoginPage() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isRegistering, setIsRegistering] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const resetForm = () => {
    setName('')
    setEmail('')
    setPhoneNumber('')
    setPassword('')
    setConfirmPassword('')
  }

  const toggleForm = () => {
    resetForm()
    setIsRegistering(!isRegistering)
  }

const showAlert = (
  icon: 'success' | 'error' | 'warning',
  title: string,
  text: string
) => {
  Swal.fire({
    icon,
    title,
    text,
    showConfirmButton: false,
    timer: 1500,
    timerProgressBar: true,
    position: 'center',
  })
}


  const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault()
  if (loading) return
  setLoading(true)

  if (!email.trim() || !password.trim()) {
    showAlert('error', 'Missing fields', 'Email and password are required')
    setLoading(false)
    return
  }

  try {
    const res = await post('/marketer/login', {
      email: email.trim().toLowerCase(),
      password
    })

    if (res?.status === 'success' && res?.data?.token && res?.data?.role === 'marketer') {
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('userId', res.data.marketerId)
      showAlert('success', 'Login successful', 'Welcome back, Marketer!')
      router.push('/marketer/dashboard')
    } else {
      showAlert('error', 'Login failed', res?.message || 'Invalid credentials')
    }
  } catch (err: any) {
    showAlert(
      'error',
      'Error',
      err?.response?.data?.message || err?.message || 'Something went wrong.'
    )
  } finally {
    setLoading(false)
  }
}

const handleRegister = async (e: React.FormEvent) => {
  e.preventDefault()
  if (loading) return
  setLoading(true)

  // Validation
  if (!name.trim() || !email.trim() || !phoneNumber.trim() || !password || !confirmPassword) {
    showAlert('error', 'Missing fields', 'All fields are required')
    setLoading(false)
    return
  }

  if (!/^\+?\d{10,15}$/.test(phoneNumber.trim())) {
    showAlert('error', 'Invalid format', 'Enter a valid phone number')
    setLoading(false)
    return
  }

  if (password !== confirmPassword) {
    showAlert('error', 'Password mismatch', 'Passwords do not match')
    setLoading(false)
    return
  }

  if (password.length < 6) {
    showAlert('error', 'Weak password', 'Password must be at least 6 characters')
    setLoading(false)
    return
  }

  try {
    const res = await post('/marketer/register', {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phoneNumber: phoneNumber.trim(),
      password,
      role: 'marketer'
    })

    if (res?.status === 'pending') {
      showAlert('success', 'Submitted', 'Signup submitted. Awaiting admin approval.')
      setIsRegistering(false)
      resetForm()
    } else {
      showAlert('error', 'Registration failed', res?.message || 'Something went wrong')
    }
  } catch (err: any) {
    showAlert(
      'error',
      'Error',
      err?.response?.data?.message || err?.message || 'Something went wrong.'
    )
  } finally {
    setLoading(false)
  }
}

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-semibold text-gray-900">
            {isRegistering ? 'Marketer Register' : 'Marketer Login'}
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            {isRegistering
              ? 'Create a new marketer account'
              : 'Access your marketer dashboard'}
          </p>
        </div>

        <form
          onSubmit={isRegistering ? handleRegister : handleLogin}
          className="space-y-4"
        >
          {isRegistering && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <Input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <Input
                  type="tel"
                  placeholder="+1 123 456 7890"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <Input
              type="email"
              placeholder="marketer@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          {isRegistering && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          )}

          <Button
            type="submit"
            className="w-full mt-4 py-2 bg-blue-600 text-white rounded-md shadow-md hover:bg-blue-700 disabled:opacity-50"
            disabled={loading}
          >
            {loading
              ? isRegistering
                ? 'Submitting...'
                : 'Authenticating...'
              : isRegistering
              ? 'Register'
              : 'Login'}
          </Button>
        </form>

        <div className="text-center text-sm text-gray-600 mt-4">
          {isRegistering ? (
            <p>
              Already have an account?{' '}
              <button
                className="text-blue-600 underline cursor-pointer"
                onClick={toggleForm}
                disabled={loading}
              >
                Login here
              </button>
            </p>
          ) : (
            <>
              <p>
                Don’t have an account?{' '}
                <button
                  className="text-blue-600 underline cursor-pointer"
                  onClick={toggleForm}
                  disabled={loading}
                >
                  Register
                </button>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                This page is for Marketers only
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

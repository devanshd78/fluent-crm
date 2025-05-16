'use client'

export async function loginUser(email: string, password: string) {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })

  if (!res.ok) throw new Error('Login failed')

  const data = await res.json()
  return {
    success: true,
    role: data.role,
  }
}

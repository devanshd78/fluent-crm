// /app/admin/(protected)/layout.tsx
import AdminLayout from '@/app/components/adminLayout'
import type { ReactNode } from 'react'

export default function ProtectedAdminLayout({ children }: { children: ReactNode }) {
    return <AdminLayout>{children}</AdminLayout>
}

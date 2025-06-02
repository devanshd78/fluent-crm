// app/admin/(protected)/campaigns/view/page.tsx
import React, { Suspense } from 'react'
import ActivityViewPage from './contactsPage'

export default function ViewContacsPage() {
  return (
    <Suspense fallback={<div className="p-4 text-gray-600">Loading campaign…</div>}>
      <ActivityViewPage />
    </Suspense>
  )
}

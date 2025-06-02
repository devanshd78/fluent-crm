// app/admin/(protected)/campaigns/view/page.tsx
import React, { Suspense } from 'react'
import ViewCampaignPage from './campaignPage'

export default function ViewContacsPage() {
  return (
    <Suspense fallback={<div className="p-4 text-gray-600">Loading campaign…</div>}>
      <ViewCampaignPage />
    </Suspense>
  )
}

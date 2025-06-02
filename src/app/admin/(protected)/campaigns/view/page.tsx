// app/admin/(protected)/campaigns/view/page.tsx
import React, { Suspense } from 'react'
import ViewCampaignClient from './campaignPage'

export default function ViewCampaignPage() {
  return (
    <Suspense fallback={<div className="p-4 text-gray-600">Loading campaign…</div>}>
      <ViewCampaignClient />
    </Suspense>
  )
}

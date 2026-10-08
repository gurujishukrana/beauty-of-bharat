import type { Metadata } from 'next'

import { LegalPage } from '@/components/LegalPage'
import { getPageBySlug, pageMetadata } from '@/lib/pages'
import { routes } from '@/lib/url'

export async function generateMetadata(): Promise<Metadata> {
  const { page } = await getPageBySlug('privacy')
  return pageMetadata(page, routes.privacy, 'Privacy Policy')
}

export default function PrivacyPage() {
  return <LegalPage slug="privacy" />
}

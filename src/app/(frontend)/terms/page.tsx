import type { Metadata } from 'next'

import { LegalPage } from '@/components/LegalPage'
import { getPageBySlug, pageMetadata } from '@/lib/pages'
import { routes } from '@/lib/url'

export async function generateMetadata(): Promise<Metadata> {
  const { page } = await getPageBySlug('terms')
  return pageMetadata(page, routes.terms, 'Terms of Use')
}

export default function TermsPage() {
  return <LegalPage slug="terms" />
}

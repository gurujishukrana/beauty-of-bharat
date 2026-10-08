import type { Metadata } from 'next'

import { ErrorView } from '@/components/ErrorView'
import { copy } from '@/lib/copy'

export const metadata: Metadata = {
  title: copy.notFound.kicker,
  robots: { index: false },
}

export default function NotFound() {
  return <ErrorView kicker={copy.notFound.kicker} title={copy.notFound.title} text={copy.notFound.text} />
}

import { notFound } from 'next/navigation'

// Any URL no other route matches renders the styled 404 inside the site layout.
export default function CatchAll() {
  notFound()
}

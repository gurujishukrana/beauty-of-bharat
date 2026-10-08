'use client'

import { RefreshRouteOnSave } from '@payloadcms/live-preview-react'
import { useRouter } from 'next/navigation'

/**
 * Shown only in draft mode: refreshes the page when the editor saves (Live Preview)
 * and offers a way back to the published version.
 */
export function PreviewBar({ path }: { path: string }) {
  const router = useRouter()
  return (
    <>
      <RefreshRouteOnSave
        refresh={() => router.refresh()}
        serverURL={process.env.NEXT_PUBLIC_SITE_URL || ''}
      />
      <div className="sticky top-0 z-40 flex items-center justify-between gap-4 bg-navy px-4 py-2 text-[13px] text-white">
        <span>
          <strong className="font-semibold">Preview</strong> — you are seeing unpublished changes.
        </span>
        <a
          href={`/next/exit-preview?path=${encodeURIComponent(path)}`}
          className="font-semibold text-white underline underline-offset-2 hover:text-white"
        >
          Exit preview
        </a>
      </div>
    </>
  )
}

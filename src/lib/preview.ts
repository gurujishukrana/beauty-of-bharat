/** Draft-mode URL for the admin "Preview" button and Live Preview iframe. */
export function previewPath(path: string): string {
  const params = new URLSearchParams({ path, previewSecret: process.env.PREVIEW_SECRET || '' })
  return `/next/preview?${params.toString()}`
}

/**
 * Video embeds are allowlisted: only YouTube, Vimeo and Instagram URLs are accepted,
 * and the iframe URL is always built here (never taken from the editor's input).
 */
export type VideoProvider = 'youtube' | 'vimeo' | 'instagram'

export type ParsedVideo = {
  provider: VideoProvider
  id: string
  embedUrl: string
  aspect: '16/9' | '4/5'
}

const YT_ID = /^[A-Za-z0-9_-]{11}$/
const VIMEO_ID = /^\d{6,12}$/
const IG_ID = /^[A-Za-z0-9_-]{5,40}$/

export function parseVideoUrl(input: string | null | undefined): ParsedVideo | null {
  if (!input) return null
  let url: URL
  try {
    url = new URL(input.trim())
  } catch {
    return null
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null
  const host = url.hostname.replace(/^(www|m)\./, '')
  const segments = url.pathname.split('/').filter(Boolean)

  if (host === 'youtu.be') {
    const id = segments[0]
    return id && YT_ID.test(id) ? youtube(id) : null
  }
  if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    let id: string | null = null
    if (segments[0] === 'watch') id = url.searchParams.get('v')
    else if (['embed', 'shorts', 'live', 'v'].includes(segments[0] ?? '')) id = segments[1] ?? null
    return id && YT_ID.test(id) ? youtube(id) : null
  }
  if (host === 'vimeo.com' || host === 'player.vimeo.com') {
    const id = segments.find((s) => VIMEO_ID.test(s))
    return id
      ? {
          provider: 'vimeo',
          id,
          embedUrl: `https://player.vimeo.com/video/${id}?dnt=1&autoplay=1`,
          aspect: '16/9',
        }
      : null
  }
  if (host === 'instagram.com') {
    const [kind, id] = segments
    if ((kind === 'p' || kind === 'reel' || kind === 'tv') && id && IG_ID.test(id)) {
      return {
        provider: 'instagram',
        id,
        embedUrl: `https://www.instagram.com/${kind}/${id}/embed`,
        aspect: '4/5',
      }
    }
  }
  return null
}

function youtube(id: string): ParsedVideo {
  return {
    provider: 'youtube',
    id,
    embedUrl: `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`,
    aspect: '16/9',
  }
}

export const VIDEO_URL_HELP = 'Paste a YouTube, Vimeo or Instagram (post or reel) link.'

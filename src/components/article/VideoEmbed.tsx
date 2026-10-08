'use client'

import Image from 'next/image'
import { useState } from 'react'

import { PlayIcon } from '@/components/Icons'
import { copy } from '@/lib/copy'
import type { ImageData } from '@/lib/media'
import type { ParsedVideo } from '@/lib/video'

/**
 * Click-to-load video facade: shows a poster and play button; the third-party iframe
 * (youtube-nocookie / Vimeo / Instagram) is only created after the reader presses play.
 */
export function VideoEmbed({
  video,
  poster,
  title,
  duration,
  caption,
}: {
  video: ParsedVideo
  poster: ImageData | null
  title: string
  duration?: string | null
  caption?: string | null
}) {
  const [playing, setPlaying] = useState(false)
  const aspect = video.aspect === '4/5' ? '4/5' : '16/9'

  return (
    <figure className="my-8 sm:my-10">
      <div
        className={`relative overflow-hidden rounded-xs bg-ink ${video.aspect === '4/5' ? 'mx-auto max-w-[480px]' : ''}`}
        style={{ aspectRatio: aspect }}
      >
        {playing ? (
          <iframe
            src={video.embedUrl}
            title={title}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            className="absolute inset-0 h-full w-full border-0"
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            aria-label={`${copy.article.playVideo}: ${title}`}
            className="group absolute inset-0 flex items-center justify-center"
          >
            {poster ? (
              <Image
                src={poster.url}
                alt=""
                fill
                sizes="(max-width: 759px) 100vw, 700px"
                className="object-cover"
                style={{ objectPosition: poster.position }}
              />
            ) : null}
            <span className="relative flex h-[60px] w-[60px] items-center justify-center rounded-full bg-white text-ink transition-transform group-hover:scale-105 sm:h-[72px] sm:w-[72px]">
              <PlayIcon size={24} />
            </span>
          </button>
        )}
      </div>
      <figcaption className="mt-2 font-sans text-xs text-subtle sm:mt-3 sm:text-[13px]">
        {[copy.article.video, duration, caption || null].filter(Boolean).join(' · ')}
        <span className="max-sm:hidden"> · {copy.article.videoLoadsOnPlay}</span>
      </figcaption>
    </figure>
  )
}

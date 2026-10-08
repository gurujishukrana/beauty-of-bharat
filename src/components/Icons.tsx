import type { SVGProps } from 'react'

/** Simple 24×24 stroke icons matching the design files. Decorative by default (aria-hidden). */
type IconProps = SVGProps<SVGSVGElement> & { size?: number }

function Svg({ size = 18, strokeWidth = 1.8, children, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  )
}

export const SearchIcon = (p: IconProps) => (
  <Svg strokeWidth={2} {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-3.5-3.5" />
  </Svg>
)
export const MenuIcon = (p: IconProps) => (
  <Svg size={22} strokeWidth={2} {...p}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </Svg>
)
export const CloseIcon = (p: IconProps) => (
  <Svg size={22} strokeWidth={2} {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </Svg>
)
export const ArrowRightIcon = (p: IconProps) => (
  <Svg size={16} strokeWidth={2} {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Svg>
)
export const InstagramIcon = (p: IconProps) => (
  <Svg size={16} {...p}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" />
  </Svg>
)
export const YouTubeIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="2" y="5" width="20" height="14" rx="4" />
    <path d="M10 9l5 3-5 3z" />
  </Svg>
)
export const WhatsAppIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 20l1.3-4A8 8 0 1 1 8 18.7z" />
  </Svg>
)
export const XIcon = (p: IconProps) => (
  <Svg size={16} {...p}>
    <path d="M4 4l16 16M20 4L4 20" />
  </Svg>
)
export const FacebookIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M14 8h3V4h-3a4 4 0 0 0-4 4v2H7v4h3v6h4v-6h3l1-4h-4V8z" />
  </Svg>
)
export const LinkedInIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3" y="3" width="18" height="18" rx="3" />
    <path d="M8 10v7M8 7v.01M12 17v-4a2 2 0 0 1 4 0v4M12 10v7" />
  </Svg>
)
export const GlobeIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
  </Svg>
)
export const MailIcon = (p: IconProps) => (
  <Svg size={16} {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3 7l9 6 9-6" />
  </Svg>
)
export const LinkIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" />
    <path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />
  </Svg>
)
export const CheckIcon = (p: IconProps) => (
  <Svg strokeWidth={2} {...p}>
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </Svg>
)
export const ShareIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 3v12M7 8l5-5 5 5" />
    <path d="M5 13v6h14v-6" />
  </Svg>
)
export const ShieldCheckIcon = (p: IconProps) => (
  <Svg size={14} strokeWidth={2} {...p}>
    <path d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6z" />
    <path d="M8.5 12l2.5 2.5 4.5-5" />
  </Svg>
)
export const PinIcon = (p: IconProps) => (
  <Svg size={13} strokeWidth={2} {...p}>
    <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z" />
    <circle cx="12" cy="9.5" r="2.5" />
  </Svg>
)
export const CameraIcon = (p: IconProps) => (
  <Svg size={14} {...p}>
    <path d="M4 8h3l2-3h6l2 3h3v11H4z" />
    <circle cx="12" cy="13" r="3.5" />
  </Svg>
)
export const PlayIcon = ({ size = 26, ...p }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false" {...p}>
    <path d="M8 5l12 7-12 7z" />
  </svg>
)

export const SOCIAL_ICONS = {
  instagram: InstagramIcon,
  x: XIcon,
  youtube: YouTubeIcon,
  linkedin: LinkedInIcon,
  facebook: FacebookIcon,
  whatsapp: WhatsAppIcon,
  website: GlobeIcon,
  email: MailIcon,
} as const

export const SOCIAL_LABELS: Record<keyof typeof SOCIAL_ICONS, string> = {
  instagram: 'Instagram',
  x: 'X / Twitter',
  youtube: 'YouTube',
  linkedin: 'LinkedIn',
  facebook: 'Facebook',
  whatsapp: 'WhatsApp channel',
  website: 'Website',
  email: 'Email',
}

/* eslint-disable @next/next/no-img-element */
/** Admin branding: full logo on the login screen, mark in the nav. */
export function Logo() {
  return (
    <img
      src="/brand/logo-color.svg"
      alt="Beauty of Bharat"
      style={{ height: 40, width: 'auto', maxWidth: '100%' }}
    />
  )
}

export function Icon() {
  return <img src="/brand/mark-color.svg" alt="Beauty of Bharat" style={{ height: 28, width: 28 }} />
}

export function getServerURL() {
  return process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
}

export function getR2PublicURL() {
  return process.env.R2_PUBLIC_URL?.replace(/\/$/, '') ?? ''
}

export function isR2Configured() {
  return Boolean(
    process.env.R2_BUCKET &&
      process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_SECRET_ACCESS_KEY &&
      process.env.R2_ENDPOINT &&
      process.env.R2_PUBLIC_URL,
  )
}

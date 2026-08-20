export const MAX_UPLOAD_MB = 30
export const MAX_UPLOAD_BYTES = MAX_UPLOAD_MB * 1024 * 1024

export function uploadSizeError(filesize: number | null | undefined): string | true {
  if (typeof filesize === 'number' && filesize > MAX_UPLOAD_BYTES) {
    return `File must be ${MAX_UPLOAD_MB} MB or smaller. Use a compressed H.264 MP4 around 1080p.`
  }

  return true
}

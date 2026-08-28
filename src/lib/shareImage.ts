import { toBlob } from 'html-to-image'

/** Renders `node` to a PNG blob so it can be previewed before sharing/saving. */
export async function captureNodeImage(node: HTMLElement): Promise<Blob> {
  const blob = await toBlob(node, {
    cacheBust: true,
    pixelRatio: 2,
    backgroundColor: '#FFFDFC',
  })
  if (!blob) throw new Error('สร้างรูปภาพไม่สำเร็จ')
  return blob
}

async function fetchImageBlob(url: string): Promise<Blob> {
  const res = await fetch(url)
  if (!res.ok) throw new Error('โหลดรูปภาพไม่สำเร็จ')
  return res.blob()
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export interface ShareImageOptions {
  filename: string
  title?: string
  text?: string
}

/**
 * Opens the native share sheet for `blob` when the browser/device supports
 * sharing files, falling back to a plain download otherwise (or when sharing
 * itself fails for a reason other than the user simply closing the sheet).
 */
export async function shareBlob(blob: Blob, { filename, title, text }: ShareImageOptions): Promise<void> {
  const file = new File([blob], filename, { type: blob.type || 'image/png' })

  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title, text })
      return
    } catch (err) {
      // AbortError means the user simply closed the share sheet — not a failure.
      if (err instanceof Error && err.name === 'AbortError') return
      // Fall through to download if sharing itself failed for another reason.
    }
  }

  downloadBlob(blob, filename)
}

/** Fetches the image at `url` and always saves it as a plain file download. */
export async function downloadImageFromUrl(url: string, filename: string): Promise<void> {
  const blob = await fetchImageBlob(url)
  downloadBlob(blob, filename)
}

/** Fetches the image at `url` and shares it (see shareBlob). */
export async function shareImageFromUrl(url: string, options: ShareImageOptions): Promise<void> {
  const blob = await fetchImageBlob(url)
  await shareBlob(blob, options)
}

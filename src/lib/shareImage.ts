import { toBlob } from 'html-to-image'

async function renderNodeToBlob(node: HTMLElement): Promise<Blob> {
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

function downloadBlob(blob: Blob, filename: string): void {
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
async function shareOrDownloadBlob(blob: Blob, { filename, title, text }: ShareImageOptions): Promise<void> {
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

/** Renders `node` to a PNG and always saves it as a plain file download. */
export async function downloadImage(node: HTMLElement, filename: string): Promise<void> {
  const blob = await renderNodeToBlob(node)
  downloadBlob(blob, filename)
}

/** Renders `node` to a PNG and shares it (see shareOrDownloadBlob). */
export async function shareImage(node: HTMLElement, options: ShareImageOptions): Promise<void> {
  const blob = await renderNodeToBlob(node)
  await shareOrDownloadBlob(blob, options)
}

/** Fetches the image at `url` and always saves it as a plain file download. */
export async function downloadImageFromUrl(url: string, filename: string): Promise<void> {
  const blob = await fetchImageBlob(url)
  downloadBlob(blob, filename)
}

/** Fetches the image at `url` and shares it (see shareOrDownloadBlob). */
export async function shareImageFromUrl(url: string, options: ShareImageOptions): Promise<void> {
  const blob = await fetchImageBlob(url)
  await shareOrDownloadBlob(blob, options)
}

import { toBlob } from 'html-to-image'

export interface CaptureShareOptions {
  filename: string
  title?: string
  text?: string
}

/**
 * Renders `node` to a PNG and either opens the native share sheet (when the
 * browser/device supports sharing files) or falls back to a plain download.
 */
export async function captureAndShareImage(node: HTMLElement, { filename, title, text }: CaptureShareOptions): Promise<void> {
  const blob = await toBlob(node, {
    cacheBust: true,
    pixelRatio: 2,
    backgroundColor: '#FFFDFC',
  })
  if (!blob) throw new Error('สร้างรูปภาพไม่สำเร็จ')

  const file = new File([blob], filename, { type: 'image/png' })

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

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

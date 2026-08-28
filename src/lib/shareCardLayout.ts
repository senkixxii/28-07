export type ShareAspectRatio = 'story' | 'portrait' | 'square'

export interface ShareCardDimensions {
  width: number
  height: number
  photoHeight: number
  messageLines: number
  label: string
}

export const SHARE_ASPECT_RATIOS: Record<ShareAspectRatio, ShareCardDimensions> = {
  story: { width: 1080, height: 1920, photoHeight: 1080, messageLines: 10, label: 'สตอรี่ 9:16' },
  portrait: { width: 1080, height: 1350, photoHeight: 760, messageLines: 5, label: 'โพสต์ 4:5' },
  square: { width: 1080, height: 1080, photoHeight: 620, messageLines: 2, label: 'จัตุรัส 1:1' },
}

export interface FocalPoint {
  x: number
  y: number
}

export const DEFAULT_FOCAL_POINT: FocalPoint = { x: 50, y: 50 }

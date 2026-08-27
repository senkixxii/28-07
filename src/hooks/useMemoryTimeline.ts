import { useMemo } from 'react'
import { useAnniversaries } from './useAnniversaries'
import { useLetters } from './useLetters'
import { useGalleryImages } from './useGalleryImages'
import type { PhotoLayout } from '@/types'

export type MemoryKind = 'anniversary' | 'letter' | 'photo'

export interface MemoryEntry {
  id: string
  kind: MemoryKind
  date: string
  title: string
  message: string | null
  images: string[]
  layout: PhotoLayout
  linkTo: string
}

/** Merges anniversaries, letters, and gallery photos into one chronological timeline. */
export function useMemoryTimeline() {
  const { anniversaries, loading: anniversariesLoading } = useAnniversaries()
  const { letters, loading: lettersLoading } = useLetters()
  const { images, loading: imagesLoading } = useGalleryImages()

  const entries = useMemo<MemoryEntry[]>(() => {
    const anniversaryEntries: MemoryEntry[] = anniversaries.map((a) => ({
      id: `anniversary-${a.id}`,
      kind: 'anniversary',
      date: a.anniversary_date,
      title: a.title,
      message: a.message,
      images: a.anniversary_images.map((img) => img.image_url),
      layout: a.photo_layout,
      linkTo: `/anniversaries/${a.id}`,
    }))

    const letterEntries: MemoryEntry[] = letters.map((l) => ({
      id: `letter-${l.id}`,
      kind: 'letter',
      date: l.letter_date,
      title: l.title,
      message: l.message,
      images: l.image_url ? [l.image_url] : [],
      layout: 'single',
      linkTo: '/letters',
    }))

    const photoEntries: MemoryEntry[] = images.map((img) => ({
      id: `photo-${img.id}`,
      kind: 'photo',
      date: img.created_at,
      title: img.caption ?? '',
      message: null,
      images: [img.image_url],
      layout: 'single',
      linkTo: '/photos',
    }))

    return [...anniversaryEntries, ...letterEntries, ...photoEntries].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    )
  }, [anniversaries, letters, images])

  return { entries, loading: anniversariesLoading || lettersLoading || imagesLoading }
}

import type { Database } from './database'

type Tables = Database['public']['Tables']

export type Profile = Tables['profiles']['Row']
export type CoupleSettings = Tables['couple_settings']['Row']
export type AnniversaryImage = Tables['anniversary_images']['Row']
export type Letter = Tables['letters']['Row']
export type GalleryImage = Tables['gallery_images']['Row']

export type PhotoLayout = 'single' | 'grid' | 'stack'

export interface Anniversary extends Omit<Tables['anniversaries']['Row'], 'photo_layout'> {
  photo_layout: PhotoLayout
}

export interface AnniversaryWithImages extends Anniversary {
  anniversary_images: AnniversaryImage[]
}

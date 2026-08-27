import type { Database } from './database'

type Tables = Database['public']['Tables']

export type Profile = Tables['profiles']['Row']
export type CoupleSettings = Tables['couple_settings']['Row']
export type Anniversary = Tables['anniversaries']['Row']
export type AnniversaryImage = Tables['anniversary_images']['Row']
export type Letter = Tables['letters']['Row']
export type GalleryImage = Tables['gallery_images']['Row']

export interface AnniversaryWithImages extends Anniversary {
  anniversary_images: AnniversaryImage[]
}

import type { Database } from './database'

type Tables = Database['public']['Tables']

export type Profile = Tables['profiles']['Row']
export type CoupleSettings = Tables['couple_settings']['Row']
export type Memory = Tables['memories']['Row']
export type MemoryImage = Tables['memory_images']['Row']
export type Anniversary = Tables['anniversaries']['Row']
export type Letter = Tables['letters']['Row']

export interface MemoryWithImages extends Memory {
  memory_images: MemoryImage[]
}

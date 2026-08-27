import { supabase } from './supabase'
import { slugifyFilename } from './utils'

const BUCKET = 'love-book-images'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export interface ValidationResult {
  valid: boolean
  error?: string
}

export function validateImageFile(file: File): ValidationResult {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: 'รองรับเฉพาะไฟล์รูปภาพ JPG, PNG, WEBP หรือ GIF นะ' }
  }
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: 'ไฟล์ใหญ่เกินไป (สูงสุด 10MB นะ)' }
  }
  return { valid: true }
}

export interface UploadedImage {
  imageUrl: string
  storagePath: string
}

/**
 * Uploads one image under `{userId}/{folder}/{filename}` — that path shape
 * is required by the storage RLS policies (first segment must equal auth.uid()).
 */
export async function uploadLoveBookImage(userId: string, folder: string, file: File): Promise<UploadedImage> {
  const validation = validateImageFile(file)
  if (!validation.valid) throw new Error(validation.error)

  const path = `${userId}/${folder}/${slugifyFilename(file.name)}`

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type,
  })
  if (error) throw error

  const { data: publicUrlData } = supabase.storage.from(BUCKET).getPublicUrl(path)

  return { imageUrl: publicUrlData.publicUrl, storagePath: path }
}

export async function deleteLoveBookImage(storagePath: string): Promise<void> {
  const { error } = await supabase.storage.from(BUCKET).remove([storagePath])
  if (error) throw error
}

export async function deleteLoveBookFolder(userId: string, folder: string): Promise<void> {
  const { data, error } = await supabase.storage.from(BUCKET).list(`${userId}/${folder}`)
  if (error || !data || data.length === 0) return
  const paths = data.map((f) => `${userId}/${folder}/${f.name}`)
  await supabase.storage.from(BUCKET).remove(paths)
}

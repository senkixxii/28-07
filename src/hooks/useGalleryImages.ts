import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import type { GalleryImage } from '@/types'

export function useGalleryImages() {
  const { user } = useAuth()
  const [images, setImages] = useState<GalleryImage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<unknown>(null)

  const refresh = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    const { data, error: err } = await supabase
      .from('gallery_images')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (err) setError(err)
    else setImages(data ?? [])
    setLoading(false)
  }, [user])

  useEffect(() => {
    refresh()
  }, [refresh])

  const addImage = useCallback(
    async (input: Omit<GalleryImage, 'id' | 'created_at' | 'user_id'>) => {
      if (!user) throw new Error('not authenticated')
      const { data, error: err } = await supabase
        .from('gallery_images')
        .insert({ ...input, user_id: user.id })
        .select('*')
        .single()
      if (err) throw err
      return data
    },
    [user],
  )

  const deleteImage = useCallback(async (id: string) => {
    const { error: err } = await supabase.from('gallery_images').delete().eq('id', id)
    if (err) throw err
  }, [])

  return { images, loading, error, refresh, addImage, deleteImage }
}

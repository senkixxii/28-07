import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { useCouple } from '@/contexts/CoupleContext'
import type { Anniversary, AnniversaryImage, AnniversaryWithImages } from '@/types'

export function useAnniversaries() {
  const { user } = useAuth()
  const { coupleId } = useCouple()
  const [anniversaries, setAnniversaries] = useState<AnniversaryWithImages[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<unknown>(null)

  const refresh = useCallback(async () => {
    if (!coupleId) return
    setLoading(true)
    setError(null)
    const { data, error: err } = await supabase
      .from('anniversaries')
      .select('*, anniversary_images(*)')
      .eq('couple_id', coupleId)
      .order('anniversary_date', { ascending: true })

    if (err) setError(err)
    else {
      const sorted = (data ?? []).map((a) => ({
        ...a,
        anniversary_images: [...a.anniversary_images].sort((x, y) => x.sort_order - y.sort_order),
      })) as AnniversaryWithImages[]
      setAnniversaries(sorted)
    }
    setLoading(false)
  }, [coupleId])

  useEffect(() => {
    refresh()
  }, [refresh])

  const createAnniversary = useCallback(
    async (input: Omit<Anniversary, 'id' | 'user_id' | 'couple_id' | 'created_at' | 'updated_at'>) => {
      if (!user || !coupleId) throw new Error('not authenticated')
      const { data, error: err } = await supabase
        .from('anniversaries')
        .insert({ ...input, user_id: user.id, couple_id: coupleId })
        .select('*')
        .single()
      if (err) throw err
      return data
    },
    [user, coupleId],
  )

  const updateAnniversary = useCallback(async (id: string, patch: Partial<Anniversary>) => {
    const { data, error: err } = await supabase
      .from('anniversaries')
      .update(patch)
      .eq('id', id)
      .select('*')
      .single()
    if (err) throw err
    return data
  }, [])

  const deleteAnniversary = useCallback(async (id: string) => {
    const { error: err } = await supabase.from('anniversaries').delete().eq('id', id)
    if (err) throw err
  }, [])

  const addAnniversaryImage = useCallback(
    async (input: Omit<AnniversaryImage, 'id' | 'created_at' | 'user_id' | 'couple_id'>) => {
      if (!user || !coupleId) throw new Error('not authenticated')
      const { data, error: err } = await supabase
        .from('anniversary_images')
        .insert({ ...input, user_id: user.id, couple_id: coupleId })
        .select('*')
        .single()
      if (err) throw err
      return data
    },
    [user, coupleId],
  )

  const removeAnniversaryImage = useCallback(async (id: string) => {
    const { error: err } = await supabase.from('anniversary_images').delete().eq('id', id)
    if (err) throw err
  }, [])

  const reorderAnniversaryImages = useCallback(async (images: { id: string; sort_order: number }[]) => {
    await Promise.all(
      images.map(({ id, sort_order }) => supabase.from('anniversary_images').update({ sort_order }).eq('id', id)),
    )
  }, [])

  return {
    anniversaries,
    loading,
    error,
    refresh,
    createAnniversary,
    updateAnniversary,
    deleteAnniversary,
    addAnniversaryImage,
    removeAnniversaryImage,
    reorderAnniversaryImages,
  }
}

export function useAnniversary(id: string | undefined) {
  const { coupleId } = useCouple()
  const [anniversary, setAnniversary] = useState<AnniversaryWithImages | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<unknown>(null)

  const refresh = useCallback(async () => {
    if (!coupleId || !id) return
    setLoading(true)
    setError(null)
    const { data, error: err } = await supabase
      .from('anniversaries')
      .select('*, anniversary_images(*)')
      .eq('id', id)
      .eq('couple_id', coupleId)
      .maybeSingle()

    if (err) setError(err)
    else if (data) {
      setAnniversary({
        ...data,
        anniversary_images: [...data.anniversary_images].sort((x, y) => x.sort_order - y.sort_order),
      } as AnniversaryWithImages)
    } else {
      setAnniversary(null)
    }
    setLoading(false)
  }, [coupleId, id])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { anniversary, loading, error, refresh }
}

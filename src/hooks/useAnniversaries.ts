import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import type { Anniversary } from '@/types'

export function useAnniversaries() {
  const { user } = useAuth()
  const [anniversaries, setAnniversaries] = useState<Anniversary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<unknown>(null)

  const refresh = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    const { data, error: err } = await supabase
      .from('anniversaries')
      .select('*')
      .eq('user_id', user.id)
      .order('anniversary_date', { ascending: true })

    if (err) setError(err)
    else setAnniversaries(data ?? [])
    setLoading(false)
  }, [user])

  useEffect(() => {
    refresh()
  }, [refresh])

  const createAnniversary = useCallback(
    async (input: Omit<Anniversary, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user) throw new Error('not authenticated')
      const { data, error: err } = await supabase
        .from('anniversaries')
        .insert({ ...input, user_id: user.id })
        .select('*')
        .single()
      if (err) throw err
      return data
    },
    [user],
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

  return { anniversaries, loading, error, refresh, createAnniversary, updateAnniversary, deleteAnniversary }
}

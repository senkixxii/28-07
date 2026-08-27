import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import type { Letter } from '@/types'

export function useLetters() {
  const { user } = useAuth()
  const [letters, setLetters] = useState<Letter[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<unknown>(null)

  const refresh = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    const { data, error: err } = await supabase
      .from('letters')
      .select('*')
      .eq('user_id', user.id)
      .order('letter_date', { ascending: false })

    if (err) setError(err)
    else setLetters(data ?? [])
    setLoading(false)
  }, [user])

  useEffect(() => {
    refresh()
  }, [refresh])

  const createLetter = useCallback(
    async (input: Omit<Letter, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user) throw new Error('not authenticated')
      const { data, error: err } = await supabase
        .from('letters')
        .insert({ ...input, user_id: user.id })
        .select('*')
        .single()
      if (err) throw err
      return data
    },
    [user],
  )

  const updateLetter = useCallback(async (id: string, patch: Partial<Letter>) => {
    const { data, error: err } = await supabase
      .from('letters')
      .update(patch)
      .eq('id', id)
      .select('*')
      .single()
    if (err) throw err
    return data
  }, [])

  const deleteLetter = useCallback(async (id: string) => {
    const { error: err } = await supabase.from('letters').delete().eq('id', id)
    if (err) throw err
  }, [])

  return { letters, loading, error, refresh, createLetter, updateLetter, deleteLetter }
}

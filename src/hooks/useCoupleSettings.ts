import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import type { CoupleSettings } from '@/types'

export function useCoupleSettings() {
  const { user } = useAuth()
  const [settings, setSettings] = useState<CoupleSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<unknown>(null)

  const refresh = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    const { data, error: err } = await supabase
      .from('couple_settings')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    if (err) {
      setError(err)
    } else if (!data) {
      // Fallback in case the signup trigger hasn't created a row yet.
      const { data: created, error: createErr } = await supabase
        .from('couple_settings')
        .insert({ user_id: user.id })
        .select('*')
        .single()
      if (createErr) setError(createErr)
      else setSettings(created)
    } else {
      setSettings(data)
    }
    setLoading(false)
  }, [user])

  useEffect(() => {
    refresh()
  }, [refresh])

  const updateSettings = useCallback(
    async (patch: Partial<CoupleSettings>) => {
      if (!user) return
      const { data, error: err } = await supabase
        .from('couple_settings')
        .update(patch)
        .eq('user_id', user.id)
        .select('*')
        .single()
      if (err) throw err
      setSettings(data)
      return data
    },
    [user],
  )

  return { settings, loading, error, refresh, updateSettings }
}

import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useCouple } from '@/contexts/CoupleContext'
import type { CoupleSettings } from '@/types'

export function useCoupleSettings() {
  const { coupleId } = useCouple()
  const [settings, setSettings] = useState<CoupleSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<unknown>(null)

  const refresh = useCallback(async () => {
    if (!coupleId) return
    setLoading(true)
    setError(null)
    const { data, error: err } = await supabase
      .from('couple_settings')
      .select('*')
      .eq('couple_id', coupleId)
      .maybeSingle()

    if (err) {
      setError(err)
    } else if (!data) {
      const { data: created, error: createErr } = await supabase
        .from('couple_settings')
        .insert({ couple_id: coupleId })
        .select('*')
        .single()
      if (createErr) setError(createErr)
      else setSettings(created)
    } else {
      setSettings(data)
    }
    setLoading(false)
  }, [coupleId])

  useEffect(() => {
    refresh()
  }, [refresh])

  const updateSettings = useCallback(
    async (patch: Partial<CoupleSettings>) => {
      if (!coupleId) return
      const { data, error: err } = await supabase
        .from('couple_settings')
        .update(patch)
        .eq('couple_id', coupleId)
        .select('*')
        .single()
      if (err) throw err
      setSettings(data)
      return data
    },
    [coupleId],
  )

  return { settings, loading, error, refresh, updateSettings }
}

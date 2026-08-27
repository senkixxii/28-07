import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import type { Memory, MemoryImage, MemoryWithImages } from '@/types'

export function useMemories() {
  const { user } = useAuth()
  const [memories, setMemories] = useState<MemoryWithImages[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<unknown>(null)

  const refresh = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    const { data, error: err } = await supabase
      .from('memories')
      .select('*, memory_images(*)')
      .eq('user_id', user.id)
      .order('memory_date', { ascending: false })

    if (err) setError(err)
    else {
      const sorted = (data ?? []).map((m) => ({
        ...m,
        memory_images: [...m.memory_images].sort((a, b) => a.sort_order - b.sort_order),
      })) as MemoryWithImages[]
      setMemories(sorted)
    }
    setLoading(false)
  }, [user])

  useEffect(() => {
    refresh()
  }, [refresh])

  const createMemory = useCallback(
    async (input: Omit<Memory, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user) throw new Error('not authenticated')
      const { data, error: err } = await supabase
        .from('memories')
        .insert({ ...input, user_id: user.id })
        .select('*')
        .single()
      if (err) throw err
      return data
    },
    [user],
  )

  const updateMemory = useCallback(async (id: string, patch: Partial<Memory>) => {
    const { data, error: err } = await supabase
      .from('memories')
      .update(patch)
      .eq('id', id)
      .select('*')
      .single()
    if (err) throw err
    return data
  }, [])

  const deleteMemory = useCallback(async (id: string) => {
    const { error: err } = await supabase.from('memories').delete().eq('id', id)
    if (err) throw err
  }, [])

  const addMemoryImage = useCallback(
    async (input: Omit<MemoryImage, 'id' | 'created_at'>) => {
      const { data, error: err } = await supabase
        .from('memory_images')
        .insert(input)
        .select('*')
        .single()
      if (err) throw err
      return data
    },
    [],
  )

  const removeMemoryImage = useCallback(async (id: string) => {
    const { error: err } = await supabase.from('memory_images').delete().eq('id', id)
    if (err) throw err
  }, [])

  return {
    memories,
    loading,
    error,
    refresh,
    createMemory,
    updateMemory,
    deleteMemory,
    addMemoryImage,
    removeMemoryImage,
  }
}

export function useMemory(id: string | undefined) {
  const { user } = useAuth()
  const [memory, setMemory] = useState<MemoryWithImages | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<unknown>(null)

  const refresh = useCallback(async () => {
    if (!user || !id) return
    setLoading(true)
    setError(null)
    const { data, error: err } = await supabase
      .from('memories')
      .select('*, memory_images(*)')
      .eq('id', id)
      .eq('user_id', user.id)
      .maybeSingle()

    if (err) setError(err)
    else if (data) {
      setMemory({
        ...data,
        memory_images: [...data.memory_images].sort((a, b) => a.sort_order - b.sort_order),
      } as MemoryWithImages)
    } else {
      setMemory(null)
    }
    setLoading(false)
  }, [user, id])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { memory, loading, error, refresh }
}

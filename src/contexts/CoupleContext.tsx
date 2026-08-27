import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

export interface CoupleMemberInfo {
  userId: string
  role: string
  joinedAt: string
  displayName: string | null
}

interface CoupleContextValue {
  coupleId: string | null
  inviteCode: string | null
  members: CoupleMemberInfo[]
  loading: boolean
  refresh: () => Promise<void>
  joinCouple: (code: string) => Promise<void>
  regenerateInviteCode: () => Promise<string>
}

const CoupleContext = createContext<CoupleContextValue | undefined>(undefined)

export function CoupleProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [coupleId, setCoupleId] = useState<string | null>(null)
  const [inviteCode, setInviteCode] = useState<string | null>(null)
  const [members, setMembers] = useState<CoupleMemberInfo[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!user) {
      setCoupleId(null)
      setInviteCode(null)
      setMembers([])
      setLoading(false)
      return
    }

    setLoading(true)
    const { data: membership } = await supabase
      .from('couple_members')
      .select('couple_id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!membership) {
      setCoupleId(null)
      setInviteCode(null)
      setMembers([])
      setLoading(false)
      return
    }

    setCoupleId(membership.couple_id)

    const [{ data: couple }, { data: memberRows }] = await Promise.all([
      supabase.from('couples').select('invite_code').eq('id', membership.couple_id).single(),
      supabase.from('couple_members').select('user_id, role, joined_at').eq('couple_id', membership.couple_id),
    ])

    setInviteCode(couple?.invite_code ?? null)

    const userIds = (memberRows ?? []).map((m) => m.user_id)
    const { data: profileRows } = userIds.length
      ? await supabase.from('profiles').select('user_id, display_name').in('user_id', userIds)
      : { data: [] as { user_id: string; display_name: string | null }[] }

    const nameByUserId = new Map((profileRows ?? []).map((p) => [p.user_id, p.display_name]))
    setMembers(
      (memberRows ?? []).map((m) => ({
        userId: m.user_id,
        role: m.role,
        joinedAt: m.joined_at,
        displayName: nameByUserId.get(m.user_id) ?? null,
      })),
    )
    setLoading(false)
  }, [user])

  useEffect(() => {
    refresh()
  }, [refresh])

  const joinCouple = useCallback(
    async (code: string) => {
      const { error } = await supabase.rpc('join_couple', { p_invite_code: code.trim() })
      if (error) throw error
      await refresh()
    },
    [refresh],
  )

  const regenerateInviteCode = useCallback(async () => {
    const { data, error } = await supabase.rpc('regenerate_invite_code')
    if (error) throw error
    setInviteCode(data)
    return data
  }, [])

  const value = useMemo<CoupleContextValue>(
    () => ({ coupleId, inviteCode, members, loading, refresh, joinCouple, regenerateInviteCode }),
    [coupleId, inviteCode, members, loading, refresh, joinCouple, regenerateInviteCode],
  )

  return <CoupleContext.Provider value={value}>{children}</CoupleContext.Provider>
}

export function useCouple(): CoupleContextValue {
  const ctx = useContext(CoupleContext)
  if (!ctx) throw new Error('useCouple must be used within CoupleProvider')
  return ctx
}

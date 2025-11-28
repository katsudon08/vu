'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface UserContextType {
  user: User | null
  userId: string | null
  isLoading: boolean
  isAuthenticated: boolean
}

const UserContext = createContext<UserContextType | undefined>(undefined)

// ユーザープロフィールを自動作成または取得
async function ensureUserProfile(user: User) {
  if (!user.id) {
    console.error('ensureUserProfile: user.id is empty')
    return
  }

  try {
    console.log('ensureUserProfile: checking for existing profile, user_id:', user.id)
    
    // ユーザープロフィールが存在するか確認
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id, user_id, username')
      .eq('user_id', user.id)
      .single()

    if (existingUser) {
      console.log('ensureUserProfile: existing profile found:', existingUser)
      return
    }

    // checkError が PGRST116 (no rows) の場合は新規作成、それ以外はエラー
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('ensureUserProfile: error checking for existing user:', checkError)
      throw checkError
    }

    // プロフィールが存在しない場合、作成
    console.log('ensureUserProfile: creating new user profile for user_id:', user.id)
    const username = user.email?.split('@')[0] || 'User'
    
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({
        user_id: user.id,
        username: username,
        avatar_url: user.user_metadata?.avatar_url || null,
        activity_count: 0,
        most_frequent_genre: null,
      })
      .select()
      .single()

    if (insertError) {
      console.error('ensureUserProfile: failed to insert user profile:', insertError)
      throw insertError
    }

    console.log('ensureUserProfile: new user profile created:', newUser)
  } catch (error) {
    console.error('ensureUserProfile: error:', error)
  }
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // 現在のセッションをチェック
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)
      if (currentUser) {
        ensureUserProfile(currentUser)
      }
      setIsLoading(false)
    })

    // リアルタイム認証状態監視
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)
      if (currentUser) {
        ensureUserProfile(currentUser)
      }
    })

    return () => subscription?.unsubscribe()
  }, [])

  const value: UserContextType = {
    user,
    userId: user?.id ?? null,
    isLoading,
    isAuthenticated: user !== null,
  }

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within UserProvider')
  }
  console.log('useUser hook called, context:', { userId: context.userId, isLoading: context.isLoading, isAuthenticated: context.isAuthenticated })
  return context
}

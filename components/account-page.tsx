"use client"

import { useState, useEffect } from "react"
import { Pencil, Check, X, Trophy, Flame } from "lucide-react"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabase"
import { 
  getCurrentRank, 
  getNextRankInfo, 
  categoryIcons,
  fetchAllActivities,
  fetchUserProfile,
  updateUserProfile,
} from "@/lib/api"
import { useUser } from "@/contexts/user-context"
import type { Activity, DbUser } from "@/lib/api"

export function AccountPage() {
  const { userId, isLoading: userContextLoading } = useUser()
  const [userProfile, setUserProfile] = useState<DbUser | null>(null)
  const [myActivities, setMyActivities] = useState<Activity[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [showAllHistory, setShowAllHistory] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ユーザープロフィールとアクティビティを取得
  useEffect(() => {
    const loadData = async () => {
      console.log('AccountPage: loadData called, userId:', userId, 'userContextLoading:', userContextLoading)
      
      if (userContextLoading) {
        console.log('AccountPage: UserContext still loading, waiting...')
        return
      }
      
      if (!userId) {
        console.log('AccountPage: userId is empty, stopping load')
        setIsLoading(false)
        setError('ユーザーIDが見つかりません')
        return
      }
      
      setIsLoading(true)
      setError(null)
      try {
        // ユーザープロフィール取得
        console.log('AccountPage: fetching user profile for userId:', userId)
        let profile = await fetchUserProfile(userId)
        console.log('AccountPage: profile fetch result:', profile)
        
        if (!profile) {
          // プロフィールが見つからない場合、自動作成を試みる
          console.log('AccountPage: profile not found, attempting to create...')
          
          // Supabase Auth の ユーザー情報を取得
          const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
          
          if (authError || !authUser) {
            console.error('AccountPage: failed to get auth user:', authError)
            setError('認証情報が見つかりません')
            setIsLoading(false)
            return
          }
          
          // プロフィール作成
          const username = authUser.email?.split('@')[0] || 'User'
          const { data: newProfile, error: createError } = await supabase
            .from('users')
            .insert({
              user_id: userId,
              username: username,
              avatar_url: authUser.user_metadata?.avatar_url || null,
              activity_count: 0,
              most_frequent_genre: null,
            })
            .select()
            .single()
          
          if (createError) {
            console.error('AccountPage: failed to create profile:', createError)
            setError(`プロフィール作成エラー: ${createError.message}`)
            setIsLoading(false)
            return
          }
          
          console.log('AccountPage: profile created:', newProfile)
          profile = newProfile
        }
        
        if (profile) {
          setUserProfile(profile)
          setEditName(profile.username)
        } else {
          console.log('AccountPage: profile is still null after creation attempt')
          setError('ユーザープロフィールを取得できません')
        }

        // 全アクティビティ取得
        console.log('AccountPage: fetching all activities')
        const allActivities = await fetchAllActivities(userId)
        console.log('AccountPage: activities fetch result:', allActivities)
        
        const userActivities = allActivities.filter((a) => a.userId === userId)
        console.log('AccountPage: user activities:', userActivities)
        setMyActivities(userActivities)
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : '不明なエラーが発生しました'
        console.error("AccountPage: Failed to load user data:", error)
        setError(`読み込みエラー: ${errorMsg}`)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [userId, userContextLoading])

  const handleSaveName = async () => {
    if (editName.trim() && userId) {
      await updateUserProfile(userId, { username: editName.trim() })
      setUserProfile((prev) => (prev ? { ...prev, username: editName.trim() } : null))
      setIsEditing(false)
    }
  }

  const handleCancelEdit = () => {
    setEditName(userProfile?.username || "")
    setIsEditing(false)
  }

  const formatDate = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 60) return `${minutes}分前`
    if (hours < 24) return `${hours}時間前`
    return `${days}日前`
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground">読み込み中...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <div className="text-red-500 text-center">
          <p className="font-semibold">エラーが発生しました</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    )
  }

  if (!userProfile) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground">ユーザー情報が見つかりません</p>
      </div>
    )
  }

  const activityCount = myActivities.length
  const currentRank = getCurrentRank(activityCount)
  const { nextRank, remaining } = getNextRankInfo(activityCount)
  const mostFrequentGenre = userProfile.most_frequent_genre
  const displayedActivities = showAllHistory ? myActivities : myActivities.slice(0, 3)

  return (
        <div className="flex-1 p-4 space-y-6 pb-24">
            {/* プロフィールヘッダー */}
            <div className="card-gradient rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-4">
                    {/* アバター */}
                    <div className="relative">
                      <div className="gradient-border rounded-full p-[3px]">
                        <div className="w-20 h-20 rounded-full bg-background flex items-center justify-center overflow-hidden">
                          <span className="text-4xl">👤</span>
                        </div>
                      </div>
                    </div>

                    {/* 名前と称号 */}
                    <div className="flex-1 space-y-1">
                        {isEditing ? (
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) =>
                                        setEditName(e.target.value)
                                    }
                                    className="bg-secondary/50 border border-border rounded-lg px-3 py-1.5 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                                    autoFocus
                                />
                                <button
                                    onClick={handleSaveName}
                                    className="p-1.5 rounded-lg bg-green-500/20 text-green-500 hover:bg-green-500/30 transition-colors"
                                >
                                    <Check className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={handleCancelEdit}
                                    className="p-1.5 rounded-lg bg-red-500/20 text-red-500 hover:bg-red-500/30 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <h2 className="text-xl font-bold">
                                    {userProfile.username}
                                </h2>
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="p-1.5 rounded-lg hover:bg-secondary/50 transition-colors text-muted-foreground hover:text-foreground"
                                >
                                    <Pencil className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                        <div
                            className={cn(
                                "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold bg-gradient-to-r text-white",
                                currentRank.color
                            )}
                        >
                            <Trophy className="w-4 h-4" />
                            {currentRank.name}
                        </div>
                    </div>
                </div>
            </div>

            {/* メインカード: 一番出やすいジャンル */}
            <div className="card-gradient rounded-2xl p-6">
                <h3 className="text-sm font-medium text-muted-foreground mb-4">
                    よく実行するジャンル
                </h3>
                {mostFrequentGenre ? (
                    <div className="flex items-center gap-4">
                        <div
                            className={cn(
                                "w-20 h-20 rounded-2xl bg-gradient-to-br flex items-center justify-center text-4xl shadow-lg",
                                categoryIcons[mostFrequentGenre]?.color ||
                                    "from-gray-400 to-gray-500"
                            )}
                        >
                            {categoryIcons[mostFrequentGenre]?.icon || "✨"}
                        </div>
                        <div>
                            <p className="text-2xl font-bold">
                                {categoryIcons[mostFrequentGenre]?.label || mostFrequentGenre}
                            </p>
                            <p className="text-muted-foreground text-sm">
                                {
                                    myActivities.filter(
                                        (a) =>
                                            a.category === mostFrequentGenre
                                    ).length
                                }
                                回実行
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-4">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center text-4xl shadow-lg">
                            ✨
                        </div>
                        <div>
                            <p className="text-lg font-medium text-muted-foreground">
                                まだアクティビティがありません
                            </p>
                            <p className="text-sm text-muted-foreground">
                                アクティビティを実行してみましょう
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* サブデータ: 累計回数とランク進捗 */}
            <div className="grid grid-cols-2 gap-4">
                <div className="card-gradient rounded-2xl p-5">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                        <Flame className="w-5 h-5 text-orange-500" />
                        <span className="text-sm font-medium">
                            累計実行回数
                        </span>
                    </div>
                    <p
                        className={cn(
                            "text-3xl font-black gradient-instagram-text"
                        )}
                    >
                        {activityCount}
                        <span className="text-lg font-medium text-muted-foreground ml-1">
                            回
                        </span>
                    </p>
                </div>
                <div className="card-gradient rounded-2xl p-5">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                        <Trophy className="w-5 h-5 text-yellow-500" />
                        <span className="text-sm font-medium">
                            次のランクまで
                        </span>
                    </div>
                    {nextRank ? (
                        <>
                            <p
                                className={cn(
                                    "text-3xl font-black gradient-instagram-text"
                                )}
                            >
                                {remaining}
                                <span className="text-lg font-medium text-muted-foreground ml-1">
                                    回
                                </span>
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                → {nextRank.name}
                            </p>
                        </>
                    ) : (
                        <p className="text-lg font-bold text-yellow-500">
                            最高ランク達成!
                        </p>
                    )}
                </div>
            </div>

            {/* ランク進捗バー */}
            {nextRank && (
                <div className="card-gradient rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">
                            {currentRank.name}
                        </span>
                        <span className="text-sm font-medium text-muted-foreground">
                            {nextRank.name}
                        </span>
                    </div>
                    <div className="h-3 bg-secondary rounded-full overflow-hidden">
                        <div
                            className={cn(
                                "h-full rounded-full bg-gradient-to-r transition-all duration-500",
                                currentRank.color
                            )}
                            style={{
                                width: `${
                                    ((activityCount - currentRank.minCount) /
                                        (nextRank.minCount -
                                            currentRank.minCount)) *
                                    100
                                }%`,
                            }}
                        />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                        {activityCount} / {nextRank.minCount}
                    </p>
                </div>
            )}

            {/* アクティビティ履歴 */}
            <div className="card-gradient rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold">実行したアクティビティ</h3>
                    {myActivities.length > 3 && (
                        <button
                            onClick={() => setShowAllHistory(!showAllHistory)}
                            className="text-xs text-pink-500 hover:text-pink-600 font-semibold transition-colors"
                        >
                            {showAllHistory ? "閉じる" : "すべて表示"}
                        </button>
                    )}
                </div>
                {displayedActivities.length === 0 ? (
                    <p className="text-sm text-muted-foreground">まだアクティビティがありません</p>
                ) : (
                    <div className="space-y-3">
                        {displayedActivities.map((activity) => (
                            <div key={activity.id} className="p-3 bg-secondary/50 rounded-lg border border-border/50">
                                <div className="flex items-start justify-between gap-2 mb-2">
                                    <div className="flex items-center gap-2 flex-1">
                                        <span className="text-2xl">{categoryIcons[activity.category]?.icon}</span>
                                        <span className="text-xs font-medium bg-secondary text-muted-foreground px-2 py-1 rounded">
                                            {categoryIcons[activity.category]?.label}
                                        </span>
                                    </div>
                                    <span className="text-xs text-muted-foreground">{formatDate(activity.createdAt)}</span>
                                </div>
                                <p className="text-sm font-medium">{activity.text}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

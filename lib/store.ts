"use client"

import { useSyncExternalStore } from "react"

export interface Activity {
  id: string
  text: string
  category: string // カテゴリを追加
  userId: string
  userName: string
  userAvatar: string
  createdAt: Date
  likes: number
  likedBy: string[]
}

export interface Rank {
  name: string
  minCount: number
  color: string
}

export const ranks: Rank[] = [
  { name: "ビギナー", minCount: 0, color: "from-gray-400 to-gray-500" },
  { name: "チャレンジャー", minCount: 5, color: "from-green-400 to-emerald-500" },
  { name: "アクティブ", minCount: 15, color: "from-blue-400 to-cyan-500" },
  { name: "エキスパート", minCount: 30, color: "from-purple-400 to-pink-500" },
  { name: "マスター", minCount: 50, color: "from-yellow-400 to-orange-500" },
  { name: "レジェンド", minCount: 100, color: "from-rose-400 to-red-500" },
]

export const activitySuggestions = [
  { text: "散歩に出かける", category: "運動", icon: "🚶" },
  { text: "本を30分読む", category: "学習", icon: "📚" },
  { text: "新しいレシピを試す", category: "料理", icon: "🍳" },
  { text: "友達に連絡する", category: "交流", icon: "💬" },
  { text: "部屋を掃除する", category: "生活", icon: "🧹" },
  { text: "15分瞑想する", category: "リラックス", icon: "🧘" },
  { text: "写真を撮りに行く", category: "クリエイティブ", icon: "📷" },
  { text: "日記を書く", category: "クリエイティブ", icon: "✍️" },
  { text: "植物に水をやる", category: "生活", icon: "🌱" },
  { text: "ストレッチをする", category: "運動", icon: "🤸" },
  { text: "新しい音楽を聴く", category: "リラックス", icon: "🎵" },
  { text: "映画を観る", category: "リラックス", icon: "🎬" },
  { text: "手紙を書く", category: "交流", icon: "💌" },
  { text: "絵を描く", category: "クリエイティブ", icon: "🎨" },
  { text: "コーヒーを淹れる", category: "生活", icon: "☕" },
  { text: "早起きする", category: "生活", icon: "🌅" },
  { text: "夜空を眺める", category: "リラックス", icon: "🌙" },
  { text: "お菓子を作る", category: "料理", icon: "🍰" },
  { text: "語学の勉強をする", category: "学習", icon: "🌍" },
  { text: "ジョギングをする", category: "運動", icon: "🏃" },
]

export const categoryIcons: Record<string, { icon: string; color: string }> = {
  運動: { icon: "🏃", color: "from-green-400 to-emerald-500" },
  学習: { icon: "📚", color: "from-blue-400 to-indigo-500" },
  料理: { icon: "🍳", color: "from-orange-400 to-red-500" },
  交流: { icon: "💬", color: "from-pink-400 to-rose-500" },
  生活: { icon: "🏠", color: "from-amber-400 to-yellow-500" },
  リラックス: { icon: "🧘", color: "from-purple-400 to-violet-500" },
  クリエイティブ: { icon: "🎨", color: "from-cyan-400 to-teal-500" },
}

interface Store {
  activities: Activity[]
  currentUserId: string
  currentUserName: string
  currentUserAvatar: string
  likedActivityIds: string[]
}

// サンプルユーザーデータ
const sampleUsers = [
  { id: "user1", name: "田中太郎", avatar: "/japanese-man-avatar.png" },
  { id: "user2", name: "佐藤花子", avatar: "/japanese-woman-avatar.png" },
  { id: "user3", name: "鈴木一郎", avatar: "/japanese-young-man-avatar.jpg" },
  { id: "user4", name: "高橋美咲", avatar: "/japanese-young-woman-avatar.jpg" },
]

// 初期サンプルアクティビティ
const initialActivities: Activity[] = [
  {
    id: "1",
    text: "散歩に出かける",
    category: "運動",
    userId: "user1",
    userName: "田中太郎",
    userAvatar: "/japanese-man-avatar.png",
    createdAt: new Date(Date.now() - 1000 * 60 * 30),
    likes: 12,
    likedBy: ["user2", "user3"],
  },
  {
    id: "2",
    text: "本を30分読む",
    category: "学習",
    userId: "user2",
    userName: "佐藤花子",
    userAvatar: "/japanese-woman-avatar.png",
    createdAt: new Date(Date.now() - 1000 * 60 * 60),
    likes: 8,
    likedBy: ["user1"],
  },
  {
    id: "3",
    text: "新しいレシピを試す",
    category: "料理",
    userId: "user3",
    userName: "鈴木一郎",
    userAvatar: "/japanese-young-man-avatar.jpg",
    createdAt: new Date(Date.now() - 1000 * 60 * 120),
    likes: 15,
    likedBy: ["user1", "user2", "user4"],
  },
  {
    id: "4",
    text: "15分瞑想する",
    category: "リラックス",
    userId: "user4",
    userName: "高橋美咲",
    userAvatar: "/japanese-young-woman-avatar.jpg",
    createdAt: new Date(Date.now() - 1000 * 60 * 180),
    likes: 6,
    likedBy: [],
  },
  {
    id: "5",
    text: "部屋を掃除する",
    category: "生活",
    userId: "user1",
    userName: "田中太郎",
    userAvatar: "/japanese-man-avatar.png",
    createdAt: new Date(Date.now() - 1000 * 60 * 240),
    likes: 10,
    likedBy: ["user2"],
  },
]

let store: Store = {
  activities: initialActivities,
  currentUserId: "me",
  currentUserName: "あなた",
  currentUserAvatar: "/default-user-avatar.png",
  likedActivityIds: [],
}

const listeners = new Set<() => void>()

function emitChange() {
  for (const listener of listeners) {
    listener()
  }
}

export function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getSnapshot() {
  return store
}

export function addActivity(text: string, category: string) {
  const newActivity: Activity = {
    id: Date.now().toString(),
    text,
    category,
    userId: store.currentUserId,
    userName: store.currentUserName,
    userAvatar: store.currentUserAvatar,
    createdAt: new Date(),
    likes: 0,
    likedBy: [],
  }
  store = {
    ...store,
    activities: [newActivity, ...store.activities],
  }
  emitChange()
}

export function toggleLike(activityId: string) {
  const activity = store.activities.find((a) => a.id === activityId)
  if (!activity) return

  const isLiked = store.likedActivityIds.includes(activityId)

  store = {
    ...store,
    likedActivityIds: isLiked
      ? store.likedActivityIds.filter((id) => id !== activityId)
      : [...store.likedActivityIds, activityId],
    activities: store.activities.map((a) =>
      a.id === activityId
        ? {
            ...a,
            likes: isLiked ? a.likes - 1 : a.likes + 1,
            likedBy: isLiked
              ? a.likedBy.filter((id) => id !== store.currentUserId)
              : [...a.likedBy, store.currentUserId],
          }
        : a,
    ),
  }
  emitChange()
}

export function updateUserName(newName: string) {
  store = {
    ...store,
    currentUserName: newName,
    activities: store.activities.map((a) => (a.userId === store.currentUserId ? { ...a, userName: newName } : a)),
  }
  emitChange()
}

export function getCurrentRank(activityCount: number): Rank {
  for (let i = ranks.length - 1; i >= 0; i--) {
    if (activityCount >= ranks[i].minCount) {
      return ranks[i]
    }
  }
  return ranks[0]
}

export function getNextRankInfo(activityCount: number): { nextRank: Rank | null; remaining: number } {
  const currentRank = getCurrentRank(activityCount)
  const currentIndex = ranks.findIndex((r) => r.name === currentRank.name)

  if (currentIndex === ranks.length - 1) {
    return { nextRank: null, remaining: 0 }
  }

  const nextRank = ranks[currentIndex + 1]
  return { nextRank, remaining: nextRank.minCount - activityCount }
}

export function getMostFrequentCategory(activities: Activity[]): string | null {
  const userActivities = activities.filter((a) => a.userId === store.currentUserId)
  if (userActivities.length === 0) return null

  const categoryCount: Record<string, number> = {}
  userActivities.forEach((a) => {
    categoryCount[a.category] = (categoryCount[a.category] || 0) + 1
  })

  let maxCategory = ""
  let maxCount = 0
  Object.entries(categoryCount).forEach(([category, count]) => {
    if (count > maxCount) {
      maxCount = count
      maxCategory = category
    }
  })

  return maxCategory || null
}

export function useStore() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}

export function getRandomActivity(): { text: string; category: string } {
  const activity = activitySuggestions[Math.floor(Math.random() * activitySuggestions.length)]
  return { text: activity.text, category: activity.category }
}

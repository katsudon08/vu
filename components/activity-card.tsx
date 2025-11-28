"use client"

import { useState } from "react"
import { Heart, MessageCircle, Send, Bookmark } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Activity } from "@/lib/store"
import { categoryIcons } from "@/lib/store"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface ActivityCardProps {
  activity: Activity
  isLiked: boolean
  onToggleLike: () => void
  index?: number
}

function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (minutes < 1) return "たった今"
  if (minutes < 60) return `${minutes}分前`
  if (hours < 24) return `${hours}時間前`
  return `${days}日前`
}

const activityColors = [
  "from-orange-400 to-pink-500",
  "from-purple-400 to-pink-500",
  "from-blue-400 to-purple-500",
  "from-green-400 to-blue-500",
  "from-yellow-400 to-orange-500",
]

export function ActivityCard({ activity, isLiked, onToggleLike, index = 0 }: ActivityCardProps) {
  const [isAnimating, setIsAnimating] = useState(false)
  const categoryInfo = categoryIcons[activity.category]
  const colorClass = categoryInfo?.color || activityColors[index % activityColors.length]

  const handleLike = () => {
    if (!isLiked) {
      setIsAnimating(true)
      setTimeout(() => setIsAnimating(false), 400)
    }
    onToggleLike()
  }

  return (
    <article
      className="bg-card border-b border-border/50 animate-float-up"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex items-center gap-3 p-4 pb-3">
        <div className={`p-0.5 rounded-full bg-gradient-to-tr ${colorClass}`}>
          <div className="p-0.5 bg-card rounded-full">
            <Avatar className="w-10 h-10">
              <AvatarImage src={activity.userAvatar || "/placeholder.svg"} alt={activity.userName} />
              <AvatarFallback className={`bg-gradient-to-tr ${colorClass} text-white font-semibold`}>
                {activity.userName[0]}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">{activity.userName}</p>
          <p className="text-xs text-muted-foreground">{formatTimeAgo(activity.createdAt)}</p>
        </div>
        {activity.category && (
          <span className="text-xs px-2.5 py-1 rounded-full bg-secondary text-muted-foreground font-medium">
            {activity.category}
          </span>
        )}
      </div>

      <div className="px-4 pb-3">
        <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${colorClass} p-[1px]`}>
          <div className="bg-card rounded-2xl p-5">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-lg shrink-0",
                  colorClass,
                )}
              >
                {categoryInfo?.icon || "✨"}
              </div>
              <p className="text-foreground text-[15px] leading-relaxed">{activity.text}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleLike}
              className="flex items-center gap-1.5 transition-transform active:scale-90"
              aria-label={isLiked ? "いいねを取り消す" : "いいね"}
            >
              <Heart
                className={cn(
                  "w-6 h-6 transition-all duration-200",
                  isLiked ? "fill-pink-500 text-pink-500" : "text-foreground hover:text-muted-foreground",
                  isAnimating && "heart-animation",
                )}
              />
            </button>
            <button className="text-foreground hover:text-muted-foreground transition-colors">
              <MessageCircle className="w-6 h-6" />
            </button>
            <button className="text-foreground hover:text-muted-foreground transition-colors">
              <Send className="w-6 h-6" />
            </button>
          </div>
          <button className="text-foreground hover:text-muted-foreground transition-colors">
            <Bookmark className="w-6 h-6" />
          </button>
        </div>

        {activity.likes > 0 && (
          <p className="mt-2 text-sm font-semibold">{activity.likes.toLocaleString()}件のいいね</p>
        )}
      </div>
    </article>
  )
}

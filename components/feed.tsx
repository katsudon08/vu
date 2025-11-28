"use client"

import type React from "react"

import { useState } from "react"
import { ActivityCard } from "./activity-card"
import { useStore, toggleLike } from "@/lib/store"
import { cn } from "@/lib/utils"
import { Users, User } from "lucide-react"

type FeedTab = "all" | "mine"

export function Feed() {
  const [activeTab, setActiveTab] = useState<FeedTab>("all")
  const store = useStore()

  const filteredActivities =
    activeTab === "all" ? store.activities : store.activities.filter((a) => a.userId === store.currentUserId)

  return (
    <div className="flex-1 flex flex-col">
      <div className="sticky top-16 z-40 glass border-b border-border/50">
        <div className="max-w-2xl mx-auto">
          <div className="flex">
            <button
              onClick={() => setActiveTab("all")}
              className={cn(
                "flex-1 py-4 text-sm font-semibold transition-all duration-300 relative flex items-center justify-center gap-2",
                activeTab === "all" ? "text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Users className="w-4 h-4" />
              みんな
              {activeTab === "all" && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-0.5 gradient-instagram rounded-full" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("mine")}
              className={cn(
                "flex-1 py-4 text-sm font-semibold transition-all duration-300 relative flex items-center justify-center gap-2",
                activeTab === "mine" ? "text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <User className="w-4 h-4" />
              あなた
              {activeTab === "mine" && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-0.5 gradient-instagram rounded-full" />
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredActivities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
            <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-6">
              <Sparkles className="w-10 h-10 text-muted-foreground/50" />
            </div>
            <p className="text-lg font-medium">まだアクティビティがありません</p>
            <p className="text-sm mt-2">アクティビティをリクエストして始めましょう</p>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            {filteredActivities.map((activity, index) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                isLiked={store.likedActivityIds.includes(activity.id)}
                onToggleLike={() => toggleLike(activity.id)}
                index={index}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function Sparkles(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  )
}

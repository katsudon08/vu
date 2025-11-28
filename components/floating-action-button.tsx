"use client"

import { Sparkles } from "lucide-react"

interface FloatingActionButtonProps {
  onClick: () => void
}

export function FloatingActionButton({ onClick }: FloatingActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-40 w-16 h-16 gradient-instagram text-white rounded-2xl shadow-2xl shadow-pink-500/40 hover:shadow-pink-500/60 hover:scale-110 transition-all duration-300 flex items-center justify-center group"
      aria-label="アクティビティをリクエスト"
    >
      <span className="absolute inset-0 rounded-2xl gradient-instagram animate-ping opacity-30" />
      <Sparkles className="w-7 h-7 relative z-10 group-hover:rotate-12 transition-transform duration-300" />
    </button>
  )
}

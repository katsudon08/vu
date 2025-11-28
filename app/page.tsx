"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { Feed } from "@/components/feed"
import { LikesPage } from "@/components/likes-page"
import { AccountPage } from "@/components/account-page"
import { ActivityRequestModal } from "@/components/activity-request-modal"
import { FloatingActionButton } from "@/components/floating-action-button"

type Tab = "home" | "likes" | "account"

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("home")
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} onRequestActivity={() => setIsModalOpen(true)} />

      <main className="flex-1 max-w-2xl mx-auto w-full flex flex-col">
        {activeTab === "home" && <Feed />}
        {activeTab === "likes" && <LikesPage />}
        {activeTab === "account" && <AccountPage />}
      </main>

      {activeTab === "home" && <FloatingActionButton onClick={() => setIsModalOpen(true)} />}

      <ActivityRequestModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  )
}

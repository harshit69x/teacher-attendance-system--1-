import type React from "react"
import Header from "@/components/header"

export default function ScheduleLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
    </div>
  )
}

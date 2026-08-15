import { AdminNav } from "@/components/admin/AdminNav"
import { ReactNode } from "react"

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans">
      <AdminNav />
      <main className="max-w-5xl mx-auto p-4 md:p-8">
        {children}
      </main>
    </div>
  )
}

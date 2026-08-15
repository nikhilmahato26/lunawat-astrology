'use client'

import { useActionState } from "react"
import { loginAction } from "@/actions/auth"

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, { error: null })

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-zinc-200">
        <h1 className="text-2xl font-black mb-6 text-center">Admin Login</h1>
        
        <form action={formAction} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="drrahuljain143@gmail.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="••••••••"
            />
          </div>

          {state?.error && (
            <p className="text-red-500 text-sm">{state.error}</p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-black text-white py-2.5 rounded-lg font-medium hover:bg-zinc-800 disabled:opacity-70 transition-colors"
          >
            {isPending ? "Logging in..." : "Log in"}
          </button>
        </form>
      </div>
    </div>
  )
}

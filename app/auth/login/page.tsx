'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function Login() {
  const router = useRouter()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })
      if (error) throw error
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#0D1B2A] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"/>
      
      <div className="relative bg-white rounded-2xl p-10 w-full max-w-md shadow-2xl">
        <div className="text-center mb-8">
          <div className="text-3xl font-black tracking-tighter text-[#0D1B2A] mb-1">
            2<span className="text-[#E8A020]">GET</span>
          </div>
          <div className="text-sm text-gray-400">Welcome back</div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wide block mb-1.5">Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg text-sm outline-none focus:border-[#E8A020]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wide block mb-1.5">Password</label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
              className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg text-sm outline-none focus:border-[#E8A020]"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#E8A020] text-[#0D1B2A] font-black rounded-xl text-sm hover:bg-[#B87A10] disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Log in →'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-400">
          Don&apos;t have an account?{' '}
          <Link href="/auth/signup" className="text-[#E8A020] font-bold hover:text-[#B87A10]">
            Sign up free
          </Link>
        </div>
      </div>
    </main>
  )
}
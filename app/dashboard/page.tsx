'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/auth/login')
        return
      }

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      setProfile(data)
      setLoading(false)
    }

    getProfile()
  }, [router])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0D1B2A] flex items-center justify-center">
        <div className="text-white/50 text-sm">Loading...</div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#0D1B2A]">
      <nav className="fixed top-0 left-0 right-0 h-16 bg-[#0D1B2A]/95 backdrop-blur border-b border-white/5 flex items-center px-6 gap-4 z-50">
        <div className="flex flex-col mr-4">
          <span className="font-black text-2xl tracking-tighter text-white">2<span className="text-[#E8A020]">GET</span></span>
          <span className="text-[10px] text-white/30 tracking-widest -mt-1">PERTH</span>
        </div>
        <div className="flex-1"/>
        <div className="flex items-center gap-3">
          <div className="text-sm text-white/50">
            {profile?.first_name} {profile?.last_name}
          </div>
          <button
            onClick={handleSignOut}
            className="px-4 py-2 rounded text-sm font-medium text-white/70 border border-white/15 hover:bg-white/5"
          >
            Sign out
          </button>
        </div>
      </nav>

      <div className="pt-24 px-6 max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-black tracking-tight text-white mb-2">
            Welcome back, {profile?.first_name} 👋
          </h1>
          <p className="text-white/40">
            {profile?.account_type === 'provider' 
              ? 'Manage your listings, bookings and finances' 
              : 'Find and book trusted Perth tradies'}
          </p>
        </div>

        {profile?.account_type === 'customer' ? (
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-[#E8A020]/30 transition-all cursor-pointer">
              <div className="text-3xl mb-4">🔍</div>
              <h3 className="text-white font-bold mb-2">Find a tradie</h3>
              <p className="text-white/40 text-sm">Browse Perth&apos;s best tradespeople</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-[#E8A020]/30 transition-all cursor-pointer">
              <div className="text-3xl mb-4">📋</div>
              <h3 className="text-white font-bold mb-2">My bookings</h3>
              <p className="text-white/40 text-sm">View and manage your jobs</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-[#E8A020]/30 transition-all cursor-pointer">
              <div className="text-3xl mb-4">⭐</div>
              <h3 className="text-white font-bold mb-2">My rewards</h3>
              <p className="text-white/40 text-sm">View your XP and giveaway entries</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-[#E8A020]/30 transition-all cursor-pointer">
              <div className="text-3xl mb-4">📝</div>
              <h3 className="text-white font-bold mb-2">My listings</h3>
              <p className="text-white/40 text-sm">Manage your service listings</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-[#E8A020]/30 transition-all cursor-pointer">
              <div className="text-3xl mb-4">📅</div>
              <h3 className="text-white font-bold mb-2">Bookings</h3>
              <p className="text-white/40 text-sm">View and manage your jobs</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-[#E8A020]/30 transition-all cursor-pointer">
              <div className="text-3xl mb-4">💰</div>
              <h3 className="text-white font-bold mb-2">Financials</h3>
              <p className="text-white/40 text-sm">Income, GST and tax deductions</p>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
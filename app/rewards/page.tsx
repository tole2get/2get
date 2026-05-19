'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getTier, getNextTier, TIERS } from '@/lib/xp'

export default function Rewards() {
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [xpTotal, setXpTotal] = useState<any>(null)
  const [xpEvents, setXpEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      setProfile(profile)

      const { data: xpTotal } = await supabase
        .from('xp_totals')
        .select('*')
        .eq('user_id', user.id)
        .single()
      setXpTotal(xpTotal)

      const { data: events } = await supabase
        .from('xp_events')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20)
      setXpEvents(events || [])

      setLoading(false)
    }
    init()
  }, [router])

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0D1B2A] flex items-center justify-center">
        <div className="text-white/30 text-sm">Loading...</div>
      </main>
    )
  }

  const totalXp = xpTotal?.total_xp || 0
  const currentTier = getTier(totalXp)
  const nextTier = getNextTier(totalXp)
  const progressToNext = nextTier
    ? ((totalXp - currentTier.min) / (nextTier.min - currentTier.min)) * 100
    : 100

  return (
    <main className="min-h-screen bg-[#0D1B2A]">
      <nav className="fixed top-0 left-0 right-0 h-16 bg-[#0D1B2A]/95 backdrop-blur border-b border-white/5 flex items-center px-6 gap-4 z-50">
        <div className="flex flex-col mr-4">
          <span className="font-black text-2xl tracking-tighter text-white">2<span className="text-[#E8A020]">GET</span></span>
          <span className="text-[10px] text-white/30 tracking-widest -mt-1">PERTH</span>
        </div>
        <div className="flex gap-1 flex-1">
          <Link href="/" className="px-3 py-2 rounded text-sm font-medium text-white/50 hover:text-white hover:bg-white/5">Home</Link>
          <Link href="/browse" className="px-3 py-2 rounded text-sm font-medium text-white/50 hover:text-white hover:bg-white/5">Find a Tradie</Link>
          <Link href="/dashboard" className="px-3 py-2 rounded text-sm font-medium text-white/50 hover:text-white hover:bg-white/5">Dashboard</Link>
          <Link href="/rewards" className="px-3 py-2 rounded text-sm font-medium text-[#E8A020] bg-[#E8A020]/10">Rewards</Link>
        </div>
      </nav>

      <div className="pt-24 px-6 max-w-4xl mx-auto pb-20">
        <div className="mb-8">
          <h1 className="text-3xl font-black tracking-tight text-white mb-2">My Rewards</h1>
          <p className="text-white/40">Earn XP every time you use 2GET — redeem for giveaway entries</p>
        </div>

        {/* XP Hero card */}
        <div className="bg-gradient-to-br from-[#1a2a3a] to-[#0D1B2A] border border-white/10 rounded-2xl p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="text-5xl mb-2">{currentTier.emoji}</div>
              <div className="text-2xl font-black text-white mb-1">{currentTier.name}</div>
              <div className="text-white/40 text-sm">Current tier</div>
            </div>
            <div className="text-right">
              <div className="text-5xl font-black tracking-tight" style={{color: currentTier.color}}>
                {totalXp.toLocaleString()}
              </div>
              <div className="text-white/40 text-sm">Total XP</div>
            </div>
          </div>

          {/* Progress bar */}
          {nextTier && (
            <div className="mb-4">
              <div className="flex justify-between text-xs text-white/40 mb-2">
                <span>{totalXp.toLocaleString()} XP</span>
                <span>{nextTier.min.toLocaleString()} XP to {nextTier.name} {nextTier.emoji}</span>
              </div>
              <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{width: `${Math.min(progressToNext, 100)}%`, background: currentTier.color}}
                />
              </div>
              <div className="text-xs text-white/30 mt-2">
                {nextTier.min - totalXp} XP to reach {nextTier.name} — {nextTier.entries} giveaway entries/month
              </div>
            </div>
          )}

          {/* Giveaway entries */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between">
            <div>
              <div className="text-white font-bold mb-1">🎟️ Monthly giveaway entries</div>
              <div className="text-white/40 text-sm">Current draw: $500 Bunnings gift card</div>
            </div>
            <div className="text-4xl font-black text-[#E8A020]">
              {currentTier.entries}
            </div>
          </div>
        </div>

        {/* Tiers */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {TIERS.map(tier => (
            <div
              key={tier.name}
              className={`border rounded-2xl p-5 transition-all ${
                currentTier.name === tier.name
                  ? 'border-opacity-50 bg-white/5'
                  : 'border-white/8 bg-white/2 opacity-50'
              }`}
              style={{borderColor: currentTier.name === tier.name ? tier.color : undefined}}
            >
              <div className="text-2xl mb-2">{tier.emoji}</div>
              <div className="font-black text-white text-sm mb-1">{tier.name}</div>
              <div className="text-xs text-white/30 mb-3">
                {tier.min.toLocaleString()}+ XP
              </div>
              <div className="text-xs" style={{color: tier.color}}>
                {tier.entries} entries/mo
              </div>
              {tier.name === 'Valued' && (
                <div className="text-xs text-white/30 mt-1">+ $10 credit/qtr</div>
              )}
              {tier.name === 'Elite' && (
                <div className="text-xs text-white/30 mt-1">+ $25 credit + badge</div>
              )}
            </div>
          ))}
        </div>

        {/* How to earn */}
        <div className="bg-white/3 border border-white/8 rounded-2xl p-6 mb-6">
          <h2 className="text-white font-black text-lg mb-4">How to earn XP</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              {icon:'👋', action:'Sign up', xp:100},
              {icon:'📅', action:'First booking', xp:500},
              {icon:'💰', action:'Every $1 spent', xp:1},
              {icon:'⭐', action:'Leave a review', xp:200},
              {icon:'👥', action:'Refer a friend who books', xp:1000},
              {icon:'🔄', action:'Repeat booking same tradie', xp:150},
              {icon:'⚡', action:'Accept quote within 48hrs', xp:75},
              {icon:'📸', action:'Upload job photos', xp:50},
            ].map(item => (
              <div key={item.action} className="flex items-center justify-between bg-white/3 rounded-xl px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-white/70 text-sm">{item.action}</span>
                </div>
                <span className="text-[#E8A020] font-black text-sm">+{item.xp} XP</span>
              </div>
            ))}
          </div>
        </div>

        {/* XP History */}
        <div className="bg-white/3 border border-white/8 rounded-2xl p-6 mb-6">
          <h2 className="text-white font-black text-lg mb-4">XP History</h2>
          {xpEvents.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">🌱</div>
              <div className="text-white/40 text-sm">No XP earned yet — start by making your first booking!</div>
              <Link href="/browse" className="inline-block mt-4 px-6 py-2 bg-[#E8A020] text-[#0D1B2A] font-bold text-sm rounded-lg hover:bg-[#B87A10]">
                Find a tradie
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {xpEvents.map(event => (
                <div key={event.id} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                  <div>
                    <div className="text-white text-sm font-medium">{event.description}</div>
                    <div className="text-white/30 text-xs mt-0.5">
                      {new Date(event.created_at).toLocaleDateString('en-AU', {day:'numeric', month:'short', year:'numeric'})}
                    </div>
                  </div>
                  <div className="text-[#E8A020] font-black">+{event.xp_amount} XP</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Giveaway info */}
        <div className="bg-gradient-to-r from-[#E8A020]/10 to-[#E8A020]/5 border border-[#E8A020]/20 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="text-4xl">🎁</div>
            <div>
              <h2 className="text-white font-black text-lg mb-2">Monthly giveaway</h2>
              <p className="text-white/50 text-sm leading-relaxed mb-3">
                Every month 2GET runs a giveaway exclusively for customers. Your tier determines how many entries you get — the more you use 2GET, the more chances to win.
              </p>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white/5 rounded-xl p-3 text-center">
                  <div className="text-white font-black text-sm">Monthly</div>
                  <div className="text-[#E8A020] text-xs mt-1">$500 Bunnings</div>
                </div>
                <div className="bg-white/5 rounded-xl p-3 text-center">
                  <div className="text-white font-black text-sm">Quarterly</div>
                  <div className="text-[#E8A020] text-xs mt-1">WA Resort stay</div>
                </div>
                <div className="bg-white/5 rounded-xl p-3 text-center">
                  <div className="text-white font-black text-sm">Annual</div>
                  <div className="text-[#E8A020] text-xs mt-1">$5,000 reno credit</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Nav() {
  const pathname = usePathname()
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      setProfile(data)
    }
    getProfile()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const link = (href: string, label: string) => (
    <Link
      href={href}
      className={`px-3 py-2 rounded text-sm font-medium transition-all ${
        pathname === href || pathname.startsWith(href + '/')
          ? 'text-[#E8A020] bg-[#E8A020]/10'
          : 'text-white/50 hover:text-white hover:bg-white/5'
      }`}
    >
      {label}
    </Link>
  )

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-[#0D1B2A]/95 backdrop-blur border-b border-white/5 flex items-center px-6 gap-4 z-50">
      <div className="flex flex-col mr-4">
        <span className="font-black text-2xl tracking-tighter text-white">2<span className="text-[#E8A020]">GET</span></span>
        <span className="text-[10px] text-white/30 tracking-widest -mt-1">PERTH</span>
      </div>
      <div className="flex gap-1 flex-1">
        {link('/', 'Home')}
        {link('/browse', 'Find a Tradie')}
        {profile && link('/dashboard', 'Dashboard')}
        {profile && link('/messages', 'Messages')}
        {profile?.account_type === 'customer' && link('/rewards', 'Rewards ⭐')}
        {profile?.account_type === 'provider' && link('/financials', 'Financials')}
        {profile?.account_type === 'provider' && link('/verify-account', 'Get verified')}
      </div>
      <div className="flex items-center gap-3">
        {profile ? (
          <>
            <div className="text-sm text-white/50">{profile.first_name} {profile.last_name}</div>
            <button onClick={handleSignOut} className="px-4 py-2 rounded text-sm font-medium text-white/70 border border-white/15 hover:bg-white/5">
              Sign out
            </button>
          </>
        ) : (
          <>
            <Link href="/auth/login" className="px-4 py-2 rounded text-sm font-medium text-white/70 border border-white/15 hover:bg-white/5">Log in</Link>
            <Link href="/auth/signup" className="px-4 py-2 rounded text-sm font-bold bg-[#E8A020] text-[#0D1B2A] hover:bg-[#B87A10]">Get started free</Link>
          </>
        )}
      </div>
    </nav>
  )
}
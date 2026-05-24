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
  const [loaded, setLoaded] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoaded(true); return }
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      setProfile(data)
      setLoaded(true)
    }
    getProfile()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setProfile(null)
    setMenuOpen(false)
    router.push('/')
  }

  const nl = (href: string, label: string) => (
    <Link
      key={href}
      href={href}
      onClick={() => setMenuOpen(false)}
      className={`px-3 py-2 rounded text-sm font-medium transition-all whitespace-nowrap ${
        pathname === href
          ? 'text-[#E8A020] bg-[#E8A020]/10'
          : 'text-white/50 hover:text-white hover:bg-white/5'
      }`}
    >
      {label}
    </Link>
  )

  const nlMobile = (href: string, label: string) => (
    <Link
      key={href}
      href={href}
      onClick={() => setMenuOpen(false)}
      className={`block px-4 py-3 text-sm font-medium transition-all border-b border-white/5 ${
        pathname === href
          ? 'text-[#E8A020] bg-[#E8A020]/10'
          : 'text-white/60 hover:text-white hover:bg-white/5'
      }`}
    >
      {label}
    </Link>
  )

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 h-16 bg-[#0D1B2A]/97 backdrop-blur border-b border-white/5 flex items-center px-4 gap-3 z-50">
        {/* Logo */}
        <Link href="/" className="flex flex-col mr-2 flex-shrink-0">
          <span className="font-black text-xl tracking-tighter text-white">2<span className="text-[#E8A020]">GET</span></span>
          <span className="text-[9px] text-white/30 tracking-widest -mt-0.5">PERTH</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex gap-1 flex-1">
          {nl('/', 'Home')}
          {nl('/browse', 'Find a Tradie')}
          {loaded && profile && nl('/dashboard', 'Dashboard')}
          {loaded && profile && nl('/messages', 'Messages')}
          {loaded && profile?.account_type === 'customer' && nl('/rewards', 'Rewards ⭐')}
          {loaded && profile?.account_type === 'provider' && nl('/financials', 'Financials')}
          {loaded && profile?.account_type === 'provider' && nl('/verify-account', 'Get verified')}
        </div>

        {/* Desktop auth */}
        <div className="hidden md:flex items-center gap-3 flex-shrink-0 ml-auto">
          {loaded && profile ? (
            <>
              <div className="text-sm text-white/50">{profile.first_name}</div>
              <button onClick={handleSignOut} className="px-3 py-1.5 rounded text-sm font-medium text-white/70 border border-white/15 hover:bg-white/5">
                Sign out
              </button>
            </>
          ) : loaded ? (
            <>
              <Link href="/auth/login" className="px-3 py-1.5 rounded text-sm font-medium text-white/70 border border-white/15 hover:bg-white/5">Log in</Link>
              <Link href="/auth/signup" className="px-3 py-1.5 rounded text-sm font-bold bg-[#E8A020] text-[#0D1B2A] hover:bg-[#B87A10]">Sign up free</Link>
            </>
          ) : null}
        </div>

        {/* Mobile right side */}
        <div className="flex md:hidden items-center gap-2 ml-auto">
          {loaded && !profile && (
            <Link href="/auth/signup" className="px-3 py-1.5 rounded text-xs font-bold bg-[#E8A020] text-[#0D1B2A]">
              Sign up
            </Link>
          )}
          {loaded && profile && (
            <div className="text-xs text-white/40">{profile.first_name}</div>
          )}
          {/* Hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-9 h-9 flex flex-col items-center justify-center gap-1.5 rounded-lg border border-white/15 hover:bg-white/5"
          >
            <span className={`w-5 h-0.5 bg-white/70 transition-all ${menuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
            <span className={`w-5 h-0.5 bg-white/70 transition-all ${menuOpen ? 'opacity-0' : ''}`}></span>
            <span className={`w-5 h-0.5 bg-white/70 transition-all ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="fixed top-16 left-0 right-0 bg-[#0D1B2A] border-b border-white/10 z-40 md:hidden">
          {nlMobile('/', 'Home')}
          {nlMobile('/browse', 'Find a Tradie')}
          {loaded && profile && nlMobile('/dashboard', 'Dashboard')}
          {loaded && profile && nlMobile('/messages', 'Messages')}
          {loaded && profile?.account_type === 'customer' && nlMobile('/rewards', 'Rewards ⭐')}
          {loaded && profile?.account_type === 'provider' && nlMobile('/financials', 'Financials')}
          {loaded && profile?.account_type === 'provider' && nlMobile('/verify-account', 'Get verified')}
          {loaded && profile && (
            <button
              onClick={handleSignOut}
              className="block w-full text-left px-4 py-3 text-sm font-medium text-[#E05A3A] hover:bg-white/5"
            >
              Sign out
            </button>
          )}
          {loaded && !profile && (
            <div className="p-4 flex gap-3">
              <Link href="/auth/login" onClick={() => setMenuOpen(false)} className="flex-1 py-2 text-center border border-white/15 rounded-lg text-sm text-white/70">Log in</Link>
              <Link href="/auth/signup" onClick={() => setMenuOpen(false)} className="flex-1 py-2 text-center bg-[#E8A020] rounded-lg text-sm font-bold text-[#0D1B2A]">Sign up free</Link>
            </div>
          )}
        </div>
      )}
    </>
  )
}
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
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

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

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 h-16 bg-[#0D1B2A]/97 backdrop-blur border-b border-white/5 flex items-center px-4 gap-3 z-50">
        <Link href="/" className="flex flex-col mr-2 flex-shrink-0">
          <span className="font-black text-xl tracking-tighter text-white">2<span className="text-[#E8A020]">GET</span></span>
          <span className="text-[9px] text-white/30 tracking-widest -mt-0.5">PERTH</span>
        </Link>

        {/* Desktop links */}
        {!isMobile && (
          <div className="flex gap-1 flex-1">
            {nl('/', 'Home')}
            {nl('/browse', 'Find a Tradie')}
            {loaded && profile && nl('/dashboard', 'Dashboard')}
            {loaded && profile && nl('/messages', 'Messages')}
            {loaded && profile?.account_type === 'customer' && nl('/rewards', 'Rewards ⭐')}
            {loaded && profile?.account_type === 'provider' && nl('/financials', 'Financials')}
            {loaded && profile?.account_type === 'provider' && nl('/verify-account', 'Get verified')}
          </div>
        )}

        {isMobile && <div className="flex-1" />}

        {/* Desktop auth */}
        {!isMobile && loaded && (
          <div className="flex items-center gap-3 flex-shrink-0">
            {profile ? (
              <>
                <div className="text-sm text-white/50">{profile.first_name}</div>
                <button onClick={handleSignOut} className="px-3 py-1.5 rounded text-sm font-medium text-white/70 border border-white/15 hover:bg-white/5">
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="px-3 py-1.5 rounded text-sm font-medium text-white/70 border border-white/15 hover:bg-white/5">Log in</Link>
                <Link href="/auth/signup" className="px-3 py-1.5 rounded text-sm font-bold bg-[#E8A020] text-[#0D1B2A] hover:bg-[#B87A10]">Sign up free</Link>
              </>
            )}
          </div>
        )}

        {/* Mobile right */}
        {isMobile && (
          <div className="flex items-center gap-2">
            {loaded && !profile && (
              <Link href="/auth/signup" className="px-3 py-1.5 rounded text-xs font-bold bg-[#E8A020] text-[#0D1B2A]">
                Sign up
              </Link>
            )}
            {loaded && profile && (
              <span className="text-xs text-white/40">{profile.first_name}</span>
            )}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-9 h-9 flex flex-col items-center justify-center gap-1.5 rounded-lg border border-white/15"
            >
              <span style={{
                display:'block', width:'20px', height:'2px', background:'rgba(255,255,255,0.7)',
                transform: menuOpen ? 'rotate(45deg) translateY(6px)' : 'none',
                transition:'all 0.2s'
              }}/>
              <span style={{
                display:'block', width:'20px', height:'2px', background:'rgba(255,255,255,0.7)',
                opacity: menuOpen ? 0 : 1,
                transition:'all 0.2s'
              }}/>
              <span style={{
                display:'block', width:'20px', height:'2px', background:'rgba(255,255,255,0.7)',
                transform: menuOpen ? 'rotate(-45deg) translateY(-6px)' : 'none',
                transition:'all 0.2s'
              }}/>
            </button>
          </div>
        )}
      </nav>

      {/* Mobile dropdown menu */}
      {isMobile && menuOpen && (
        <div style={{
          position:'fixed', top:'64px', left:0, right:0,
          background:'#0D1B2A', borderBottom:'1px solid rgba(255,255,255,0.1)',
          zIndex:40
        }}>
          {[
            {href:'/', label:'Home'},
            {href:'/browse', label:'Find a Tradie'},
            ...(loaded && profile ? [{href:'/dashboard', label:'Dashboard'}, {href:'/messages', label:'Messages'}] : []),
            ...(loaded && profile?.account_type === 'customer' ? [{href:'/rewards', label:'Rewards ⭐'}] : []),
            ...(loaded && profile?.account_type === 'provider' ? [{href:'/financials', label:'Financials'}, {href:'/verify-account', label:'Get verified'}] : []),
          ].map(item => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              style={{
                display:'block', padding:'14px 18px',
                fontSize:'14px', fontWeight:'500',
                color: pathname === item.href ? '#E8A020' : 'rgba(255,255,255,0.6)',
                background: pathname === item.href ? 'rgba(232,160,32,0.08)' : 'transparent',
                borderBottom:'1px solid rgba(255,255,255,0.05)',
                textDecoration:'none'
              }}
            >
              {item.label}
            </Link>
          ))}
          {loaded && profile && (
            <button
              onClick={handleSignOut}
              style={{
                display:'block', width:'100%', textAlign:'left',
                padding:'14px 18px', fontSize:'14px', fontWeight:'500',
                color:'#E05A3A', background:'none', border:'none', cursor:'pointer',
                borderTop:'1px solid rgba(255,255,255,0.05)'
              }}
            >
              Sign out
            </button>
          )}
          {loaded && !profile && (
            <div style={{padding:'14px 18px', display:'flex', gap:'10px'}}>
              <Link href="/auth/login" onClick={() => setMenuOpen(false)} style={{flex:1, padding:'9px', textAlign:'center', border:'1px solid rgba(255,255,255,0.15)', borderRadius:'8px', fontSize:'13px', color:'rgba(255,255,255,0.7)', textDecoration:'none'}}>Log in</Link>
              <Link href="/auth/signup" onClick={() => setMenuOpen(false)} style={{flex:1, padding:'9px', textAlign:'center', background:'#E8A020', borderRadius:'8px', fontSize:'13px', fontWeight:'700', color:'#0D1B2A', textDecoration:'none'}}>Sign up free</Link>
            </div>
          )}
        </div>
      )}
    </>
  )
}
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
  const [isMobile, setIsMobile] = useState<boolean | null>(null)

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
      style={{
        padding:'6px 12px',
        borderRadius:'6px',
        fontSize:'14px',
        fontWeight:500,
        whiteSpace:'nowrap' as const,
        color: pathname === href ? '#E8A020' : 'rgba(255,255,255,0.5)',
        background: pathname === href ? 'rgba(232,160,32,0.1)' : 'transparent',
        textDecoration:'none',
        transition:'all 0.15s'
      }}
    >
      {label}
    </Link>
  )

  // Don't render until we know screen size
  if (isMobile === null) {
    return (
      <nav style={{position:'fixed',top:0,left:0,right:0,height:'64px',background:'rgba(13,27,42,0.97)',borderBottom:'1px solid rgba(255,255,255,0.05)',zIndex:50,display:'flex',alignItems:'center',padding:'0 16px'}}>
        <Link href="/" style={{textDecoration:'none',display:'flex',flexDirection:'column',marginRight:'8px'}}>
          <span style={{fontWeight:900,fontSize:'20px',letterSpacing:'-1px',color:'#fff'}}>2<span style={{color:'#E8A020'}}>GET</span></span>
          <span style={{fontSize:'9px',color:'rgba(255,255,255,0.3)',letterSpacing:'2px',marginTop:'-2px'}}>PERTH</span>
        </Link>
      </nav>
    )
  }

  return (
    <>
      <nav style={{
        position:'fixed',top:0,left:0,right:0,height:'64px',
        background:'rgba(13,27,42,0.97)',
        borderBottom:'1px solid rgba(255,255,255,0.05)',
        zIndex:50,display:'flex',alignItems:'center',padding:'0 16px',gap:'8px'
      }}>
        {/* Logo */}
        <Link href="/" style={{textDecoration:'none',display:'flex',flexDirection:'column',marginRight:'8px',flexShrink:0}}>
          <span style={{fontWeight:900,fontSize:'20px',letterSpacing:'-1px',color:'#fff'}}>2<span style={{color:'#E8A020'}}>GET</span></span>
          <span style={{fontSize:'9px',color:'rgba(255,255,255,0.3)',letterSpacing:'2px',marginTop:'-2px'}}>PERTH</span>
        </Link>

        {/* Desktop nav links */}
        {isMobile === false && (
          <div style={{display:'flex',gap:'2px',flex:1}}>
            {nl('/', 'Home')}
            {nl('/browse', 'Find a Tradie')}
            {loaded && profile && nl('/dashboard', 'Dashboard')}
            {loaded && profile && nl('/messages', 'Messages')}
            {loaded && profile?.account_type === 'customer' && nl('/rewards', 'Rewards ⭐')}
            {loaded && profile?.account_type === 'provider' && nl('/financials', 'Financials')}
            {loaded && profile?.account_type === 'provider' && nl('/verify-account', 'Get verified')}
          </div>
        )}

        {isMobile === true && <div style={{flex:1}}/>}

        {/* Desktop auth */}
        {isMobile === false && loaded && (
          <div style={{display:'flex',alignItems:'center',gap:'10px',flexShrink:0}}>
            {profile ? (
              <>
                <span style={{fontSize:'13px',color:'rgba(255,255,255,0.5)'}}>{profile.first_name}</span>
                <button onClick={handleSignOut} style={{padding:'6px 12px',borderRadius:'6px',fontSize:'13px',fontWeight:500,color:'rgba(255,255,255,0.7)',border:'1px solid rgba(255,255,255,0.15)',background:'none',cursor:'pointer'}}>
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" style={{padding:'6px 12px',borderRadius:'6px',fontSize:'13px',fontWeight:500,color:'rgba(255,255,255,0.7)',border:'1px solid rgba(255,255,255,0.15)',textDecoration:'none'}}>Log in</Link>
                <Link href="/auth/signup" style={{padding:'6px 12px',borderRadius:'6px',fontSize:'13px',fontWeight:700,background:'#E8A020',color:'#0D1B2A',textDecoration:'none'}}>Sign up free</Link>
              </>
            )}
          </div>
        )}

        {/* Mobile right side */}
        {isMobile === true && (
          <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
            {loaded && !profile && (
              <Link href="/auth/signup" style={{padding:'6px 10px',borderRadius:'6px',fontSize:'12px',fontWeight:700,background:'#E8A020',color:'#0D1B2A',textDecoration:'none'}}>
                Sign up
              </Link>
            )}
            {loaded && profile && (
              <span style={{fontSize:'12px',color:'rgba(255,255,255,0.4)'}}>{profile.first_name}</span>
            )}
            {/* Hamburger button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={{
                width:'38px',height:'38px',borderRadius:'8px',
                border:'1px solid rgba(255,255,255,0.15)',
                background:'none',cursor:'pointer',
                display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'5px'
              }}
            >
              <span style={{display:'block',width:'18px',height:'2px',background:'rgba(255,255,255,0.7)',transition:'all 0.2s',transform:menuOpen?'rotate(45deg) translateY(7px)':'none'}}/>
              <span style={{display:'block',width:'18px',height:'2px',background:'rgba(255,255,255,0.7)',transition:'all 0.2s',opacity:menuOpen?0:1}}/>
              <span style={{display:'block',width:'18px',height:'2px',background:'rgba(255,255,255,0.7)',transition:'all 0.2s',transform:menuOpen?'rotate(-45deg) translateY(-7px)':'none'}}/>
            </button>
          </div>
        )}
      </nav>

      {/* Mobile dropdown */}
      {isMobile === true && menuOpen && (
        <div style={{
          position:'fixed',top:'64px',left:0,right:0,
          background:'#0D1B2A',
          borderBottom:'1px solid rgba(255,255,255,0.1)',
          zIndex:49
        }}>
          {[
            {href:'/', label:'Home'},
            {href:'/browse', label:'Find a Tradie'},
            ...(loaded && profile ? [{href:'/dashboard',label:'Dashboard'},{href:'/messages',label:'Messages'}] : []),
            ...(loaded && profile?.account_type === 'customer' ? [{href:'/rewards',label:'Rewards ⭐'}] : []),
            ...(loaded && profile?.account_type === 'provider' ? [{href:'/financials',label:'Financials'},{href:'/verify-account',label:'Get verified'}] : []),
          ].map(item => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              style={{
                display:'block',padding:'14px 18px',fontSize:'15px',fontWeight:500,
                color: pathname === item.href ? '#E8A020' : 'rgba(255,255,255,0.7)',
                background: pathname === item.href ? 'rgba(232,160,32,0.08)' : 'transparent',
                borderBottom:'1px solid rgba(255,255,255,0.05)',textDecoration:'none'
              }}
            >
              {item.label}
            </Link>
          ))}
          {loaded && profile && (
            <button
              onClick={handleSignOut}
              style={{
                display:'block',width:'100%',textAlign:'left',
                padding:'14px 18px',fontSize:'15px',fontWeight:500,
                color:'#E05A3A',background:'none',border:'none',cursor:'pointer',
                borderTop:'1px solid rgba(255,255,255,0.05)'
              }}
            >
              Sign out
            </button>
          )}
          {loaded && !profile && (
            <div style={{padding:'14px 18px',display:'flex',gap:'10px'}}>
              <Link href="/auth/login" onClick={() => setMenuOpen(false)} style={{flex:1,padding:'10px',textAlign:'center',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'8px',fontSize:'14px',color:'rgba(255,255,255,0.7)',textDecoration:'none'}}>Log in</Link>
              <Link href="/auth/signup" onClick={() => setMenuOpen(false)} style={{flex:1,padding:'10px',textAlign:'center',background:'#E8A020',borderRadius:'8px',fontSize:'14px',fontWeight:700,color:'#0D1B2A',textDecoration:'none'}}>Sign up free</Link>
            </div>
          )}
        </div>
      )}
    </>
  )
}
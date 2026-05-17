'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useParams } from 'next/navigation'

export default function ListingPage() {
  const { id } = useParams()
  const [listing, setListing] = useState<any>(null)
  const [provider, setProvider] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const fetchListing = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      const { data } = await supabase
        .from('listings')
        .select('*, profiles(id, first_name, last_name, abn, phone)')
        .eq('id', id)
        .single()

      if (data) {
        setListing(data)
        setProvider(data.profiles)
      }
      setLoading(false)
    }
    fetchListing()
  }, [id])

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0D1B2A] flex items-center justify-center">
        <div className="text-white/30 text-sm">Loading...</div>
      </main>
    )
  }

  if (!listing) {
    return (
      <main className="min-h-screen bg-[#0D1B2A] flex items-center justify-center">
        <div className="text-white/30 text-sm">Listing not found</div>
      </main>
    )
  }

  const pricingLabel: Record<string,string> = {
    job:'/job', hr:'/hr', day:'/day', sqm:'/sqm', quote:''
  }

  const CATEGORY_ICONS: Record<string,string> = {
    Painters:'🖌️', Plumbers:'🔧', Electricians:'⚡', Gardeners:'🌿', Cleaners:'✨', Handymen:'🔨'
  }

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
        </div>
        <div className="flex gap-2">
          <Link href="/auth/login" className="px-4 py-2 rounded text-sm font-medium text-white/70 border border-white/15 hover:bg-white/5">Log in</Link>
          <Link href="/auth/signup" className="px-4 py-2 rounded text-sm font-bold bg-[#E8A020] text-[#0D1B2A] hover:bg-[#B87A10]">Get started free</Link>
        </div>
      </nav>

      <div className="pt-20 max-w-5xl mx-auto px-6 pb-20">
        <Link href="/browse" className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm mb-6 mt-4">
          ← Back to listings
        </Link>

        <div className="grid grid-cols-3 gap-8">
          <div className="col-span-2">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-full bg-[#E8A020] flex items-center justify-center text-[#0D1B2A] font-black text-lg flex-shrink-0">
                  {provider?.first_name?.[0]}{provider?.last_name?.[0]}
                </div>
                <div>
                  <div className="text-white font-bold text-lg flex items-center gap-2">
                    {provider?.first_name} {provider?.last_name}
                    {provider?.abn && (
                      <span className="text-[#0EA47A] text-xs font-semibold bg-[#0EA47A]/10 border border-[#0EA47A]/20 px-2 py-0.5 rounded-full">
                        ✓ ABN Verified
                      </span>
                    )}
                  </div>
                  <div className="text-white/40 text-sm mt-1">
                    {listing.category} · {listing.region}
                  </div>
                  <div className="flex items-center gap-4 mt-2 flex-wrap">
                    {listing.rating > 0 && (
                      <span className="text-amber-400 text-sm">★ {listing.rating} ({listing.review_count} reviews)</span>
                    )}
                    {listing.jobs_completed > 0 && (
                      <span className="text-white/40 text-sm">✓ {listing.jobs_completed} jobs done</span>
                    )}
                    <span className="text-[#0EA47A] text-sm font-medium">{listing.availability}</span>
                  </div>
                </div>
              </div>
            </div>

            <h1 className="text-3xl font-black tracking-tight text-white mb-4">{listing.title}</h1>

            {listing.tags && listing.tags.length > 0 && (
              <div className="flex gap-2 flex-wrap mb-6">
                {listing.tags.map((tag: string) => (
                  <span key={tag} className="px-3 py-1 bg-[#E8A020]/10 border border-[#E8A020]/20 rounded-full text-xs font-semibold text-[#E8A020]">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="bg-white/3 border border-white/8 rounded-2xl p-6 mb-6">
              <h2 className="text-white font-bold mb-3">About this service</h2>
              <p className="text-white/60 text-sm leading-relaxed whitespace-pre-wrap">{listing.description}</p>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white/3 border border-white/8 rounded-xl p-4 text-center">
                <div className="text-2xl font-black text-white mb-1">{listing.rating > 0 ? listing.rating : '—'}</div>
                <div className="text-xs text-white/30">Rating</div>
              </div>
              <div className="bg-white/3 border border-white/8 rounded-xl p-4 text-center">
                <div className="text-2xl font-black text-white mb-1">{listing.jobs_completed || 0}</div>
                <div className="text-xs text-white/30">Jobs completed</div>
              </div>
              <div className="bg-white/3 border border-white/8 rounded-xl p-4 text-center">
                <div className="text-2xl font-black text-white mb-1">{listing.review_count || 0}</div>
                <div className="text-xs text-white/30">Reviews</div>
              </div>
            </div>

            <div className="bg-white/3 border border-white/8 rounded-2xl p-6">
              <h2 className="text-white font-bold mb-3">Reviews</h2>
              <div className="text-white/30 text-sm text-center py-6">
                No reviews yet — be the first to book and leave a review!
              </div>
            </div>
          </div>

          <div className="col-span-1">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sticky top-20">
              <div className="mb-5">
                <div className="text-xs text-white/30 uppercase tracking-widest mb-1">Starting from</div>
                {listing.pricing_type === 'quote' ? (
                  <div className="text-2xl font-black text-[#E8A020]">Quote only</div>
                ) : (
                  <div>
                    <span className="text-4xl font-black text-white tracking-tight">${listing.price?.toFixed(0)}</span>
                    <span className="text-white/30 text-sm ml-1">{pricingLabel[listing.pricing_type]}</span>
                  </div>
                )}
                <div className="text-xs text-white/30 mt-1">Final price confirmed after quote</div>
              </div>

              {user ? (
                <div className="space-y-3">
                  <Link
                    href={`/book/${listing.id}`}
                    className="block w-full py-3 bg-[#E8A020] text-[#0D1B2A] font-black rounded-xl text-sm text-center hover:bg-[#B87A10]"
                  >
                    Book now
                  </Link>
                  <Link
                    href={`/messages?provider=${provider?.id}&listing=${listing.id}`}
                    className="block w-full py-3 border border-white/20 text-white font-bold rounded-xl text-sm text-center hover:bg-white/5"
                  >
                    Request a quote
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  <Link
                    href="/auth/signup"
                    className="block w-full py-3 bg-[#E8A020] text-[#0D1B2A] font-black rounded-xl text-sm text-center hover:bg-[#B87A10]"
                  >
                    Sign up to book
                  </Link>
                  <Link
                    href="/auth/login"
                    className="block w-full py-3 border border-white/20 text-white font-bold rounded-xl text-sm text-center hover:bg-white/5"
                  >
                    Log in
                  </Link>
                </div>
              )}

              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-xs text-[#0EA47A]">🛡️ 2GET Secure Payment</div>
                <div className="flex items-center gap-2 text-xs text-white/30">🔄 Free cancellation up to 48hrs</div>
                <div className="flex items-center gap-2 text-xs text-white/30">🎧 2GET support if anything goes wrong</div>
              </div>

              <div className="mt-5 pt-5 border-t border-white/8 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-white/40 flex items-center gap-2">📍 Region</span>
                  <span className="text-white font-medium text-xs">{listing.region}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/40 flex items-center gap-2">📅 Availability</span>
                  <span className="text-[#0EA47A] font-medium text-xs">{listing.availability}</span>
                </div>
                {provider?.abn && (
                  <div className="flex justify-between text-sm">
                    <span className="text-white/40 flex items-center gap-2">✓ ABN</span>
                    <span className="text-[#0EA47A] font-medium text-xs">Verified</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
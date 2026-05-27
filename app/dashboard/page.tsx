'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Dashboard() {
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [bookings, setBookings] = useState<any[]>([])
  const [listings, setListings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      setProfile(profile)

      if (profile?.account_type === 'customer') {
        const { data: bookings } = await supabase
          .from('bookings')
          .select('*, listings(title, category)')
          .eq('customer_id', user.id)
          .order('created_at', { ascending: false })
        setBookings(bookings || [])
      } else {
        const { data: listings } = await supabase
          .from('listings')
          .select('*')
          .eq('provider_id', user.id)
          .order('created_at', { ascending: false })
        setListings(listings || [])

        const { data: bookings } = await supabase
          .from('bookings')
          .select('*, profiles!bookings_customer_id_fkey(first_name, last_name), listings(title)')
          .eq('provider_id', user.id)
          .order('created_at', { ascending: false })
        setBookings(bookings || [])
      }

      setLoading(false)
    }
    getProfile()
  }, [router])

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0D1B2A] flex items-center justify-center">
        <div className="text-white/50 text-sm">Loading...</div>
      </main>
    )
  }

  const statusColours: Record<string,string> = {
    pending: 'text-[#E8A020] bg-[#E8A020]/10',
    confirmed: 'text-[#0EA47A] bg-[#0EA47A]/10',
    completed: 'text-blue-400 bg-blue-400/10',
    cancelled: 'text-red-400 bg-red-400/10',
  }

  return (
    <main className="min-h-screen bg-[#0D1B2A] pt-16">
      <div className="px-4 md:px-6 max-w-5xl mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white mb-2">
            Welcome back, {profile?.first_name} 👋
          </h1>
          <p className="text-white/40 text-sm">
            {profile?.account_type === 'provider' ? 'Manage your listings, bookings and finances' : 'Find and book trusted Perth tradies'}
          </p>
        </div>

        {profile?.account_type === 'customer' ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/browse" className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-[#E8A020]/30 transition-all cursor-pointer block">
                <div className="text-3xl mb-3">🔍</div>
                <h3 className="text-white font-bold mb-1">Find a tradie</h3>
                <p className="text-white/40 text-sm">Browse Perth&apos;s best tradespeople</p>
              </Link>
              <Link href="/messages" className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-[#E8A020]/30 transition-all cursor-pointer block">
                <div className="text-3xl mb-3">💬</div>
                <h3 className="text-white font-bold mb-1">Messages</h3>
                <p className="text-white/40 text-sm">Chat with your tradies</p>
              </Link>
              <Link href="/rewards" className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-[#E8A020]/30 transition-all cursor-pointer block">
                <div className="text-3xl mb-3">⭐</div>
                <h3 className="text-white font-bold mb-1">My rewards</h3>
                <p className="text-white/40 text-sm">View your XP and giveaway entries</p>
              </Link>
            </div>

            {bookings.length > 0 && (
              <div>
                <h2 className="text-lg font-black text-white mb-4">My bookings</h2>
                <div className="space-y-3">
                  {bookings.map(booking => (
                    <div key={booking.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between gap-3">
                      <div>
                        <div className="text-white font-bold text-sm mb-1">{booking.listings?.title}</div>
                        <div className="text-white/40 text-xs">{booking.job_date} · ${booking.amount}</div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${statusColours[booking.status]}`}>
                          {booking.status}
                        </span>
                        {booking.status === 'completed' && (
                          <Link href={`/review/${booking.id}`} className="px-3 py-1.5 bg-[#E8A020] text-[#0D1B2A] font-bold text-xs rounded-lg">
                            Review
                          </Link>
                        )}
                        {booking.status === 'pending' && (
                          <Link href="/messages" className="px-3 py-1.5 border border-white/20 text-white font-bold text-xs rounded-lg">
                            Message
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Link href="/dashboard/listings/new" className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:border-[#E8A020]/30 transition-all block">
                <div className="text-2xl mb-2">➕</div>
                <h3 className="text-white font-bold text-sm mb-1">New listing</h3>
                <p className="text-white/40 text-xs">Add a service</p>
              </Link>
              <Link href="/messages" className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:border-[#E8A020]/30 transition-all block">
                <div className="text-2xl mb-2">💬</div>
                <h3 className="text-white font-bold text-sm mb-1">Messages</h3>
                <p className="text-white/40 text-xs">Customer enquiries</p>
              </Link>
              <Link href="/financials" className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:border-[#E8A020]/30 transition-all block">
                <div className="text-2xl mb-2">💰</div>
                <h3 className="text-white font-bold text-sm mb-1">Financials</h3>
                <p className="text-[#E8A020] text-xs font-bold">${bookings.filter(b => b.status === 'completed').reduce((sum, b) => sum + (b.amount || 0), 0).toFixed(2)}</p>
              </Link>
              <Link href="/verify-account" className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:border-[#E8A020]/30 transition-all block">
                <div className="text-2xl mb-2">✅</div>
                <h3 className="text-white font-bold text-sm mb-1">Get verified</h3>
                <p className="text-white/40 text-xs">Build trust</p>
              </Link>
            </div>

            {listings.length > 0 && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-black text-white">My listings</h2>
                  <Link href="/dashboard/listings/new" className="text-sm text-[#E8A020] font-bold">+ Add new</Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {listings.map(listing => (
                    <div key={listing.id} className="bg-white/5 border border-white/10 rounded-2xl p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="text-white font-bold text-sm mb-1">{listing.title}</div>
                          <div className="text-white/40 text-xs">{listing.category} · {listing.region}</div>
                        </div>
                        <span className="text-xs font-bold text-[#0EA47A] bg-[#0EA47A]/10 px-2 py-1 rounded-full">Active</span>
                      </div>
                      <div className="flex gap-4 text-xs text-white/40 mb-3">
                        <span>★ {listing.rating || '—'}</span>
                        <span>{listing.review_count || 0} reviews</span>
                        <span>${listing.price}</span>
                      </div>
                      <Link href={`/listing/${listing.id}`} className="block w-full py-2 border border-white/10 rounded-lg text-xs text-white/50 hover:text-white text-center">
                        View listing
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {bookings.length > 0 && (
              <div>
                <h2 className="text-lg font-black text-white mb-4">Recent bookings</h2>
                <div className="space-y-3">
                  {bookings.map(booking => (
                    <div key={booking.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between gap-3">
                      <div>
                        <div className="text-white font-bold text-sm mb-1">
                          {booking.profiles?.first_name} {booking.profiles?.last_name}
                        </div>
                        <div className="text-white/40 text-xs">
                          {booking.listings?.title} · {booking.job_date} · ${booking.amount}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${statusColours[booking.status]}`}>
                          {booking.status}
                        </span>
                        <Link href="/messages" className="px-3 py-1.5 border border-white/20 text-white font-bold text-xs rounded-lg">
                          Message
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
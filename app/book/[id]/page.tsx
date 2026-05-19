'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { awardXP, XP_EVENTS } from '@/lib/xp'

export default function BookPage() {
  const { id } = useParams()
  const router = useRouter()
  const [listing, setListing] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)
  const [paid, setPaid] = useState(false)
  const [jobDate, setJobDate] = useState('')
  const [jobNotes, setJobNotes] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      setUser(user)

      const { data } = await supabase
        .from('listings')
        .select('*, profiles(first_name, last_name, email)')
        .eq('id', id)
        .single()

      setListing(data)
      setLoading(false)
    }
    init()
  }, [id])

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!jobDate) { setError('Please select a job date'); return }
    setPaying(true)
    setError('')

    try {
      const res = await fetch('/api/stripe/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: listing.price,
          metadata: {
            listing_id: listing.id,
            customer_id: user.id,
            provider_id: listing.provider_id,
            job_date: jobDate,
          }
        })
      })

      const { clientSecret, error: stripeError } = await res.json()
      if (stripeError) throw new Error(stripeError)

      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          listing_id: listing.id,
          customer_id: user.id,
          provider_id: listing.provider_id,
          job_date: jobDate,
          notes: jobNotes,
          amount: listing.price,
          fee_amount: listing.fee_amount,
          status: 'pending',
          payment_intent_id: clientSecret.split('_secret_')[0],
        })
        .select()
        .single()

      if (bookingError) throw bookingError

      // Award XP for booking
      const xpPerDollar = Math.floor(listing.price * XP_EVENTS.BOOKING_PER_DOLLAR)
      await awardXP(
        user.id,
        'BOOKING',
        xpPerDollar,
        `Booked ${listing.title}`,
        booking.id
      )

      // Check if first booking and award bonus
      const { data: allBookings } = await supabase
        .from('bookings')
        .select('id')
        .eq('customer_id', user.id)

      if (allBookings && allBookings.length === 1) {
        await awardXP(
          user.id,
          'FIRST_BOOKING',
          XP_EVENTS.FIRST_BOOKING,
          'First booking bonus! 🎉',
          booking.id
        )
      }

      setPaid(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setPaying(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0D1B2A] flex items-center justify-center">
        <div className="text-white/30 text-sm">Loading...</div>
      </main>
    )
  }

  if (paid) {
    return (
      <main className="min-h-screen bg-[#0D1B2A] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-10 max-w-md w-full text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h1 className="text-2xl font-black text-[#0D1B2A] mb-3">Booking confirmed!</h1>
          <p className="text-gray-400 text-sm leading-relaxed mb-3">
            Your booking with <strong>{listing.profiles?.first_name}</strong> has been confirmed for <strong>{jobDate}</strong>.
          </p>
          <div className="bg-[#FDF3DC] border border-[#E8A020]/20 rounded-xl p-4 text-sm text-[#B87A10] font-bold mb-3">
            🎉 You earned XP for this booking! Check your rewards.
          </div>
          <div className="bg-[#E6F7F2] border border-[#0EA47A]/20 rounded-xl p-4 text-sm text-[#0A7A5C] mb-6">
            Your payment of <strong>${listing.price}</strong> is held securely by 2GET and released to the tradie once the job is complete.
          </div>
          <Link href="/rewards" className="block w-full py-3 bg-[#E8A020] text-[#0D1B2A] font-black rounded-xl text-sm hover:bg-[#B87A10] mb-3">
            View my rewards
          </Link>
          <Link href="/dashboard" className="block w-full py-3 border border-gray-200 text-gray-500 font-bold rounded-xl text-sm hover:bg-gray-50">
            Go to dashboard
          </Link>
        </div>
      </main>
    )
  }

  const fee = listing?.fee_amount || listing?.price * 0.05
  const providerReceives = listing?.price - fee

  return (
    <main className="min-h-screen bg-[#0D1B2A]">
      <nav className="fixed top-0 left-0 right-0 h-16 bg-[#0D1B2A]/95 backdrop-blur border-b border-white/5 flex items-center px-6 gap-4 z-50">
        <div className="flex flex-col mr-4">
          <span className="font-black text-2xl tracking-tighter text-white">2<span className="text-[#E8A020]">GET</span></span>
          <span className="text-[10px] text-white/30 tracking-widest -mt-1">PERTH</span>
        </div>
        <Link href={`/listing/${id}`} className="text-white/50 hover:text-white text-sm">← Back to listing</Link>
      </nav>

      <div className="pt-24 px-6 max-w-2xl mx-auto pb-20">
        <h1 className="text-3xl font-black tracking-tight text-white mb-2">Confirm your booking</h1>
        <p className="text-white/40 text-sm mb-8">Review the details and confirm your booking below</p>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-[#E8A020] flex items-center justify-center text-[#0D1B2A] font-black text-sm">
              {listing.profiles?.first_name?.[0]}{listing.profiles?.last_name?.[0]}
            </div>
            <div>
              <div className="text-white font-bold text-sm">{listing.profiles?.first_name} {listing.profiles?.last_name}</div>
              <div className="text-white/40 text-xs">{listing.category} · {listing.region}</div>
            </div>
          </div>
          <div className="text-white font-semibold">{listing.title}</div>
        </div>

        <form onSubmit={handlePayment} className="space-y-5">
          <div>
            <label className="text-xs font-bold text-white/40 uppercase tracking-wide block mb-2">Preferred job date</label>
            <input
              type="date"
              required
              value={jobDate}
              onChange={e => setJobDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm outline-none focus:border-[#E8A020]/50"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-white/40 uppercase tracking-wide block mb-2">Notes for the tradie (optional)</label>
            <textarea
              rows={3}
              value={jobNotes}
              onChange={e => setJobNotes(e.target.value)}
              placeholder="Describe your job in more detail, access instructions, specific requirements..."
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm outline-none focus:border-[#E8A020]/50 placeholder-white/20 resize-none"
            />
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <div className="flex justify-between px-5 py-3 border-b border-white/8 text-sm">
              <span className="text-white/40">Service price</span>
              <span className="text-white font-semibold">${listing.price?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between px-5 py-3 border-b border-white/8 text-sm bg-white/3">
              <span className="text-white/40">2GET secure payment</span>
              <span className="text-[#0EA47A] font-semibold">Included</span>
            </div>
            <div className="flex justify-between px-5 py-3 border-b border-white/8 text-sm bg-[#E8A020]/5">
              <span className="text-[#E8A020]/70">XP you&apos;ll earn</span>
              <span className="text-[#E8A020] font-bold">+{Math.floor(listing.price)} XP</span>
            </div>
            <div className="flex justify-between px-5 py-4 text-base">
              <span className="text-white font-bold">Total you pay</span>
              <span className="text-[#E8A020] font-black text-xl">${listing.price?.toFixed(2)}</span>
            </div>
          </div>

          <div className="bg-[#0EA47A]/10 border border-[#0EA47A]/20 rounded-xl p-4 text-xs text-white/50 leading-relaxed">
            🛡️ Your payment is held securely by 2GET and only released to the tradie once you confirm the job is complete.
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={paying}
            className="w-full py-4 bg-[#E8A020] text-[#0D1B2A] font-black rounded-xl text-base hover:bg-[#B87A10] disabled:opacity-50"
          >
            {paying ? 'Processing...' : `Confirm & pay $${listing.price?.toFixed(2)}`}
          </button>

          <div className="text-center text-xs text-white/30">
            By confirming you agree to 2GET&apos;s Terms of Service. Payments processed securely by Stripe.
          </div>
        </form>
      </div>
    </main>
  )
}
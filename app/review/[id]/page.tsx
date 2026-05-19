'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

export default function ReviewPage() {
  const { id } = useParams()
  const router = useRouter()
  const [booking, setBooking] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [comment, setComment] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      setUser(user)

      const { data } = await supabase
        .from('bookings')
        .select('*, listings(title, category), profiles!bookings_provider_id_fkey(first_name, last_name)')
        .eq('id', id)
        .single()

      setBooking(data)
      setLoading(false)
    }
    init()
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rating === 0) { setError('Please select a rating'); return }
    setSubmitting(true)
    setError('')

    try {
      const { error: reviewError } = await supabase
        .from('reviews')
        .insert({
          booking_id: booking.id,
          listing_id: booking.listing_id,
          customer_id: user.id,
          provider_id: booking.provider_id,
          rating,
          comment,
        })

      if (reviewError) throw reviewError

      // Update listing rating
      const { data: reviews } = await supabase
        .from('reviews')
        .select('rating')
        .eq('listing_id', booking.listing_id)

      if (reviews) {
        const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        await supabase
          .from('listings')
          .update({
            rating: Math.round(avgRating * 10) / 10,
            review_count: reviews.length,
          })
          .eq('id', booking.listing_id)
      }

      // Mark booking as completed
      await supabase
        .from('bookings')
        .update({ status: 'completed', completed_at: new Date().toISOString() })
        .eq('id', booking.id)

      setSubmitted(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0D1B2A] flex items-center justify-center">
        <div className="text-white/30 text-sm">Loading...</div>
      </main>
    )
  }

  if (submitted) {
    return (
      <main className="min-h-screen bg-[#0D1B2A] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-10 max-w-md w-full text-center">
          <div className="text-5xl mb-4">⭐</div>
          <h1 className="text-2xl font-black text-[#0D1B2A] mb-3">Thanks for your review!</h1>
          <p className="text-gray-400 text-sm leading-relaxed mb-6">
            Your review helps other customers find great tradies. You&apos;ve earned <strong className="text-[#E8A020]">200 XP</strong> for leaving a review!
          </p>
          <Link href="/dashboard" className="block w-full py-3 bg-[#E8A020] text-[#0D1B2A] font-black rounded-xl text-sm hover:bg-[#B87A10]">
            Go to dashboard
          </Link>
        </div>
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
        <Link href="/dashboard" className="text-white/50 hover:text-white text-sm">← Back to dashboard</Link>
      </nav>

      <div className="pt-24 px-6 max-w-lg mx-auto pb-20">
        <h1 className="text-3xl font-black tracking-tight text-white mb-2">Leave a review</h1>
        <p className="text-white/40 text-sm mb-8">How did it go? Your review helps others find great tradies.</p>

        {/* Booking summary */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#E8A020] flex items-center justify-center text-[#0D1B2A] font-black text-sm">
              {booking?.profiles?.first_name?.[0]}{booking?.profiles?.last_name?.[0]}
            </div>
            <div>
              <div className="text-white font-bold text-sm">
                {booking?.profiles?.first_name} {booking?.profiles?.last_name}
              </div>
              <div className="text-white/40 text-xs">{booking?.listings?.title}</div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Star rating */}
          <div>
            <label className="text-xs font-bold text-white/40 uppercase tracking-wide block mb-3">Your rating</label>
            <div className="flex gap-2">
              {[1,2,3,4,5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHovered(star)}
                  onMouseLeave={() => setHovered(0)}
                  className="text-4xl transition-transform hover:scale-110"
                >
                  <span className={star <= (hovered || rating) ? 'text-[#E8A020]' : 'text-white/20'}>★</span>
                </button>
              ))}
            </div>
            {rating > 0 && (
              <div className="text-sm text-white/40 mt-2">
                {['','Terrible','Poor','Average','Good','Excellent'][rating]}
              </div>
            )}
          </div>

          {/* Comment */}
          <div>
            <label className="text-xs font-bold text-white/40 uppercase tracking-wide block mb-2">Your review</label>
            <textarea
              rows={4}
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Tell others about your experience — was the job done well? Were they on time? Would you hire again?"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm outline-none focus:border-[#E8A020]/50 placeholder-white/20 resize-none"
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <div className="bg-[#E8A020]/10 border border-[#E8A020]/20 rounded-xl p-4 text-sm text-white/50">
            ⭐ You&apos;ll earn <strong className="text-[#E8A020]">200 XP</strong> for leaving a review — that&apos;s more giveaway entries!
          </div>

          <button
            type="submit"
            disabled={submitting || rating === 0}
            className="w-full py-4 bg-[#E8A020] text-[#0D1B2A] font-black rounded-xl text-base hover:bg-[#B87A10] disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit review'}
          </button>
        </form>
      </div>
    </main>
  )
}
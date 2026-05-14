'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewListing() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Painters',
    pricing_type: 'job',
    price: '',
    region: 'All Perth metro',
    suburb: '',
    availability: 'Available now',
    tags: '',
  })

  const price = parseFloat(formData.price) || 0
  const fee = price * (5 / 105)
  const net = price - fee
  const gross = price / 0.952381

  const fmt = (v: number) => '$' + v.toFixed(2)

  const pricingLabels: Record<string, string> = {
    job: 'per job',
    hr: 'per hour',
    day: 'per day',
    sqm: 'per sqm',
    quote: 'quote only',
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not logged in')

      const { error } = await supabase.from('listings').insert({
        provider_id: user.id,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        pricing_type: formData.pricing_type,
        price: price,
        listed_price: price,
        fee_amount: fee,
        region: formData.region,
        suburb: formData.suburb,
        availability: formData.availability,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        is_active: true,
      })

      if (error) throw error
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
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

      <div className="pt-24 px-6 max-w-5xl mx-auto pb-20">
        <div className="mb-8">
          <h1 className="text-3xl font-black tracking-tight text-white mb-2">Create a new listing</h1>
          <p className="text-white/40">The fee calculator updates live as you set your price</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-3 gap-6">
            
            {/* LEFT — form fields */}
            <div className="col-span-2 space-y-5">
              
              <div>
                <label className="text-xs font-bold text-white/40 uppercase tracking-wide block mb-2">Listing title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm outline-none focus:border-[#E8A020]/50 placeholder-white/20"
                  placeholder="e.g. Residential house painting — interior & exterior"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-white/40 uppercase tracking-wide block mb-2">Trade category</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm outline-none focus:border-[#E8A020]/50"
                  >
                    {['Painters','Plumbers','Electricians','Gardeners','Cleaners','Handymen'].map(c => (
                      <option key={c} value={c} className="bg-[#0D1B2A]">{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-white/40 uppercase tracking-wide block mb-2">Pricing type</label>
                  <select
                    value={formData.pricing_type}
                    onChange={e => setFormData({...formData, pricing_type: e.target.value})}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm outline-none focus:border-[#E8A020]/50"
                  >
                    <option value="job" className="bg-[#0D1B2A]">Fixed / per job</option>
                    <option value="hr" className="bg-[#0D1B2A]">Per hour</option>
                    <option value="day" className="bg-[#0D1B2A]">Per day</option>
                    <option value="sqm" className="bg-[#0D1B2A]">Per sqm</option>
                    <option value="quote" className="bg-[#0D1B2A]">Quote only</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-white/40 uppercase tracking-wide block mb-2">Description</label>
                <textarea
                  required
                  rows={5}
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm outline-none focus:border-[#E8A020]/50 placeholder-white/20 resize-none"
                  placeholder="Describe your service, what's included, your experience and qualifications..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-white/40 uppercase tracking-wide block mb-2">Perth region</label>
                  <select
                    value={formData.region}
                    onChange={e => setFormData({...formData, region: e.target.value})}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm outline-none focus:border-[#E8A020]/50"
                  >
                    {['All Perth metro','North of river','South of river','Joondalup area','Fremantle area','Rockingham area','Mandurah area'].map(r => (
                      <option key={r} value={r} className="bg-[#0D1B2A]">{r}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-white/40 uppercase tracking-wide block mb-2">Availability</label>
                  <select
                    value={formData.availability}
                    onChange={e => setFormData({...formData, availability: e.target.value})}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm outline-none focus:border-[#E8A020]/50"
                  >
                    {['Available now','1–2 weeks lead time','2–4 weeks lead time','Flexible / on request'].map(a => (
                      <option key={a} value={a} className="bg-[#0D1B2A]">{a}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-white/40 uppercase tracking-wide block mb-2">Tags (comma separated)</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={e => setFormData({...formData, tags: e.target.value})}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm outline-none focus:border-[#E8A020]/50 placeholder-white/20"
                  placeholder="e.g. interior, exterior, residential, insured..."
                />
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 bg-[#E8A020] text-[#0D1B2A] font-black rounded-xl text-sm hover:bg-[#B87A10] disabled:opacity-50"
                >
                  {loading ? 'Publishing...' : 'Publish listing'}
                </button>
                <Link href="/dashboard" className="px-6 py-3 border border-white/10 rounded-xl text-sm text-white/50 hover:text-white hover:border-white/20">
                  Cancel
                </Link>
              </div>
            </div>

            {/* RIGHT — live fee calculator */}
            <div className="col-span-1">
              <div className="bg-[#0D1B2A] border border-white/10 rounded-2xl p-6 sticky top-24">
                <div className="text-xs font-bold text-white/30 uppercase tracking-widest mb-5 flex items-center gap-2">
                  🧮 Pricing & fee breakdown
                </div>

                <label className="text-xs font-bold text-white/40 uppercase tracking-wide block mb-2">
                  Your listing price ({pricingLabels[formData.pricing_type]})
                </label>
                <div className="relative mb-5">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 font-bold text-lg">$</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={formData.price}
                    onChange={e => setFormData({...formData, price: e.target.value})}
                    className="w-full pl-8 pr-4 py-3 bg-white/8 border border-white/12 rounded-xl text-white font-black text-2xl tracking-tight outline-none focus:border-[#E8A020]/50"
                    placeholder="0"
                  />
                </div>

                <div className="border border-white/10 rounded-xl overflow-hidden mb-4">
                  <div className="flex justify-between items-center px-4 py-3 border-b border-white/8 text-sm">
                    <span className="text-white/40">Customer pays</span>
                    <span className="text-white font-bold">{fmt(price)}</span>
                  </div>
                  <div className="flex justify-between items-center px-4 py-3 border-b border-white/8 text-sm bg-white/3">
                    <span className="text-white/40 flex items-center gap-1">% 2GET fee (5%)</span>
                    <span className="text-[#E05A3A] font-bold">-{fmt(fee)}</span>
                  </div>
                  <div className="flex justify-between items-center px-4 py-3 text-sm">
                    <span className="text-white font-bold">You receive</span>
                    <span className="text-[#E8A020] font-black text-xl">{fmt(net)}</span>
                  </div>
                </div>

                <div className="bg-[#0EA47A]/10 border border-[#0EA47A]/20 rounded-xl p-3 text-xs text-white/50 leading-relaxed mb-3">
                  <strong className="text-white/80">How it works:</strong> The customer pays {fmt(price)}. The 2GET fee is deducted before payout — nothing upfront from you. The fee is also <strong className="text-white/80">tax deductible</strong>.
                </div>

                <div className="bg-[#E8A020]/10 border border-[#E8A020]/20 rounded-xl p-3 text-xs text-white/50 leading-relaxed">
                  <strong className="text-[#E8A020]">💡 Tip:</strong> To take home {fmt(price)}, list at <strong className="text-[#E8A020]">{fmt(gross)}</strong>.
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </main>
  )
}
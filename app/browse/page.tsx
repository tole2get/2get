'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

const CATEGORIES = ['All','Painters','Plumbers','Electricians','Gardeners','Cleaners','Handymen']
const SUBURBS = ['All Perth','Joondalup','Fremantle','Subiaco','Scarborough','Rockingham','Midland','Armadale','Mandurah','Cottesloe','Baldivis','Ellenbrook','Canning Vale','Morley']
const CATEGORY_ICONS: Record<string,string> = {
  Painters:'🖌️', Plumbers:'🔧', Electricians:'⚡', Gardeners:'🌿', Cleaners:'✨', Handymen:'🔨'
}

export default function Browse() {
  const [listings, setListings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('All')
  const [suburb, setSuburb] = useState('All Perth')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('newest')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchListings()
  }, [category, sort])

  const fetchListings = async () => {
    setLoading(true)
    let query = supabase
      .from('listings')
      .select('*, profiles(first_name, last_name, abn)')
      .eq('is_active', true)

    if (category !== 'All') query = query.eq('category', category)
    if (sort === 'price_low') query = query.order('price', { ascending: true })
    else if (sort === 'price_high') query = query.order('price', { ascending: false })
    else if (sort === 'rating') query = query.order('rating', { ascending: false })
    else query = query.order('created_at', { ascending: false })

    const { data } = await query
    setListings(data || [])
    setLoading(false)
  }

  const filtered = listings.filter(l => {
    const matchSearch = search === '' ||
      l.title.toLowerCase().includes(search.toLowerCase()) ||
      l.description?.toLowerCase().includes(search.toLowerCase())
    const matchSuburb = suburb === 'All Perth' ||
      l.region?.includes(suburb) || l.suburb?.includes(suburb)
    return matchSearch && matchSuburb
  })

  const pricingLabel: Record<string,string> = {
    job:'/job', hr:'/hr', day:'/day', sqm:'/sqm', quote:''
  }

  return (
    <main className="min-h-screen bg-[#0D1B2A]">
      {/* Search bar */}
      <div className="pt-16 bg-[#0D1B2A] border-b border-white/8">
        <div className="px-4 py-3 flex gap-2 items-center flex-wrap">
          <div className="relative flex-1 min-w-0">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm">🔍</span>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search trades..."
              className="w-full pl-8 pr-3 py-2 bg-white/8 border border-white/10 rounded-lg text-white text-sm outline-none focus:border-[#E8A020]/40 placeholder-white/30"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-3 py-2 border border-white/15 rounded-lg text-xs font-medium text-white/60 hover:bg-white/5 whitespace-nowrap"
          >
            {showFilters ? 'Hide filters' : '⚙️ Filters'}
          </button>
        </div>

        {/* Category chips - scrollable on mobile */}
        <div className="px-4 pb-2 flex gap-2 overflow-x-auto" style={{scrollbarWidth:'none'}}>
          {CATEGORIES.map(c => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border whitespace-nowrap flex-shrink-0 ${
                category === c
                  ? 'bg-[#E8A020]/15 border-[#E8A020] text-[#E8A020]'
                  : 'border-white/15 text-white/50 hover:text-white'
              }`}
            >
              {c !== 'All' && CATEGORY_ICONS[c]} {c}
            </button>
          ))}
        </div>

        {/* Suburb chips - scrollable */}
        <div className="px-4 pb-3 flex gap-2 overflow-x-auto" style={{scrollbarWidth:'none'}}>
          {SUBURBS.map(s => (
            <button
              key={s}
              onClick={() => setSuburb(s)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0 transition-all border ${
                suburb === s
                  ? 'bg-white text-[#0D1B2A] border-white font-bold'
                  : 'border-white/15 text-white/40 hover:text-white'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="flex min-h-screen">
        {/* Filters panel - hidden on mobile unless toggled */}
        {showFilters && (
          <div className="w-full md:w-56 bg-[#0D1B2A] border-b md:border-b-0 md:border-r border-white/8 p-4">
            <div className="grid grid-cols-2 md:grid-cols-1 gap-4">
              <div>
                <div className="text-xs font-bold text-white/30 uppercase tracking-widest mb-2">Sort by</div>
                {[
                  {val:'newest', label:'Newest first'},
                  {val:'rating', label:'Highest rated'},
                  {val:'price_low', label:'Price: low to high'},
                  {val:'price_high', label:'Price: high to low'},
                ].map(o => (
                  <label key={o.val} className="flex items-center gap-2 cursor-pointer text-sm text-white/50 hover:text-white mb-2">
                    <input type="radio" name="sort" value={o.val} checked={sort === o.val} onChange={() => setSort(o.val)} className="accent-[#E8A020]"/>
                    {o.label}
                  </label>
                ))}
              </div>
              <div>
                <div className="text-xs font-bold text-white/30 uppercase tracking-widest mb-2">Provider type</div>
                {['Business','Freelancer'].map(t => (
                  <label key={t} className="flex items-center gap-2 cursor-pointer text-sm text-white/50 hover:text-white mb-2">
                    <input type="checkbox" defaultChecked className="accent-[#E8A020]"/>
                    {t}
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        <div className="flex-1 p-4 bg-slate-950/50">
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm text-white/40">
              <strong className="text-white">{filtered.length}</strong> listings
              {category !== 'All' && <span> in <strong className="text-white">{category}</strong></span>}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="text-white/30 text-sm">Loading listings...</div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center">
              <div className="text-4xl mb-4">🔍</div>
              <div className="text-white font-bold mb-2">No listings found</div>
              <div className="text-white/30 text-sm">Try a different category or search term</div>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map(listing => (
                <Link
                  key={listing.id}
                  href={`/listing/${listing.id}`}
                  className="block bg-white/4 border border-white/8 rounded-2xl p-4 hover:border-[#E8A020]/30 hover:bg-white/6 transition-all"
                >
                  <div className="flex gap-3 items-start">
                    <div className="w-12 h-12 rounded-xl bg-[#E8A020]/10 flex items-center justify-center text-2xl flex-shrink-0">
                      {CATEGORY_ICONS[listing.category] || '🔧'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-bold text-sm mb-1 leading-tight">{listing.title}</h3>
                          <div className="flex items-center gap-2 flex-wrap mb-2">
                            <span className="text-white/40 text-xs">👤 {listing.profiles?.first_name} {listing.profiles?.last_name}</span>
                            <span className="text-white/40 text-xs">📍 {listing.region}</span>
                            {listing.availability && (
                              <span className="text-[#0EA47A] text-xs font-medium">✓ {listing.availability}</span>
                            )}
                          </div>
                          {listing.tags && listing.tags.length > 0 && (
                            <div className="flex gap-1 flex-wrap">
                              {listing.tags.slice(0,3).map((tag: string) => (
                                <span key={tag} className="text-xs px-2 py-0.5 bg-white/5 border border-white/10 rounded-full text-white/40">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="text-right flex-shrink-0">
                          {listing.pricing_type === 'quote' ? (
                            <div className="text-[#E8A020] font-black text-sm">Quote only</div>
                          ) : (
                            <div className="text-[#E8A020] font-black text-base">
                              ${listing.price?.toFixed(0)}
                              <span className="text-white/30 text-xs font-normal">{pricingLabel[listing.pricing_type]}</span>
                            </div>
                          )}
                          {listing.rating > 0 && (
                            <div className="text-amber-400 text-xs mt-1">★ {listing.rating} ({listing.review_count})</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
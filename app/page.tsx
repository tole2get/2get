import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0D1B2A]">
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 h-16 bg-[#0D1B2A]/95 backdrop-blur border-b border-white/5 flex items-center px-6 gap-4 z-50">
        <div className="flex flex-col mr-4">
          <span className="font-black text-2xl tracking-tighter text-white">2<span className="text-[#E8A020]">GET</span></span>
          <span className="text-[10px] text-white/30 tracking-widest -mt-1">PERTH</span>
        </div>
        <div className="flex gap-1 flex-1">
          <Link href="/" className="px-3 py-2 rounded text-sm font-medium text-[#E8A020] bg-[#E8A020]/10">Home</Link>
          <Link href="/browse" className="px-3 py-2 rounded text-sm font-medium text-white/50 hover:text-white hover:bg-white/5">Find a Tradie</Link>
          <Link href="/dashboard" className="px-3 py-2 rounded text-sm font-medium text-white/50 hover:text-white hover:bg-white/5">Dashboard</Link>
        </div>
        <div className="flex gap-2">
          <Link href="/auth/login" className="px-4 py-2 rounded text-sm font-medium text-white/70 border border-white/15 hover:bg-white/5">Log in</Link>
          <Link href="/auth/signup" className="px-4 py-2 rounded text-sm font-bold bg-[#E8A020] text-[#0D1B2A] hover:bg-[#B87A10]">Get started free</Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-40 pb-24 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"/>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-[radial-gradient(ellipse,rgba(232,160,32,0.1),transparent_70%)] pointer-events-none"/>
        <div className="relative max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-[#E8A020]/10 border border-[#E8A020]/30 rounded-full px-4 py-1.5 text-xs font-semibold text-[#E8A020] mb-6">
            <span>📍</span> Perth&apos;s home for trusted trades
          </div>
          <h1 className="text-5xl font-black tracking-tighter leading-tight text-white mb-4">
            Find a tradie.<br/><span className="text-[#E8A020]">Get it done.</span>
          </h1>
          <p className="text-lg text-white/50 leading-relaxed mb-10">
            Compare quotes from Perth&apos;s best tradespeople.<br/>Free to use — no subscriptions, no lead fees.
          </p>
          <div className="flex items-center bg-white/7 border border-white/10 rounded-xl p-1.5 pl-5 max-w-xl mx-auto mb-8 gap-3">
            <input className="flex-1 bg-transparent text-white placeholder-white/30 text-sm outline-none" placeholder="What trade do you need? e.g. painter, plumber..."/>
            <select className="bg-transparent text-white/50 text-sm outline-none border-l border-white/10 pl-3 pr-2 py-1 cursor-pointer">
              <option className="bg-[#0D1B2A]">All Perth</option>
              <option className="bg-[#0D1B2A]">Joondalup</option>
              <option className="bg-[#0D1B2A]">Fremantle</option>
              <option className="bg-[#0D1B2A]">Subiaco</option>
              <option className="bg-[#0D1B2A]">Rockingham</option>
            </select>
            <Link href="/browse" className="px-5 py-2.5 bg-[#E8A020] text-[#0D1B2A] font-bold text-sm rounded-lg hover:bg-[#B87A10] whitespace-nowrap">Search</Link>
          </div>
          <div className="flex gap-6 justify-center flex-wrap">
            {['Free for customers','Verified tradies','Real reviews','Secure payments'].map(t=>(
              <div key={t} className="flex items-center gap-2 text-sm text-white/40">
                <span className="text-[#E8A020]">✓</span> {t}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRADE CATEGORIES */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <p className="text-xs font-semibold text-white/30 tracking-widest uppercase mb-2">What do you need?</p>
        <h2 className="text-2xl font-black tracking-tight text-white mb-6">Browse by trade</h2>
        <div className="grid grid-cols-6 gap-3 mb-16">
          {[
            {icon:'🖌️', name:'Painters', count:86},
            {icon:'🔧', name:'Plumbers', count:124},
            {icon:'⚡', name:'Electricians', count:98},
            {icon:'🌿', name:'Gardeners', count:71},
            {icon:'✨', name:'Cleaners', count:143},
            {icon:'🔨', name:'Handymen', count:57},
          ].map(t=>(
            <Link href="/browse" key={t.name} className="bg-white/5 border border-white/10 rounded-xl p-4 text-center hover:border-[#E8A020]/50 hover:bg-[#E8A020]/5 transition-all group">
              <div className="text-3xl mb-2">{t.icon}</div>
              <div className="text-sm font-bold text-white">{t.name}</div>
              <div className="text-xs text-white/30 mt-1">{t.count} in Perth</div>
            </Link>
          ))}
        </div>

        {/* HOW IT WORKS */}
        <div className="bg-white/3 border border-white/8 rounded-2xl p-10 mb-16">
          <p className="text-xs font-semibold text-[#E8A020] tracking-widest uppercase mb-2">Simple by design</p>
          <h2 className="text-2xl font-black tracking-tight text-white mb-8">How 2GET works</h2>
          <div className="grid grid-cols-4 gap-8">
            {[
              {n:'01', icon:'🔍', title:'Search', desc:'Browse by trade and suburb. Filter by rating, price and availability.'},
              {n:'02', icon:'💬', title:'Message & Quote', desc:'Chat directly with tradies and receive a formal quote in-app.'},
              {n:'03', icon:'📅', title:'Book', desc:'Accept the quote, lock in your date, and pay securely through 2GET.'},
              {n:'04', icon:'⭐', title:'Review', desc:'Job done? Leave a review. Funds released. Everyone wins.'},
            ].map(s=>(
              <div key={s.n}>
                <div className="text-5xl font-black text-[#E8A020]/15 leading-none mb-3">{s.n}</div>
                <div className="text-2xl mb-3">{s.icon}</div>
                <div className="text-sm font-bold text-white mb-2">{s.title}</div>
                <div className="text-xs text-white/40 leading-relaxed">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* PROVIDER CTA */}
        <div className="grid grid-cols-2 rounded-2xl overflow-hidden border border-white/10">
          <div className="bg-white/5 p-10">
            <p className="text-xs font-semibold text-[#E8A020] tracking-widest uppercase mb-3">For tradies & businesses</p>
            <h2 className="text-2xl font-black tracking-tight text-white mb-3">List your services.<br/>Keep what you earn.</h2>
            <p className="text-sm text-white/50 leading-relaxed mb-6">No subscription. No lead fees. A small 5% fee is included in your listed price — the customer covers it. And it&apos;s tax deductible for you.</p>
            {['Free to sign up and list','5% fee is tax deductible','Auto-invoicing & GST tracking built in','Syncs with Xero, MYOB & QuickBooks'].map(c=>(
              <div key={c} className="flex items-center gap-2 text-sm text-white/60 mb-2">
                <span className="text-[#0EA47A]">✓</span> {c}
              </div>
            ))}
            <Link href="/auth/signup" className="inline-block mt-6 px-6 py-3 bg-[#E8A020] text-[#0D1B2A] font-bold text-sm rounded-lg hover:bg-[#B87A10]">List my services →</Link>
          </div>
          <div className="bg-[#E8A020]/8 border-l border-white/10 p-10">
            <p className="text-xs font-semibold text-[#E8A020] tracking-widest uppercase mb-3">Fee breakdown example</p>
            <h3 className="text-lg font-black text-white mb-4">You list at $400. Here&apos;s the split:</h3>
            <div className="bg-white/5 rounded-xl overflow-hidden border border-white/10">
              <div className="flex justify-between px-4 py-3 text-sm border-b border-white/10">
                <span className="text-white/50">Customer pays</span>
                <span className="text-white font-semibold">$400.00</span>
              </div>
              <div className="flex justify-between px-4 py-3 text-sm border-b border-white/10 bg-white/3">
                <span className="text-white/50">2GET fee (5%)</span>
                <span className="text-[#E05A3A] font-semibold">-$19.05</span>
              </div>
              <div className="flex justify-between px-4 py-3 text-sm">
                <span className="text-white font-bold">You receive</span>
                <span className="text-[#E8A020] font-black text-lg">$380.95</span>
              </div>
            </div>
            <p className="text-xs text-white/30 mt-4 leading-relaxed">The $19.05 fee is tax deductible — and 2GET automatically tracks it for you.</p>
          </div>
        </div>
      </section>
    </main>
  )
}
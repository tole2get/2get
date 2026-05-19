import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#0D1B2A] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-8xl font-black text-white/10 tracking-tighter mb-4">404</div>
        <div className="text-5xl mb-6">🔧</div>
        <h1 className="text-2xl font-black text-white mb-3">Page not found</h1>
        <p className="text-white/40 text-sm mb-8 max-w-sm mx-auto leading-relaxed">
          Looks like this page went walkabout. Let&apos;s get you back on track.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/" className="px-6 py-3 bg-[#E8A020] text-[#0D1B2A] font-black rounded-xl text-sm hover:bg-[#B87A10]">
            Go home
          </Link>
          <Link href="/browse" className="px-6 py-3 border border-white/20 text-white font-bold rounded-xl text-sm hover:bg-white/5">
            Find a tradie
          </Link>
        </div>
      </div>
    </main>
  )
}
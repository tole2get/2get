export default function Verify() {
  return (
    <main className="min-h-screen bg-[#0D1B2A] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl p-10 w-full max-w-md shadow-2xl text-center">
        <div className="text-5xl mb-6">📧</div>
        <div className="text-3xl font-black tracking-tighter text-[#0D1B2A] mb-2">
          2<span className="text-[#E8A020]">GET</span>
        </div>
        <h1 className="text-xl font-black text-[#0D1B2A] mb-3">Check your email</h1>
        <p className="text-sm text-gray-400 leading-relaxed mb-6">
          We&apos;ve sent a verification link to your email address. Click the link to activate your account and get started.
        </p>
        <div className="bg-[#FDF3DC] border border-[#E8A020]/20 rounded-xl p-4 text-sm text-[#B87A10] font-medium">
          Didn&apos;t get it? Check your spam folder.
        </div>
      </div>
    </main>
  )
}
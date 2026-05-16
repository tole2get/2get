'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function SignUp() {
  const router = useRouter()
  const [accountType, setAccountType] = useState<'customer' | 'provider'>('customer')
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    abn: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      })

      if (signUpError) throw signUpError

      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email: formData.email,
            first_name: formData.firstName,
            last_name: formData.lastName,
            account_type: accountType,
            phone: formData.phone,
            abn: accountType === 'provider' ? formData.abn : null,
          })

        if (profileError) throw profileError
        router.push('/dashboard')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#0D1B2A] flex items-center justify-center px-4 py-12">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"/>
      
      <div className="relative bg-white rounded-2xl p-10 w-full max-w-md shadow-2xl">
        <div className="text-center mb-8">
          <div className="text-3xl font-black tracking-tighter text-[#0D1B2A] mb-1">
            2<span className="text-[#E8A020]">GET</span>
          </div>
          <div className="text-sm text-gray-400">Perth&apos;s home for trusted trades</div>
        </div>

        <div className="mb-6">
          <div className="text-sm font-bold text-gray-500 mb-3">I am a...</div>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setAccountType('customer')}
              className={`border-2 rounded-xl p-4 text-center transition-all ${
                accountType === 'customer'
                  ? 'border-[#E8A020] bg-[#FDF3DC]'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-2">🏠</div>
              <div className="text-sm font-bold text-[#0D1B2A]">Customer</div>
              <div className="text-xs text-gray-400 mt-1">I need a tradie</div>
            </button>
            <button
              type="button"
              onClick={() => setAccountType('provider')}
              className={`border-2 rounded-xl p-4 text-center transition-all ${
                accountType === 'provider'
                  ? 'border-[#E8A020] bg-[#FDF3DC]'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-2">🔧</div>
              <div className="text-sm font-bold text-[#0D1B2A]">Tradie / Business</div>
              <div className="text-xs text-gray-400 mt-1">I offer services</div>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wide block mb-1.5">First name</label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={e => setFormData({...formData, firstName: e.target.value})}
                className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg text-sm outline-none focus:border-[#E8A020]"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wide block mb-1.5">Last name</label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={e => setFormData({...formData, lastName: e.target.value})}
                className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg text-sm outline-none focus:border-[#E8A020]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wide block mb-1.5">Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg text-sm outline-none focus:border-[#E8A020]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wide block mb-1.5">Password</label>
            <input
              type="password"
              required
              minLength={8}
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
              className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg text-sm outline-none focus:border-[#E8A020]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wide block mb-1.5">Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={e => setFormData({...formData, phone: e.target.value})}
              className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg text-sm outline-none focus:border-[#E8A020]"
              placeholder="04XX XXX XXX"
            />
          </div>

          {accountType === 'provider' && (
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wide block mb-1.5">ABN</label>
              <input
                type="text"
                value={formData.abn}
                onChange={e => setFormData({...formData, abn: e.target.value})}
                className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg text-sm outline-none focus:border-[#E8A020]"
                placeholder="XX XXX XXX XXX"
              />
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#E8A020] text-[#0D1B2A] font-black rounded-xl text-sm hover:bg-[#B87A10] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating account...' : 'Create free account →'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-400">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-[#E8A020] font-bold hover:text-[#B87A10]">
            Log in
          </Link>
        </div>

        <div className="mt-4 text-center text-xs text-gray-300 leading-relaxed">
          By signing up you agree to 2GET&apos;s Terms of Service and Privacy Policy.
        </div>
      </div>
    </main>
  )
}
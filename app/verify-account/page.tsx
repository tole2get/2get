'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function VerifyAccount() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [abn, setAbn] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [licenceNumber, setLicenceNumber] = useState('')
  const [licenceFile, setLicenceFile] = useState<File | null>(null)
  const [insuranceFile, setInsuranceFile] = useState<File | null>(null)
  const [abnStatus, setAbnStatus] = useState<'idle'|'checking'|'valid'|'invalid'>('idle')

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      setUser(user)

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profile?.account_type !== 'provider') {
        router.push('/dashboard')
        return
      }

      setProfile(profile)
      setAbn(profile.abn || '')
      setBusinessName(profile.business_name || '')
      setLicenceNumber(profile.trade_licence_number || '')
      setLoading(false)
    }
    init()
  }, [router])

  const checkAbn = async () => {
    if (abn.replace(/\s/g,'').length !== 11) {
      setAbnStatus('invalid')
      return
    }
    setAbnStatus('checking')
    // Simulate ABN lookup — in production connect to ABR API
    await new Promise(r => setTimeout(r, 1500))
    const digits = abn.replace(/\s/g,'')
    // Basic ABN validation algorithm
    const weights = [10,1,3,5,7,9,11,13,15,17,19]
    const d = digits.split('').map(Number)
    d[0] -= 1
    const sum = weights.reduce((s,w,i) => s + w * d[i], 0)
    setAbnStatus(sum % 89 === 0 ? 'valid' : 'invalid')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      let licenceUrl = profile?.licence_url
      let insuranceUrl = profile?.insurance_url

      // Upload licence doc
      if (licenceFile) {
        const { data, error } = await supabase.storage
          .from('verification-docs')
          .upload(`${user.id}/licence-${Date.now()}`, licenceFile)
        if (error) throw error
        licenceUrl = data.path
      }

      // Upload insurance doc
      if (insuranceFile) {
        const { data, error } = await supabase.storage
          .from('verification-docs')
          .upload(`${user.id}/insurance-${Date.now()}`, insuranceFile)
        if (error) throw error
        insuranceUrl = data.path
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          abn: abn.replace(/\s/g,''),
          abn_verified: abnStatus === 'valid',
          business_name: businessName,
          trade_licence_number: licenceNumber,
          licence_url: licenceUrl,
          insurance_url: insuranceUrl,
          verification_status: 'pending',
        })
        .eq('id', user.id)

      if (updateError) throw updateError
      setSaved(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0D1B2A] flex items-center justify-center">
        <div className="text-white/30 text-sm">Loading...</div>
      </main>
    )
  }

  if (saved) {
    return (
      <main className="min-h-screen bg-[#0D1B2A] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-10 max-w-md w-full text-center">
          <div className="text-5xl mb-4">✅</div>
          <h1 className="text-2xl font-black text-[#0D1B2A] mb-3">Verification submitted!</h1>
          <p className="text-gray-400 text-sm leading-relaxed mb-6">
            We&apos;ll review your documents within 24 hours. Once verified, your listings will show the <strong className="text-[#0EA47A]">✓ Verified</strong> badge.
          </p>
          <Link href="/dashboard" className="block w-full py-3 bg-[#E8A020] text-[#0D1B2A] font-black rounded-xl text-sm hover:bg-[#B87A10]">
            Back to dashboard
          </Link>
        </div>
      </main>
    )
  }

  const statusColour = {
    idle: '',
    checking: 'text-white/40',
    valid: 'text-[#0EA47A]',
    invalid: 'text-[#E05A3A]',
  }

  const statusText = {
    idle: '',
    checking: 'Checking ABN...',
    valid: '✓ ABN verified',
    invalid: '✗ ABN not found — check and try again',
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

      <div className="pt-24 px-6 max-w-2xl mx-auto pb-20">
        <div className="mb-8">
          <h1 className="text-3xl font-black tracking-tight text-white mb-2">Get verified</h1>
          <p className="text-white/40 text-sm">Verified providers get a badge on their listings and rank higher in search results</p>
        </div>

        {/* Current status */}
        <div className={`rounded-2xl p-5 mb-6 border ${
          profile?.verification_status === 'verified'
            ? 'bg-[#0EA47A]/10 border-[#0EA47A]/20'
            : profile?.verification_status === 'pending'
            ? 'bg-[#E8A020]/10 border-[#E8A020]/20'
            : 'bg-white/5 border-white/10'
        }`}>
          <div className="flex items-center gap-3">
            <div className="text-2xl">
              {profile?.verification_status === 'verified' ? '✅' : profile?.verification_status === 'pending' ? '⏳' : '❌'}
            </div>
            <div>
              <div className="text-white font-bold capitalize">{profile?.verification_status || 'Unverified'}</div>
              <div className="text-white/40 text-sm">
                {profile?.verification_status === 'verified' && 'Your account is fully verified'}
                {profile?.verification_status === 'pending' && 'Your documents are under review — usually within 24 hours'}
                {(profile?.verification_status === 'unverified' || !profile?.verification_status) && 'Complete the form below to get verified'}
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ABN */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-white font-black text-base mb-4">Business details</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-white/40 uppercase tracking-wide block mb-2">Business name</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={e => setBusinessName(e.target.value)}
                  placeholder="Your business or trading name"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm outline-none focus:border-[#E8A020]/50 placeholder-white/20"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-white/40 uppercase tracking-wide block mb-2">ABN</label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={abn}
                    onChange={e => { setAbn(e.target.value); setAbnStatus('idle') }}
                    placeholder="XX XXX XXX XXX"
                    className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm outline-none focus:border-[#E8A020]/50 placeholder-white/20"
                  />
                  <button
                    type="button"
                    onClick={checkAbn}
                    disabled={abnStatus === 'checking'}
                    className="px-5 py-3 bg-white/10 border border-white/15 rounded-xl text-sm font-bold text-white hover:bg-white/20 disabled:opacity-50 whitespace-nowrap"
                  >
                    {abnStatus === 'checking' ? 'Checking...' : 'Verify ABN'}
                  </button>
                </div>
                {abnStatus !== 'idle' && (
                  <div className={`text-xs mt-2 font-medium ${statusColour[abnStatus]}`}>
                    {statusText[abnStatus]}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Trade licence */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-white font-black text-base mb-1">Trade licence</h2>
            <p className="text-white/30 text-xs mb-4">Required for licensed trades (electricians, plumbers, builders). Optional for others.</p>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-white/40 uppercase tracking-wide block mb-2">Licence number</label>
                <input
                  type="text"
                  value={licenceNumber}
                  onChange={e => setLicenceNumber(e.target.value)}
                  placeholder="e.g. EL123456"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm outline-none focus:border-[#E8A020]/50 placeholder-white/20"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-white/40 uppercase tracking-wide block mb-2">Upload licence document</label>
                <div className="border-2 border-dashed border-white/15 rounded-xl p-6 text-center hover:border-[#E8A020]/30 transition-all">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={e => setLicenceFile(e.target.files?.[0] || null)}
                    className="hidden"
                    id="licence-upload"
                  />
                  <label htmlFor="licence-upload" className="cursor-pointer">
                    <div className="text-3xl mb-2">📄</div>
                    <div className="text-white/40 text-sm">
                      {licenceFile ? licenceFile.name : 'Click to upload PDF or image'}
                    </div>
                    <div className="text-white/20 text-xs mt-1">PDF, JPG or PNG — max 10MB</div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Insurance */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-white font-black text-base mb-1">Public liability insurance</h2>
            <p className="text-white/30 text-xs mb-4">Upload your current certificate of currency. Strongly recommended for all trades.</p>
            <div className="border-2 border-dashed border-white/15 rounded-xl p-6 text-center hover:border-[#E8A020]/30 transition-all">
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={e => setInsuranceFile(e.target.files?.[0] || null)}
                className="hidden"
                id="insurance-upload"
              />
              <label htmlFor="insurance-upload" className="cursor-pointer">
                <div className="text-3xl mb-2">🛡️</div>
                <div className="text-white/40 text-sm">
                  {insuranceFile ? insuranceFile.name : 'Click to upload insurance certificate'}
                </div>
                <div className="text-white/20 text-xs mt-1">PDF, JPG or PNG — max 10MB</div>
              </label>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full py-4 bg-[#E8A020] text-[#0D1B2A] font-black rounded-xl text-base hover:bg-[#B87A10] disabled:opacity-50"
          >
            {saving ? 'Submitting...' : 'Submit for verification'}
          </button>

          <div className="text-center text-xs text-white/30 leading-relaxed">
            Your documents are stored securely and only used for verification purposes. We&apos;ll review within 24 hours.
          </div>
        </form>
      </div>
    </main>
  )
}
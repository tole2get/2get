'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Financials() {
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('this_month')

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

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

      const { data: bookings } = await supabase
        .from('bookings')
        .select('*, listings(title, category), profiles!bookings_customer_id_fkey(first_name, last_name)')
        .eq('provider_id', user.id)
        .order('created_at', { ascending: false })

      setBookings(bookings || [])
      setLoading(false)
    }
    init()
  }, [router])

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0D1B2A] flex items-center justify-center">
        <div className="text-white/30 text-sm">Loading...</div>
      </main>
    )
  }

  const now = new Date()
  const currentFYStart = now.getMonth() >= 6
    ? new Date(now.getFullYear(), 6, 1)
    : new Date(now.getFullYear() - 1, 6, 1)
  const currentFYEnd = new Date(currentFYStart.getFullYear() + 1, 5, 30)
  const fyLabel = `FY ${currentFYStart.getFullYear()}–${String(currentFYEnd.getFullYear()).slice(2)}`

  const filterBookings = (bookings: any[]) => {
    const active = bookings.filter(b => b.status === 'completed' || b.status === 'pending' || b.status === 'confirmed')
    if (period === 'this_month') {
      return active.filter(b => {
        const d = new Date(b.created_at)
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      })
    }
    if (period === 'this_quarter') {
      const qStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1)
      return active.filter(b => new Date(b.created_at) >= qStart)
    }
    if (period === 'this_fy') {
      return active.filter(b => new Date(b.created_at) >= currentFYStart)
    }
    return active
  }

  const filtered = filterBookings(bookings)

  // Clean 5% of listed price
  const grossIncome = filtered.reduce((sum, b) => sum + (b.amount || 0), 0)
  const totalFees = filtered.reduce((sum, b) => sum + (b.amount * 0.05 || 0), 0)
  const netIncome = grossIncome - totalFees
  const gstCollected = grossIncome / 11
  const netExGst = netIncome - gstCollected

  const monthlyData = Array.from({length: 12}, (_, i) => {
    const month = new Date(currentFYStart.getFullYear(), currentFYStart.getMonth() + i, 1)
    const monthBookings = bookings.filter(b => {
      const d = new Date(b.created_at)
      return d.getMonth() === month.getMonth() && d.getFullYear() === month.getFullYear()
    })
    return {
      label: month.toLocaleString('en-AU', {month:'short'}),
      amount: monthBookings.reduce((sum, b) => sum + (b.amount || 0), 0),
      isCurrent: month.getMonth() === now.getMonth() && month.getFullYear() === now.getFullYear(),
    }
  })

  const maxAmount = Math.max(...monthlyData.map(m => m.amount), 1)

  const periodLabels: Record<string,string> = {
    this_month: 'This month',
    this_quarter: 'This quarter',
    this_fy: fyLabel,
    all_time: 'All time',
  }

  return (
    <main className="min-h-screen bg-[#0D1B2A]">
      <nav className="fixed top-0 left-0 right-0 h-16 bg-[#0D1B2A]/95 backdrop-blur border-b border-white/5 flex items-center px-6 gap-4 z-50">
        <div className="flex flex-col mr-4">
          <span className="font-black text-2xl tracking-tighter text-white">2<span className="text-[#E8A020]">GET</span></span>
          <span className="text-[10px] text-white/30 tracking-widest -mt-1">PERTH</span>
        </div>
        <div className="flex gap-1 flex-1">
          <Link href="/" className="px-3 py-2 rounded text-sm font-medium text-white/50 hover:text-white hover:bg-white/5">Home</Link>
          <Link href="/dashboard" className="px-3 py-2 rounded text-sm font-medium text-white/50 hover:text-white hover:bg-white/5">Dashboard</Link>
          <Link href="/financials" className="px-3 py-2 rounded text-sm font-medium text-[#E8A020] bg-[#E8A020]/10">Financials</Link>
          <Link href="/messages" className="px-3 py-2 rounded text-sm font-medium text-white/50 hover:text-white hover:bg-white/5">Messages</Link>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-white/50">{profile?.first_name} {profile?.last_name}</div>
        </div>
      </nav>

      <div className="pt-24 px-6 max-w-5xl mx-auto pb-20">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white mb-2">Financials & Tax</h1>
            <p className="text-white/40">Your income, GST and tax deductions — all in one place</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => alert('CSV export coming soon!')} className="px-4 py-2 border border-white/15 rounded-lg text-sm text-white/60 hover:bg-white/5 font-medium">
              📊 Export CSV
            </button>
            <button onClick={() => alert('EOFY report coming soon!')} className="px-4 py-2 border border-white/15 rounded-lg text-sm text-white/60 hover:bg-white/5 font-medium">
              📄 EOFY Report
            </button>
          </div>
        </div>

        {/* Period selector */}
        <div className="flex gap-2 mb-6 bg-white/5 border border-white/10 rounded-xl p-1 w-fit">
          {Object.entries(periodLabels).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setPeriod(key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                period === key ? 'bg-[#E8A020] text-[#0D1B2A] font-bold' : 'text-white/40 hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Key metrics */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white/5 border-l-4 border-[#0EA47A] rounded-2xl p-5">
            <div className="text-xs font-bold text-white/30 uppercase tracking-widest mb-2">Gross income</div>
            <div className="text-3xl font-black text-white tracking-tight">${grossIncome.toFixed(2)}</div>
            <div className="text-xs text-white/30 mt-1">{periodLabels[period]}</div>
          </div>
          <div className="bg-white/5 border-l-4 border-[#E05A3A] rounded-2xl p-5">
            <div className="text-xs font-bold text-white/30 uppercase tracking-widest mb-2">2GET fees (5%)</div>
            <div className="text-3xl font-black text-[#E05A3A] tracking-tight">-${totalFees.toFixed(2)}</div>
            <div className="text-xs text-[#0EA47A] mt-1">✓ Tax deductible</div>
          </div>
          <div className="bg-white/5 border-l-4 border-[#E8A020] rounded-2xl p-5">
            <div className="text-xs font-bold text-white/30 uppercase tracking-widest mb-2">GST collected</div>
            <div className="text-3xl font-black text-[#E8A020] tracking-tight">${gstCollected.toFixed(2)}</div>
            <div className="text-xs text-white/30 mt-1">Due to ATO (÷11)</div>
          </div>
          <div className="bg-white/5 border-l-4 border-white/20 rounded-2xl p-5">
            <div className="text-xs font-bold text-white/30 uppercase tracking-widest mb-2">Net income (ex-GST)</div>
            <div className="text-3xl font-black text-white tracking-tight">${netExGst.toFixed(2)}</div>
            <div className="text-xs text-white/30 mt-1">After fees & GST</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* Income chart */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="text-white font-black text-base mb-5">Monthly income · {fyLabel}</div>
            <div className="flex items-end gap-1.5 mb-3" style={{height:'120px'}}>
              {monthlyData.map((month, i) => {
                const height = maxAmount > 0 ? (month.amount / maxAmount) * 100 : 2
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                    <div
                      className="w-full rounded-t-sm transition-all"
                      style={{
                        height: `${Math.max(height, 2)}%`,
                        background: month.isCurrent ? '#E8A020' : month.amount > 0 ? '#0EA47A' : 'rgba(255,255,255,0.08)'
                      }}
                    />
                    <div className={`text-xs ${month.isCurrent ? 'text-[#E8A020] font-bold' : 'text-white/20'}`}>
                      {month.label}
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="flex gap-4 text-xs text-white/30">
              <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-[#0EA47A] inline-block"></span> Revenue</div>
              <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-[#E8A020] inline-block"></span> Current month</div>
            </div>
          </div>

          {/* BAS Summary */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-2">
              <div className="text-white font-black text-base">BAS Summary</div>
              <span className="text-xs font-bold text-[#E8A020] bg-[#E8A020]/10 px-3 py-1 rounded-full">
                Q{Math.ceil((now.getMonth() + 1) / 3)} · Due {['Jan','Apr','Jul','Oct'][Math.floor(now.getMonth()/3)]} 28
              </span>
            </div>
            <div className="text-xs text-white/30 mb-4">Business Activity Statement — ready to copy into ATO portal</div>
            <div className="border border-white/10 rounded-xl overflow-hidden mb-4">
              <div className="flex justify-between px-4 py-3 border-b border-white/8 text-sm">
                <span className="text-white/40">G1 — Total sales (inc. GST)</span>
                <span className="text-white font-semibold">${grossIncome.toFixed(2)}</span>
              </div>
              <div className="flex justify-between px-4 py-3 border-b border-white/8 text-sm">
                <span className="text-white/40">1A — GST on sales (÷11)</span>
                <span className="text-[#E05A3A] font-semibold">${gstCollected.toFixed(2)}</span>
              </div>
              <div className="flex justify-between px-4 py-3 border-b border-white/8 text-sm">
                <span className="text-white/40">1B — GST credits (2GET fees)</span>
                <span className="text-[#0EA47A] font-semibold">-${(totalFees / 11).toFixed(2)}</span>
              </div>
              <div className="flex justify-between px-4 py-4 bg-[#0D1B2A] text-sm">
                <span className="text-white font-bold">Net GST payable to ATO</span>
                <span className="text-[#E8A020] font-black text-lg">${Math.max(gstCollected - totalFees / 11, 0).toFixed(2)}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => navigator.clipboard.writeText(`G1: $${grossIncome.toFixed(2)}\n1A: $${gstCollected.toFixed(2)}\n1B: -$${(totalFees/11).toFixed(2)}\nNet GST: $${Math.max(gstCollected - totalFees/11, 0).toFixed(2)}`)}
                className="flex-1 py-2 border border-white/15 rounded-lg text-xs text-white/50 hover:bg-white/5 font-medium"
              >
                📋 Copy BAS numbers
              </button>
              <button
                onClick={() => alert('Email to accountant coming soon!')}
                className="flex-1 py-2 border border-white/15 rounded-lg text-xs text-white/50 hover:bg-white/5 font-medium"
              >
                📧 Email accountant
              </button>
            </div>
          </div>
        </div>

        {/* Tax deductions table */}
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden mb-6">
          <div className="flex justify-between items-center px-6 py-4 border-b border-white/8">
            <div>
              <div className="text-white font-black text-base">2GET fee deductions — auto-logged</div>
              <div className="text-xs text-white/30 mt-1">Every 2GET fee is a tax deductible business expense</div>
            </div>
            <div className="bg-[#0EA47A]/10 border border-[#0EA47A]/20 rounded-lg px-4 py-2 text-sm font-bold text-[#0EA47A]">
              Total deductible: ${totalFees.toFixed(2)}
            </div>
          </div>
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-white/30 text-sm">No transactions yet for this period</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-white/3">
                  <th className="text-left px-6 py-3 text-xs font-bold text-white/30 uppercase tracking-widest">Date</th>
                  <th className="text-left px-6 py-3 text-xs font-bold text-white/30 uppercase tracking-widest">Job</th>
                  <th className="text-left px-6 py-3 text-xs font-bold text-white/30 uppercase tracking-widest">Customer</th>
                  <th className="text-left px-6 py-3 text-xs font-bold text-white/30 uppercase tracking-widest">Total</th>
                  <th className="text-left px-6 py-3 text-xs font-bold text-white/30 uppercase tracking-widest">2GET fee (5%)</th>
                  <th className="text-left px-6 py-3 text-xs font-bold text-white/30 uppercase tracking-widest">You received</th>
                  <th className="text-left px-6 py-3 text-xs font-bold text-white/30 uppercase tracking-widest">Deductible</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(booking => {
                  const fee = booking.amount * 0.05
                  const net = booking.amount - fee
                  return (
                    <tr key={booking.id} className="border-t border-white/5 hover:bg-white/3">
                      <td className="px-6 py-4 text-sm text-white/60">
                        {new Date(booking.created_at).toLocaleDateString('en-AU', {day:'numeric', month:'short', year:'numeric'})}
                      </td>
                      <td className="px-6 py-4 text-sm text-white font-medium">{booking.listings?.title}</td>
                      <td className="px-6 py-4 text-sm text-white/60">{booking.profiles?.first_name} {booking.profiles?.last_name}</td>
                      <td className="px-6 py-4 text-sm text-white font-semibold">${booking.amount?.toFixed(2)}</td>
                      <td className="px-6 py-4 text-sm text-[#E05A3A] font-semibold">-${fee.toFixed(2)}</td>
                      <td className="px-6 py-4 text-sm text-[#0EA47A] font-bold">${net.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold text-[#0EA47A] bg-[#0EA47A]/10 px-2 py-1 rounded-full">✓ Yes</span>
                      </td>
                    </tr>
                  )
                })}
                <tr className="border-t border-white/10 bg-[#E8A020]/5">
                  <td colSpan={4} className="px-6 py-4 text-sm font-bold text-white">Total ({periodLabels[period]})</td>
                  <td className="px-6 py-4 text-sm font-black text-[#E05A3A]">-${totalFees.toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm font-black text-[#0EA47A]">${netIncome.toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm font-bold text-[#E8A020]">← Claim this</td>
                </tr>
              </tbody>
            </table>
          )}
        </div>

        {/* Accounting integrations */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
          <div className="text-white font-black text-base mb-2">Accounting integrations</div>
          <div className="text-xs text-white/30 mb-5">Connect your software and every job syncs automatically</div>
          <div className="grid grid-cols-3 gap-4">
            {[
              {name:'Xero', color:'#13B5EA', initial:'X'},
              {name:'MYOB', color:'#7B2D8B', initial:'M'},
              {name:'QuickBooks', color:'#2CA01C', initial:'Q'},
            ].map(intg => (
              <div key={intg.name} className="border border-white/10 rounded-xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center font-black text-white text-sm flex-shrink-0" style={{background:intg.color}}>
                  {intg.initial}
                </div>
                <div className="flex-1">
                  <div className="text-white font-bold text-sm">{intg.name}</div>
                  <div className="text-white/30 text-xs">Not connected</div>
                </div>
                <button onClick={() => alert(`${intg.name} integration coming soon!`)} className="px-3 py-1.5 bg-white/10 rounded-lg text-xs font-bold text-white hover:bg-white/20">
                  Connect
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* EOFY CTA */}
        <div className="bg-gradient-to-r from-[#0D1B2A] to-[#1a2a3a] border border-white/10 rounded-2xl p-6 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-[#E8A020] uppercase tracking-widest mb-2">End of financial year</div>
            <div className="text-white font-black text-lg mb-1">{fyLabel} tax summary ready</div>
            <div className="text-white/40 text-sm">One PDF with everything your accountant needs</div>
          </div>
          <div className="flex flex-col gap-2">
            <button onClick={() => alert('EOFY PDF coming soon!')} className="px-6 py-3 bg-[#E8A020] text-[#0D1B2A] font-black rounded-xl text-sm hover:bg-[#B87A10]">
              📄 Download EOFY Report
            </button>
            <button onClick={() => alert('Coming soon!')} className="px-6 py-2 border border-white/15 text-white/50 font-medium rounded-xl text-sm hover:bg-white/5">
              📧 Email to accountant
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
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
      <main className="min-h-screen bg-[#0D1B2A] flex items-center justify-center pt-16">
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
    <main className="min-h-screen bg-[#0D1B2A] pt-16">
      <div className="px-4 md:px-6 max-w-5xl mx-auto py-8 pb-20">
        <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white mb-1">Financials & Tax</h1>
            <p className="text-white/40 text-sm">Your income, GST and tax deductions</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => alert('CSV export coming soon!')} className="px-3 py-2 border border-white/15 rounded-lg text-xs text-white/60 hover:bg-white/5">
              📊 Export
            </button>
            <button onClick={() => alert('EOFY report coming soon!')} className="px-3 py-2 border border-white/15 rounded-lg text-xs text-white/60 hover:bg-white/5">
              📄 EOFY
            </button>
          </div>
        </div>

        {/* Period selector */}
        <div className="flex gap-1 mb-5 bg-white/5 border border-white/10 rounded-xl p-1 w-fit overflow-x-auto">
          {Object.entries(periodLabels).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setPeriod(key)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                period === key ? 'bg-[#E8A020] text-[#0D1B2A] font-bold' : 'text-white/40 hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Key metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          <div className="bg-white/5 border-l-4 border-[#0EA47A] rounded-2xl p-4">
            <div className="text-xs font-bold text-white/30 uppercase tracking-widest mb-1">Gross income</div>
            <div className="text-2xl font-black text-white">${grossIncome.toFixed(2)}</div>
            <div className="text-xs text-white/30 mt-1">{periodLabels[period]}</div>
          </div>
          <div className="bg-white/5 border-l-4 border-[#E05A3A] rounded-2xl p-4">
            <div className="text-xs font-bold text-white/30 uppercase tracking-widest mb-1">2GET fees (5%)</div>
            <div className="text-2xl font-black text-[#E05A3A]">-${totalFees.toFixed(2)}</div>
            <div className="text-xs text-[#0EA47A] mt-1">✓ Tax deductible</div>
          </div>
          <div className="bg-white/5 border-l-4 border-[#E8A020] rounded-2xl p-4">
            <div className="text-xs font-bold text-white/30 uppercase tracking-widest mb-1">GST collected</div>
            <div className="text-2xl font-black text-[#E8A020]">${gstCollected.toFixed(2)}</div>
            <div className="text-xs text-white/30 mt-1">Due to ATO</div>
          </div>
          <div className="bg-white/5 border-l-4 border-white/20 rounded-2xl p-4">
            <div className="text-xs font-bold text-white/30 uppercase tracking-widest mb-1">Net (ex-GST)</div>
            <div className="text-2xl font-black text-white">${netExGst.toFixed(2)}</div>
            <div className="text-xs text-white/30 mt-1">After fees & GST</div>
          </div>
        </div>

        {/* Chart + BAS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <div className="text-white font-black text-sm mb-4">Monthly income · {fyLabel}</div>
            <div className="flex items-end gap-1 mb-2" style={{height:'80px'}}>
              {monthlyData.map((month, i) => {
                const height = maxAmount > 0 ? (month.amount / maxAmount) * 100 : 2
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                    <div className="w-full rounded-t-sm" style={{
                      height:`${Math.max(height, 2)}%`,
                      background: month.isCurrent ? '#E8A020' : month.amount > 0 ? '#0EA47A' : 'rgba(255,255,255,0.08)'
                    }}/>
                    <div className={`text-xs ${month.isCurrent ? 'text-[#E8A020]' : 'text-white/20'}`} style={{fontSize:'9px'}}>
                      {month.label}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <div className="flex justify-between items-center mb-3">
              <div className="text-white font-black text-sm">BAS Summary</div>
              <span className="text-xs font-bold text-[#E8A020] bg-[#E8A020]/10 px-2 py-1 rounded-full">
                Q{Math.ceil((now.getMonth() + 1) / 3)}
              </span>
            </div>
            <div className="border border-white/10 rounded-xl overflow-hidden mb-3">
              <div className="flex justify-between px-3 py-2.5 border-b border-white/8 text-xs">
                <span className="text-white/40">G1 — Total sales (inc. GST)</span>
                <span className="text-white font-semibold">${grossIncome.toFixed(2)}</span>
              </div>
              <div className="flex justify-between px-3 py-2.5 border-b border-white/8 text-xs">
                <span className="text-white/40">1A — GST on sales</span>
                <span className="text-[#E05A3A] font-semibold">${gstCollected.toFixed(2)}</span>
              </div>
              <div className="flex justify-between px-3 py-2.5 border-b border-white/8 text-xs">
                <span className="text-white/40">1B — GST credits</span>
                <span className="text-[#0EA47A] font-semibold">-${(totalFees / 11).toFixed(2)}</span>
              </div>
              <div className="flex justify-between px-3 py-3 bg-[#0D1B2A] text-sm">
                <span className="text-white font-bold">Net GST payable</span>
                <span className="text-[#E8A020] font-black">${Math.max(gstCollected - totalFees / 11, 0).toFixed(2)}</span>
              </div>
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(`G1: $${grossIncome.toFixed(2)}\n1A: $${gstCollected.toFixed(2)}\n1B: -$${(totalFees/11).toFixed(2)}\nNet: $${Math.max(gstCollected - totalFees/11, 0).toFixed(2)}`)}
              className="w-full py-2 border border-white/15 rounded-lg text-xs text-white/50 hover:bg-white/5"
            >
              📋 Copy BAS numbers
            </button>
          </div>
        </div>

        {/* Deductions table */}
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden mb-5">
          <div className="flex justify-between items-center px-4 py-3 border-b border-white/8">
            <div>
              <div className="text-white font-black text-sm">2GET fee deductions</div>
              <div className="text-xs text-white/30 mt-0.5">Auto-logged tax deductible expenses</div>
            </div>
            <div className="bg-[#0EA47A]/10 border border-[#0EA47A]/20 rounded-lg px-3 py-1.5 text-xs font-bold text-[#0EA47A]">
              ${totalFees.toFixed(2)} deductible
            </div>
          </div>
          {filtered.length === 0 ? (
            <div className="text-center py-8 text-white/30 text-sm">No transactions for this period</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-white/3">
                    <th className="text-left px-4 py-2 text-xs font-bold text-white/30 uppercase">Date</th>
                    <th className="text-left px-4 py-2 text-xs font-bold text-white/30 uppercase">Job</th>
                    <th className="text-left px-4 py-2 text-xs font-bold text-white/30 uppercase">Total</th>
                    <th className="text-left px-4 py-2 text-xs font-bold text-white/30 uppercase">Fee (5%)</th>
                    <th className="text-left px-4 py-2 text-xs font-bold text-white/30 uppercase">Net</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(booking => {
                    const fee = booking.amount * 0.05
                    const net = booking.amount - fee
                    return (
                      <tr key={booking.id} className="border-t border-white/5">
                        <td className="px-4 py-3 text-xs text-white/60">{new Date(booking.created_at).toLocaleDateString('en-AU', {day:'numeric',month:'short'})}</td>
                        <td className="px-4 py-3 text-xs text-white">{booking.listings?.title}</td>
                        <td className="px-4 py-3 text-xs text-white font-semibold">${booking.amount?.toFixed(2)}</td>
                        <td className="px-4 py-3 text-xs text-[#E05A3A] font-semibold">-${fee.toFixed(2)}</td>
                        <td className="px-4 py-3 text-xs text-[#0EA47A] font-bold">${net.toFixed(2)}</td>
                      </tr>
                    )
                  })}
                  <tr className="border-t border-white/10 bg-[#E8A020]/5">
                    <td colSpan={3} className="px-4 py-3 text-xs font-bold text-white">Total</td>
                    <td className="px-4 py-3 text-xs font-black text-[#E05A3A]">-${totalFees.toFixed(2)}</td>
                    <td className="px-4 py-3 text-xs font-black text-[#0EA47A]">${netIncome.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Integrations */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-5">
          <div className="text-white font-black text-sm mb-1">Accounting integrations</div>
          <div className="text-xs text-white/30 mb-4">Connect your software and every job syncs automatically</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              {name:'Xero', color:'#13B5EA', initial:'X'},
              {name:'MYOB', color:'#7B2D8B', initial:'M'},
              {name:'QuickBooks', color:'#2CA01C', initial:'Q'},
            ].map(intg => (
              <div key={intg.name} className="border border-white/10 rounded-xl p-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center font-black text-white text-xs flex-shrink-0" style={{background:intg.color}}>
                  {intg.initial}
                </div>
                <div className="flex-1">
                  <div className="text-white font-bold text-sm">{intg.name}</div>
                  <div className="text-white/30 text-xs">Not connected</div>
                </div>
                <button onClick={() => alert(`${intg.name} coming soon!`)} className="px-3 py-1.5 bg-white/10 rounded-lg text-xs font-bold text-white">
                  Connect
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* EOFY */}
        <div className="bg-gradient-to-r from-[#0D1B2A] to-[#1a2a3a] border border-white/10 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-bold text-[#E8A020] uppercase tracking-widest mb-1">End of financial year</div>
            <div className="text-white font-black text-base mb-1">{fyLabel} tax summary ready</div>
            <div className="text-white/40 text-sm">One PDF with everything your accountant needs</div>
          </div>
          <div className="flex flex-col gap-2 w-full md:w-auto">
            <button onClick={() => alert('EOFY PDF coming soon!')} className="px-5 py-2.5 bg-[#E8A020] text-[#0D1B2A] font-black rounded-xl text-sm hover:bg-[#B87A10]">
              📄 Download EOFY Report
            </button>
            <button onClick={() => alert('Coming soon!')} className="px-5 py-2 border border-white/15 text-white/50 font-medium rounded-xl text-sm hover:bg-white/5">
              📧 Email to accountant
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
import { supabase } from './supabase'

export const XP_EVENTS = {
  SIGNUP: 100,
  FIRST_BOOKING: 500,
  BOOKING_PER_DOLLAR: 1,
  LEAVE_REVIEW: 200,
  REFER_FRIEND: 1000,
  REPEAT_BOOKING: 150,
  QUICK_ACCEPT: 75,
  UPLOAD_PHOTO: 50,
}

export const TIERS = [
  { name: 'Newcomer', min: 0, max: 999, entries: 1, color: '#94A3B8', emoji: '🌱' },
  { name: 'Regular', min: 1000, max: 4999, entries: 3, color: '#0EA47A', emoji: '⭐' },
  { name: 'Valued', min: 5000, max: 14999, entries: 8, color: '#E8A020', emoji: '🏆' },
  { name: 'Elite', min: 15000, max: Infinity, entries: 20, color: '#E05A3A', emoji: '👑' },
]

export function getTier(totalXp: number) {
  return TIERS.find(t => totalXp >= t.min && totalXp <= t.max) || TIERS[0]
}

export function getNextTier(totalXp: number) {
  const currentIndex = TIERS.findIndex(t => totalXp >= t.min && totalXp <= t.max)
  return TIERS[currentIndex + 1] || null
}

export async function awardXP(
  userId: string,
  eventType: string,
  xpAmount: number,
  description: string,
  bookingId?: string
) {
  try {
    // Insert XP event
    await supabase.from('xp_events').insert({
      user_id: userId,
      event_type: eventType,
      xp_amount: xpAmount,
      description,
      booking_id: bookingId || null,
    })

    // Get current total
    const { data: existing } = await supabase
      .from('xp_totals')
      .select('*')
      .eq('user_id', userId)
      .single()

    const newTotal = (existing?.total_xp || 0) + xpAmount
    const tier = getTier(newTotal)
    const entries = tier.entries

    if (existing) {
      await supabase
        .from('xp_totals')
        .update({
          total_xp: newTotal,
          tier: tier.name,
          giveaway_entries: entries,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
    } else {
      await supabase
        .from('xp_totals')
        .insert({
          user_id: userId,
          total_xp: newTotal,
          tier: tier.name,
          giveaway_entries: entries,
        })
    }

    return { newTotal, tier }
  } catch (err) {
    console.error('XP award error:', err)
  }
}
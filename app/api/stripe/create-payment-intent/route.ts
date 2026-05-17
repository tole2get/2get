import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe('sk_test_51SMPz248MlpW57cT5TaoJAeTYFo5sspVxQgTX8oC6T5eHLZ8MAnRHlsNcMCzyIVnufgajdBW74i5hkzUnnqhhIX3007lwGauOt')

export async function POST(req: NextRequest) {
  try {
    const { amount, currency = 'aud', metadata } = await req.json()

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency,
      metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    })

    return NextResponse.json({ 
      clientSecret: paymentIntent.client_secret 
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
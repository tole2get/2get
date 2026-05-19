import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  try {
    const { type, to, data } = await req.json()

    let subject = ''
    let html = ''

    if (type === 'booking_confirmed') {
      subject = `Booking confirmed — ${data.listingTitle}`
      html = `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px">
          <div style="font-size:28px;font-weight:900;letter-spacing:-1px;margin-bottom:24px">
            2<span style="color:#E8A020">GET</span>
            <span style="font-size:11px;font-weight:500;color:#94A3B8;letter-spacing:2px;margin-left:4px">PERTH</span>
          </div>
          <h1 style="font-size:22px;font-weight:800;color:#0D1B2A;margin-bottom:8px">Booking confirmed! 🎉</h1>
          <p style="color:#475569;font-size:15px;line-height:1.6;margin-bottom:24px">
            Your booking with <strong>${data.providerName}</strong> has been confirmed for <strong>${data.jobDate}</strong>.
          </p>
          <div style="background:#F8FAFC;border-radius:12px;padding:20px;margin-bottom:24px;border:1px solid #E2E8F0">
            <div style="font-size:13px;color:#94A3B8;margin-bottom:4px">Service</div>
            <div style="font-size:15px;font-weight:600;color:#0D1B2A;margin-bottom:12px">${data.listingTitle}</div>
            <div style="font-size:13px;color:#94A3B8;margin-bottom:4px">Date</div>
            <div style="font-size:15px;font-weight:600;color:#0D1B2A;margin-bottom:12px">${data.jobDate}</div>
            <div style="font-size:13px;color:#94A3B8;margin-bottom:4px">Amount paid</div>
            <div style="font-size:18px;font-weight:800;color:#E8A020">$${data.amount}</div>
          </div>
          <div style="background:#E6F7F2;border-radius:12px;padding:16px;margin-bottom:24px;border:1px solid rgba(14,164,122,0.2)">
            <p style="color:#0A7A5C;font-size:13px;margin:0">
              🛡️ Your payment is held securely by 2GET and released to the tradie once you confirm the job is complete.
            </p>
          </div>
          <a href="https://2get-azure.vercel.app/dashboard" style="display:inline-block;background:#E8A020;color:#0D1B2A;font-weight:800;padding:14px 28px;border-radius:10px;text-decoration:none;font-size:14px">
            View my dashboard →
          </a>
          <p style="color:#94A3B8;font-size:12px;margin-top:32px">
            2GET Perth · <a href="https://2get-azure.vercel.app" style="color:#E8A020">2get-azure.vercel.app</a>
          </p>
        </div>
      `
    }

    if (type === 'new_message') {
      subject = `New message from ${data.senderName} on 2GET`
      html = `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px">
          <div style="font-size:28px;font-weight:900;letter-spacing:-1px;margin-bottom:24px">
            2<span style="color:#E8A020">GET</span>
            <span style="font-size:11px;font-weight:500;color:#94A3B8;letter-spacing:2px;margin-left:4px">PERTH</span>
          </div>
          <h1 style="font-size:22px;font-weight:800;color:#0D1B2A;margin-bottom:8px">New message 💬</h1>
          <p style="color:#475569;font-size:15px;line-height:1.6;margin-bottom:24px">
            <strong>${data.senderName}</strong> sent you a message on 2GET.
          </p>
          <div style="background:#F8FAFC;border-radius:12px;padding:20px;margin-bottom:24px;border:1px solid #E2E8F0;border-left:4px solid #E8A020">
            <p style="color:#0D1B2A;font-size:15px;margin:0;font-style:italic">"${data.preview}"</p>
          </div>
          <a href="https://2get-azure.vercel.app/messages" style="display:inline-block;background:#E8A020;color:#0D1B2A;font-weight:800;padding:14px 28px;border-radius:10px;text-decoration:none;font-size:14px">
            Reply now →
          </a>
          <p style="color:#94A3B8;font-size:12px;margin-top:32px">
            2GET Perth · <a href="https://2get-azure.vercel.app" style="color:#E8A020">2get-azure.vercel.app</a>
          </p>
        </div>
      `
    }

    if (type === 'review_reminder') {
      subject = `How did it go? Leave a review for ${data.providerName}`
      html = `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px">
          <div style="font-size:28px;font-weight:900;letter-spacing:-1px;margin-bottom:24px">
            2<span style="color:#E8A020">GET</span>
            <span style="font-size:11px;font-weight:500;color:#94A3B8;letter-spacing:2px;margin-left:4px">PERTH</span>
          </div>
          <h1 style="font-size:22px;font-weight:800;color:#0D1B2A;margin-bottom:8px">How did it go? ⭐</h1>
          <p style="color:#475569;font-size:15px;line-height:1.6;margin-bottom:24px">
            Your job with <strong>${data.providerName}</strong> is complete. Leave a review to help others find great tradies — and earn <strong style="color:#E8A020">200 XP</strong>!
          </p>
          <a href="https://2get-azure.vercel.app/review/${data.bookingId}" style="display:inline-block;background:#E8A020;color:#0D1B2A;font-weight:800;padding:14px 28px;border-radius:10px;text-decoration:none;font-size:14px">
            Leave a review →
          </a>
          <p style="color:#94A3B8;font-size:12px;margin-top:32px">
            2GET Perth · <a href="https://2get-azure.vercel.app" style="color:#E8A020">2get-azure.vercel.app</a>
          </p>
        </div>
      `
    }

    if (type === 'new_booking_provider') {
      subject = `New booking from ${data.customerName} — ${data.listingTitle}`
      html = `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px">
          <div style="font-size:28px;font-weight:900;letter-spacing:-1px;margin-bottom:24px">
            2<span style="color:#E8A020">GET</span>
            <span style="font-size:11px;font-weight:500;color:#94A3B8;letter-spacing:2px;margin-left:4px">PERTH</span>
          </div>
          <h1 style="font-size:22px;font-weight:800;color:#0D1B2A;margin-bottom:8px">New booking! 🎉</h1>
          <p style="color:#475569;font-size:15px;line-height:1.6;margin-bottom:24px">
            <strong>${data.customerName}</strong> has booked your service.
          </p>
          <div style="background:#F8FAFC;border-radius:12px;padding:20px;margin-bottom:24px;border:1px solid #E2E8F0">
            <div style="font-size:13px;color:#94A3B8;margin-bottom:4px">Service</div>
            <div style="font-size:15px;font-weight:600;color:#0D1B2A;margin-bottom:12px">${data.listingTitle}</div>
            <div style="font-size:13px;color:#94A3B8;margin-bottom:4px">Job date</div>
            <div style="font-size:15px;font-weight:600;color:#0D1B2A;margin-bottom:12px">${data.jobDate}</div>
            <div style="font-size:13px;color:#94A3B8;margin-bottom:4px">You will receive</div>
            <div style="font-size:18px;font-weight:800;color:#0EA47A">$${data.providerReceives}</div>
          </div>
          ${data.notes ? `<div style="background:#FDF3DC;border-radius:12px;padding:16px;margin-bottom:24px;border:1px solid rgba(232,160,32,0.2)"><p style="color:#B87A10;font-size:13px;margin:0"><strong>Customer notes:</strong> ${data.notes}</p></div>` : ''}
          <a href="https://2get-azure.vercel.app/messages" style="display:inline-block;background:#E8A020;color:#0D1B2A;font-weight:800;padding:14px 28px;border-radius:10px;text-decoration:none;font-size:14px">
            Message customer →
          </a>
          <p style="color:#94A3B8;font-size:12px;margin-top:32px">
            2GET Perth · <a href="https://2get-azure.vercel.app" style="color:#E8A020">2get-azure.vercel.app</a>
          </p>
        </div>
      `
    }

    if (!subject) {
      return NextResponse.json({ error: 'Unknown email type' }, { status: 400 })
    }

    const { data: emailData, error } = await resend.emails.send({
      from: '2GET Perth <noreply@2get-azure.vercel.app>',
      to,
      subject,
      html,
    })

    if (error) throw error

    return NextResponse.json({ success: true, id: emailData?.id })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
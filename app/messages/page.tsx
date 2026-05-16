'use client'
import { useEffect, useState, useRef, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

function MessagesContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [conversations, setConversations] = useState<any[]>([])
  const [activeConvo, setActiveConvo] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

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
      setProfile(profile)

      const convos = await fetchConversations(user.id, profile)

      const providerId = searchParams.get('provider')
      const listingId = searchParams.get('listing')
      if (providerId && providerId !== user.id) {
        await startOrFindConversation(user.id, providerId, listingId, convos)
      }

      setLoading(false)
    }
    init()
  }, [])

  const fetchConversations = async (userId: string, userProfile: any) => {
    const { data } = await supabase
      .from('conversations')
      .select('*, listings(title, category)')
      .or(`customer_id.eq.${userId},provider_id.eq.${userId}`)
      .order('last_message_at', { ascending: false })

    if (data) {
      const convosWithProfiles = await Promise.all(data.map(async (convo) => {
        const otherId = userProfile?.account_type === 'customer' ? convo.provider_id : convo.customer_id
        const { data: otherProfile } = await supabase
          .from('profiles')
          .select('first_name, last_name, account_type')
          .eq('id', otherId)
          .single()
        return { ...convo, otherProfile }
      }))
      setConversations(convosWithProfiles)
      if (convosWithProfiles.length > 0) {
        await selectConversation(convosWithProfiles[0])
      }
      return convosWithProfiles
    }
    return []
  }

  const startOrFindConversation = async (customerId: string, providerId: string, listingId: string | null, existingConvos: any[]) => {
    const existing = existingConvos.find(c => c.provider_id === providerId)
    if (existing) {
      await selectConversation(existing)
      return
    }

    const { data: newConvo } = await supabase
      .from('conversations')
      .insert({
        customer_id: customerId,
        provider_id: providerId,
        listing_id: listingId,
      })
      .select()
      .single()

    if (newConvo) {
      await selectConversation(newConvo)
    }
  }

  const selectConversation = async (convo: any) => {
    setActiveConvo(convo)
    const { data } = await supabase
      .from('messages')
      .select('*, profiles(first_name, last_name)')
      .eq('conversation_id', convo.id)
      .order('created_at', { ascending: true })
    setMessages(data || [])
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !activeConvo || sending) return
    setSending(true)

    const { data } = await supabase
      .from('messages')
      .insert({
        conversation_id: activeConvo.id,
        sender_id: user.id,
        content: newMessage.trim(),
      })
      .select('*, profiles(first_name, last_name)')
      .single()

    if (data) {
      setMessages(prev => [...prev, data])
      setNewMessage('')
      await supabase
        .from('conversations')
        .update({ last_message: newMessage.trim(), last_message_at: new Date().toISOString() })
        .eq('id', activeConvo.id)
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
    }
    setSending(false)
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0D1B2A] flex items-center justify-center">
        <div className="text-white/30 text-sm">Loading messages...</div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#0D1B2A] flex flex-col">
      <nav className="h-16 bg-[#0D1B2A]/95 backdrop-blur border-b border-white/5 flex items-center px-6 gap-4 z-50 flex-shrink-0">
        <div className="flex flex-col mr-4">
          <span className="font-black text-2xl tracking-tighter text-white">2<span className="text-[#E8A020]">GET</span></span>
          <span className="text-[10px] text-white/30 tracking-widest -mt-1">PERTH</span>
        </div>
        <div className="flex gap-1 flex-1">
          <Link href="/" className="px-3 py-2 rounded text-sm font-medium text-white/50 hover:text-white hover:bg-white/5">Home</Link>
          <Link href="/browse" className="px-3 py-2 rounded text-sm font-medium text-white/50 hover:text-white hover:bg-white/5">Find a Tradie</Link>
          <Link href="/dashboard" className="px-3 py-2 rounded text-sm font-medium text-white/50 hover:text-white hover:bg-white/5">Dashboard</Link>
          <Link href="/messages" className="px-3 py-2 rounded text-sm font-medium text-[#E8A020] bg-[#E8A020]/10">Messages</Link>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden" style={{height:'calc(100vh - 64px)'}}>
        <div className="w-72 min-w-72 border-r border-white/8 flex flex-col">
          <div className="p-4 border-b border-white/8">
            <div className="text-white font-bold text-sm mb-3">Messages</div>
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-xs outline-none placeholder-white/30"
            />
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-6 text-center text-white/30 text-sm">
                No conversations yet.<br/>
                <Link href="/browse" className="text-[#E8A020] hover:underline">Find a tradie</Link> to get started.
              </div>
            ) : (
              conversations.map(convo => (
                <button
                  key={convo.id}
                  onClick={() => selectConversation(convo)}
                  className={`w-full flex gap-3 p-4 border-b border-white/5 hover:bg-white/5 transition-all text-left ${
                    activeConvo?.id === convo.id ? 'bg-[#E8A020]/10 border-l-2 border-l-[#E8A020]' : ''
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-[#E8A020] flex items-center justify-center text-[#0D1B2A] font-black text-sm flex-shrink-0">
                    {convo.otherProfile?.first_name?.[0]}{convo.otherProfile?.last_name?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-semibold text-sm truncate">
                      {convo.otherProfile?.first_name} {convo.otherProfile?.last_name}
                    </div>
                    <div className="text-white/30 text-xs truncate mt-0.5">
                      {convo.last_message || convo.listings?.title || 'New conversation'}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {activeConvo ? (
          <div className="flex-1 flex flex-col">
            <div className="px-6 py-4 border-b border-white/8 flex items-center gap-3 bg-[#0D1B2A]/50">
              <div className="w-9 h-9 rounded-full bg-[#E8A020] flex items-center justify-center text-[#0D1B2A] font-black text-sm flex-shrink-0">
                {activeConvo.otherProfile?.first_name?.[0]}
              </div>
              <div>
                <div className="text-white font-bold text-sm">
                  {activeConvo.otherProfile?.first_name} {activeConvo.otherProfile?.last_name}
                </div>
                <div className="text-[#0EA47A] text-xs font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-[#0EA47A] rounded-full inline-block"></span> Online
                </div>
              </div>
              {activeConvo.listings && (
                <div className="ml-auto text-xs text-white/30 bg-white/5 px-3 py-1.5 rounded-full">
                  Re: {activeConvo.listings.title}
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="text-4xl mb-4">👋</div>
                  <div className="text-white font-bold mb-2">Start the conversation</div>
                  <div className="text-white/30 text-sm">Send a message to get a quote or ask a question</div>
                </div>
              ) : (
                messages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                        msg.sender_id === user.id
                          ? 'bg-[#0D1B2A] border border-[#E8A020]/30 text-white rounded-br-sm'
                          : 'bg-white/8 border border-white/10 text-white rounded-bl-sm'
                      }`}
                    >
                      {msg.content}
                      <div className={`text-xs mt-1 ${msg.sender_id === user.id ? 'text-white/30' : 'text-white/20'}`}>
                        {new Date(msg.created_at).toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef}/>
            </div>

            <form onSubmit={sendMessage} className="px-6 py-4 border-t border-white/8 flex gap-3 items-center">
              <input
                type="text"
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                placeholder="Write a message..."
                className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-full text-white text-sm outline-none focus:border-[#E8A020]/40 placeholder-white/30"
              />
              <button
                type="submit"
                disabled={sending || !newMessage.trim()}
                className="w-10 h-10 bg-[#E8A020] rounded-full flex items-center justify-center text-[#0D1B2A] font-bold text-lg hover:bg-[#B87A10] disabled:opacity-40 flex-shrink-0"
              >
                →
              </button>
            </form>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-5xl mb-4">💬</div>
              <div className="text-white font-bold mb-2">Your messages</div>
              <div className="text-white/30 text-sm">Select a conversation or find a tradie to message</div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

export default function Messages() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-[#0D1B2A] flex items-center justify-center">
        <div className="text-white/30 text-sm">Loading...</div>
      </main>
    }>
      <MessagesContent />
    </Suspense>
  )
}
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
  const [showThreads, setShowThreads] = useState(true)
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
    setShowThreads(false)
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
      <main className="min-h-screen bg-[#0D1B2A] flex items-center justify-center pt-16">
        <div className="text-white/30 text-sm">Loading messages...</div>
      </main>
    )
  }

  return (
    <main className="bg-[#0D1B2A] pt-16" style={{height:'100vh',display:'flex',flexDirection:'column'}}>
      <div style={{flex:1,display:'flex',overflow:'hidden'}}>

        {/* Thread list */}
        <div style={{
          width: showThreads ? '100%' : '0',
          minWidth: showThreads ? '100%' : '0',
          overflow: 'hidden',
          transition: 'all 0.2s',
          borderRight: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          flexDirection: 'column',
        }}
        className="md:w-72 md:min-w-72 md:block"
        >
          <div style={{padding:'14px 16px 12px',borderBottom:'1px solid rgba(255,255,255,0.08)'}}>
            <div style={{fontWeight:700,fontSize:'15px',color:'#fff',marginBottom:'10px'}}>Messages</div>
            <input type="text" placeholder="Search..." style={{width:'100%',padding:'7px 12px',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'8px',fontSize:'13px',color:'#fff',outline:'none'}}/>
          </div>
          <div style={{flex:1,overflowY:'auto'}}>
            {conversations.length === 0 ? (
              <div style={{padding:'24px',textAlign:'center',color:'rgba(255,255,255,0.3)',fontSize:'14px'}}>
                No conversations yet.<br/>
                <Link href="/browse" style={{color:'#E8A020'}}>Find a tradie</Link> to get started.
              </div>
            ) : (
              conversations.map(convo => (
                <button
                  key={convo.id}
                  onClick={() => selectConversation(convo)}
                  style={{
                    width:'100%',display:'flex',gap:'10px',padding:'13px 16px',
                    borderBottom:'1px solid rgba(255,255,255,0.05)',
                    background: activeConvo?.id === convo.id ? 'rgba(232,160,32,0.08)' : 'transparent',
                    borderLeft: activeConvo?.id === convo.id ? '3px solid #E8A020' : '3px solid transparent',
                    cursor:'pointer',textAlign:'left'
                  }}
                >
                  <div style={{width:'38px',height:'38px',borderRadius:'50%',background:'#E8A020',display:'flex',alignItems:'center',justifyContent:'center',color:'#0D1B2A',fontWeight:700,fontSize:'13px',flexShrink:0}}>
                    {convo.otherProfile?.first_name?.[0]}{convo.otherProfile?.last_name?.[0]}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:'13px',fontWeight:600,color:'#fff',marginBottom:'2px'}}>
                      {convo.otherProfile?.first_name} {convo.otherProfile?.last_name}
                    </div>
                    <div style={{fontSize:'12px',color:'rgba(255,255,255,0.3)',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>
                      {convo.last_message || convo.listings?.title || 'New conversation'}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat area */}
        {(!showThreads || true) && (
          <div style={{flex:1,display:'flex',flexDirection:'column',minWidth:0}}>
            {activeConvo ? (
              <>
                <div style={{padding:'12px 16px',borderBottom:'1px solid rgba(255,255,255,0.08)',background:'rgba(13,27,42,0.5)',display:'flex',alignItems:'center',gap:'10px'}}>
                  <button
                    onClick={() => setShowThreads(true)}
                    style={{background:'none',border:'none',color:'rgba(255,255,255,0.5)',cursor:'pointer',fontSize:'18px',padding:'0 8px 0 0'}}
                    className="md:hidden"
                  >
                    ←
                  </button>
                  <div style={{width:'36px',height:'36px',borderRadius:'50%',background:'#E8A020',display:'flex',alignItems:'center',justifyContent:'center',color:'#0D1B2A',fontWeight:700,fontSize:'13px',flexShrink:0}}>
                    {activeConvo.otherProfile?.first_name?.[0]}
                  </div>
                  <div>
                    <div style={{fontSize:'14px',fontWeight:700,color:'#fff'}}>
                      {activeConvo.otherProfile?.first_name} {activeConvo.otherProfile?.last_name}
                    </div>
                    <div style={{fontSize:'11px',color:'#0EA47A',fontWeight:500}}>● Online</div>
                  </div>
                </div>

                <div style={{flex:1,overflowY:'auto',padding:'16px',display:'flex',flexDirection:'column',gap:'10px',background:'rgba(248,250,252,0.03)'}}>
                  {messages.length === 0 ? (
                    <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'100%',textAlign:'center'}}>
                      <div style={{fontSize:'36px',marginBottom:'12px'}}>👋</div>
                      <div style={{color:'#fff',fontWeight:700,marginBottom:'6px'}}>Start the conversation</div>
                      <div style={{color:'rgba(255,255,255,0.3)',fontSize:'13px'}}>Send a message to get a quote</div>
                    </div>
                  ) : (
                    messages.map(msg => (
                      <div key={msg.id} style={{display:'flex',justifyContent: msg.sender_id === user.id ? 'flex-end' : 'flex-start'}}>
                        <div style={{
                          maxWidth:'70%',padding:'10px 14px',borderRadius:'16px',fontSize:'14px',lineHeight:'1.5',
                          background: msg.sender_id === user.id ? '#0D1B2A' : 'rgba(255,255,255,0.08)',
                          color: msg.sender_id === user.id ? '#fff' : '#fff',
                          border: msg.sender_id === user.id ? '1px solid rgba(232,160,32,0.3)' : '1px solid rgba(255,255,255,0.1)',
                          borderBottomRightRadius: msg.sender_id === user.id ? '4px' : '16px',
                          borderBottomLeftRadius: msg.sender_id === user.id ? '16px' : '4px',
                        }}>
                          {msg.content}
                          <div style={{fontSize:'10px',opacity:0.5,marginTop:'4px'}}>
                            {new Date(msg.created_at).toLocaleTimeString('en-AU', {hour:'2-digit',minute:'2-digit'})}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef}/>
                </div>

                <form onSubmit={sendMessage} style={{padding:'12px 16px',borderTop:'1px solid rgba(255,255,255,0.08)',background:'#0D1B2A',display:'flex',gap:'8px',alignItems:'center'}}>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    placeholder="Write a message..."
                    style={{flex:1,padding:'10px 16px',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'24px',fontSize:'14px',color:'#fff',outline:'none'}}
                  />
                  <button
                    type="submit"
                    disabled={sending || !newMessage.trim()}
                    style={{width:'40px',height:'40px',borderRadius:'50%',background:'#E8A020',border:'none',color:'#0D1B2A',cursor:'pointer',fontSize:'16px',flexShrink:0,opacity: sending || !newMessage.trim() ? 0.4 : 1}}
                  >
                    →
                  </button>
                </form>
              </>
            ) : (
              <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',textAlign:'center'}}>
                <div style={{fontSize:'48px',marginBottom:'16px'}}>💬</div>
                <div style={{color:'#fff',fontWeight:700,marginBottom:'8px'}}>Your messages</div>
                <div style={{color:'rgba(255,255,255,0.3)',fontSize:'13px'}}>Select a conversation or find a tradie</div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}

export default function Messages() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-[#0D1B2A] flex items-center justify-center pt-16">
        <div className="text-white/30 text-sm">Loading...</div>
      </main>
    }>
      <MessagesContent />
    </Suspense>
  )
}
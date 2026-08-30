import { useState, useEffect, useRef } from 'react';
import { Hash, Send, Paperclip, Search, AtSign, Plus, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

interface Channel {
  id: string;
  name: string;
  description: string | null;
  is_direct: boolean;
  unread: number;
}

interface Message {
  id: string;
  content: string;
  sender_id: string;
  sender_name: string;
  sender_avatar: string;
  created_at: string;
}

export const MessagesPage = () => (<MessagesPageInner />);
function MessagesPageInner() {
  const { profile } = useAuth();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewChannel, setShowNewChannel] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');

  // Fetch channels
  useEffect(() => {
    if (!profile?.company_id) return;

    const fetchChannels = async () => {
      setLoading(true);
      const { data: memberChannels, error: mcErr } = await supabase
        .from('channel_members')
        .select('channel_id, channels(id, name, description, is_direct)')
        .eq('profile_id', profile.id);

      if (mcErr || !memberChannels) {
        setLoading(false);
        return;
      }

      const chs: Channel[] = [];
      for (const mc of memberChannels) {
        const ch = mc.channels as any;
        if (!ch) continue;

        // Get unread count
        const { count } = await supabase
          .from('messages')
          .select('id', { count: 'exact', head: true })
          .eq('channel_id', ch.id)
          .eq('sender_id', '!=', profile.id)
          .gt('created_at', new Date(Date.now() - 7 * 86400000).toISOString()); // simplified unread

        chs.push({
          id: ch.id,
          name: ch.name,
          description: ch.description,
          is_direct: ch.is_direct,
          unread: count || 0,
        });
      }

      setChannels(chs);
      if (chs.length > 0 && !activeChannel) {
        setActiveChannel(chs[0]);
      }
      setLoading(false);
    };

    fetchChannels();
  }, [profile?.company_id, profile?.id]);

  // Fetch messages for active channel
  useEffect(() => {
    if (!activeChannel) return;

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*, profiles!messages_sender_id_fkey(name, avatar)')
        .eq('channel_id', activeChannel.id)
        .order('created_at', { ascending: true })
        .limit(100);

      if (!error && data) {
        const msgs: Message[] = data.map((m: any) => ({
          id: m.id,
          content: m.content,
          sender_id: m.sender_id,
          sender_name: m.profiles?.name || 'Unknown',
          sender_avatar: m.profiles?.avatar || '??',
          created_at: m.created_at,
        }));
        setMessages(msgs);
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    };

    fetchMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel(`messages-${activeChannel.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `channel_id=eq.${activeChannel.id}`,
      }, async (payload) => {
        const newMsg = payload.new as any;
        // Fetch sender profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('name, avatar')
          .eq('id', newMsg.sender_id)
          .single();

        setMessages(prev => [...prev, {
          id: newMsg.id,
          content: newMsg.content,
          sender_id: newMsg.sender_id,
          sender_name: profileData?.name || 'Unknown',
          sender_avatar: profileData?.avatar || '??',
          created_at: newMsg.created_at,
        }]);
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeChannel?.id]);

  const sendMessage = async () => {
    if (!message.trim() || !activeChannel || !profile?.id || sending) return;
    setSending(true);
    const content = message.trim();
    setMessage('');

    await supabase.from('messages').insert({
      channel_id: activeChannel.id,
      sender_id: profile.id,
      content,
    });
    setSending(false);
  };

  const createChannel = async () => {
    if (!newChannelName.trim() || !profile?.company_id || !profile?.id) return;

    const { data: channel, error } = await supabase
      .from('channels')
      .insert({
        name: newChannelName.trim().toLowerCase().replace(/\s+/g, '-'),
        description: '',
        company_id: profile.company_id,
        created_by: profile.id,
      })
      .select()
      .single();

    if (!error && channel) {
      // Add creator as member
      await supabase.from('channel_members').insert({
        channel_id: channel.id,
        profile_id: profile.id,
      });

      setChannels(prev => [...prev, {
        id: channel.id,
        name: channel.name,
        description: channel.description,
        is_direct: channel.is_direct,
        unread: 0,
      }]);
      setActiveChannel({
        id: channel.id,
        name: channel.name,
        description: channel.description,
        is_direct: channel.is_direct,
        unread: 0,
      });
      setShowNewChannel(false);
      setNewChannelName('');
    }
  };

  const filteredChannels = channels.filter(ch =>
    ch.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatTime = (iso: string) => new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

  const getAvatarColor = (name: string) => {
    const colors = ['#FB923C', '#3dd68c', '#9b7cf4', '#e5a435', '#f09858', '#52d9c4', '#f75f6b'];
    return colors[name.charCodeAt(0) % colors.length];
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ background: '#0b0e18' }}>
        <div className="text-center">
          <div style={{
            width: 32, height: 32,
            border: '3px solid rgba(251,146,60,0.2)',
            borderTopColor: '#FB923C',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 12px',
          }} />
          <p style={{ color: '#7c85a2', fontSize: 13 }}>Loading channels...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex overflow-hidden" style={{ background: '#0b0e18' }}>
      {/* Channel list */}
      <div className="w-56 flex flex-col shrink-0" style={{ background: '#10131f', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="px-4 py-4 shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold" style={{ color: '#d9dff0' }}>Messages</h2>
            <button
              onClick={() => setShowNewChannel(true)}
              className="w-6 h-6 flex items-center justify-center rounded"
              style={{ color: '#484f6b', background: 'rgba(255,255,255,0.04)' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#d9dff0')}
              onMouseLeave={e => (e.currentTarget.style.color = '#484f6b')}
            >
              <Plus size={13} />
            </button>
          </div>
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-md" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <Search size={12} color="#484f6b" />
            <input
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search..."
              className="flex-1 bg-transparent text-xs outline-none"
              style={{ color: '#d9dff0' }}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-3">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-xs font-medium uppercase tracking-wider" style={{ color: '#2e3450', fontSize: 10 }}>Channels</span>
          </div>

          {filteredChannels.length === 0 && (
            <p className="text-xs px-2 py-4" style={{ color: '#484f6b' }}>No channels yet</p>
          )}

          {filteredChannels.map(ch => (
            <button
              key={ch.id}
              onClick={() => setActiveChannel(ch)}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-colors mb-0.5"
              style={{
                background: activeChannel?.id === ch.id ? 'rgba(251,146,60,0.12)' : 'transparent',
                color: activeChannel?.id === ch.id ? '#d9dff0' : '#7c85a2',
              }}
              onMouseEnter={e => { if (activeChannel?.id !== ch.id) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
              onMouseLeave={e => { if (activeChannel?.id !== ch.id) e.currentTarget.style.background = 'transparent'; }}
            >
              <Hash size={13} color={activeChannel?.id === ch.id ? '#FB923C' : '#484f6b'} />
              <span className="flex-1 text-left truncate">{ch.name}</span>
              {ch.unread > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-xs font-medium" style={{ background: '#FB923C', color: '#fff', fontSize: 10 }}>
                  {ch.unread}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Message area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {activeChannel ? (
          <>
            {/* Channel header */}
            <div className="flex items-center gap-2 px-5 py-3 shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <Hash size={15} color="#FB923C" />
              <span className="text-sm font-semibold" style={{ color: '#d9dff0' }}>{activeChannel.name}</span>
              {activeChannel.description && (
                <span className="text-xs" style={{ color: '#484f6b' }}>· {activeChannel.description}</span>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full">
                  <Hash size={32} color="#2e3450" />
                  <p className="mt-3 text-sm" style={{ color: '#7c85a2' }}>No messages yet. Start the conversation!</p>
                </div>
              )}

              {messages.map((msg) => (
                <div key={msg.id} className="flex gap-3 group">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                    style={{ background: `${getAvatarColor(msg.sender_name)}20`, color: getAvatarColor(msg.sender_name) }}
                  >
                    {msg.sender_avatar?.length <= 2 ? msg.sender_avatar : msg.sender_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-xs font-semibold" style={{ color: '#d9dff0' }}>{msg.sender_name}</span>
                      <span className="text-xs" style={{ color: '#2e3450' }}>{formatTime(msg.created_at)}</span>
                    </div>
                    <div
                      className="text-sm rounded-lg px-3 py-2.5 inline-block max-w-lg"
                      style={{ background: 'rgba(255,255,255,0.04)', color: '#a0a8c0', border: '1px solid rgba(255,255,255,0.05)' }}
                    >
                      {msg.content}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="px-5 py-3 shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-end gap-2 rounded-lg px-3 py-2" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder={`Message #${activeChannel.name}`}
                  rows={1}
                  className="flex-1 bg-transparent outline-none text-sm resize-none"
                  style={{ color: '#d9dff0', minHeight: 24, maxHeight: 120 }}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                />
                <div className="flex items-center gap-2 shrink-0">
                  <button style={{ color: '#484f6b' }}><AtSign size={15} /></button>
                  <button style={{ color: '#484f6b' }}><Paperclip size={15} /></button>
                  <button
                    className="flex items-center justify-center w-7 h-7 rounded-md transition-colors"
                    style={{ background: message.trim() && !sending ? '#FB923C' : 'rgba(255,255,255,0.06)', color: message.trim() && !sending ? '#fff' : '#484f6b', cursor: message.trim() && !sending ? 'pointer' : 'default' }}
                    onClick={sendMessage}
                    disabled={!message.trim() || sending}
                  >
                    <Send size={13} />
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Hash size={40} color="#2e3450" />
              <p className="mt-3 text-sm" style={{ color: '#7c85a2' }}>Select a channel to start messaging</p>
            </div>
          </div>
        )}
      </div>

      {/* New Channel Modal */}
      {showNewChannel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
          <div className="rounded-xl p-5 w-full max-w-sm" style={{ background: '#141826', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold" style={{ color: '#e8eaf0' }}>Create Channel</h3>
              <button onClick={() => { setShowNewChannel(false); setNewChannelName(''); }} style={{ color: '#7c85a2' }}>
                <X size={16} />
              </button>
            </div>
            <input
              value={newChannelName}
              onChange={e => setNewChannelName(e.target.value)}
              placeholder="Channel name"
              className="w-full px-3 py-2 rounded-md text-sm outline-none mb-4"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#d9dff0' }}
              onKeyDown={e => { if (e.key === 'Enter') createChannel(); }}
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => { setShowNewChannel(false); setNewChannelName(''); }}
                className="px-3 py-1.5 rounded-md text-xs"
                style={{ color: '#7c85a2', background: 'rgba(255,255,255,0.05)' }}
              >
                Cancel
              </button>
              <button
                onClick={createChannel}
                disabled={!newChannelName.trim()}
                className="px-3 py-1.5 rounded-md text-xs font-medium"
                style={{ background: newChannelName.trim() ? '#FB923C' : 'rgba(255,255,255,0.06)', color: newChannelName.trim() ? '#fff' : '#484f6b' }}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

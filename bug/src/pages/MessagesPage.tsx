import { useState } from 'react';
import { Hash, Send, Paperclip, Search, AtSign, Plus } from 'lucide-react';
import { channels, members, currentUser } from '../data/mockData';

function Avatar({ initials, size = 28 }: { initials: string; size?: number }) {
  const colors = ['#5c6ef8','#3dd68c','#9b7cf4','#e5a435','#f09858','#52d9c4','#f75f6b'];
  const idx = initials.charCodeAt(0) % colors.length;
  return (
    <div className="rounded-full flex items-center justify-center font-semibold flex-shrink-0" style={{ width: size, height: size, background: colors[idx], color: '#fff', fontSize: size * 0.38 }}>
      {initials}
    </div>
  );
}

export const MessagesPage = () => (<MessagesPageInner />);
function MessagesPageInner() {
  const [activeChannel, setActiveChannel] = useState(channels[0]);
  const [message, setMessage] = useState('');

  const formatTime = (iso: string) => new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

  return (
    <div className="flex-1 flex overflow-hidden" style={{ background: '#0b0e18' }}>
      {/* Channel list */}
      <div className="w-56 flex flex-col shrink-0" style={{ background: '#10131f', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="px-4 py-4 shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <h2 className="text-sm font-semibold mb-3" style={{ color: '#d9dff0' }}>Messages</h2>
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-md" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <Search size={12} color="#484f6b" />
            <input placeholder="Search..." className="flex-1 bg-transparent text-xs outline-none" style={{ color: '#d9dff0' }} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-3">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-xs font-medium uppercase tracking-wider" style={{ color: '#2e3450', fontSize: 10 }}>Channels</span>
            <button style={{ color: '#484f6b' }}><Plus size={12} /></button>
          </div>

          {channels.map(ch => (
            <button
              key={ch.id}
              onClick={() => setActiveChannel(ch)}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-colors mb-0.5"
              style={{
                background: activeChannel.id === ch.id ? 'rgba(92,110,248,0.12)' : 'transparent',
                color: activeChannel.id === ch.id ? '#d9dff0' : '#7c85a2',
              }}
              onMouseEnter={e => { if (activeChannel.id !== ch.id) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
              onMouseLeave={e => { if (activeChannel.id !== ch.id) e.currentTarget.style.background = 'transparent'; }}
            >
              <Hash size={13} color={activeChannel.id === ch.id ? '#5c6ef8' : '#484f6b'} />
              <span className="flex-1 text-left truncate">{ch.name}</span>
              {ch.unread > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-xs font-medium" style={{ background: '#5c6ef8', color: '#fff', fontSize: 10 }}>
                  {ch.unread}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Message area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Channel header */}
        <div className="flex items-center gap-2 px-5 py-3 shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <Hash size={15} color="#5c6ef8" />
          <span className="text-sm font-semibold" style={{ color: '#d9dff0' }}>{activeChannel.name}</span>
          <span className="text-xs" style={{ color: '#484f6b' }}>· {activeChannel.members.length} members</span>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {activeChannel.messages.map(msg => {
            const sender = members.find(m => m.id === msg.senderId);
            const initials = msg.senderName.split(' ').map(n => n[0]).join('');
            return (
              <div key={msg.id} className="flex gap-3 group">
                <Avatar initials={initials} size={30} />
                <div className="flex-1">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-xs font-semibold" style={{ color: '#d9dff0' }}>{msg.senderName}</span>
                    <span className="text-xs capitalize" style={{ color: '#484f6b' }}>{sender?.role}</span>
                    <span className="text-xs" style={{ color: '#2e3450' }}>{formatTime(msg.timestamp)}</span>
                  </div>
                  <div
                    className="text-sm rounded-lg px-3 py-2.5 inline-block max-w-lg"
                    style={{ background: 'rgba(255,255,255,0.04)', color: '#a0a8c0', border: '1px solid rgba(255,255,255,0.05)' }}
                  >
                    {msg.content}
                  </div>
                </div>
              </div>
            );
          })}
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
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); setMessage(''); } }}
            />
            <div className="flex items-center gap-2 shrink-0">
              <button style={{ color: '#484f6b' }}><AtSign size={15} /></button>
              <button style={{ color: '#484f6b' }}><Paperclip size={15} /></button>
              <button
                className="flex items-center justify-center w-7 h-7 rounded-md transition-colors"
                style={{ background: message ? '#5c6ef8' : 'rgba(255,255,255,0.06)', color: message ? '#fff' : '#484f6b' }}
                onClick={() => setMessage('')}
              >
                <Send size={13} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

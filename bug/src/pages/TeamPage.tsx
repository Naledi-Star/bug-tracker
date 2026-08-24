import { useState } from 'react';
import { Plus, MoreHorizontal, Search } from 'lucide-react';
import { members } from '../data/mockData';

const roleColors: Record<string, { bg: string; color: string }> = {
  manager: { bg: 'rgba(155,124,244,0.15)', color: '#9b7cf4' },
  developer: { bg: 'rgba(92,110,248,0.15)', color: '#5c6ef8' },
  tester: { bg: 'rgba(61,214,140,0.15)', color: '#3dd68c' },
};

const statusColors: Record<string, string> = {
  online: '#3dd68c',
  away: '#e5a435',
  offline: '#484f6b',
};

export const TeamPage = () => (<TeamPageInner />);
function TeamPageInner() {
  const [search, setSearch] = useState('');

  const filtered = members.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-y-auto" style={{ background: '#0b0e18' }}>
      <div style={{ width: '100%' }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold mb-1" style={{ color: '#e8eaf0' }}>Team</h1>
            <p className="text-sm" style={{ color: '#484f6b' }}>Stargaze Inc · {members.length} members</p>
          </div>
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium"
            style={{ background: '#5c6ef8', color: '#fff' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#6e7ff9')}
            onMouseLeave={e => (e.currentTarget.style.background = '#5c6ef8')}
          >
            <Plus size={14} /> Add Member
          </button>
        </div>

        <div className="flex items-center gap-2 mb-4 px-3 py-1.5 rounded-md max-w-xs" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <Search size={13} color="#484f6b" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search members..."
            className="flex-1 bg-transparent outline-none text-xs"
            style={{ color: '#d9dff0' }}
          />
        </div>

        {/* Table */}
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="grid grid-cols-[auto_1fr_auto_auto_auto_auto_auto] gap-4 px-5 py-2.5 text-xs" style={{ background: '#141826', color: '#484f6b', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="w-8" />
            <div>Member</div>
            <div className="w-24">Role</div>
            <div className="w-20 text-center">Active</div>
            <div className="w-20 text-center">Completed</div>
            <div className="w-28">Workload</div>
            <div className="w-8" />
          </div>

          {filtered.map((m, i) => {
            const { bg, color } = roleColors[m.role];
            return (
              <div
                key={m.id}
                className="grid grid-cols-[auto_1fr_auto_auto_auto_auto_auto] gap-4 items-center px-5 py-3 transition-colors"
                style={{
                  background: 'transparent',
                  borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                {/* Avatar + status */}
                <div className="w-8 relative">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold" style={{ background: '#5c6ef8', color: '#fff' }}>
                    {m.avatar}
                  </div>
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2" style={{ background: statusColors[m.status], borderColor: '#141826' }} />
                </div>

                {/* Name + email */}
                <div>
                  <div className="text-sm font-medium" style={{ color: '#d9dff0' }}>{m.name}</div>
                  <div className="text-xs" style={{ color: '#484f6b' }}>{m.email}</div>
                </div>

                {/* Role */}
                <div className="w-24">
                  <span className="px-2 py-0.5 rounded text-xs font-medium capitalize" style={{ background: bg, color }}>{m.role}</span>
                </div>

                {/* Active bugs */}
                <div className="w-20 text-center">
                  <span className="text-sm font-semibold" style={{ color: m.activeBugs > 5 ? '#f09858' : '#d9dff0' }}>{m.activeBugs}</span>
                </div>

                {/* Completed */}
                <div className="w-20 text-center">
                  <span className="text-sm font-semibold" style={{ color: '#3dd68c' }}>{m.completedBugs}</span>
                </div>

                {/* Workload bar */}
                <div className="w-28">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${m.workload}%`, background: m.workload >= 85 ? '#f75f6b' : m.workload >= 65 ? '#e5a435' : '#3dd68c' }}
                      />
                    </div>
                    <span className="text-xs w-8 text-right" style={{ color: '#7c85a2' }}>{m.workload}%</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="w-8 flex justify-end">
                  <button style={{ color: '#484f6b' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#7c85a2')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#484f6b')}
                  >
                    <MoreHorizontal size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

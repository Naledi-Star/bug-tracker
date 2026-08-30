import { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  status: string;
  active_bugs: number;
  completed_bugs: number;
}

const roleColors: Record<string, { bg: string; color: string }> = {
  admin: { bg: 'rgba(155,124,244,0.15)', color: '#9b7cf4' },
  manager: { bg: 'rgba(155,124,244,0.15)', color: '#9b7cf4' },
  developer: { bg: 'rgba(251,146,60,0.15)', color: '#FB923C' },
  tester: { bg: 'rgba(61,214,140,0.15)', color: '#3dd68c' },
};

const statusColors: Record<string, string> = {
  online: '#3dd68c',
  away: '#e5a435',
  offline: '#484f6b',
};

export const TeamPage = () => (<TeamPageInner />);
function TeamPageInner() {
  const { profile } = useAuth();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!profile?.company_id) return;

    const fetchMembers = async () => {
      setLoading(true);

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, name, email, avatar, role, status')
        .eq('company_id', profile.company_id);

      if (profiles) {
        const membersWithStats: TeamMember[] = await Promise.all(
          profiles.map(async (member) => {
            const [activeRes, completedRes] = await Promise.all([
              supabase
                .from('bugs')
                .select('id', { count: 'exact', head: true })
                .eq('assignee_id', member.id)
                .not('status', 'in', '(resolved,closed)'),
              supabase
                .from('bugs')
                .select('id', { count: 'exact', head: true })
                .eq('assignee_id', member.id)
                .in('status', ['resolved', 'closed']),
            ]);

            return {
              id: member.id,
              name: member.name,
              email: member.email,
              avatar: member.avatar || '??',
              role: member.role,
              status: member.status || 'offline',
              active_bugs: activeRes.count || 0,
              completed_bugs: completedRes.count || 0,
            };
          })
        );

        setMembers(membersWithStats);
      }

      setLoading(false);
    };

    fetchMembers();
  }, [profile?.company_id]);

  const filtered = members.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.role.toLowerCase().includes(search.toLowerCase()) ||
    m.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 32, height: 32,
            border: '3px solid rgba(251,146,60,0.2)',
            borderTopColor: '#FB923C',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 12px',
          }} />
          <p style={{ color: '#7c85a2', fontSize: 13 }}>Loading team...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto" style={{ background: '#0b0e18' }}>
      <div style={{ width: '100%' }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold mb-1" style={{ color: '#e8eaf0' }}>Team</h1>
            <p className="text-sm" style={{ color: '#484f6b' }}>{members.length} members</p>
          </div>
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium"
            style={{ background: '#FB923C', color: '#fff' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#6e7ff9')}
            onMouseLeave={e => (e.currentTarget.style.background = '#FB923C')}
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
          <div className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 px-5 py-2.5 text-xs" style={{ background: '#141826', color: '#484f6b', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="w-8" />
            <div>Member</div>
            <div className="w-24">Role</div>
            <div className="w-20 text-center">Active</div>
            <div className="w-20 text-center">Done</div>
            <div className="w-28">Workload</div>
          </div>

          {filtered.map((m, i) => {
            const { bg, color } = roleColors[m.role] || roleColors['developer'];
            const workload = Math.min(100, m.active_bugs * 10);
            return (
              <div
                key={m.id}
                className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 items-center px-5 py-3 transition-colors"
                style={{
                  borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                {/* Avatar + status */}
                <div className="w-8 relative">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold" style={{ background: '#FB923C', color: '#fff' }}>
                    {m.avatar}
                  </div>
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2" style={{ background: statusColors[m.status] || statusColors['offline'], borderColor: '#141826' }} />
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
                  <span className="text-sm font-semibold" style={{ color: m.active_bugs > 5 ? '#f09858' : '#d9dff0' }}>{m.active_bugs}</span>
                </div>

                {/* Completed */}
                <div className="w-20 text-center">
                  <span className="text-sm font-semibold" style={{ color: '#3dd68c' }}>{m.completed_bugs}</span>
                </div>

                {/* Workload bar */}
                <div className="w-28">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${workload}%`,
                          background: workload > 80 ? '#f75f6b' : workload > 50 ? '#f09858' : '#3dd68c',
                        }}
                      />
                    </div>
                    <span className="text-[10px] font-medium" style={{ color: '#484f6b', minWidth: 28, textAlign: 'right' }}>{workload}%</span>
                  </div>
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="py-12 text-center" style={{ color: '#484f6b' }}>
              <p className="text-sm">No team members found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

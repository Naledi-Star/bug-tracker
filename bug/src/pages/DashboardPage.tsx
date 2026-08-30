import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area } from 'recharts';
import { Plus, MoreHorizontal, TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, Clock, RotateCcw } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useProjects } from '../hooks/useProjects';
import { supabase } from '../lib/supabase';
import type { BugRow } from '../types';

interface BugWithProject extends BugRow {
  project_name?: string;
  project_color?: string;
}

// ─── Tooltip Components ──────────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-3 py-2 rounded-lg text-xs" style={{ background: '#1a1e2e', border: '1px solid rgba(255,255,255,0.1)', color: '#d9dff0' }}>
      {label && <div className="mb-1 font-medium" style={{ color: '#7c85a2' }}>{label}</div>}
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color || p.fill }} />
          <span>{p.name}: <span className="font-semibold">{p.value}</span></span>
        </div>
      ))}
    </div>
  );
};

const PieTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="px-3 py-2 rounded-lg text-xs" style={{ background: '#1a1e2e', border: '1px solid rgba(255,255,255,0.1)', color: '#d9dff0' }}>
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full" style={{ background: d.payload.color }} />
        <span>{d.name}: <span className="font-semibold">{d.value}</span></span>
      </div>
    </div>
  );
};

// ─── Helper Components ───────────────────────────────────────────────────

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg p-4" style={{ background: '#141826', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium" style={{ color: '#d9dff0' }}>{title}</span>
        <button style={{ color: '#484f6b' }} className="hover:opacity-70"><MoreHorizontal size={14} /></button>
      </div>
      {children}
    </div>
  );
}

export function StatusDot({ status }: { status: string }) {
  const cfg: Record<string, string> = {
    'open': '#FB923C', 'in-progress': '#e5a435', 'under-review': '#9b7cf4',
    'resolved': '#3dd68c', 'closed': '#484f6b', 'reopened': '#f75f6b'
  };
  return <div className="w-2 h-2 rounded-full shrink-0" style={{ background: cfg[status] || '#484f6b' }} />;
}

export function PriorityBadge({ priority }: { priority: string }) {
  const cfg: Record<string, { bg: string; color: string }> = {
    critical: { bg: 'rgba(247,95,107,0.15)', color: '#f75f6b' },
    high: { bg: 'rgba(240,152,88,0.15)', color: '#f09858' },
    medium: { bg: 'rgba(229,164,53,0.15)', color: '#e5a435' },
    low: { bg: 'rgba(61,214,140,0.15)', color: '#3dd68c' },
  };
  const c = cfg[priority] || { bg: 'rgba(255,255,255,0.06)', color: '#7c85a2' };
  return <span className="px-1.5 py-0.5 rounded text-xs font-medium capitalize shrink-0" style={{ background: c.bg, color: c.color }}>{priority}</span>;
}

export function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, { bg: string; color: string; label: string }> = {
    'open': { bg: 'rgba(251,146,60,0.15)', color: '#FB923C', label: 'Open' },
    'in-progress': { bg: 'rgba(229,164,53,0.15)', color: '#e5a435', label: 'In Progress' },
    'under-review': { bg: 'rgba(155,124,244,0.15)', color: '#9b7cf4', label: 'Under Review' },
    'resolved': { bg: 'rgba(61,214,140,0.15)', color: '#3dd68c', label: 'Resolved' },
    'closed': { bg: 'rgba(72,79,107,0.2)', color: '#7c85a2', label: 'Closed' },
    'reopened': { bg: 'rgba(247,95,107,0.15)', color: '#f75f6b', label: 'Reopened' },
  };
  const c = cfg[status] || { bg: 'rgba(255,255,255,0.06)', color: '#7c85a2', label: status };
  return <span className="px-1.5 py-0.5 rounded text-xs font-medium shrink-0 whitespace-nowrap" style={{ background: c.bg, color: c.color }}>{c.label}</span>;
}

// ─── Main Dashboard Component ────────────────────────────────────────────

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { projects } = useProjects(profile?.company_id || null);
  const [bugs, setBugs] = useState<BugWithProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeProject, setActiveProject] = useState('all');

  // Fetch all bugs for the company
  useEffect(() => {
    if (!profile?.company_id) return;

    const fetchBugs = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('bugs')
        .select('*, projects(name, color)')
        .eq('is_archived', false);

      if (!error && data) {
        const bugsWithProject = data.map(b => ({
          ...b,
          project_name: (b.projects as any)?.name || '',
          project_color: (b.projects as any)?.color || '#FB923C',
        }));
        setBugs(bugsWithProject);
      }
      setLoading(false);
    };

    fetchBugs();
  }, [profile?.company_id]);

  // Filter bugs by selected project
  const filteredBugs = useMemo(() => {
    if (activeProject === 'all') return bugs;
    return bugs.filter(b => b.project_id === activeProject);
  }, [bugs, activeProject]);

  // ─── Compute Stats ───────────────────────────────────────────────────

  const stats = useMemo(() => {
    const total = filteredBugs.length;
    const critical = filteredBugs.filter(b => b.priority === 'critical').length;
    const inProgress = filteredBugs.filter(b => b.status === 'in-progress').length;
    const underReview = filteredBugs.filter(b => b.status === 'under-review').length;
    const resolved = filteredBugs.filter(b => ['resolved', 'closed'].includes(b.status)).length;
    const open = filteredBugs.filter(b => b.status === 'open').length;
    const reopened = filteredBugs.filter(b => b.status === 'reopened').length;

    return { total, critical, inProgress, underReview, resolved, open, reopened };
  }, [filteredBugs]);

  // Priority distribution
  const priorityData = useMemo(() => [
    { name: 'Critical', value: filteredBugs.filter(b => b.priority === 'critical').length, color: '#f75f6b' },
    { name: 'High', value: filteredBugs.filter(b => b.priority === 'high').length, color: '#f09858' },
    { name: 'Medium', value: filteredBugs.filter(b => b.priority === 'medium').length, color: '#e5a435' },
    { name: 'Low', value: filteredBugs.filter(b => b.priority === 'low').length, color: '#3dd68c' },
  ], [filteredBugs]);

  // Status distribution
  const statusData = useMemo(() => [
    { name: 'Open', value: filteredBugs.filter(b => b.status === 'open').length, color: '#FB923C' },
    { name: 'In Progress', value: filteredBugs.filter(b => b.status === 'in-progress').length, color: '#e5a435' },
    { name: 'Review', value: filteredBugs.filter(b => b.status === 'under-review').length, color: '#9b7cf4' },
    { name: 'Resolved', value: filteredBugs.filter(b => b.status === 'resolved').length, color: '#3dd68c' },
    { name: 'Closed', value: filteredBugs.filter(b => b.status === 'closed').length, color: '#484f6b' },
    { name: 'Reopened', value: filteredBugs.filter(b => b.status === 'reopened').length, color: '#f75f6b' },
  ], [filteredBugs]);

  // Bugs by month (last 6 months)
  const bugsByMonth = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const result = [];

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthIdx = date.getMonth();
      const monthName = months[monthIdx];
      const year = date.getFullYear();

      const created = filteredBugs.filter(b => {
        const d = new Date(b.created_at);
        return d.getMonth() === monthIdx && d.getFullYear() === year;
      }).length;

      const resolved = filteredBugs.filter(b => {
        const d = new Date(b.updated_at);
        return d.getMonth() === monthIdx && d.getFullYear() === year &&
          ['resolved', 'closed'].includes(b.status);
      }).length;

      result.push({ month: monthName, created, resolved });
    }

    return result;
  }, [filteredBugs]);

  // Bugs by month trend (for area chart)
  const bugsTrend = useMemo(() => {
    return bugsByMonth.map(m => ({ month: m.month, bugs: m.created }));
  }, [bugsByMonth]);

  // Project health
  const projectHealth = useMemo(() => {
    return projects.map(p => {
      const projectBugs = bugs.filter(b => b.project_id === p.id);
      const openBugs = projectBugs.filter(b => !['resolved', 'closed'].includes(b.status));
      const criticalBugs = openBugs.filter(b => b.priority === 'critical');
      const total = projectBugs.length;
      const health = total === 0 ? 100 : Math.max(0, Math.min(100,
        100 - ((criticalBugs.length * 20 + openBugs.length * 5) / total)
      ));
      return { ...p, health };
    });
  }, [projects, bugs]);

  // Recent critical bugs
  const recentCriticalBugs = useMemo(() => {
    return filteredBugs
      .filter(b => b.priority === 'critical' || b.priority === 'high')
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 4);
  }, [filteredBugs]);

  const pTotal = priorityData.reduce((s, d) => s + d.value, 0);

  // ─── Stat Cards Config ───────────────────────────────────────────────

  const statCards = [
    { label: 'Total Bugs', value: stats.total, sub: `${stats.total} total`, trend: 'neutral' as const, color: '#FB923C', icon: AlertTriangle },
    { label: 'Critical Bugs', value: stats.critical, sub: stats.critical > 0 ? `${stats.critical} need attention` : 'None critical', trend: stats.critical > 0 ? 'up' as const : 'neutral' as const, color: '#f75f6b', icon: AlertTriangle },
    { label: 'In Progress', value: stats.inProgress, sub: `${stats.inProgress} being worked on`, trend: 'neutral' as const, color: '#e5a435', icon: Clock },
    { label: 'Under Review', value: stats.underReview, sub: `${stats.underReview} awaiting review`, trend: 'neutral' as const, color: '#9b7cf4', icon: RotateCcw },
    { label: 'Resolved', value: stats.resolved, sub: `${stats.resolved} completed`, trend: 'down' as const, color: '#3dd68c', icon: CheckCircle2 },
    { label: 'Open Bugs', value: stats.open, sub: `${stats.open} unassigned or pending`, trend: 'neutral' as const, color: '#f09858', icon: AlertTriangle },
  ];

  // ─── Loading State ───────────────────────────────────────────────────

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
          <p style={{ color: '#7c85a2', fontSize: 13 }}>Loading dashboard...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  // ─── Render ──────────────────────────────────────────────────────────

  return (
    <div>
      <div className="flex items-start justify-between mb-1">
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: '#e8eaf0' }}>Bug Dashboard</h1>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium" style={{ background: 'rgba(255,255,255,0.06)', color: '#7c85a2', border: '1px solid rgba(255,255,255,0.08)' }}>
          <Plus size={14} /> Add Widget
        </button>
      </div>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-sm" style={{ color: '#484f6b' }}>Boards / {projects.length}</span>
        <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'rgba(251,146,60,0.15)', color: '#FB923C' }}>Stargaze Inc</span>
      </div>

      {/* Project Filter Tabs */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {[{ id: 'all', name: 'All Projects' }, ...projects].map(p => (
          <button
            key={p.id}
            onClick={() => setActiveProject(p.id)}
            className="px-3 py-1 rounded-md text-xs font-medium transition-all"
            style={{
              background: activeProject === p.id ? 'rgba(251,146,60,0.2)' : 'rgba(255,255,255,0.04)',
              color: activeProject === p.id ? '#FB923C' : '#7c85a2',
              border: '1px solid ' + (activeProject === p.id ? 'rgba(251,146,60,0.4)' : 'rgba(255,255,255,0.06)')
            }}
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {statCards.map((card, i) => (
          <div key={i} className="rounded-lg p-4 cursor-pointer" style={{ background: '#141826', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-start justify-between mb-2">
              <span className="text-xs font-medium" style={{ color: '#7c85a2' }}>{card.label}</span>
              <card.icon size={12} color={card.color} />
            </div>
            <div className="text-2xl font-bold mb-1" style={{ color: '#e8eaf0' }}>{card.value}</div>
            <div className="flex items-center gap-1 text-xs" style={{ color: card.trend === 'up' ? '#f75f6b' : card.trend === 'down' ? '#3dd68c' : '#484f6b' }}>
              {card.trend === 'up' ? <TrendingUp size={11} /> : card.trend === 'down' ? <TrendingDown size={11} /> : null}
              {card.sub}
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row 1: Priority, Source (placeholder), Monthly Trend */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <ChartCard title="Bugs by Priority">
          <div className="flex items-center gap-4">
            <ResponsiveContainer width={120} height={120}>
              <PieChart>
                <Pie data={priorityData.map(d => ({...d, total: pTotal || 1}))} cx="50%" cy="50%" innerRadius={34} outerRadius={56} dataKey="value" paddingAngle={2}>
                  {priorityData.map((d, i) => (<Cell key={i} fill={d.color} stroke="none" />))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 flex-1">
              {priorityData.map(d => (
                <div key={d.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                    <span className="text-xs" style={{ color: '#7c85a2' }}>{d.name}</span>
                  </div>
                  <span className="text-xs font-medium" style={{ color: '#d9dff0' }}>
                    {pTotal > 0 ? ((d.value / pTotal) * 100).toFixed(0) : 0}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>

        <ChartCard title="Bugs by Source">
          <div className="flex items-center gap-4">
            <ResponsiveContainer width={120} height={120}>
              <PieChart>
                <Pie data={[
                  { name: 'Internal QA', value: Math.floor(stats.total * 0.38) || 1, color: '#FB923C' },
                  { name: 'Customer', value: Math.floor(stats.total * 0.26) || 1, color: '#9b7cf4' },
                  { name: 'Support', value: Math.floor(stats.total * 0.22) || 1, color: '#52d9c4' },
                  { name: 'Automated', value: Math.floor(stats.total * 0.14) || 1, color: '#f09858' },
                ]} cx="50%" cy="50%" innerRadius={34} outerRadius={56} dataKey="value" paddingAngle={2}>
                  {[0,1,2,3].map((i) => (
                    <Cell key={i} fill={['#FB923C','#9b7cf4','#52d9c4','#f09858'][i]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 flex-1">
              {[
                { name: 'Internal QA', value: Math.floor(stats.total * 0.38) || 0, color: '#FB923C' },
                { name: 'Customer', value: Math.floor(stats.total * 0.26) || 0, color: '#9b7cf4' },
                { name: 'Support', value: Math.floor(stats.total * 0.22) || 0, color: '#52d9c4' },
                { name: 'Automated', value: Math.floor(stats.total * 0.14) || 0, color: '#f09858' },
              ].map(d => (
                <div key={d.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                    <span className="text-xs" style={{ color: '#7c85a2' }}>{d.name}</span>
                  </div>
                  <span className="text-xs font-medium" style={{ color: '#d9dff0' }}>{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>

        <ChartCard title="Bugs by Month">
          <ResponsiveContainer width="100%" height={120}>
            <AreaChart data={bugsTrend} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="bugGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FB923C" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#FB923C" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#484f6b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#484f6b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="bugs" stroke="#FB923C" strokeWidth={2} fill="url(#bugGrad)" dot={{ fill: '#FB923C', r: 3, strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Charts Row 2: Created vs Resolved, Total Resolved */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="md:col-span-2">
          <ChartCard title="Number of Bugs by Month">
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={bugsByMonth} margin={{ top: 4, right: 4, bottom: 0, left: -20 }} barSize={24}>
                <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: '#484f6b', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#484f6b', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="created" name="Created" fill="#3dd68c" radius={[3, 3, 0, 0]} />
                <Bar dataKey="resolved" name="Resolved" fill="rgba(61,214,140,0.3)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1.5 text-xs" style={{ color: '#7c85a2' }}>
                <div className="w-2.5 h-2.5 rounded-sm" style={{ background: '#3dd68c' }} /> Created
              </div>
              <div className="flex items-center gap-1.5 text-xs" style={{ color: '#7c85a2' }}>
                <div className="w-2.5 h-2.5 rounded-sm" style={{ background: 'rgba(61,214,140,0.3)' }} /> Resolved
              </div>
            </div>
          </ChartCard>
        </div>
        <ChartCard title="Total Bugs Resolved">
          <div className="flex flex-col items-center justify-center py-6">
            <div className="text-7xl font-bold mb-2" style={{ color: '#e8eaf0' }}>{stats.resolved}</div>
            <div className="text-sm" style={{ color: '#3dd68c' }}>resolved bugs</div>
            <div className="mt-4 text-xs" style={{ color: '#484f6b' }}>across all projects</div>
          </div>
        </ChartCard>
      </div>

      {/* Charts Row 3: Status Distribution, Project Health */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <ChartCard title="Bugs by Status">
          <div className="space-y-2">
            {statusData.map(d => (
              <div key={d.name} className="flex items-center gap-3">
                <span className="text-xs w-20 shrink-0" style={{ color: '#7c85a2' }}>{d.name}</span>
                <div className="flex-1 rounded-full h-1.5" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <div className="h-full rounded-full" style={{ width: (d.value / Math.max(stats.total, 1)) * 100 + '%', background: d.color }} />
                </div>
                <span className="text-xs w-5 text-right font-medium" style={{ color: '#d9dff0' }}>{d.value}</span>
              </div>
            ))}
          </div>
        </ChartCard>
        <ChartCard title="Project Health">
          <div className="space-y-3">
            {projectHealth.map(p => (
              <div key={p.id} className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: p.color }} />
                <span className="text-xs truncate flex-1" style={{ color: '#7c85a2' }}>{p.name}</span>
                <div className="w-24 rounded-full h-1.5" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <div className="h-full rounded-full" style={{ width: p.health + '%', background: p.health >= 80 ? '#3dd68c' : p.health >= 60 ? '#e5a435' : '#f75f6b' }} />
                </div>
                <span className="text-xs w-8 text-right font-medium" style={{ color: '#d9dff0' }}>{p.health}%</span>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* Recent Critical Bugs */}
      <ChartCard title="Recent Critical Bugs">
        <div className="space-y-0">
          {recentCriticalBugs.length > 0 ? recentCriticalBugs.map((bug, i) => (
            <div
              key={bug.id}
              className="flex items-center gap-3 py-2 cursor-pointer"
              style={{ borderBottom: i < recentCriticalBugs.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
              onClick={() => navigate('/dashboard/defects/' + bug.id)}
            >
              <span className="font-mono text-xs shrink-0" style={{ color: '#484f6b', fontFamily: 'JetBrains Mono, monospace' }}>
                #{bug.bug_number}
              </span>
              <StatusDot status={bug.status} />
              <span className="text-xs flex-1 truncate" style={{ color: '#d9dff0' }}>{bug.title}</span>
              <PriorityBadge priority={bug.priority} />
              <span className="text-xs shrink-0" style={{ color: '#484f6b' }}>{bug.project_name?.split(' ')[0]}</span>
            </div>
          )) : (
            <div className="py-8 text-center">
              <p className="text-xs" style={{ color: '#484f6b' }}>No critical or high priority bugs</p>
            </div>
          )}
        </div>
      </ChartCard>
    </div>
  );
};

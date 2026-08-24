import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area } from 'recharts';
import { bugs, projects, bugsByMonth } from '../data/mockData';

const bugsByMonthChart = [
  { month: 'Mar', bugs: 8 },
  { month: 'Apr', bugs: 12 },
  { month: 'May', bugs: 7 },
  { month: 'Jun', bugs: 15 },
  { month: 'Jul', bugs: 18 },
  { month: 'Aug', bugs: 11 },
];
import { Plus, MoreHorizontal, TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, Clock, RotateCcw } from 'lucide-react';

const priorityData = [{ name: 'Critical', value: 12, color: '#f75f6b' }, { name: 'High', value: 18, color: '#f09858' }, { name: 'Medium', value: 24, color: '#e5a435' }, { name: 'Low', value: 14, color: '#3dd68c' }];
const sourceData = [{ name: 'Internal QA', value: 38, color: '#5c6ef8' }, { name: 'Customer', value: 26, color: '#9b7cf4' }, { name: 'Support', value: 22, color: '#52d9c4' }, { name: 'Automated', value: 14, color: '#f09858' }];
const statusData = [{ name: 'Open', value: bugs.filter(b => b.status === 'open').length, color: '#5c6ef8' }, { name: 'In Progress', value: bugs.filter(b => b.status === 'in-progress').length, color: '#e5a435' }, { name: 'Review', value: bugs.filter(b => b.status === 'under-review').length, color: '#9b7cf4' }, { name: 'Resolved', value: bugs.filter(b => b.status === 'resolved').length, color: '#3dd68c' }, { name: 'Closed', value: bugs.filter(b => b.status === 'closed').length, color: '#484f6b' }];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (<div className="px-3 py-2 rounded-lg text-xs" style={{ background: '#1a1e2e', border: '1px solid rgba(255,255,255,0.1)', color: '#d9dff0' }}>{label && <div className="mb-1 font-medium" style={{ color: '#7c85a2' }}>{label}</div>}{payload.map((p: any, i: number) => (<div key={i} className="flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{ background: p.color || p.fill }} /><span>{p.name}: <span className="font-semibold">{p.value}</span></span></div>))}</div>);
};

const PieTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (<div className="px-3 py-2 rounded-lg text-xs" style={{ background: '#1a1e2e', border: '1px solid rgba(255,255,255,0.1)', color: '#d9dff0' }}><div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{ background: d.payload.color }} /><span>{d.name}: <span className="font-semibold">{d.value}</span></span></div></div>);
};

const statCards = [
  { label: 'Total Bugs', value: bugs.length, sub: '+5 this week', trend: 'up' as const, color: '#5c6ef8', icon: AlertTriangle },
  { label: 'Critical Bugs', value: bugs.filter(b => b.priority === 'critical').length, sub: '+2 this week', trend: 'up' as const, color: '#f75f6b', icon: AlertTriangle },
  { label: 'In Progress', value: bugs.filter(b => b.status === 'in-progress').length, sub: '2 overdue', trend: 'neutral' as const, color: '#e5a435', icon: Clock },
  { label: 'Under Review', value: bugs.filter(b => b.status === 'under-review').length, sub: 'avg 1.2d', trend: 'neutral' as const, color: '#9b7cf4', icon: RotateCcw },
  { label: 'Resolved', value: bugs.filter(b => b.status === 'resolved' || b.status === 'closed').length, sub: '+14 this month', trend: 'down' as const, color: '#3dd68c', icon: CheckCircle2 },
  { label: 'Open Bugs', value: bugs.filter(b => b.status === 'open').length, sub: '3 critical', trend: 'neutral' as const, color: '#f09858', icon: AlertTriangle },
];

export const DashboardPage = () => {
  const navigate = useNavigate();
  const [activeProject, setActiveProject] = useState('all');
  const pTotal = priorityData.reduce((s, d) => s + d.value, 0);
  const sTotal = sourceData.reduce((s, d) => s + d.value, 0);

  return (
    <div>
      <div className="flex items-start justify-between mb-1">
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: '#e8eaf0' }}>Bug Dashboard</h1>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium" style={{ background: 'rgba(255,255,255,0.06)', color: '#7c85a2', border: '1px solid rgba(255,255,255,0.08)' }}><Plus size={14} /> Add Widget</button>
      </div>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-sm" style={{ color: '#484f6b' }}>Boards / 4</span>
        <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'rgba(92,110,248,0.15)', color: '#5c6ef8' }}>Stargaze Inc</span>
      </div>

      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {[{ id: 'all', name: 'All Projects' }, ...projects].map(p => (
          <button key={'id' in p ? p.id : 'all'} onClick={() => setActiveProject('id' in p ? p.id : 'all')} className="px-3 py-1 rounded-md text-xs font-medium transition-all" style={{ background: activeProject === ('id' in p ? p.id : 'all') ? 'rgba(92,110,248,0.2)' : 'rgba(255,255,255,0.04)', color: activeProject === ('id' in p ? p.id : 'all') ? '#5c6ef8' : '#7c85a2', border: '1px solid ' + (activeProject === ('id' in p ? p.id : 'all') ? 'rgba(92,110,248,0.4)' : 'rgba(255,255,255,0.06)') }}>{p.name}</button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {statCards.map((card, i) => (
          <div key={i} className="rounded-lg p-4 cursor-pointer" style={{ background: '#141826', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-start justify-between mb-2"><span className="text-xs font-medium" style={{ color: '#7c85a2' }}>{card.label}</span><card.icon size={12} color={card.color} /></div>
            <div className="text-2xl font-bold mb-1" style={{ color: '#e8eaf0' }}>{card.value}</div>
            <div className="flex items-center gap-1 text-xs" style={{ color: card.trend === 'up' ? '#f75f6b' : card.trend === 'down' ? '#3dd68c' : '#484f6b' }}>{card.trend === 'up' ? <TrendingUp size={11} /> : card.trend === 'down' ? <TrendingDown size={11} /> : null}{card.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <ChartCard title="Bugs by Priority">
          <div className="flex items-center gap-4">
            <ResponsiveContainer width={120} height={120}><PieChart><Pie data={priorityData.map(d => ({...d, total: pTotal}))} cx="50%" cy="50%" innerRadius={34} outerRadius={56} dataKey="value" paddingAngle={2}>{priorityData.map((d, i) => (<Cell key={i} fill={d.color} stroke="none" />))}</Pie><Tooltip content={<PieTooltip />} /></PieChart></ResponsiveContainer>
            <div className="space-y-2 flex-1">{priorityData.map(d => (<div key={d.name} className="flex items-center justify-between"><div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full" style={{ background: d.color }} /><span className="text-xs" style={{ color: '#7c85a2' }}>{d.name}</span></div><span className="text-xs font-medium" style={{ color: '#d9dff0' }}>{((d.value / pTotal) * 100).toFixed(0)}%</span></div>))}</div>
          </div>
        </ChartCard>
        <ChartCard title="Bugs by Source">
          <div className="flex items-center gap-4">
            <ResponsiveContainer width={120} height={120}><PieChart><Pie data={sourceData.map(d => ({...d, total: sTotal}))} cx="50%" cy="50%" innerRadius={34} outerRadius={56} dataKey="value" paddingAngle={2}>{sourceData.map((d, i) => (<Cell key={i} fill={d.color} stroke="none" />))}</Pie><Tooltip content={<PieTooltip />} /></PieChart></ResponsiveContainer>
            <div className="space-y-2 flex-1">{sourceData.map(d => (<div key={d.name} className="flex items-center justify-between"><div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full" style={{ background: d.color }} /><span className="text-xs" style={{ color: '#7c85a2' }}>{d.name}</span></div><span className="text-xs font-medium" style={{ color: '#d9dff0' }}>{((d.value / sTotal) * 100).toFixed(0)}%</span></div>))}</div>
          </div>
        </ChartCard>
        <ChartCard title="Bugs by Month">
          <ResponsiveContainer width="100%" height={120}><AreaChart data={bugsByMonthChart} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}><defs><linearGradient id="bugGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#5c6ef8" stopOpacity={0.25} /><stop offset="100%" stopColor="#5c6ef8" stopOpacity={0} /></linearGradient></defs><CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} /><XAxis dataKey="month" tick={{ fill: '#484f6b', fontSize: 10 }} axisLine={false} tickLine={false} /><YAxis tick={{ fill: '#484f6b', fontSize: 10 }} axisLine={false} tickLine={false} /><Tooltip content={<CustomTooltip />} /><Area type="monotone" dataKey="bugs" stroke="#5c6ef8" strokeWidth={2} fill="url(#bugGrad)" dot={{ fill: '#5c6ef8', r: 3, strokeWidth: 0 }} /></AreaChart></ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="md:col-span-2">
          <ChartCard title="Number of Bugs by Month">
            <ResponsiveContainer width="100%" height={160}><BarChart data={bugsByMonth} margin={{ top: 4, right: 4, bottom: 0, left: -20 }} barSize={24}><CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} /><XAxis dataKey="month" tick={{ fill: '#484f6b', fontSize: 10 }} axisLine={false} tickLine={false} /><YAxis tick={{ fill: '#484f6b', fontSize: 10 }} axisLine={false} tickLine={false} /><Tooltip content={<CustomTooltip />} /><Bar dataKey="created" name="Created" fill="#3dd68c" radius={[3, 3, 0, 0]} /><Bar dataKey="resolved" name="Resolved" fill="rgba(61,214,140,0.3)" radius={[3, 3, 0, 0]} /></BarChart></ResponsiveContainer>
            <div className="flex items-center gap-4 mt-2"><div className="flex items-center gap-1.5 text-xs" style={{ color: '#7c85a2' }}><div className="w-2.5 h-2.5 rounded-sm" style={{ background: '#3dd68c' }} /> Created</div><div className="flex items-center gap-1.5 text-xs" style={{ color: '#7c85a2' }}><div className="w-2.5 h-2.5 rounded-sm" style={{ background: 'rgba(61,214,140,0.3)' }} /> Resolved</div></div>
          </ChartCard>
        </div>
        <ChartCard title="Total Bugs Resolved">
          <div className="flex flex-col items-center justify-center py-6">
            <div className="text-7xl font-bold mb-2" style={{ color: '#e8eaf0' }}>72</div>
            <div className="text-sm" style={{ color: '#3dd68c' }}>+14 this month</div>
            <div className="mt-4 text-xs" style={{ color: '#484f6b' }}>across all projects</div>
          </div>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <ChartCard title="Bugs by Status">
          <div className="space-y-2">{statusData.map(d => (<div key={d.name} className="flex items-center gap-3"><span className="text-xs w-20 shrink-0" style={{ color: '#7c85a2' }}>{d.name}</span><div className="flex-1 rounded-full h-1.5" style={{ background: 'rgba(255,255,255,0.06)' }}><div className="h-full rounded-full" style={{ width: (d.value / Math.max(bugs.length, 1)) * 100 + '%', background: d.color }} /></div><span className="text-xs w-5 text-right font-medium" style={{ color: '#d9dff0' }}>{d.value}</span></div>))}</div>
        </ChartCard>
        <ChartCard title="Project Health">
          <div className="space-y-3">{projects.map(p => (<div key={p.id} className="flex items-center gap-3"><div className="w-2 h-2 rounded-full shrink-0" style={{ background: p.color }} /><span className="text-xs truncate flex-1" style={{ color: '#7c85a2' }}>{p.name}</span><div className="w-24 rounded-full h-1.5" style={{ background: 'rgba(255,255,255,0.06)' }}><div className="h-full rounded-full" style={{ width: p.health + '%', background: p.health >= 80 ? '#3dd68c' : p.health >= 60 ? '#e5a435' : '#f75f6b' }} /></div><span className="text-xs w-8 text-right font-medium" style={{ color: '#d9dff0' }}>{p.health}%</span></div>))}</div>
        </ChartCard>
      </div>

      <ChartCard title="Recent Critical Bugs">
        <div className="space-y-0">{bugs.filter(b => b.priority === 'critical' || b.priority === 'high').slice(0, 4).map((bug, i) => (
          <div key={bug.id} className="flex items-center gap-3 py-2 cursor-pointer" style={{ borderBottom: i < 3 ? '1px solid rgba(255,255,255,0.04)' : 'none' }} onClick={() => navigate('/defects/' + bug.id.replace('BUG-', ''))}>
            <span className="font-mono text-xs shrink-0" style={{ color: '#484f6b', fontFamily: 'JetBrains Mono, monospace' }}>{bug.id}</span>
            <StatusDot status={bug.status} />
            <span className="text-xs flex-1 truncate" style={{ color: '#d9dff0' }}>{bug.title}</span>
            <PriorityBadge priority={bug.priority} />
            <span className="text-xs shrink-0" style={{ color: '#484f6b' }}>{bug.projectName.split(' ')[0]}</span>
          </div>
        ))}</div>
      </ChartCard>
    </div>
  );
};

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (<div className="rounded-lg p-4" style={{ background: '#141826', border: '1px solid rgba(255,255,255,0.06)' }}><div className="flex items-center justify-between mb-4"><span className="text-sm font-medium" style={{ color: '#d9dff0' }}>{title}</span><button style={{ color: '#484f6b' }} className="hover:opacity-70"><MoreHorizontal size={14} /></button></div>{children}</div>);
}

export function StatusDot({ status }: { status: string }) {
  const cfg: Record<string, string> = { 'open': '#5c6ef8', 'in-progress': '#e5a435', 'under-review': '#9b7cf4', 'resolved': '#3dd68c', 'closed': '#484f6b', 'reopened': '#f75f6b' };
  return <div className="w-2 h-2 rounded-full shrink-0" style={{ background: cfg[status] || '#484f6b' }} />;
}

export function PriorityBadge({ priority }: { priority: string }) {
  const cfg: Record<string, { bg: string; color: string }> = { critical: { bg: 'rgba(247,95,107,0.15)', color: '#f75f6b' }, high: { bg: 'rgba(240,152,88,0.15)', color: '#f09858' }, medium: { bg: 'rgba(229,164,53,0.15)', color: '#e5a435' }, low: { bg: 'rgba(61,214,140,0.15)', color: '#3dd68c' } };
  const c = cfg[priority] || { bg: 'rgba(255,255,255,0.06)', color: '#7c85a2' };
  return <span className="px-1.5 py-0.5 rounded text-xs font-medium capitalize shrink-0" style={{ background: c.bg, color: c.color }}>{priority}</span>;
}

export function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, { bg: string; color: string; label: string }> = { 'open': { bg: 'rgba(92,110,248,0.15)', color: '#5c6ef8', label: 'Open' }, 'in-progress': { bg: 'rgba(229,164,53,0.15)', color: '#e5a435', label: 'In Progress' }, 'under-review': { bg: 'rgba(155,124,244,0.15)', color: '#9b7cf4', label: 'Under Review' }, 'resolved': { bg: 'rgba(61,214,140,0.15)', color: '#3dd68c', label: 'Resolved' }, 'closed': { bg: 'rgba(72,79,107,0.2)', color: '#7c85a2', label: 'Closed' }, 'reopened': { bg: 'rgba(247,95,107,0.15)', color: '#f75f6b', label: 'Reopened' } };
  const c = cfg[status] || { bg: 'rgba(255,255,255,0.06)', color: '#7c85a2', label: status };
  return <span className="px-1.5 py-0.5 rounded text-xs font-medium shrink-0 whitespace-nowrap" style={{ background: c.bg, color: c.color }}>{c.label}</span>;
}

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import { bugsByMonth } from '../data/mockData';

const resolutionTime = [
  { project: 'E-Commerce', avg: 3.2 },
  { project: 'Mobile Banking', avg: 2.1 },
  { project: 'Customer Portal', avg: 1.8 },
  { project: 'HR System', avg: 4.5 },
];

const severityDist = [
  { name: 'Blocker', value: 4, color: '#f75f6b' },
  { name: 'Severe', value: 9, color: '#f09858' },
  { name: 'Major', value: 21, color: '#e5a435' },
  { name: 'Minor', value: 34, color: '#3dd68c' },
];

const teamWorkload = [
  { name: 'Sarah C.', bugs: 8, role: 'tester' },
  { name: 'John P.', bugs: 5, role: 'developer' },
  { name: 'David K.', bugs: 7, role: 'developer' },
  { name: 'Priya N.', bugs: 6, role: 'tester' },
  { name: 'Marcus L.', bugs: 4, role: 'developer' },
  { name: 'Nadia T.', bugs: 9, role: 'tester' },
];

const reopened = [
  { month: 'Apr', count: 2 },
  { month: 'May', count: 1 },
  { month: 'Jun', count: 4 },
  { month: 'Jul', count: 2 },
  { month: 'Aug', count: 3 },
];

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

export const ReportsPage = () => (<ReportsPageInner />);
function ReportsPageInner() {
  return (
    <div className="flex-1 overflow-y-auto" style={{ background: '#0b0e18' }}>
      <div style={{ width: '100%' }}>
        <div className="mb-6">
          <h1 className="text-xl font-bold mb-1" style={{ color: '#e8eaf0' }}>Reports & Analytics</h1>
          <p className="text-sm" style={{ color: '#484f6b' }}>Stargaze Inc · Last 6 months</p>
        </div>

        {/* Summary row */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Avg Resolution Time', value: '2.9d', sub: '-0.4d vs last month', positive: true },
            { label: 'Bug Reopen Rate', value: '8.3%', sub: '+1.2% vs last month', positive: false },
            { label: 'Critical Fix Rate', value: '94%', sub: '+3% vs last month', positive: true },
            { label: 'Overdue Bugs', value: '3', sub: 'Down from 7 last month', positive: true },
          ].map((s, i) => (
            <div key={i} className="rounded-lg p-4" style={{ background: '#141826', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="text-xs mb-2" style={{ color: '#7c85a2' }}>{s.label}</div>
              <div className="text-2xl font-bold mb-1" style={{ color: '#e8eaf0' }}>{s.value}</div>
              <div className="text-xs" style={{ color: s.positive ? '#3dd68c' : '#f75f6b' }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Charts grid */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* Created vs resolved */}
          <ReportCard title="Bug Trends - Created vs Resolved">
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={bugsByMonth} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="created" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f75f6b" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#f75f6b" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="resolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3dd68c" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#3dd68c" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: '#484f6b', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#484f6b', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="created" name="Created" stroke="#f75f6b" strokeWidth={2} fill="url(#created)" dot={false} />
                <Area type="monotone" dataKey="resolved" name="Resolved" stroke="#3dd68c" strokeWidth={2} fill="url(#resolved)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </ReportCard>

          {/* Severity distribution */}
          <ReportCard title="Bugs by Severity">
            <div className="flex items-center gap-6">
              <ResponsiveContainer width={140} height={140}>
                <PieChart>
                  <Pie data={severityDist} cx="50%" cy="50%" innerRadius={40} outerRadius={64} dataKey="value" paddingAngle={2}>
                    {severityDist.map((d, i) => <Cell key={i} fill={d.color} stroke="none" />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 flex-1">
                {severityDist.map(d => (
                  <div key={d.name} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: d.color }} />
                    <span className="text-xs flex-1" style={{ color: '#7c85a2' }}>{d.name}</span>
                    <span className="text-xs font-semibold" style={{ color: '#d9dff0' }}>{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </ReportCard>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* Resolution time by project */}
          <ReportCard title="Avg Resolution Time by Project (days)">
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={resolutionTime} layout="vertical" margin={{ top: 0, right: 16, bottom: 0, left: 0 }} barSize={16}>
                <CartesianGrid stroke="rgba(255,255,255,0.04)" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#484f6b', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="project" width={110} tick={{ fill: '#7c85a2', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="avg" name="Days" fill="#5c6ef8" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ReportCard>

          {/* Team workload */}
          <ReportCard title="Team Workload - Active Bugs">
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={teamWorkload} layout="vertical" margin={{ top: 0, right: 16, bottom: 0, left: 0 }} barSize={16}>
                <CartesianGrid stroke="rgba(255,255,255,0.04)" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#484f6b', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" width={70} tick={{ fill: '#7c85a2', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="bugs" name="Active Bugs" radius={[0, 4, 4, 0]}
                  fill="#3dd68c"
                />
              </BarChart>
            </ResponsiveContainer>
          </ReportCard>
        </div>

        {/* Reopened bugs trend */}
        <ReportCard title="Reopened Bugs Trend">
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={reopened} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#484f6b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#484f6b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="count" name="Reopened" stroke="#f09858" strokeWidth={2} dot={{ fill: '#f09858', r: 3, strokeWidth: 0 }} activeDot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </ReportCard>
      </div>
    </div>
  );
}

function ReportCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg p-4" style={{ background: '#141826', border: '1px solid rgba(255,255,255,0.06)' }}>
      <h3 className="text-sm font-medium mb-4" style={{ color: '#d9dff0' }}>{title}</h3>
      {children}
    </div>
  );
}

import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { Download, FileText } from 'lucide-react';
import { exportSummaryReportPDF } from '../lib/pdfExport';

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
  const { profile } = useAuth();
  const [bugs, setBugs] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.company_id) return;

    const fetchData = async () => {
      setLoading(true);

      // Fetch all bugs
      const { data: bugData } = await supabase
        .from('bugs')
        .select('*, projects(name), profiles!bugs_assignee_id_fkey(name)')
        .order('created_at', { ascending: false });

      // Fetch all profiles for team workload
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, name, role')
        .eq('company_id', profile.company_id);

      setBugs(bugData || []);
      setProfiles(profileData || []);
      setLoading(false);
    };

    fetchData();
  }, [profile?.company_id]);

  // Compute bugs by month (last 6 months)
  const getBugsByMonth = () => {
    const months: Record<string, { created: number; resolved: number }> = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleString('en-US', { month: 'short' });
      months[key] = { created: 0, resolved: 0 };
    }

    bugs.forEach(bug => {
      const created = new Date(bug.created_at);
      const key = created.toLocaleString('en-US', { month: 'short' });
      if (months[key]) months[key].created++;

      if (bug.status === 'resolved' || bug.status === 'closed') {
        if (bug.updated_at) {
          const resolved = new Date(bug.updated_at);
          const rKey = resolved.toLocaleString('en-US', { month: 'short' });
          if (months[rKey]) months[rKey].resolved++;
        }
      }
    });

    return Object.entries(months).map(([month, data]) => ({ month, ...data }));
  };

  // Severity distribution
  const getSeverityDist = () => {
    const counts: Record<string, number> = { blocker: 0, severe: 0, high: 0, medium: 0, low: 0 };
    bugs.forEach(bug => {
      const sev = bug.severity || 'medium';
      if (sev === 'blocker') counts.blocker++;
      else if (sev === 'severe') counts.severe++;
      else if (sev === 'high') counts.high++;
      else if (sev === 'medium') counts.medium++;
      else counts.low++;
    });

    return [
      { name: 'Blocker', value: counts.blocker, color: '#f75f6b' },
      { name: 'Severe', value: counts.severe, color: '#f09858' },
      { name: 'High', value: counts.high, color: '#e5a435' },
      { name: 'Medium', value: counts.medium, color: '#FB923C' },
      { name: 'Low', value: counts.low, color: '#3dd68c' },
    ].filter(d => d.value > 0);
  };

  // Resolution time by project
  const getResolutionTimeByProject = () => {
    const projectTimes: Record<string, { total: number; count: number }> = {};
    bugs.forEach(bug => {
      if ((bug.status === 'resolved' || bug.status === 'closed') && bug.updated_at) {
        const projectName = bug.projects?.name || 'Unknown';
        const created = new Date(bug.created_at).getTime();
        const resolved = new Date(bug.updated_at).getTime();
        const days = (resolved - created) / (1000 * 60 * 60 * 24);
        if (!projectTimes[projectName]) projectTimes[projectName] = { total: 0, count: 0 };
        projectTimes[projectName].total += days;
        projectTimes[projectName].count++;
      }
    });

    return Object.entries(projectTimes)
      .map(([project, data]) => ({
        project,
        avg: data.count > 0 ? Math.round((data.total / data.count) * 10) / 10 : 0,
      }))
      .sort((a, b) => b.avg - a.avg);
  };

  // Team workload
  const getTeamWorkload = () => {
    const workload: Record<string, { name: string; bugs: number; role: string }> = {};
    bugs.forEach(bug => {
      if (bug.status !== 'resolved' && bug.status !== 'closed' && bug.assignee_id) {
        const assignee = bug.profiles?.name || 'Unknown';
        if (!workload[bug.assignee_id]) {
          const profile = profiles.find(p => p.id === bug.assignee_id);
          workload[bug.assignee_id] = {
            name: assignee.split(' ')[0],
            bugs: 0,
            role: profile?.role || 'developer',
          };
        }
        workload[bug.assignee_id].bugs++;
      }
    });

    return Object.values(workload)
      .sort((a, b) => b.bugs - a.bugs)
      .slice(0, 8);
  };

  // Status distribution
  const getStatusDist = () => {
    const counts: Record<string, number> = {};
    bugs.forEach(bug => {
      const status = bug.status || 'unknown';
      counts[status] = (counts[status] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({
      name: name.replace('_', ' '),
      value,
    }));
  };

  const bugsByMonth = getBugsByMonth();
  const severityDist = getSeverityDist();
  const resolutionTime = getResolutionTimeByProject();
  const teamWorkload = getTeamWorkload();
  const statusDist = getStatusDist();

  // Summary stats
  const totalBugs = bugs.length;
  const criticalBugs = bugs.filter(b => b.priority === 'critical' || b.severity === 'blocker').length;
  const openBugs = bugs.filter(b => !['resolved', 'closed'].includes(b.status)).length;
  const resolvedBugs = bugs.filter(b => ['resolved', 'closed'].includes(b.status)).length;
  const criticalFixRate = totalBugs > 0 ? Math.round((1 - criticalBugs / totalBugs) * 100) : 100;

  const downloadCSV = () => {
    const headers = ['Title', 'Status', 'Priority', 'Severity', 'Project', 'Created', 'Resolved'];
    const rows = bugs.map(bug => [
      bug.title,
      bug.status,
      bug.priority,
      bug.severity,
      bug.projects?.name || '',
      new Date(bug.created_at).toISOString(),
      bug.status === 'resolved' || bug.status === 'closed' ? new Date(bug.updated_at).toISOString() : '',
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${v}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bug-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
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
          <p style={{ color: '#7c85a2', fontSize: 13 }}>Loading reports...</p>
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
            <h1 className="text-xl font-bold mb-1" style={{ color: '#e8eaf0' }}>Reports & Analytics</h1>
            <p className="text-sm" style={{ color: '#484f6b' }}>{totalBugs} total bugs tracked</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={downloadCSV}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
              style={{ background: 'rgba(251,146,60,0.12)', color: '#FB923C', border: '1px solid rgba(251,146,60,0.3)' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(251,146,60,0.2)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(251,146,60,0.12)')}
            >
              <Download size={13} /> Export CSV
            </button>
            <button
              onClick={() => exportSummaryReportPDF(bugs, 'All Projects')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
              style={{ background: 'rgba(61,214,140,0.12)', color: '#3dd68c', border: '1px solid rgba(61,214,140,0.3)' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(61,214,140,0.2)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(61,214,140,0.12)')}
            >
              <FileText size={13} /> Export PDF
            </button>
          </div>
        </div>

        {/* Summary row */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total Bugs', value: totalBugs.toString(), sub: 'all time', positive: true },
            { label: 'Critical Fix Rate', value: `${criticalFixRate}%`, sub: criticalFixRate >= 90 ? 'on track' : 'needs attention', positive: criticalFixRate >= 90 },
            { label: 'Open Bugs', value: openBugs.toString(), sub: openBugs === 0 ? 'all clear' : 'need attention', positive: openBugs === 0 },
            { label: 'Resolved', value: resolvedBugs.toString(), sub: `${totalBugs > 0 ? Math.round((resolvedBugs / totalBugs) * 100) : 0}% resolution rate`, positive: true },
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
            {resolutionTime.length === 0 ? (
              <div className="flex items-center justify-center py-8" style={{ color: '#484f6b' }}>
                <p className="text-xs">No resolved bugs yet</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={resolutionTime} layout="vertical" margin={{ top: 0, right: 16, bottom: 0, left: 0 }} barSize={16}>
                  <CartesianGrid stroke="rgba(255,255,255,0.04)" horizontal={false} />
                  <XAxis type="number" tick={{ fill: '#484f6b', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="project" width={110} tick={{ fill: '#7c85a2', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="avg" name="Days" fill="#FB923C" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ReportCard>

          {/* Team workload */}
          <ReportCard title="Team Workload - Active Bugs">
            {teamWorkload.length === 0 ? (
              <div className="flex items-center justify-center py-8" style={{ color: '#484f6b' }}>
                <p className="text-xs">No active assignments</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={teamWorkload} layout="vertical" margin={{ top: 0, right: 16, bottom: 0, left: 0 }} barSize={16}>
                  <CartesianGrid stroke="rgba(255,255,255,0.04)" horizontal={false} />
                  <XAxis type="number" tick={{ fill: '#484f6b', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" width={70} tick={{ fill: '#7c85a2', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="bugs" name="Active Bugs" fill="#3dd68c" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ReportCard>
        </div>

        {/* Status distribution */}
        <ReportCard title="Bug Status Distribution">
          <div className="flex items-center gap-6">
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie data={statusDist} cx="50%" cy="50%" innerRadius={50} outerRadius={70} dataKey="value" paddingAngle={2}>
                  {statusDist.map((_, i) => {
                    const colors = ['#FB923C', '#f09858', '#e5a435', '#9b7cf4', '#3dd68c', '#7c85a2'];
                    return <Cell key={i} fill={colors[i % colors.length]} stroke="none" />;
                  })}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 flex-1">
              {statusDist.map((d, i) => {
                const colors = ['#FB923C', '#f09858', '#e5a435', '#9b7cf4', '#3dd68c', '#7c85a2'];
                return (
                  <div key={d.name} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: colors[i % colors.length] }} />
                    <span className="text-xs flex-1 capitalize" style={{ color: '#7c85a2' }}>{d.name}</span>
                    <span className="text-xs font-semibold" style={{ color: '#d9dff0' }}>{d.value}</span>
                  </div>
                );
              })}
            </div>
          </div>
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

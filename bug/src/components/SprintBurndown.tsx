import React, { useMemo, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, ComposedChart, ReferenceLine, Legend } from 'recharts';

interface Bug {
  id: string;
  status: string;
  created_at: string;
  updated_at: string;
  sprint_id: string | null;
}

interface SprintBurndownProps {
  bugs: Bug[];
  startDate: string;
  endDate: string;
  totalBugs: number;
}

interface ChartDataPoint {
  date: string;
  label: string;
  remaining: number;
  ideal: number;
  completed: number;
  created: number;
  netRemaining: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-3 py-2 rounded-lg text-xs shadow-xl" style={{ background: '#1a1e2e', border: '1px solid rgba(255,255,255,0.1)', color: '#d9dff0', minWidth: 140 }}>
      <p className="mb-1.5 font-semibold text-[11px]" style={{ color: '#7c85a2' }}>{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center justify-between gap-3 py-0.5">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: p.color || p.stroke }} />
            <span style={{ color: '#a0a8c0' }}>{p.name}</span>
          </div>
          <span className="font-semibold">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

export function SprintBurndown({ bugs, startDate, endDate, totalBugs }: SprintBurndownProps) {
  const [hoveredStat, setHoveredStat] = useState<string | null>(null);

  const chartData = useMemo(() => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const totalDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));

    // Count bugs completed (resolved/closed) by day
    const completedByDay: Record<string, number> = {};
    bugs.forEach(bug => {
      if (bug.status === 'resolved' || bug.status === 'closed') {
        const resolvedDate = new Date(bug.updated_at);
        if (resolvedDate >= start && resolvedDate <= end) {
          const dayStr = resolvedDate.toISOString().split('T')[0];
          completedByDay[dayStr] = (completedByDay[dayStr] || 0) + 1;
        }
      }
    });

    // Count bugs created during the sprint by day
    const createdByDay: Record<string, number> = {};
    bugs.forEach(bug => {
      const createdDate = new Date(bug.created_at);
      if (createdDate >= start && createdDate <= end) {
        const dayStr = createdDate.toISOString().split('T')[0];
        createdByDay[dayStr] = (createdByDay[dayStr] || 0) + 1;
      }
    });

    // Build daily data points
    const data: ChartDataPoint[] = [];
    let cumulativeCompleted = 0;
    let cumulativeCreated = 0;

    for (let d = 0; d <= totalDays; d++) {
      const currentDate = new Date(start);
      currentDate.setDate(currentDate.getDate() + d);
      const dateStr = currentDate.toISOString().split('T')[0];
      const label = currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      cumulativeCompleted += completedByDay[dateStr] || 0;
      cumulativeCreated += createdByDay[dateStr] || 0;

      // Ideal burndown (linear from total to 0)
      const idealRemaining = Math.max(0, totalBugs - Math.floor((totalBugs * d) / totalDays));

      // Actual remaining = original total - completed + new bugs added
      const netRemaining = Math.max(0, totalBugs - cumulativeCompleted + cumulativeCreated);

      // Pure completed line (bugs resolved, not accounting for new ones)
      const remaining = Math.max(0, totalBugs - cumulativeCompleted);

      data.push({
        date: dateStr,
        label,
        remaining,
        ideal: idealRemaining,
        completed: cumulativeCompleted,
        created: cumulativeCreated,
        netRemaining,
      });
    }

    return data;
  }, [bugs, startDate, endDate, totalBugs]);

  // Compute stats
  const completedBugs = bugs.filter(b => b.status === 'resolved' || b.status === 'closed').length;
  const remainingBugs = totalBugs - completedBugs;
  const createdDuringSprint = bugs.filter(b => {
    const created = new Date(b.created_at);
    return created >= new Date(startDate) && created <= new Date(endDate);
  }).length;
  const progress = totalBugs > 0 ? Math.round((completedBugs / totalBugs) * 100) : 0;

  const start = new Date(startDate);
  const end = new Date(endDate);
  const now = new Date();
  const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const daysPassed = Math.min(totalDays, Math.max(0, Math.ceil((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))));
  const daysRemaining = Math.max(0, totalDays - daysPassed);

  // Velocity: bugs completed per day
  const velocity = daysPassed > 0 ? (completedBugs / daysPassed).toFixed(1) : '0.0';
  // Burn rate: remaining / days left
  const burnRate = daysRemaining > 0 ? (remainingBugs / daysRemaining).toFixed(1) : '0.0';
  // On track: is the team completing fast enough?
  const onTrack = daysRemaining > 0 ? completedBugs >= (totalBugs * (daysPassed / totalDays)) : progress >= 100;
  // Scope change
  const scopeChange = totalBugs > 0 ? Math.round((createdDuringSprint / totalBugs) * 100) : 0;

  if (totalBugs === 0) {
    return (
      <div className="flex items-center justify-center py-8" style={{ color: '#484f6b' }}>
        <p className="text-xs">No bugs in this sprint</p>
      </div>
    );
  }

  const stats = [
    { label: 'Total', value: totalBugs, color: '#FB923C', key: 'total' },
    { label: 'Completed', value: completedBugs, color: '#3dd68c', key: 'completed' },
    { label: 'Remaining', value: remainingBugs, color: remainingBugs > 0 ? '#f09858' : '#3dd68c', key: 'remaining' },
    { label: 'Added', value: createdDuringSprint, color: createdDuringSprint > 0 ? '#f75f6b' : '#7c85a2', key: 'created' },
    { label: 'Days Left', value: daysRemaining, color: daysRemaining <= 2 ? '#f75f6b' : '#FB923C', key: 'days' },
    { label: 'Velocity', value: `${velocity}/d`, color: '#e5a435', key: 'velocity' },
  ];

  return (
    <div>
      {/* Summary stats */}
      <div className="grid grid-cols-6 gap-2 mb-4">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="rounded-lg p-2.5 cursor-pointer transition-all"
            style={{
              background: hoveredStat === stat.key ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)',
              border: `1px solid ${hoveredStat === stat.key ? 'rgba(255,255,255,0.1)' : 'transparent'}`,
            }}
            onMouseEnter={() => setHoveredStat(stat.key)}
            onMouseLeave={() => setHoveredStat(null)}
          >
            <p className="text-[10px] mb-0.5" style={{ color: '#484f6b' }}>{stat.label}</p>
            <p className="text-sm font-bold" style={{ color: stat.color }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Health indicators */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: onTrack ? 'rgba(61,214,140,0.1)' : 'rgba(247,95,107,0.1)' }}>
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: onTrack ? '#3dd68c' : '#f75f6b' }} />
          <span className="text-[10px] font-medium" style={{ color: onTrack ? '#3dd68c' : '#f75f6b' }}>
            {onTrack ? 'On track' : 'Behind schedule'}
          </span>
        </div>
        {createdDuringSprint > 0 && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: 'rgba(247,95,107,0.1)' }}>
            <span className="text-[10px] font-medium" style={{ color: '#f75f6b' }}>
              Scope +{scopeChange}%
            </span>
          </div>
        )}
        {daysRemaining <= 2 && daysRemaining > 0 && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: 'rgba(229,164,53,0.1)' }}>
            <span className="text-[10px] font-medium" style={{ color: '#e5a435' }}>
              {daysRemaining}d remaining
            </span>
          </div>
        )}
      </div>

      {/* Chart */}
      <div style={{ height: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
            <defs>
              <linearGradient id="sprintRemainingGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f09858" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#f09858" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="sprintNetRemainingGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f75f6b" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#f75f6b" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="sprintCompletedGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3dd68c" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#3dd68c" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: '#484f6b', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fill: '#484f6b', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />

            {/* Ideal burndown line */}
            <Line
              type="monotone"
              dataKey="ideal"
              name="Ideal"
              stroke="rgba(255,255,255,0.15)"
              strokeWidth={1}
              strokeDasharray="5 5"
              dot={false}
            />

            {/* Net remaining (accounting for scope changes) */}
            <Area
              type="monotone"
              dataKey="netRemaining"
              name="Net Remaining"
              stroke="#f75f6b"
              strokeWidth={1.5}
              fill="url(#sprintNetRemainingGrad)"
              dot={false}
              strokeDasharray="3 3"
            />

            {/* Remaining bugs area (without new bugs) */}
            <Area
              type="monotone"
              dataKey="remaining"
              name="Remaining"
              stroke="#f09858"
              strokeWidth={2}
              fill="url(#sprintRemainingGrad)"
              dot={false}
            />

            {/* Completed line */}
            <Line
              type="monotone"
              dataKey="completed"
              name="Completed"
              stroke="#3dd68c"
              strokeWidth={2}
              dot={{ fill: '#3dd68c', r: 1.5, strokeWidth: 0 }}
              activeDot={{ r: 3, fill: '#3dd68c' }}
            />

            {/* Created line */}
            {createdDuringSprint > 0 && (
              <Line
                type="monotone"
                dataKey="created"
                name="Created"
                stroke="#8b5cf6"
                strokeWidth={1.5}
                dot={{ fill: '#8b5cf6', r: 1.5, strokeWidth: 0 }}
                strokeDasharray="4 2"
              />
            )}

            {/* Today reference line */}
            {now >= start && now <= end && (
              <ReferenceLine
                x={now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                stroke="rgba(251,146,60,0.5)"
                strokeDasharray="3 3"
                label={{ value: 'Today', fill: '#FB923C', fontSize: 10, position: 'insideTopRight' }}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-3">
        {[
          { label: 'Remaining', color: '#f09858' },
          { label: 'Completed', color: '#3dd68c' },
          { label: 'Ideal', color: 'rgba(255,255,255,0.2)', dashed: true },
          ...(createdDuringSprint > 0 ? [{ label: 'Created', color: '#8b5cf6', dashed: true }] : []),
          ...(createdDuringSprint > 0 ? [{ label: 'Net Remaining', color: '#f75f6b', dashed: true }] : []),
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div
              className="w-3 h-[2px]"
              style={{
                background: item.dashed ? 'transparent' : item.color,
                borderTop: item.dashed ? `2px dashed ${item.color}` : 'none',
              }}
            />
            <span className="text-[10px]" style={{ color: '#484f6b' }}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

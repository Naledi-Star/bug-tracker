import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, ComposedChart, ReferenceLine } from 'recharts';

interface Bug {
  id: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface BurndownChartProps {
  bugs: Bug[];
  projectCreated: string;
}

interface ChartDataPoint {
  date: string;
  label: string;
  created: number;
  resolved: number;
  remaining: number;
  ideal: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-3 py-2 rounded-lg text-xs" style={{ background: '#1a1e2e', border: '1px solid rgba(255,255,255,0.1)', color: '#d9dff0' }}>
      <p className="mb-1 font-medium" style={{ color: '#7c85a2' }}>{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color || p.fill }} />
          <span>{p.name}: <span className="font-semibold">{p.value}</span></span>
        </div>
      ))}
    </div>
  );
};

export function BurndownChart({ bugs, projectCreated }: BurndownChartProps) {
  const chartData = useMemo(() => {
    if (bugs.length === 0) return [];

    // Get date range
    const startDate = new Date(projectCreated);
    const now = new Date();
    const totalDays = Math.max(1, Math.floor((now.getTime() - startDate.getTime()) / 86400000));
    
    // Group bugs by day
    const createdByDay: Record<string, number> = {};
    const resolvedByDay: Record<string, number> = {};

    bugs.forEach(bug => {
      const createdDay = new Date(bug.created_at).toISOString().split('T')[0];
      createdByDay[createdDay] = (createdByDay[createdDay] || 0) + 1;

      if (bug.status === 'resolved' || bug.status === 'closed') {
        const resolvedDay = new Date(bug.updated_at).toISOString().split('T')[0];
        resolvedByDay[resolvedDay] = (resolvedByDay[resolvedDay] || 0) + 1;
      }
    });

    // Build daily data points
    const data: ChartDataPoint[] = [];
    let cumulativeCreated = 0;
    let cumulativeResolved = 0;

    // Sample data points (max 30 points for readability)
    const step = Math.max(1, Math.floor(totalDays / 30));
    
    for (let d = 0; d <= totalDays; d += step) {
      const currentDate = new Date(startDate);
      currentDate.setDate(currentDate.getDate() + d);
      const dateStr = currentDate.toISOString().split('T')[0];
      const label = currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      // Count bugs created and resolved up to this day
      let dayCreated = 0;
      let dayResolved = 0;
      
      for (let dd = 0; dd <= d; dd++) {
        const checkDate = new Date(startDate);
        checkDate.setDate(checkDate.getDate() + dd);
        const checkStr = checkDate.toISOString().split('T')[0];
        dayCreated += createdByDay[checkStr] || 0;
        dayResolved += resolvedByDay[checkStr] || 0;
      }

      cumulativeCreated = dayCreated;
      cumulativeResolved = dayResolved;

      // Ideal burndown line (linear from total created to 0)
      const idealRemaining = Math.max(0, cumulativeCreated - Math.floor((cumulativeCreated * d) / totalDays));

      data.push({
        date: dateStr,
        label,
        created: cumulativeCreated,
        resolved: cumulativeResolved,
        remaining: cumulativeCreated - cumulativeResolved,
        ideal: idealRemaining,
      });
    }

    // Add today as the final point
    const todayStr = now.toISOString().split('T')[0];
    const todayLabel = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    if (data.length === 0 || data[data.length - 1].date !== todayStr) {
      data.push({
        date: todayStr,
        label: todayLabel,
        created: cumulativeCreated,
        resolved: cumulativeResolved,
        remaining: cumulativeCreated - cumulativeResolved,
        ideal: 0,
      });
    }

    return data;
  }, [bugs, projectCreated]);

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center py-8" style={{ color: '#484f6b' }}>
        <p className="text-xs">No data to display</p>
      </div>
    );
  }

  const totalCreated = bugs.length;
  const totalResolved = bugs.filter(b => ['resolved', 'closed'].includes(b.status)).length;
  const totalOpen = totalCreated - totalResolved;
  const resolutionRate = totalCreated > 0 ? Math.round((totalResolved / totalCreated) * 100) : 0;

  return (
    <div>
      {/* Summary stats */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        {[
          { label: 'Total Created', value: totalCreated, color: '#FB923C' },
          { label: 'Resolved', value: totalResolved, color: '#3dd68c' },
          { label: 'Remaining', value: totalOpen, color: '#f09858' },
          { label: 'Resolution Rate', value: `${resolutionRate}%`, color: resolutionRate >= 80 ? '#3dd68c' : '#f09858' },
        ].map((stat, i) => (
          <div key={i} className="rounded-lg p-3" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <p className="text-xs mb-1" style={{ color: '#484f6b' }}>{stat.label}</p>
            <p className="text-lg font-bold" style={{ color: stat.color }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div style={{ height: 240 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
            <defs>
              <linearGradient id="createdGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FB923C" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#FB923C" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="resolvedGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3dd68c" stopOpacity={0.3} />
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
            
            {/* Created bugs area */}
            <Area 
              type="monotone" 
              dataKey="created" 
              name="Created" 
              stroke="#FB923C" 
              strokeWidth={2} 
              fill="url(#createdGradient)" 
              dot={false}
            />
            
            {/* Resolved bugs area */}
            <Area 
              type="monotone" 
              dataKey="resolved" 
              name="Resolved" 
              stroke="#3dd68c" 
              strokeWidth={2} 
              fill="url(#resolvedGradient)" 
              dot={false}
            />
            
            {/* Remaining line */}
            <Line 
              type="monotone" 
              dataKey="remaining" 
              name="Remaining" 
              stroke="#f09858" 
              strokeWidth={2} 
              dot={{ fill: '#f09858', r: 3, strokeWidth: 0 }}
              activeDot={{ r: 4 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-3">
        {[
          { label: 'Created', color: '#FB923C' },
          { label: 'Resolved', color: '#3dd68c' },
          { label: 'Remaining', color: '#f09858' },
          { label: 'Ideal', color: 'rgba(255,255,255,0.3)', dashed: true },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div 
              className="w-3 h-0.5" 
              style={{ 
                background: item.color,
                borderTop: item.dashed ? `1px dashed ${item.color}` : 'none',
              }} 
            />
            <span className="text-xs" style={{ color: '#484f6b' }}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

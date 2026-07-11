'use client';

import { useMemo } from 'react';
import { Card, CardBody, CardHeader, Chip } from '@heroui/react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import {
  Inbox, Target, CalendarCheck, BellDot, TrendingUp,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-xl p-3 text-sm shadow-xl border"
      style={{
        background: 'var(--bg-surface)',
        borderColor: 'var(--border)',
      }}
    >
      <p className="font-semibold mb-2 text-xs" style={{ color: 'var(--text-muted)' }}>{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2 py-0.5">
          <span className="w-2 h-2 rounded-full flex-none" style={{ background: p.color }} />
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{p.name}:</span>
          <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
};

const METRICS = [
  {
    key: 'total',
    label: 'Total Scanned',
    sub: 'Applications',
    icon: Inbox,
    accent: '#6366f1',
    bg: 'rgba(99,102,241,0.08)',
    border: 'rgba(99,102,241,0.18)',
  },
  {
    key: 'shortlistRate',
    label: 'Shortlisted Rate',
    sub: '',
    icon: Target,
    accent: '#10b981',
    bg: 'rgba(16,185,129,0.08)',
    border: 'rgba(16,185,129,0.18)',
    suffix: '%',
  },
  {
    key: 'interviews',
    label: 'Interviews',
    sub: 'Scheduled',
    icon: CalendarCheck,
    accent: '#3b82f6',
    bg: 'rgba(59,130,246,0.08)',
    border: 'rgba(59,130,246,0.18)',
  },
  {
    key: 'missed',
    label: 'Missed Responses',
    sub: 'Action Required',
    icon: BellDot,
    accent: '#ef4444',
    bg: 'rgba(239,68,68,0.08)',
    border: 'rgba(239,68,68,0.18)',
    danger: true,
  },
];

export default function AnalyticsDashboard() {
  const { applications, mode } = useApp();

  const stats = useMemo(() => {
    const total = applications.length;
    const shortlisted = applications.filter(
      (a) => a.status === 'shortlisted' || a.status === 'interview_scheduled'
    ).length;
    const missed = applications.filter(
      (a) => a.requiresAction && a.status === 'interview_scheduled'
    ).length;
    const interviews = applications.filter((a) => a.status === 'interview_scheduled').length;
    return {
      total,
      shortlistRate: total > 0 ? Math.round((shortlisted / total) * 100) : 0,
      shortlisted,
      missed,
      interviews,
    };
  }, [applications]);

  // Dynamically compute chart data from actual active applications
  const dynamicVelocityData = useMemo(() => {
    const today = new Date();

    // Initialize 6 weeks
    const weeks = [
      { period: 'Week 1', interviews: 0, shortlisted: 0, rejections: 0 },
      { period: 'Week 2', interviews: 0, shortlisted: 0, rejections: 0 },
      { period: 'Week 3', interviews: 0, shortlisted: 0, rejections: 0 },
      { period: 'Week 4', interviews: 0, shortlisted: 0, rejections: 0 },
      { period: 'Week 5', interviews: 0, shortlisted: 0, rejections: 0 },
      { period: 'Week 6', interviews: 0, shortlisted: 0, rejections: 0 },
    ];

    applications.forEach((app) => {
      const appDate = new Date(app.appliedDate);
      if (isNaN(appDate.getTime())) return;

      const diffMs = today.getTime() - appDate.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      // Classify into week categories (relative to current date)
      let weekIndex = 5; // Default to Week 6 (current week)
      if (diffDays >= 35) weekIndex = 0;      // Week 1
      else if (diffDays >= 28) weekIndex = 1; // Week 2
      else if (diffDays >= 21) weekIndex = 2; // Week 3
      else if (diffDays >= 14) weekIndex = 3; // Week 4
      else if (diffDays >= 7) weekIndex = 4;  // Week 5

      if (app.status === 'interview_scheduled') {
        weeks[weekIndex].interviews += 1;
      } else if (app.status === 'shortlisted') {
        weeks[weekIndex].shortlisted += 1;
      } else if (app.status === 'rejected') {
        weeks[weekIndex].rejections += 1;
      }
    });

    return weeks;
  }, [applications]);

  if (mode === 'idle') return null;

  return (
    <div className="space-y-5">
      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {METRICS.map(({ key, label, sub, icon: Icon, accent, bg, border, suffix, danger }) => {
          const value = stats[key as keyof typeof stats];
          return (
            <Card
              key={key}
              shadow="none"
              className="metric-card rounded-2xl border overflow-hidden"
              style={{ background: bg, borderColor: border }}
            >
              <CardBody className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wide mb-2"
                      style={{ color: 'var(--text-muted)' }}>
                      {label}
                    </p>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl font-black" style={{ color: 'var(--text-primary)' }}>
                        {value}{suffix}
                      </span>
                      {danger && (value as number) > 0 && (
                        <Chip size="sm" color="danger" variant="flat"
                          className="danger-flash text-xs font-bold px-1">
                          URGENT
                        </Chip>
                      )}
                    </div>
                    {sub && (
                      <p className="text-xs mt-1 font-medium" style={{ color: accent }}>{sub}</p>
                    )}
                    {key === 'shortlistRate' && (
                      <p className="text-xs mt-1 font-medium" style={{ color: accent }}>
                        {stats.shortlisted} of {stats.total}
                      </p>
                    )}
                  </div>
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-none"
                    style={{ background: `${accent}22` }}
                  >
                    <Icon size={18} style={{ color: accent }} strokeWidth={2} />
                  </div>
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>

      {/* Velocity Chart */}
      <Card
        shadow="none"
        className="rounded-2xl border overflow-hidden"
        style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}
      >
        <CardHeader className="px-6 pt-5 pb-0 flex-col items-start gap-0.5">
          <div className="flex items-center gap-3 w-full">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-none"
              style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}
            >
              <TrendingUp size={16} color="#fff" strokeWidth={2} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                Application Pipeline Velocity
              </h3>
              <p className="text-xs" style={{ color: 'var(--text-subtle)' }}>
                Real-time chart mapped dynamically from current board data
              </p>
            </div>
            <Chip size="sm" variant="flat" color="secondary" className="text-xs">Dynamic</Chip>
          </div>
        </CardHeader>
        <CardBody className="px-4 pb-4 pt-4">
          <ResponsiveContainer width="100%" height={210}>
            <AreaChart data={dynamicVelocityData} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
              <defs>
                {[
                  { id: 'itvw', color: '#6366f1' },
                  { id: 'shtw', color: '#10b981' },
                  { id: 'rejw', color: '#ef4444' },
                ].map(({ id, color }) => (
                  <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={color} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="period" tick={{ fill: 'var(--text-subtle)', fontSize: 10 }}
                axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-subtle)', fontSize: 10 }}
                axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} iconType="circle" iconSize={7} />
              <Area type="monotone" dataKey="interviews" name="Interviews"
                stroke="#6366f1" strokeWidth={2} fill="url(#itvw)"
                dot={{ fill: '#6366f1', r: 2.5, strokeWidth: 0 }}
                activeDot={{ r: 4.5, fill: '#6366f1', strokeWidth: 1.5, stroke: '#fff' }} />
              <Area type="monotone" dataKey="shortlisted" name="Shortlisted"
                stroke="#10b981" strokeWidth={2} fill="url(#shtw)"
                dot={{ fill: '#10b981', r: 2.5, strokeWidth: 0 }}
                activeDot={{ r: 4.5, fill: '#10b981', strokeWidth: 1.5, stroke: '#fff' }} />
              <Area type="monotone" dataKey="rejections" name="Rejections"
                stroke="#ef4444" strokeWidth={2} fill="url(#rejw)"
                dot={{ fill: '#ef4444', r: 2.5, strokeWidth: 0 }}
                activeDot={{ r: 4.5, fill: '#ef4444', strokeWidth: 1.5, stroke: '#fff' }} />
            </AreaChart>
          </ResponsiveContainer>
        </CardBody>
      </Card>
    </div>
  );
}

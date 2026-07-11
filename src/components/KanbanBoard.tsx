'use client';

import { useEffect, useState } from 'react';
import { Card, CardBody, Chip, Button } from '@heroui/react';
import {
  MapPin, DollarSign, BriefcaseBusiness,
  CalendarDays, Tag, Zap, Mail, Link2,
  Send, Search, Star, XCircle, LucideIcon
} from 'lucide-react';
import { JobApplication, ApplicationStatus } from '@/types';
import { useApp } from '@/context/AppContext';

// ── Column config with Lucide Icons (Zero Emojis) ─────────────────────────
const COL_CFG: Record<ApplicationStatus, {
  label: string; icon: LucideIcon; accent: string; bg: string; border: string;
}> = {
  applied: { label: 'Applied', icon: Send, accent: '#6366f1', bg: 'rgba(99,102,241,0.06)', border: 'rgba(99,102,241,0.20)' },
  under_review: { label: 'Under Review', icon: Search, accent: '#f59e0b', bg: 'rgba(245,158,11,0.06)', border: 'rgba(245,158,11,0.20)' },
  shortlisted: { label: 'Shortlisted', icon: Star, accent: '#10b981', bg: 'rgba(16,185,129,0.06)', border: 'rgba(16,185,129,0.20)' },
  interview_scheduled: { label: 'Interview Scheduled', icon: CalendarDays, accent: '#3b82f6', bg: 'rgba(59,130,246,0.06)', border: 'rgba(59,130,246,0.20)' },
  rejected: { label: 'Rejected', icon: XCircle, accent: '#ef4444', bg: 'rgba(239,68,68,0.06)', border: 'rgba(239,68,68,0.20)' },
};

const COLUMN_ORDER: ApplicationStatus[] = [
  'applied', 'under_review', 'shortlisted', 'interview_scheduled', 'rejected',
];

// ── JobCard ───────────────────────────────────────────────────────────────
function JobCard({ app, isNew }: { app: JobApplication; isNew: boolean }) {
  const { clearNewCard } = useApp();
  const [animated, setAnimated] = useState(isNew);
  const isAction = app.status === 'interview_scheduled' && app.requiresAction;

  useEffect(() => {
    if (!isNew) return;
    const t = setTimeout(() => { setAnimated(false); clearNewCard(); }, 800);
    return () => clearTimeout(t);
  }, [isNew, clearNewCard]);

  const initial = (app.company || '?').charAt(0).toUpperCase();

  return (
    <Card
      shadow="none"
      className={`job-card rounded-xl border w-full ${animated ? 'card-slide-in' : ''} ${isAction ? 'card-glow' : ''}`}
      style={{
        background: 'var(--bg-surface)',
        borderColor: isAction ? 'rgba(99,102,241,0.45)' : 'var(--border)',
        overflow: 'visible', // Avoid inner scroll
      }}
    >
      <CardBody className="p-4 gap-3.5" style={{ overflow: 'visible' }}>
        {/* Header row */}
        <div className="flex items-start gap-3">
          {/* Logo / Initial */}
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-base font-black flex-none"
            style={{
              background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
              color: '#fff',
              fontSize: '16px',
            }}
          >
            {initial}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm leading-tight truncate" style={{ color: 'var(--text-primary)' }}>
              {app.company}
            </p>
            <p className="text-xs leading-tight mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
              {app.role}
            </p>
          </div>
          <span className="text-xs px-1.5 py-0.5 rounded-md font-medium flex-none"
            style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
            {app.source}
          </span>
        </div>

        {/* Action Required Banner */}
        {isAction && (
          <div
            className="flex items-center gap-2 rounded-lg px-3 py-2 danger-flash"
            style={{
              background: 'rgba(99,102,241,0.10)',
              border: '1px solid rgba(99,102,241,0.35)',
            }}
          >
            <Zap size={13} style={{ color: '#6366f1', flexShrink: 0 }} strokeWidth={2.5} />
            <span className="text-xs font-semibold" style={{ color: '#6366f1' }}>
              Action Required: Scheduling Link Detected
            </span>
          </div>
        )}

        {/* Detail rows */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <MapPin size={12} style={{ color: 'var(--text-subtle)', flexShrink: 0 }} strokeWidth={2} />
            <span className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{app.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign size={12} style={{ color: 'var(--text-subtle)', flexShrink: 0 }} strokeWidth={2} />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{app.salary}</span>
          </div>
          <div className="flex items-center gap-2">
            <CalendarDays size={12} style={{ color: 'var(--text-subtle)', flexShrink: 0 }} strokeWidth={2} />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Applied: {app.appliedDate}
              {app.lastActivity !== app.appliedDate && (
                <> · Updated: {app.lastActivity}</>
              )}
            </span>
          </div>
        </div>

        {/* Tags */}
        {app.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 items-center">
            <Tag size={11} style={{ color: 'var(--text-subtle)', flexShrink: 0 }} strokeWidth={2} />
            {app.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-0.5 rounded-md"
                style={{
                  background: 'var(--bg-elevated)',
                  color: 'var(--text-muted)',
                  border: '1px solid var(--border)',
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Scheduling link */}
        {isAction && app.schedulingLink && (
          <a
            href={app.schedulingLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-medium hover:underline break-all"
            style={{ color: '#6366f1' }}
          >
            <Link2 size={11} strokeWidth={2} />
            Open Scheduling Link
          </a>
        )}
      </CardBody>
    </Card>
  );
}

// ── KanbanColumn ──────────────────────────────────────────────────────────
function KanbanColumn({ status, apps, newCardId }: {
  status: ApplicationStatus;
  apps: JobApplication[];
  newCardId: string | null;
}) {
  const cfg = COL_CFG[status];
  const Icon = cfg.icon;

  return (
    <div
      className="flex flex-col rounded-2xl overflow-hidden border flex-none"
      style={{
        width: '300px',
        minWidth: '300px',
        maxHeight: 'calc(100vh - 320px)',
        background: cfg.bg,
        borderColor: cfg.border,
        borderTop: `3px solid ${cfg.accent}`,
      }}
    >
      {/* Column Header */}
      <div
        className="flex items-center justify-between px-4 py-3 flex-none"
        style={{ borderBottom: `1px solid ${cfg.border}` }}
      >
        <div className="flex items-center gap-2">
          <Icon size={15} style={{ color: cfg.accent }} strokeWidth={2} />
          <span className="font-semibold text-sm" style={{ color: cfg.accent }}>
            {cfg.label}
          </span>
        </div>
        <span
          className="text-xs font-bold px-2 py-0.5 rounded-full"
          style={{ background: `${cfg.accent}22`, color: cfg.accent }}
        >
          {apps.length}
        </span>
      </div>

      {/* Scrollable card list */}
      <div className="kanban-col flex flex-col gap-3 p-3">
        {apps.length === 0 ? (
          <div
            className="rounded-xl p-8 text-center"
            style={{ border: `1px dashed ${cfg.border}` }}
          >
            <BriefcaseBusiness size={20} style={{ color: cfg.accent, margin: '0 auto 8px', opacity: 0.5 }} />
            <p className="text-xs" style={{ color: 'var(--text-subtle)' }}>No applications</p>
          </div>
        ) : (
          apps.map((app) => (
            <JobCard key={app.id} app={app} isNew={newCardId === app.id} />
          ))
        )}
      </div>
    </div>
  );
}

// ── KanbanBoard ───────────────────────────────────────────────────────────
export default function KanbanBoard() {
  const { applications, mode, isNewCard, simulateNewEmail } = useApp();

  const appsByStatus = COLUMN_ORDER.reduce<Record<ApplicationStatus, JobApplication[]>>(
    (acc, s) => { acc[s] = applications.filter((a) => a.status === s); return acc; },
    {} as any
  );

  if (mode === 'idle') return null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
            Pipeline Board
            <span className="ml-2 font-normal text-sm" style={{ color: 'var(--text-subtle)' }}>
              {applications.length} applications
            </span>
          </h2>
          <p className="text-xs" style={{ color: 'var(--text-subtle)' }}>
            Real-time tracking across all stages
          </p>
        </div>

        {mode === 'preview' && (
          <Button
            id="simulate-email-btn"
            onPress={simulateNewEmail}
            size="sm"
            variant="bordered"
            startContent={<Mail size={14} strokeWidth={2} />}
            className="font-semibold"
            style={{
              borderColor: 'var(--accent)',
              color: 'var(--accent)',
            }}
          >
            Simulate New Email
          </Button>
        )}
      </div>

      {/* Columns — horizontal scroll */}
      <div className="flex gap-4 overflow-x-auto pb-4" style={{ alignItems: 'flex-start' }}>
        {COLUMN_ORDER.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            apps={appsByStatus[status]}
            newCardId={isNewCard}
          />
        ))}
      </div>
    </div>
  );
}

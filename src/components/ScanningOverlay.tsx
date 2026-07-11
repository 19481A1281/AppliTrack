'use client';

import { ScanLine, CheckCircle2, Loader2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';

const STEPS = [
  { label: 'Authenticating Gmail API', doneAfter: 0 },
  { label: 'Fetching emails in date range', doneAfter: 800 },
  { label: 'Parsing application patterns', doneAfter: 1600 },
  { label: 'Categorising by company & status', doneAfter: 2200 },
];

export default function ScanningOverlay() {
  const { mode } = useApp();
  if (mode !== 'scanning') return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(244,246,251,0.92)', backdropFilter: 'blur(14px)' }}
    >
      <div className="text-center space-y-8 px-6 max-w-sm w-full">

        {/* Animated scanner icon */}
        <div className="relative mx-auto w-24 h-24">
          <div
            className="absolute inset-0 rounded-full"
            style={{
              border: '2px solid rgba(99,102,241,0.2)',
              animation: 'spin 3s linear infinite',
            }}
          />
          <div
            className="absolute inset-3 rounded-full"
            style={{
              border: '2px solid rgba(139,92,246,0.35)',
              animation: 'spin 2s linear infinite reverse',
            }}
          />
          <div
            className="absolute inset-6 rounded-full flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg,rgba(99,102,241,0.15),rgba(139,92,246,0.15))',
              animation: 'pulse 1.5s ease-in-out infinite',
            }}
          >
            <ScanLine size={24} style={{ color: '#6366f1' }} strokeWidth={1.5} />
          </div>
        </div>

        {/* Scan beam */}
        <div
          className="relative h-1 rounded-full overflow-hidden mx-auto w-full"
          style={{ background: 'rgba(99,102,241,0.12)' }}
        >
          <div className="absolute inset-y-0 w-1/3 rounded-full scan-beam" />
        </div>

        {/* Text */}
        <div>
          <h2 className="text-xl font-black" style={{ color: 'var(--text-primary)' }}>
            Scanning Inbox…
          </h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Connecting to Gmail and processing your application emails
          </p>
        </div>

        {/* Status steps */}
        <div className="space-y-2.5 text-left">
          {STEPS.map(({ label, doneAfter }, i) => (
            <StepRow key={label} label={label} delay={doneAfter} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

function StepRow({ label, delay, index }: { label: string; delay: number; index: number }) {
  // Steps earlier in list complete first (delay = when they become done)
  // For display, first two are "done", last two are "in progress"
  const isDone = index < 2;

  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="flex-none">
        {isDone ? (
          <CheckCircle2 size={16} style={{ color: '#10b981' }} strokeWidth={2} />
        ) : (
          <Loader2 size={16} style={{ color: '#6366f1', animation: 'spin 1s linear infinite' }} strokeWidth={2} />
        )}
      </span>
      <span style={{ color: isDone ? '#10b981' : 'var(--text-muted)' }}>{label}</span>
    </div>
  );
}

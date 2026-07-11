'use client';

import { useEffect, useState } from 'react';
import { Inbox, Layers, BarChart3, Zap, Mail, ShieldAlert, Cpu, Terminal } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import ConfigPanel from '@/components/ConfigPanel';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';
import KanbanBoard from '@/components/KanbanBoard';
import ScanningOverlay from '@/components/ScanningOverlay';
import ThemeToggle from '@/components/ThemeToggle';

const FEATURES = [
  {
    icon: Mail,
    label: 'Gmail Sync',
    desc: 'OAuth2 inbox scanning',
    accent: '#bd00ff',
  },
  {
    icon: BarChart3,
    label: 'Analytics',
    desc: 'Pipeline velocity charts',
    accent: '#00f0ff',
  },
  {
    icon: Layers,
    label: 'Kanban Board',
    desc: '5-stage pipeline view',
    accent: '#6366f1',
  },
  {
    icon: Zap,
    label: 'Real-time Updates',
    desc: 'Live status changes',
    accent: '#f59e0b',
  },
];

function RadarVisualizer() {
  return (
    <div className="flex flex-col items-center justify-center p-6 relative overflow-hidden h-52 bg-black/20 dark:bg-black/40 rounded-2xl border border-[var(--border)]">
      {/* Radar rings */}
      <div className="relative w-36 h-36 rounded-full border border-indigo-500/20 flex items-center justify-center">
        {/* Pulsing rings */}
        <div className="absolute w-28 h-28 rounded-full border border-indigo-500/10" />
        <div className="absolute w-20 h-20 rounded-full border border-indigo-500/15" />
        <div className="absolute w-10 h-10 rounded-full border border-indigo-500/20" />
        
        {/* Radar pulsing ring effect */}
        <div className="absolute w-full h-full rounded-full border border-indigo-500/40 radar-ring pointer-events-none" />
        <div className="absolute w-full h-full rounded-full border border-cyan-500/30 radar-ring pointer-events-none" style={{ animationDelay: '1.5s' }} />

        {/* Sweep line */}
        <div className="absolute top-0 bottom-1/2 left-1/2 right-0 origin-bottom-left border-l border-indigo-500/30 overflow-hidden" 
          style={{
            height: '72px',
            transformOrigin: '0% 100%',
            animation: 'spin 4s linear infinite',
            background: 'linear-gradient(90deg, rgba(99,102,241,0.15) 0%, transparent 80%)'
          }}
        />

        {/* Pulse center node */}
        <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 z-10 shadow-[0_0_12px_#00f0ff]" />

        {/* Static target nodes */}
        <div className="absolute top-[25%] left-[30%] w-1.5 h-1.5 rounded-full bg-indigo-400 opacity-60 animate-ping" />
        <div className="absolute bottom-[30%] right-[25%] w-1.5 h-1.5 rounded-full bg-cyan-400 opacity-80 animate-pulse" />
      </div>
      <div className="text-[10px] font-mono-data mt-4 text-[var(--text-muted)] tracking-widest">
        SYS_RADAR: LISTENING_ON_IMAP
      </div>
    </div>
  );
}

function TerminalLogs() {
  const [logs, setLogs] = useState<string[]>([
    '[system] applitrack sync engine booting...',
  ]);
  
  useEffect(() => {
    const logBuffer = [
      '[system] applitrack sync engine booting...',
      '[security] sandbox ssl/tls context verified',
      '[imap] loading server mapping protocols (gmail, outlook, yahoo)',
      '[heuristics] loading categorizer model: 5 pipeline phases',
      '[heuristics] pre-compiled regex keyword matching rules',
      '[network] listening on secure imap port: 993',
      '[status] engine standing by. waiting for authentication...',
      '[info] zero credentials are logged or saved to database'
    ];

    let index = 1;
    const interval = setInterval(() => {
      if (index < logBuffer.length) {
        setLogs(prev => [...prev, logBuffer[index]]);
        index++;
      } else {
        // Reset and cycle
        setLogs([logBuffer[0]]);
        index = 1;
      }
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-black/90 dark:bg-black/80 rounded-2xl p-5 font-mono text-[10px] sm:text-xs text-indigo-400 dark:text-indigo-300 border border-white/5 h-52 overflow-y-auto flex flex-col justify-end">
      <div className="space-y-1 text-left w-full">
        {logs.map((log, idx) => (
          <div key={idx} className="flex gap-2">
            <span className="text-cyan-400 select-none">&gt;</span>
            <span className="break-all text-slate-300 dark:text-slate-200">{log}</span>
          </div>
        ))}
        <div className="flex gap-2">
          <span className="text-cyan-400 select-none">&gt;</span>
          <span className="w-2 h-3.5 bg-indigo-400 cursor-blink inline-block" />
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const { mode } = useApp();

  return (
    <>
      <ScanningOverlay />

      {/* Subtle tinted background gradients inspired by Etheric Glass */}
      <div
        className="fixed inset-0 -z-10 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 40% at 15% 10%, rgba(189,0,255,0.03) 0%, transparent 60%), radial-gradient(ellipse 50% 30% at 85% 90%, rgba(0,240,255,0.02) 0%, transparent 60%), var(--bg-base)',
        }}
      />

      <main className="min-h-screen pt-[72px]" style={{ background: 'var(--bg-base)' }}>
        {/* Fixed Header Bar (always visible at top of page) */}
        <div 
          className="fixed top-0 left-0 right-0 z-50 border-b glass" 
          style={{ borderColor: 'var(--border)' }}
        >
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-black text-sm flex-none"
                style={{
                  background: 'linear-gradient(135deg,#bd00ff,#00f0ff)',
                  boxShadow: '0 4px 16px rgba(189,0,255,0.25)',
                }}
              >
                AT
              </div>
              <div>
                <h1 className="gradient-text text-lg font-black tracking-tight leading-none">
                  AppliTrack
                </h1>
                <p className="font-mono-data text-[9px] mt-0.5" style={{ color: 'var(--text-subtle)' }}>
                  INBOX_PIPELINE_SCANNER
                </p>
              </div>
              
              {/* 2-line Description on the left side */}
              <div className="hidden md:block border-l border-[var(--border)] pl-4 py-0.5 max-w-[240px]">
                <p className="text-[10px] font-semibold leading-normal text-[var(--text-muted)]">
                  Scans inbox via secure IMAP to track & visualize job applications automatically.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {mode !== 'idle' && (
                <div
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-mono-data font-semibold animate-pulse-slow"
                  style={{
                    background: 'var(--accent-soft)',
                    border: '1px solid var(--accent-glow)',
                    color: 'var(--accent)',
                  }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full inline-block"
                    style={{
                      background: mode === 'live' ? '#10b981' : '#bd00ff',
                      animation: 'pulse 2s ease-in-out infinite',
                    }}
                  />
                  {mode === 'preview'
                    ? 'PREVIEW_MODE'
                    : mode === 'live'
                    ? 'LIVE_SYNC_ACTIVE'
                    : 'SCANNING_INBOX'}
                </div>
              )}
              <ThemeToggle />
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6 space-y-6">
          {/* Config Panel */}
          <ConfigPanel />

          {/* Idle welcome state */}
          {mode === 'idle' && (
            <div
              className="rounded-3xl py-12 px-6 text-center glass-panel border border-[var(--border)]"
              style={{
                boxShadow: 'var(--shadow-lg)',
              }}
            >
              <div className="max-w-4xl mx-auto space-y-8">
                <div className="space-y-3">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 flex-none"
                    style={{ background: 'var(--accent-soft)', border: '1px solid var(--accent-glow)' }}
                  >
                    <Inbox size={26} style={{ color: 'var(--accent)' }} strokeWidth={1.5} />
                  </div>
                  <h2 className="text-2xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
                    Your Job Application Command Center
                  </h2>
                  <p className="text-sm max-w-lg mx-auto leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    Connect your Gmail account using secure IMAP to automatically scan, categorize, and visualise every job application callback, interview invite, or update.
                  </p>
                </div>

                {/* Cybernetic Sync Monitor Grid (Signature Element) */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 max-w-3xl mx-auto items-stretch">
                  <div className="md:col-span-5">
                    <RadarVisualizer />
                  </div>
                  <div className="md:col-span-7">
                    <TerminalLogs />
                  </div>
                </div>

                {/* Features Display */}
                <div className="flex items-center justify-center gap-4 flex-wrap pt-2">
                  {FEATURES.map(({ icon: Icon, label, desc, accent }) => (
                    <div
                      key={label}
                      className="flex flex-col items-center gap-2 px-5 py-4 rounded-2xl glass w-[170px]"
                      style={{
                        border: '1px solid var(--border)',
                      }}
                    >
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center"
                        style={{ background: `${accent}15` }}
                      >
                        <Icon size={18} style={{ color: accent }} strokeWidth={1.8} />
                      </div>
                      <span className="font-bold text-xs" style={{ color: 'var(--text-primary)' }}>
                        {label}
                      </span>
                      <span className="text-[10px] text-center" style={{ color: 'var(--text-subtle)' }}>
                        {desc}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Gmail Setup Notice */}
                <div className="pt-2">
                  <div
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono-data text-[10px]"
                    style={{
                      background: 'var(--accent-soft)',
                      border: '1px solid var(--accent-glow)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    <Mail size={12} className="text-indigo-400" strokeWidth={2.5} />
                    <span>
                      Sync with your credentials above or click{' '}
                      <strong className="text-indigo-600 dark:text-indigo-400">Explore Preview</strong> to load simulated dashboard data.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Analytics */}
          <AnalyticsDashboard />

          {/* Kanban Board */}
          <KanbanBoard />
        </div>
      </main>
    </>
  );
}

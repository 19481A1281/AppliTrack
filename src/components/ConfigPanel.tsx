'use client';

import { useState } from 'react';
import { Card, CardBody, Input, Button, Chip, Divider, DateRangePicker } from '@heroui/react';
import { Mail, Lock, Scan, Eye, EyeOff, AlertCircle, ShieldCheck, HelpCircle } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { parseDate } from '@internationalized/date';

export default function ConfigPanel() {
  const { config, setConfig, loadPreviewMode, startLiveSync, mode, scanError } = useApp();
  const [emailError, setEmailError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleEmailChange = (value: string) => {
    setConfig({ email: value });
    setEmailError(
      value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
        ? 'Enter a valid email address'
        : ''
    );
  };

  const handleLiveSync = async () => {
    if (!config.email) { setEmailError('Email is required'); return; }
    if (emailError) return;
    if (!config.password) return;
    await startLiveSync();
  };

  const isScanning = mode === 'scanning';
  const isGmail = config.email.toLowerCase().includes('@gmail');

  const rangeValue =
    config.startDate && config.endDate
      ? { start: parseDate(config.startDate), end: parseDate(config.endDate) }
      : null;

  const handleRangeChange = (val: any) => {
    if (val?.start && val?.end) {
      setConfig({
        startDate: val.start.toString(),
        endDate: val.end.toString(),
      });
    }
  };

  return (
    <Card
      shadow="none"
      className="rounded-2xl border glass"
      style={{
        background: 'var(--bg-surface)',
        borderColor: 'var(--border)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <CardBody className="p-5 gap-5">
        {/* Top Controls Row */}
        <div className="flex flex-col lg:flex-row gap-4 items-start pb-2">
          {/* Label */}
          <div className="flex items-center gap-3 flex-none pt-2">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-none"
              style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}
            >
              <Scan size={17} color="#fff" strokeWidth={2} />
            </div>
            <div>
              <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Inbox Scanner</p>
              <p className="text-xs" style={{ color: 'var(--text-subtle)' }}>IMAP Sync Engine</p>
            </div>
          </div>

          <Divider orientation="vertical" className="hidden lg:block h-12 opacity-20 self-center" />

          {/* Email */}
          <div className="flex-1 min-w-0 w-full relative pb-4">
            <Input
              id="target-email"
              label="Your Email Address"
              placeholder="you@gmail.com"
              value={config.email}
              onValueChange={handleEmailChange}
              isInvalid={!!emailError}
              errorMessage={emailError}
              variant="bordered"
              size="sm"
              startContent={<Mail size={14} style={{ color: 'var(--accent)', flexShrink: 0 }} />}
              classNames={{
                inputWrapper: 'bg-transparent border-[var(--border)] hover:border-indigo-400 data-[focused=true]:border-indigo-500',
                input: 'text-sm',
                label: 'text-xs',
                helperWrapper: 'absolute top-full left-0 right-0 mt-0.5 h-3',
                errorMessage: 'text-[11px] leading-none text-red-500',
              }}
            />
          </div>

          {/* App Password */}
          <div className="flex-1 min-w-0 w-full relative pb-4">
            <Input
              id="app-password"
              label="App Password"
              placeholder={isGmail ? '16-character app password' : 'IMAP password'}
              type={showPassword ? 'text' : 'password'}
              value={config.password}
              onValueChange={(v) => setConfig({ password: v })}
              variant="bordered"
              size="sm"
              startContent={<Lock size={14} style={{ color: 'var(--accent)', flexShrink: 0 }} />}
              endContent={
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  style={{ color: 'var(--text-subtle)', flexShrink: 0 }}
                  tabIndex={-1}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              }
              classNames={{
                inputWrapper: 'bg-transparent border-[var(--border)] hover:border-indigo-400 data-[focused=true]:border-indigo-500',
                input: 'text-sm',
                label: 'text-xs',
              }}
            />
          </div>
        </div>

        {/* Date Picker + Buttons Row */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end w-full">
          {/* Standard HeroUI DateRangePicker - Compact (w-80) & Error-free */}
          <div className="flex-none w-full lg:w-80">
            <DateRangePicker
              label="Select Sync Range"
              value={rangeValue}
              onChange={handleRangeChange}
              variant="bordered"
              size="sm"
              className="w-full"
              classNames={{
                inputWrapper: 'bg-transparent border-[var(--border)] hover:border-indigo-400 data-[focused=true]:border-indigo-500',
                label: 'text-xs font-semibold text-[var(--text-muted)]',
              }}
            />
          </div>

          <Divider orientation="vertical" className="hidden lg:block h-12 opacity-20 self-center" />

          {/* Action Buttons pushed to the right */}
          <div className="flex gap-2.5 flex-none flex-wrap lg:ml-auto">
            <Button
              id="preview-mode-btn"
              onPress={loadPreviewMode}
              isDisabled={isScanning}
              variant="bordered"
              size="sm"
              startContent={<Eye size={14} />}
              className={`font-semibold border-indigo-400 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950 min-w-[130px] ${mode === 'idle' ? 'animate-green-pulse' : ''
                }`}
            >
              Explore Preview
            </Button>

            <Button
              id="live-sync-btn"
              onPress={handleLiveSync}
              isLoading={isScanning}
              isDisabled={isScanning || !config.email || !config.password}
              size="sm"
              startContent={!isScanning ? <Scan size={14} /> : undefined}
              className="font-semibold text-white min-w-[160px]"
              style={{
                background: isScanning ? '#a5b4fc' : 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                boxShadow: isScanning ? 'none' : '0 2px 12px rgba(99,102,241,0.35)',
              }}
            >
              {isScanning ? 'Scanning…' : 'Scan My Inbox'}
            </Button>
          </div>
        </div>

        {/* Step-by-Step App Password Instructions + Privacy Guarantee Row */}
        <div
          className="grid grid-cols-1 md:grid-cols-12 gap-5 p-4 rounded-xl text-xs"
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
            color: 'var(--text-primary)',
          }}
        >
          {/* Left Column: Generator Instructions */}
          <div className="md:col-span-7 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-sm text-indigo-600 dark:text-indigo-400">
              <HelpCircle size={15} />
              <span>How to Create Google App Password (Gmail)</span>
            </div>
            <ol className="list-decimal pl-4 space-y-1 leading-relaxed text-[var(--text-muted)]">
              <li>
                Go to Google Account settings:{' '}
                <a
                  href="https://myaccount.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 dark:text-indigo-400 underline font-semibold"
                >
                  myaccount.google.com
                </a>
              </li>
              <li>
                Click on the <strong className="text-slate-800 dark:text-slate-200">Security</strong> tab on the left.
              </li>
              <li>
                Ensure <strong className="text-slate-800 dark:text-slate-200">2-Step Verification</strong> is turned ON.
              </li>
              <li>
                Use the <strong className="text-slate-800 dark:text-slate-200">Search bar at the top</strong> of the account settings page and search for <strong className="text-indigo-600 dark:text-indigo-400">"App passwords"</strong> directly.
              </li>
              <li>
                Enter a name (e.g. <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded text-indigo-600">AppliTrack</code>) and click <strong className="text-slate-800 dark:text-slate-200">Create</strong>.
              </li>
              <li>
                Copy the generated <strong className="text-indigo-600 dark:text-indigo-400">16-character password</strong> (e.g. <code className="bg-slate-200 dark:bg-slate-800 font-bold px-1">abcd efgh ijkl mnop</code>).
              </li>
              <li>
                Paste it into the <strong className="text-slate-800 dark:text-slate-200">App Password</strong> input field above (without spaces).
              </li>
            </ol>
          </div>

          <Divider orientation="vertical" className="hidden md:block h-auto opacity-20 col-span-1" />

          {/* Right Column: Privacy & Safety Guarantee */}
          <div className="md:col-span-4 flex flex-col justify-center space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-sm text-emerald-600 dark:text-emerald-400">
              <ShieldCheck size={16} />
              <span>100% Privacy & Safety Guarantee</span>
            </div>
            <p className="leading-relaxed text-[var(--text-muted)]">
              This application is completely client-side and **does not save, store, or log** your email address or password anywhere.
            </p>
            <p className="leading-relaxed text-[var(--text-muted)]">
              Your credentials are only held in temporary system memory (RAM) for the duration of the IMAP sync request to connect to Gmail's server, and are immediately discarded.
            </p>
          </div>
        </div>

        {/* Status / Error */}
        {(mode !== 'idle' || scanError) && (
          <div
            className="flex items-center gap-2 pt-3 border-t"
            style={{ borderColor: 'var(--border)' }}
          >
            {scanError ? (
              <div
                className="flex items-start gap-2 rounded-xl px-3 py-2 text-xs flex-1"
                style={{
                  background: 'rgba(239,68,68,0.07)',
                  border: '1px solid rgba(239,68,68,0.2)',
                  color: '#ef4444',
                }}
              >
                <AlertCircle size={13} className="flex-none mt-0.5" />
                <span>{scanError}</span>
              </div>
            ) : (
              <Chip
                size="sm"
                variant="flat"
                color={mode === 'preview' ? 'secondary' : mode === 'scanning' ? 'warning' : 'success'}
                startContent={
                  <span
                    className="w-1.5 h-1.5 rounded-full ml-1 inline-block"
                    style={{
                      background: mode === 'live' ? '#10b981' : mode === 'scanning' ? '#f59e0b' : '#8b5cf6',
                      animation: 'pulse 2s ease-in-out infinite',
                    }}
                  />
                }
              >
                {mode === 'preview'
                  ? 'Preview Mode — sample data'
                  : mode === 'scanning'
                    ? 'Connecting to inbox via IMAP…'
                    : `Live — ${config.email}`}
              </Chip>
            )}
          </div>
        )}
      </CardBody>
    </Card>
  );
}

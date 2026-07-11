'use client';

import { useState } from 'react';
import { Card, CardBody, Input, Button, Divider, DateRangePicker } from '@heroui/react';
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
      className="rounded-3xl border glass-panel"
      style={{
        boxShadow: 'var(--shadow-md)',
      }}
    >
      <CardBody className="p-6 gap-6">
        {/* Top Controls Row */}
        <div className="flex flex-col lg:flex-row gap-5 items-start pb-2">
          {/* Label */}
          <div className="flex items-center gap-3.5 flex-none pt-2">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center flex-none"
              style={{
                background: 'linear-gradient(135deg, #bd00ff, #00f0ff)',
                boxShadow: '0 4px 12px var(--accent-glow)',
              }}
            >
              <Scan size={18} color="#fff" strokeWidth={2.5} />
            </div>
            <div>
              <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>IMAP Gateway</p>
              <p className="font-mono-data text-[9px] mt-0.5" style={{ color: 'var(--text-subtle)' }}>SYNC_STATUS_IDLE</p>
            </div>
          </div>

          <Divider orientation="vertical" className="hidden lg:block h-12 opacity-30 self-center bg-[var(--border)]" />

          {/* Email */}
          <div className="flex-1 min-w-0 w-full relative">
            <Input
              id="target-email"
              label="Secure Email Address"
              placeholder="you@gmail.com"
              value={config.email}
              onValueChange={handleEmailChange}
              isInvalid={!!emailError}
              errorMessage={emailError}
              variant="bordered"
              size="sm"
              startContent={<Mail size={14} className="text-indigo-400 flex-none mr-1" strokeWidth={2.5} />}
              classNames={{
                inputWrapper: 'bg-black/5 dark:bg-white/5 border-[var(--border)] data-[hover=true]:border-[var(--accent)] data-[focused=true]:border-[var(--accent)] transition-all rounded-xl h-11',
                input: 'text-sm font-medium',
                label: 'text-xs font-semibold text-[var(--text-muted)]',
                helperWrapper: 'absolute top-full left-0 right-0 mt-0.5 h-3',
                errorMessage: 'text-[10px] leading-none text-red-500 font-mono-data',
              }}
            />
          </div>

          {/* App Password */}
          <div className="flex-1 min-w-0 w-full relative">
            <Input
              id="app-password"
              label="App Security Key"
              placeholder={isGmail ? '16-character app password' : 'IMAP password'}
              type={showPassword ? 'text' : 'password'}
              value={config.password}
              onValueChange={(v) => setConfig({ password: v })}
              variant="bordered"
              size="sm"
              startContent={<Lock size={14} className="text-indigo-400 flex-none mr-1" strokeWidth={2.5} />}
              endContent={
                <button
                   type="button"
                   onClick={() => setShowPassword((v) => !v)}
                   style={{ color: 'var(--text-subtle)', flexShrink: 0 }}
                   tabIndex={-1}
                   aria-label="Toggle password visibility"
                   className="p-1 hover:text-[var(--accent)] transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              }
              classNames={{
                inputWrapper: 'bg-black/5 dark:bg-white/5 border-[var(--border)] data-[hover=true]:border-[var(--accent)] data-[focused=true]:border-[var(--accent)] transition-all rounded-xl h-11',
                input: 'text-sm font-medium',
                label: 'text-xs font-semibold text-[var(--text-muted)]',
              }}
            />
          </div>
        </div>

        {/* Date Picker + Buttons Row */}
        <div className="flex flex-col lg:flex-row gap-5 items-start lg:items-end w-full">
          {/* Date Picker */}
          <div className="flex-none w-full lg:w-80">
            <DateRangePicker
              label="Target Scan Interval"
              value={rangeValue}
              onChange={handleRangeChange}
              variant="bordered"
              size="sm"
              className="w-full"
              classNames={{
                inputWrapper: 'bg-black/5 dark:bg-white/5 border-[var(--border)] data-[hover=true]:border-[var(--accent)] data-[focused=true]:border-[var(--accent)] transition-all rounded-xl h-11',
                label: 'text-xs font-semibold text-[var(--text-muted)]',
              }}
            />
          </div>

          <Divider orientation="vertical" className="hidden lg:block h-12 opacity-30 self-center bg-[var(--border)]" />

          {/* Action Buttons */}
          <div className="flex gap-3 flex-none flex-wrap lg:ml-auto w-full lg:w-auto">
            <Button
              id="preview-mode-btn"
              onPress={loadPreviewMode}
              isDisabled={isScanning}
              variant="bordered"
              size="sm"
              startContent={<Eye size={14} strokeWidth={2.5} />}
              className={`flex-1 lg:flex-none font-bold font-mono-data rounded-xl border-[var(--border)] text-[var(--text-primary)] hover:border-[var(--accent)] hover:shadow-[0_0_10px_var(--border-glow)] transition-all min-w-[140px] cursor-pointer h-10 ${
                mode === 'idle' ? 'animate-green-pulse' : ''
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
              startContent={!isScanning ? <Scan size={14} strokeWidth={2.5} /> : undefined}
              className="flex-1 lg:flex-none font-bold font-mono-data rounded-xl text-white min-w-[180px] cursor-pointer h-10"
              style={{
                background: isScanning ? '#7c6999' : 'linear-gradient(135deg, #bd00ff, #00f0ff)',
                boxShadow: isScanning ? 'none' : '0 4px 16px var(--accent-glow)',
              }}
            >
              {isScanning ? 'RUNNING_SYNC…' : 'INITIALIZE_SCAN'}
            </Button>
          </div>
        </div>

        {/* Instructions + Security Guarantee Grid */}
        <div
          className="grid grid-cols-1 md:grid-cols-12 gap-6 p-5 rounded-2xl text-xs border border-[var(--border)]"
          style={{
            background: 'rgba(0, 0, 0, 0.08)',
            color: 'var(--text-primary)',
          }}
        >
          {/* Generator Steps */}
          <div className="md:col-span-7 space-y-3.5">
            <div className="flex items-center gap-2 font-bold text-xs font-mono-data text-indigo-600 dark:text-indigo-400">
              <HelpCircle size={15} strokeWidth={2.5} />
              <span>CONFIG_GUIDE: GENERATING_GOOGLE_APP_PASSWORD</span>
            </div>
            <ol className="list-decimal pl-4 space-y-2 leading-relaxed text-[var(--text-muted)] font-medium">
              <li>
                Navigate to your Google Console Account page:{' '}
                <a
                  href="https://myaccount.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-500 dark:text-indigo-400 underline font-bold"
                >
                  myaccount.google.com
                </a>
              </li>
              <li>
                Access the <strong className="text-slate-800 dark:text-slate-200">Security</strong> settings portal.
              </li>
              <li>
                Confirm that <strong className="text-slate-800 dark:text-slate-200">2-Step Verification</strong> is enabled.
              </li>
              <li>
                Search for <strong className="text-indigo-500 dark:text-indigo-400 font-bold">&quot;App passwords&quot;</strong> in the top search queries bar.
              </li>
              <li>
                Generate a new password key named <code className="bg-black/10 dark:bg-white/10 px-1 py-0.5 rounded text-indigo-500 font-bold">AppliTrack</code>.
              </li>
              <li>
                Securely copy the generated <strong className="text-indigo-500 dark:text-indigo-400 font-bold">16-character token</strong> key.
              </li>
              <li>
                Paste it into the <strong className="text-slate-800 dark:text-slate-200">App Security Key</strong> input above (without spaces).
              </li>
            </ol>
          </div>

          <Divider orientation="vertical" className="hidden md:block h-full opacity-30 col-span-1 bg-[var(--border)]" />

          {/* Privacy Protection Statement */}
          <div className="md:col-span-4 flex flex-col justify-center space-y-3">
            <div className="flex items-center gap-2 font-bold text-xs font-mono-data text-emerald-600 dark:text-emerald-400">
              <ShieldCheck size={16} strokeWidth={2.5} />
              <span>SECURE_PROTOCOL_VERIFIED</span>
            </div>
            <p className="leading-relaxed text-[var(--text-muted)] font-medium">
              This application compiles entirely on the client-side context. Zero server logs are compiled, and credentials are never stored.
            </p>
            <p className="leading-relaxed text-[var(--text-muted)] font-medium">
              IMAP credentials reside temporarily in browser RAM only for pipeline compilation and are immediately cleared.
            </p>
          </div>
        </div>

        {/* Sync Status / Error */}
        {(mode !== 'idle' || scanError) && (
          <div
            className="flex items-center gap-2 pt-4 border-t border-[var(--border)]"
          >
            {scanError ? (
              <div
                className="flex items-start gap-2.5 rounded-xl px-4 py-2.5 text-xs flex-1 border font-medium"
                style={{
                  background: 'rgba(239,68,68,0.06)',
                  borderColor: 'rgba(239,68,68,0.2)',
                  color: '#ef4444',
                }}
              >
                <AlertCircle size={14} className="flex-none mt-0.5" strokeWidth={2.5} />
                <span>{scanError}</span>
              </div>
            ) : (
              <div
                className="flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-mono-data border border-[var(--border)] bg-black/10 dark:bg-white/5"
              >
                <span
                  className="w-1.5 h-1.5 rounded-full inline-block"
                  style={{
                    background: mode === 'live' ? '#10b981' : mode === 'scanning' ? '#f59e0b' : '#bd00ff',
                    animation: 'pulse 1.8s ease-in-out infinite',
                  }}
                />
                <span className="text-[var(--text-muted)] font-bold">
                  {mode === 'preview'
                    ? 'ENVIRONMENT: PREVIEW_SAMPLE_DATA'
                    : mode === 'scanning'
                    ? 'ESTABLISHING_IMAP_CONNECTION…'
                    : `GATEWAY_READY: ${config.email}`}
                </span>
              </div>
            )}
          </div>
        )}
      </CardBody>
    </Card>
  );
}

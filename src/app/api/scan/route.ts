import { NextRequest, NextResponse } from 'next/server';
import Imap from 'imap';
import { simpleParser } from 'mailparser';
import { JobApplication, ApplicationStatus } from '@/types';

// ── IMAP config per provider ─────────────────────────────────────────────
const IMAP_CONFIGS: Record<string, { host: string; port: number; tls: boolean }> = {
  'gmail.com':        { host: 'imap.gmail.com',        port: 993, tls: true },
  'googlemail.com':   { host: 'imap.gmail.com',        port: 993, tls: true },
  'outlook.com':      { host: 'outlook.office365.com', port: 993, tls: true },
  'hotmail.com':      { host: 'outlook.office365.com', port: 993, tls: true },
  'live.com':         { host: 'outlook.office365.com', port: 993, tls: true },
  'yahoo.com':        { host: 'imap.mail.yahoo.com',   port: 993, tls: true },
  'icloud.com':       { host: 'imap.mail.me.com',      port: 993, tls: true },
  'protonmail.com':   { host: '127.0.0.1',             port: 1143, tls: false }, // via bridge
};

function getImapConfig(email: string) {
  const domain = email.split('@')[1]?.toLowerCase() || '';
  return IMAP_CONFIGS[domain] ?? { host: `imap.${domain}`, port: 993, tls: true };
}

// ── Email classifier ──────────────────────────────────────────────────────
function classifyEmail(subject: string, text: string): ApplicationStatus | null {
  const t = (subject + ' ' + text).toLowerCase();

  if (/interview|let('s| us) (talk|connect|chat)|schedule.*call|meeting invite|zoom.*invite/i.test(t))
    return 'interview_scheduled';

  if (/shortlist|advance.*process|next (stage|round|step)|moved forward|congratulations.*application/i.test(t))
    return 'shortlisted';

  if (/under review|received your application|reviewing your|under consideration|in our pipeline/i.test(t))
    return 'under_review';

  if (/regret|unfortunately|not (moving|proceeding|selecting)|other candidates|position.*filled|not.*right fit/i.test(t))
    return 'rejected';

  if (/thank you for applying|application (received|submitted|confirmed)|we.*received.*application/i.test(t))
    return 'applied';

  return null;
}

function extractCompany(from: string, subject: string): string {
  const domainMatch = from.match(/@([^.>\s]+)\./);
  if (domainMatch) {
    const d = domainMatch[1];
    if (!['gmail','yahoo','hotmail','outlook','mail','greenhouse','lever','workday','myworkdayjobs','icims','taleo','bamboohr'].includes(d))
      return d.charAt(0).toUpperCase() + d.slice(1);
  }
  const s = subject.match(/\bat\s+([A-Z][a-zA-Z\s&.]+?)(?:\s[-|!,]|\s*$)/);
  if (s) return s[1].trim();
  return 'Unknown Company';
}

function extractRole(subject: string): string {
  for (const p of [
    /application for (.+?) (?:at|[-|])/i,
    /your (.+?) application/i,
    /(.+?) (?:position|role|job|opportunity)/i,
  ]) {
    const m = subject.match(p);
    if (m) return m[1].trim().slice(0, 70);
  }
  return subject.slice(0, 70);
}

function hasSchedulingLink(text: string): boolean {
  return /calendly\.com|cal\.com|doodle\.com|schedule.*meeting|zoom\.us\/j|teams\.microsoft|meet\.google/i.test(text);
}

// ── IMAP fetch — promisified ──────────────────────────────────────────────
function fetchEmails(
  email: string,
  password: string,
  startDate: Date,
  endDate: Date
): Promise<{ subject: string; from: string; date: Date; text: string }[]> {
  return new Promise((resolve, reject) => {
    const cfg = getImapConfig(email);
    const imap = new Imap({
      user: email,
      password,
      host: cfg.host,
      port: cfg.port,
      tls: cfg.tls,
      tlsOptions: { rejectUnauthorized: false },
      connTimeout: 15000,
      authTimeout: 10000,
    });

    const results: { subject: string; from: string; date: Date; text: string }[] = [];

    imap.once('ready', () => {
      imap.openBox('INBOX', true, (err) => {
        if (err) { imap.end(); return reject(err); }

        const since = startDate.toDateString(); // e.g. "Jan 01 2025"
        const before = endDate.toDateString();

        imap.search(
          [
            ['SINCE', since],
            ['BEFORE', before],
            [
              'OR',
              ['OR', ['SUBJECT', 'application'], ['SUBJECT', 'interview']],
              ['OR', ['SUBJECT', 'offer'], ['SUBJECT', 'position']],
            ],
          ],
          (err, uids) => {
            if (err || !uids?.length) { imap.end(); return resolve([]); }

            // Limit to 150 most recent
            const subset = uids.slice(-150);
            const fetch = imap.fetch(subset, { bodies: '' });
            const pending: Promise<void>[] = [];

            fetch.on('message', (msg) => {
              const p = new Promise<void>((res) => {
                let buffer = '';
                msg.on('body', (stream) => {
                  stream.on('data', (chunk: Buffer) => { buffer += chunk.toString(); });
                  stream.once('end', async () => {
                    try {
                      const parsed = await simpleParser(buffer);
                      results.push({
                        subject: parsed.subject ?? '',
                        from: String(parsed.from?.text ?? ''),
                        date: parsed.date ?? new Date(),
                        text: parsed.text ?? parsed.html ?? '',
                      });
                    } catch { /* skip */ }
                    res();
                  });
                });
              });
              pending.push(p);
            });

            fetch.once('error', (e) => { imap.end(); reject(e); });
            fetch.once('end', async () => {
              await Promise.all(pending);
              imap.end();
            });
          }
        );
      });
    });

    imap.once('error', reject);
    imap.once('end', () => resolve(results));
    imap.connect();
  });
}

// ── Route Handler ────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const { email, password, startDate, endDate } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and App Password are required' }, { status: 400 });
  }
  if (!startDate) {
    return NextResponse.json({ error: 'startDate is required' }, { status: 400 });
  }

  const start = new Date(startDate);
  const end   = endDate ? new Date(endDate) : new Date();

  let emails: Awaited<ReturnType<typeof fetchEmails>>;
  try {
    emails = await fetchEmails(email, password, start, end);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    const friendly =
      msg.includes('Invalid credentials') || msg.includes('AUTHENTICATE')
        ? 'Login failed — check your App Password. Gmail: enable 2FA → generate App Password at myaccount.google.com/apppasswords'
        : msg.includes('ECONNREFUSED') || msg.includes('ETIMEDOUT')
        ? 'Could not connect to mail server. Check email provider IMAP settings.'
        : msg;
    return NextResponse.json({ error: friendly }, { status: 401 });
  }

  const applications: JobApplication[] = [];
  const seen = new Set<string>();

  for (const mail of emails) {
    const status = classifyEmail(mail.subject, mail.text);
    if (!status) continue;

    const company = extractCompany(mail.from, mail.subject);
    const role    = extractRole(mail.subject);
    const key     = `${company}|${role}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const dateStr = mail.date.toISOString().split('T')[0];
    const requiresAction = status === 'interview_scheduled' && hasSchedulingLink(mail.text);

    applications.push({
      id:             `imap-${Date.now()}-${applications.length}`,
      company,
      role,
      location:       'Remote / On-site',
      salary:         '—',
      status,
      appliedDate:    dateStr,
      lastActivity:   dateStr,
      requiresAction,
      schedulingLink: requiresAction ? mail.text.match(/(https?:\/\/(?:calendly|cal\.com|zoom)\S+)/i)?.[1] : undefined,
      logo:           company.charAt(0).toUpperCase(),
      source:         'IMAP Scan',
      tags:           [mail.from.split('@')[1]?.split('.')[0] ?? 'Email'],
    });
  }

  // Sort newest first
  applications.sort((a, b) => b.appliedDate.localeCompare(a.appliedDate));

  return NextResponse.json({ applications, total: applications.length });
}

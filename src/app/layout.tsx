import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'AppliTrack — Inbox Pipeline Scanner',
  description:
    'AI-powered job application pipeline scanner. Track, analyze, and manage your job search with real-time email sync and Kanban pipeline view.',
  keywords: ['job search', 'application tracker', 'pipeline scanner', 'email sync', 'career'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

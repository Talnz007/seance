import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Séance - AI Spirit Communication',
  description: 'Connect with an AI spirit through a digital Ouija board. Multi-user sessions with immersive audio and animations.',
  keywords: ['AI', 'Ouija board', 'spirit', 'supernatural', 'multiplayer', 'chat'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}

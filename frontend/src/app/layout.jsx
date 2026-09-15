import './globals.css';
import ClientProviders from '../components/ClientProviders';

import Link from 'next/link';

export const metadata = {
  title: 'Thirai+ | Premier Short Movie Submission & Judging Platform',
  description: 'Submit your cinematic short films to Thirai+, judged by industry leaders with community rating events and direct R2 cloud storage integration.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen flex flex-col justify-between bg-canvas text-slate-100 antialiased selection:bg-gold-500 selection:text-black">
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}

import './globals.css';
import Header from '../components/Header';

export const metadata = {
  title: 'Thirai+ | Premier Short Movie Submission & Judging Platform',
  description: 'Submit your cinematic short films to Thirai+, judged by industry leaders with community rating events and direct R2 cloud storage integration.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen flex flex-col justify-between bg-black text-slate-100 antialiased selection:bg-gold-500 selection:text-black">
        <Header />
        
        <main className="flex-grow max-w-7xl w-full mx-auto px-4 md:px-6 py-6">
          {children}
        </main>

        <footer className="border-t border-gold-500/20 bg-black/90 py-8 px-6 text-center text-xs text-zinc-500">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-wider text-white font-mono">THIRAI<span className="gold-text-gradient">+</span></span>
              <span>© 2026 Thirai+ Short Film Festival. All Rights Reserved.</span>
            </div>
            <div className="flex gap-6 text-zinc-400">
              <a href="#" className="hover:text-gold-400">Privacy Policy</a>
              <a href="#" className="hover:text-gold-400">Terms of Submission</a>
              <a href="#" className="hover:text-gold-400">Jury Guidelines</a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}

"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Film, Shield, Award, Upload, PlayCircle } from 'lucide-react';

export default function Header() {
  const pathname = usePathname();

  const isActive = (path) => pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-black/90 backdrop-blur-md border-b border-gold-500/20 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gold-gradient p-0.5 shadow-gold-glow flex items-center justify-center group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-black rounded-[10px] flex items-center justify-center">
              <Film className="w-5 h-5 text-gold-400" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-extrabold tracking-wider font-mono text-white">
              THIRAI<span className="gold-text-gradient">+</span>
            </span>
            <span className="block text-[10px] text-zinc-400 tracking-widest uppercase font-semibold">
              Cinematic Shorts Platform
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="/"
            className={`flex items-center gap-2 text-sm font-semibold transition-colors ${
              isActive('/') ? 'text-gold-400 border-b-2 border-gold-400 pb-1' : 'text-zinc-300 hover:text-gold-300'
            }`}
          >
            <PlayCircle className="w-4 h-4" /> Gallery
          </Link>
          <Link
            href="/upload"
            className={`flex items-center gap-2 text-sm font-semibold transition-colors ${
              isActive('/upload') ? 'text-gold-400 border-b-2 border-gold-400 pb-1' : 'text-zinc-300 hover:text-gold-300'
            }`}
          >
            <Upload className="w-4 h-4" /> Submit Film
          </Link>
          <Link
            href="/judge"
            className={`flex items-center gap-2 text-sm font-semibold transition-colors ${
              isActive('/judge') ? 'text-gold-400 border-b-2 border-gold-400 pb-1' : 'text-zinc-300 hover:text-gold-300'
            }`}
          >
            <Award className="w-4 h-4" /> Judge Panel
          </Link>
          <Link
            href="/admin"
            className={`flex items-center gap-2 text-sm font-semibold transition-colors ${
              isActive('/admin') ? 'text-gold-400 border-b-2 border-gold-400 pb-1' : 'text-zinc-300 hover:text-gold-300'
            }`}
          >
            <Shield className="w-4 h-4" /> Admin Portal
          </Link>
        </nav>

        {/* Action Button */}
        <Link
          href="/upload"
          className="gold-btn px-5 py-2.5 rounded-lg text-xs tracking-wider uppercase flex items-center gap-2"
        >
          <Upload className="w-4 h-4" /> Submit Entry
        </Link>
      </div>
    </header>
  );
}

"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { Film, Shield, Award, Upload, PlayCircle, LogIn, LogOut, User } from 'lucide-react';

export default function Header() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

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

        {/* User Auth Controls & Action Button */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-card border border-gold-500/30">
                <img
                  src={user.profile_pic_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                  alt={user.full_name}
                  className="w-6 h-6 rounded-full object-cover border border-gold-400"
                />
                <div className="text-left">
                  <span className="block text-xs font-bold text-white line-clamp-1">{user.full_name}</span>
                  <span className="block text-[9px] text-gold-400 uppercase font-semibold">{user.role}</span>
                </div>
              </div>

              <button
                onClick={logout}
                title="Log Out"
                className="p-2 rounded-xl bg-zinc-900 border border-zinc-700 hover:border-rose-500/50 text-zinc-300 hover:text-rose-400 text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="px-4 py-2 rounded-xl bg-zinc-900 border border-gold-500/30 hover:border-gold-400 text-gold-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <LogIn className="w-4 h-4 text-gold-400" /> Portal Login
            </Link>
          )}

          <Link
            href="/upload"
            className="gold-btn px-4 py-2 rounded-xl text-xs tracking-wider uppercase flex items-center gap-1.5 shadow-gold-glow"
          >
            <Upload className="w-4 h-4" /> Submit Entry
          </Link>
        </div>
      </div>
    </header>
  );
}

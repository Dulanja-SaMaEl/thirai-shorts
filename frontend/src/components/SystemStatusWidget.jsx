"use client";

import { useState, useEffect } from 'react';
import api from '../lib/api';
import { Server, Database, Cloud, RefreshCw, CheckCircle2, AlertTriangle, XCircle, ShieldCheck } from 'lucide-react';

export default function SystemStatusWidget() {
  const [statusData, setStatusData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastCheck, setLastCheck] = useState('');

  const checkHealth = async () => {
    setLoading(true);
    try {
      const res = await api.get('/health');
      setStatusData(res.data);
      setLastCheck(new Date().toLocaleTimeString());
    } catch (err) {
      setStatusData({
        server: { status: 'offline', message: 'Express Server unreachable' },
        database: { status: 'offline', message: 'Unable to reach backend' },
        cloudflareR2: { status: 'offline', message: 'Unable to reach backend' },
        overall: 'offline'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 30000); // refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'online':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Online
          </span>
        );
      case 'unconfigured':
      case 'degraded':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Pending Key
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/30 px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Disconnected
          </span>
        );
    }
  };

  return (
    <div className="bg-surface-card border border-gold-500/30 rounded-2xl p-4 glass-panel space-y-3">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-gold-400" />
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-white">System Infrastructure Health</h4>
        </div>
        <button
          onClick={checkHealth}
          disabled={loading}
          className="text-zinc-400 hover:text-gold-400 text-[11px] flex items-center gap-1 transition-colors"
          title="Refresh Diagnostics"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin text-gold-400' : ''}`} />
          <span>{lastCheck ? `Updated ${lastCheck}` : 'Checking...'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Node.js Express Server */}
        <div className="bg-black/60 border border-zinc-800 rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-gold-400">
              <Server className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="block text-xs font-bold text-white">Render Express</span>
              <span className="block text-[9px] text-zinc-400 line-clamp-1">{statusData?.server?.message || 'API Node'}</span>
            </div>
          </div>
          {getStatusBadge(statusData?.server?.status)}
        </div>

        {/* Supabase PostgreSQL DB */}
        <div className="bg-black/60 border border-zinc-800 rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-gold-400">
              <Database className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="block text-xs font-bold text-white">Supabase DB</span>
              <span className="block text-[9px] text-zinc-400 line-clamp-1">{statusData?.database?.message || 'PostgreSQL'}</span>
            </div>
          </div>
          {getStatusBadge(statusData?.database?.status)}
        </div>

        {/* Cloudflare R2 Storage */}
        <div className="bg-black/60 border border-zinc-800 rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-gold-400">
              <Cloud className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="block text-xs font-bold text-white">Cloudflare R2</span>
              <span className="block text-[9px] text-zinc-400 line-clamp-1">{statusData?.cloudflareR2?.message || 'S3 Bucket'}</span>
            </div>
          </div>
          {getStatusBadge(statusData?.cloudflareR2?.status)}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from 'react';
import api from '../lib/api';
import { Server, Database, Cloud, RefreshCw, CheckCircle2, AlertTriangle, XCircle, ShieldCheck } from 'lucide-react';

export default function SystemStatusWidget() {
  const [statusData, setStatusData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastCheck, setLastCheck] = useState('');

  const checkHealth = async (isRetry = false) => {
    setLoading(true);
    try {
      const res = await api.get('/health');
      setStatusData(res.data);
      setLastCheck(new Date().toLocaleTimeString());
    } catch (err) {
      setStatusData({
        server: {
          status: 'offline',
          message: err.code === 'ECONNABORTED'
            ? 'Server warming up...'
            : (err.response?.data?.message || (err.response ? `HTTP ${err.response.status}` : 'Express Server unreachable'))
        },
        database: { status: 'offline', message: 'Offline or connecting...' },
        cloudflareR2: { status: 'offline', message: 'Offline or connecting...' },
        overall: 'offline'
      });
      setLastCheck(new Date().toLocaleTimeString() + ' (Retrying)');
      // If failed on initial check, auto-retry once after 5s to catch cold start recovery
      if (!isRetry) {
        setTimeout(() => checkHealth(true), 5000);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(() => checkHealth(false), 30000); // refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'online':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-full shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Online</span>
          </span>
        );
      case 'unconfigured':
      case 'degraded':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-full shrink-0">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>Pending Key</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-400 bg-rose-500/10 border border-rose-500/30 px-2.5 py-1 rounded-full shrink-0">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>Disconnected</span>
          </span>
        );
    }
  };

  return (
    <div className="bg-surface-card/95 border border-gold-500/25 rounded-3xl p-6 sm:p-7 glass-panel shadow-gold-glow space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-400 shrink-0">
            <ShieldCheck className="w-4 h-4 text-gold-400" />
          </div>
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-white">System Infrastructure Health</h4>
            <p className="text-[11px] text-zinc-400">Live operational telemetry across distributed cinema microservices</p>
          </div>
        </div>
        <button
          onClick={checkHealth}
          disabled={loading}
          className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl bg-black/60 border border-zinc-700/70 hover:border-gold-500/50 text-zinc-300 hover:text-gold-300 text-xs font-mono transition-all flex items-center gap-2"
          title="Refresh Diagnostics"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-gold-400' : ''}`} />
          <span>{lastCheck ? `Checked ${lastCheck}` : 'Diagnostics...'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
        {/* Node.js Express Server */}
        <div className="bg-black/60 border border-zinc-800/80 hover:border-gold-500/30 rounded-2xl p-4 sm:p-5 flex items-center justify-between transition-all group shadow-sm">
          <div className="flex items-center gap-3.5 min-w-0 mr-2">
            <div className="w-10 h-10 rounded-xl bg-zinc-900/90 border border-zinc-700/60 text-gold-400 flex items-center justify-center group-hover:scale-105 group-hover:border-gold-500/40 transition-all shrink-0">
              <Server className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="block text-sm font-bold text-white truncate">Render Express</span>
              <span className="block text-xs text-zinc-400 font-mono truncate">
                {statusData?.server?.message || (statusData?.status === 'online' ? 'API Node Active' : 'API Node')}
              </span>
            </div>
          </div>
          {getStatusBadge(statusData?.server?.status || (statusData?.status === 'online' ? 'online' : 'offline'))}
        </div>

        {/* Supabase PostgreSQL DB */}
        <div className="bg-black/60 border border-zinc-800/80 hover:border-gold-500/30 rounded-2xl p-4 sm:p-5 flex items-center justify-between transition-all group shadow-sm">
          <div className="flex items-center gap-3.5 min-w-0 mr-2">
            <div className="w-10 h-10 rounded-xl bg-zinc-900/90 border border-zinc-700/60 text-gold-400 flex items-center justify-center group-hover:scale-105 group-hover:border-gold-500/40 transition-all shrink-0">
              <Database className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="block text-sm font-bold text-white truncate">Supabase DB</span>
              <span className="block text-xs text-zinc-400 font-mono truncate">{statusData?.database?.message || 'PostgreSQL'}</span>
            </div>
          </div>
          {getStatusBadge(statusData?.database?.status)}
        </div>

        {/* Cloudflare R2 Storage */}
        <div className="bg-black/60 border border-zinc-800/80 hover:border-gold-500/30 rounded-2xl p-4 sm:p-5 flex items-center justify-between transition-all group shadow-sm">
          <div className="flex items-center gap-3.5 min-w-0 mr-2">
            <div className="w-10 h-10 rounded-xl bg-zinc-900/90 border border-zinc-700/60 text-gold-400 flex items-center justify-center group-hover:scale-105 group-hover:border-gold-500/40 transition-all shrink-0">
              <Cloud className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="block text-sm font-bold text-white truncate">Cloudflare R2</span>
              <span className="block text-xs text-zinc-400 font-mono truncate">{statusData?.cloudflareR2?.message || 'S3 Bucket'}</span>
            </div>
          </div>
          {getStatusBadge(statusData?.cloudflareR2?.status)}
        </div>
      </div>
    </div>
  );
}

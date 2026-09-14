"use client";

import { Sparkles, Award, ArrowUpRight, ShieldCheck, Film, ExternalLink } from 'lucide-react';

const HEADLINE_SPONSORS = [
  {
    id: 'cloudflare',
    name: 'Cloudflare',
    product: 'R2 & Stream',
    role: 'Official Cloud Infrastructure Partner',
    category: 'Cloud & Media Delivery',
    tag: 'Global Edge Network',
    description: 'Powering secure zero-egress media storage and ultra-low latency worldwide cinema streaming for Thirai+ filmmakers.',
    iconSvg: (
      <svg viewBox="0 0 24 24" className="w-8 h-8 fill-current text-amber-400" xmlns="http://www.w3.org/2000/svg">
        <path d="M18.8 9.2a5.4 5.4 0 0 0-9.8-1.7 4.2 4.2 0 0 0-3.6 2.3 4.8 4.8 0 0 0 .6 9.6h12.8a4.4 4.4 0 0 0 0-8.8l-.8.1-.2-.8-.2-.7z"/>
      </svg>
    )
  },
  {
    id: 'dolby',
    name: 'Dolby',
    product: 'Vision • Atmos',
    role: 'Official Cinema Sound & Color Partner',
    category: 'Acoustics & Visual Tech',
    tag: 'Immersive Experience',
    description: 'Setting spatial acoustic fidelity and dynamic color mastering standards for our festival official competition.',
    iconSvg: (
      <svg viewBox="0 0 24 24" className="w-8 h-8 fill-current text-gold-400" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 4h3.5A7.5 7.5 0 0 1 14 11.5a7.5 7.5 0 0 1-7.5 7.5H3V4zm14.5 0H21v15h-3.5A7.5 7.5 0 0 1 10 11.5 7.5 7.5 0 0 1 17.5 4z" />
      </svg>
    )
  },
  {
    id: 'blackmagic',
    name: 'Blackmagic Design',
    product: 'DaVinci Resolve Studio',
    role: 'Official Post-Production Partner',
    category: 'Color Grading & Finishing',
    tag: 'Industry Standard',
    description: 'Providing advanced color correction and digital mastering suites to help independent directors bring cinema vision to life.',
    iconSvg: (
      <svg viewBox="0 0 24 24" className="w-8 h-8 fill-current text-amber-300" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L2 7l10 5 10-5-10-5zm0 9L4 7.5 12 4l8 3.5-8 3.5zm-10 4l10 5 10-5-2.2-1.1L12 18l-7.8-3.9L2 15zm0 4l10 5 10-5-2.2-1.1L12 22l-7.8-3.9L2 19z" />
      </svg>
    )
  },
  {
    id: 'arri',
    name: 'ARRI',
    product: 'Cinema Systems & Optics',
    role: 'Official Digital Cinematography Partner',
    category: 'Optics & Camera Guild',
    tag: 'Cinema Heritage',
    description: 'Celebrating exceptional cinematic texture, dynamic latitude, and high-fidelity optical craft in short filmmaking.',
    iconSvg: (
      <svg viewBox="0 0 24 24" className="w-8 h-8 fill-current text-gold-300" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14.93V18h-2v-1.07A6.002 6.002 0 0 1 6 11h2c0 2.21 1.79 4 4 4s4-1.79 4-4h2c0 2.97-2.16 5.43-5 5.93zM12 6a5 5 0 0 0-5 5h2c0-1.66 1.34-3 3-3s3 1.34 3 3h2a5 5 0 0 0-5-5z" />
      </svg>
    )
  }
];

const GUILD_PARTNERS = [
  {
    name: 'Stripe Payments',
    role: 'Global Payment & Billing Partner',
    badge: '135+ Currencies'
  },
  {
    name: 'Sony CineAlta',
    role: 'Cinematography Camera Guild Associate',
    badge: 'CineAlta FX Guild'
  },
  {
    name: 'Sennheiser Pro Audio',
    role: 'Official Acoustic & Audio Partner',
    badge: 'Studio Sound'
  },
  {
    name: 'National Film Corporation (NFC)',
    role: 'Institutional & Cultural Associate',
    badge: 'Sri Lanka'
  },
  {
    name: 'FilmFreeway',
    role: 'Global Submission Platform Associate',
    badge: 'Verified Festival'
  }
];

export default function SponsorsSection() {
  return (
    <section aria-label="Festival Sponsors and Industry Partners" className="relative my-10">
      
      {/* Background ambient lighting */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gold-500/5 to-transparent pointer-events-none rounded-3xl" />

      <div className="relative rounded-3xl bg-zinc-950/70 border border-gold-500/30 p-6 sm:p-8 md:p-10 backdrop-blur-md shadow-gold-glow space-y-8">
        
        {/* Header Title & Subtitle */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-850 pb-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/15 border border-gold-400/40 text-gold-300 text-xs font-mono font-bold tracking-wider shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-gold-400" />
              OFFICIAL FESTIVAL SPONSORS & INDUSTRY PARTNERS
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Supported by <span className="gold-text-gradient">Cinema Pioneers</span> & Tech Leaders
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
              Thirai+ is proudly championed by international media leaders, post-production pioneers, and cultural institutions empowering the next era of South Asian and global independent short films.
            </p>
          </div>

          <a
            href="#contact"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900/90 hover:bg-gold-500 hover:text-black border border-zinc-800 hover:border-gold-400 text-xs font-bold text-zinc-300 transition-all shrink-0 self-start md:self-auto shadow-sm"
          >
            Become a Sponsor <ArrowUpRight className="w-4 h-4" />
          </a>
        </div>

        {/* Headline Tier Sponsor Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {HEADLINE_SPONSORS.map((sponsor) => (
            <div
              key={sponsor.id}
              className="group relative rounded-2xl bg-surface-card border border-zinc-800/80 hover:border-gold-500/60 p-5 transition-all duration-300 hover:shadow-gold-glow flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Header Icon & Tag */}
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-black/80 border border-gold-500/20 flex items-center justify-center group-hover:scale-105 group-hover:border-gold-400 transition-all shadow-sm">
                    {sponsor.iconSvg}
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-400 text-[10px] font-mono font-semibold">
                    {sponsor.tag}
                  </span>
                </div>

                {/* Brand Name & Product */}
                <div>
                  <h3 className="text-base font-extrabold text-white group-hover:text-gold-300 transition-colors">
                    {sponsor.name}
                  </h3>
                  <span className="text-xs font-semibold text-zinc-400 block">
                    {sponsor.product}
                  </span>
                </div>

                {/* Role Pill */}
                <div className="text-[11px] font-mono text-gold-300/90 bg-black/60 px-2.5 py-1 rounded-lg border border-zinc-850">
                  {sponsor.role}
                </div>

                {/* Description */}
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {sponsor.description}
                </p>
              </div>

              {/* Bottom Subtle Indicator */}
              <div className="pt-4 mt-3 border-t border-zinc-850/80 flex items-center justify-between text-[11px] text-zinc-500">
                <span className="text-[10px] uppercase font-mono tracking-wider">{sponsor.category}</span>
                <span className="text-gold-400 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                  Verified Partner ✓
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Guild Associates & Cultural Partners Strip */}
        <div className="pt-2 border-t border-zinc-850">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              Official Guild Associates & Cultural Entities
            </span>
            <span className="text-[10px] font-mono text-gold-400">
              2026-2027 Season
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {GUILD_PARTNERS.map((guild, idx) => (
              <div
                key={idx}
                className="bg-black/60 hover:bg-black border border-zinc-800/80 hover:border-gold-500/40 rounded-xl p-3 text-center space-y-1 transition-all group"
              >
                <span className="block text-xs font-bold text-white group-hover:text-gold-300 transition-colors line-clamp-1">
                  {guild.name}
                </span>
                <span className="block text-[10px] text-zinc-400 line-clamp-1">
                  {guild.role}
                </span>
                <span className="inline-block text-[9px] font-mono px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-gold-400/90">
                  {guild.badge}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}

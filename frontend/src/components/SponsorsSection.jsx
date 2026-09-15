"use client";

import { useState, useEffect } from 'react';
import { Sparkles, Award, ArrowUpRight, ShieldCheck, Film, ExternalLink } from 'lucide-react';
import api from '../lib/api';

const DEFAULT_HEADLINE_SPONSORS = [
  {
    id: 'cloudflare',
    name: 'Cloudflare',
    product: 'R2 & Stream',
    tier: 'headline',
    role: 'Official Cloud Infrastructure Partner',
    category: 'Cloud & Media Delivery',
    tag: 'Global Edge Network',
    description: 'Powering secure zero-egress media storage and ultra-low latency worldwide cinema streaming for Thirai+ filmmakers.',
    website_url: 'https://www.cloudflare.com',
    logo_url: '',
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
    tier: 'headline',
    role: 'Official Cinema Sound & Color Partner',
    category: 'Acoustics & Visual Tech',
    tag: 'Immersive Experience',
    description: 'Setting spatial acoustic fidelity and dynamic color mastering standards for our festival official competition.',
    website_url: 'https://www.dolby.com',
    logo_url: '',
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
    tier: 'headline',
    role: 'Official Post-Production Partner',
    category: 'Color Grading & Finishing',
    tag: 'Industry Standard',
    description: 'Providing advanced color correction and digital mastering suites to help independent directors bring cinema vision to life.',
    website_url: 'https://www.blackmagicdesign.com',
    logo_url: '',
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
    tier: 'headline',
    role: 'Official Digital Cinematography Partner',
    category: 'Optics & Camera Guild',
    tag: 'Cinema Heritage',
    description: 'Celebrating exceptional cinematic texture, dynamic latitude, and high-fidelity optical craft in short filmmaking.',
    website_url: 'https://www.arri.com',
    logo_url: '',
    iconSvg: (
      <svg viewBox="0 0 24 24" className="w-8 h-8 fill-current text-gold-300" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14.93V18h-2v-1.07A6.002 6.002 0 0 1 6 11h2c0 2.21 1.79 4 4 4s4-1.79 4-4h2c0 2.97-2.16 5.43-5 5.93zM12 6a5 5 0 0 0-5 5h2c0-1.66 1.34-3 3-3s3 1.34 3 3h2a5 5 0 0 0-5-5z" />
      </svg>
    )
  }
];

const DEFAULT_GUILD_SPONSORS = [
  {
    id: 'stripe',
    name: 'Stripe Payments',
    product: 'Global Checkout',
    tier: 'guild',
    role: 'Global Payment & Billing Partner',
    category: 'Financial Infrastructure',
    tag: '135+ Currencies',
    website_url: 'https://stripe.com'
  },
  {
    id: 'sony',
    name: 'Sony CineAlta',
    product: 'FX Cinema Series',
    tier: 'guild',
    role: 'Cinematography Camera Guild Associate',
    category: 'Camera Guild',
    tag: 'CineAlta FX Guild',
    website_url: 'https://pro.sony'
  },
  {
    id: 'sennheiser',
    name: 'Sennheiser Pro Audio',
    product: 'MKH & EW Series',
    tier: 'guild',
    role: 'Official Acoustic & Audio Partner',
    category: 'Sound Capture',
    tag: 'Studio Sound',
    website_url: 'https://www.sennheiser.com'
  },
  {
    id: 'nfc',
    name: 'National Film Corporation (NFC)',
    product: 'Sri Lanka Film Guild',
    tier: 'guild',
    role: 'Institutional & Cultural Associate',
    category: 'Cultural Guild',
    tag: 'Sri Lanka',
    website_url: 'http://www.nfc.gov.lk'
  },
  {
    id: 'filmfreeway',
    name: 'FilmFreeway',
    product: 'Festival Network',
    tier: 'guild',
    role: 'Global Submission Platform Associate',
    category: 'Submission Portal',
    tag: 'Verified Festival',
    website_url: 'https://filmfreeway.com'
  }
];

export default function SponsorsSection() {
  const [sponsors, setSponsors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Instant cache load from localStorage
    try {
      const cached = localStorage.getItem('thirai_custom_sponsors');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSponsors(parsed.filter(s => s.is_active !== false));
        }
      }
    } catch (e) {}

    // 2. Fresh API sync
    fetchSponsors();
  }, []);

  const fetchSponsors = async () => {
    try {
      const res = await api.get('/sponsors');
      if (res.data?.success && Array.isArray(res.data.sponsors) && res.data.sponsors.length > 0) {
        setSponsors(res.data.sponsors.filter(s => s.is_active !== false));
        try {
          localStorage.setItem('thirai_custom_sponsors', JSON.stringify(res.data.sponsors));
        } catch (e) {}
      }
    } catch (e) {
      console.warn('Using default sponsors fallback:', e);
    } finally {
      setLoading(false);
    }
  };

  // Group into Headline and Guild sponsors
  const dynamicHeadline = sponsors.filter(s => s.tier === 'headline');
  const dynamicGuild = sponsors.filter(s => s.tier === 'guild');

  const headlineList = dynamicHeadline.length > 0 ? dynamicHeadline : DEFAULT_HEADLINE_SPONSORS;
  const guildList = dynamicGuild.length > 0 ? dynamicGuild : DEFAULT_GUILD_SPONSORS;

  return (
    <section aria-label="Festival Sponsors and Industry Partners" className="space-y-6 pt-2">
      
      {/* Header Title & Subtitle */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/[0.08] pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Festival Partners & Sponsors
          </h2>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl">
            Supported by media leaders, post-production pioneers, and cultural institutions empowering independent short cinema.
          </p>
        </div>

        <a
          href="#contact"
          className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 transition-colors self-start md:self-auto"
        >
          Become a Partner <ArrowUpRight className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Headline Tier Sponsor Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {headlineList.map((sponsor) => {
          const hasLink = Boolean(sponsor.website_url);
          const CardWrapper = hasLink ? 'a' : 'div';
          const cardProps = hasLink
            ? { href: sponsor.website_url, target: '_blank', rel: 'noopener noreferrer' }
            : {};

          return (
            <CardWrapper
              key={sponsor.id || sponsor.name}
              {...cardProps}
              className="group rounded-lg bg-[#0F131C] border border-white/[0.06] hover:border-white/[0.16] p-4 transition-colors flex flex-col justify-between block text-left"
            >
              <div className="space-y-3">
                {/* Header Icon & Tag */}
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-md bg-[#07080B] border border-white/[0.08] flex items-center justify-center overflow-hidden p-1.5">
                    {sponsor.logo_url ? (
                      <img
                        src={sponsor.logo_url}
                        alt={sponsor.name}
                        className="w-full h-full object-contain"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    ) : sponsor.iconSvg ? (
                      sponsor.iconSvg
                    ) : (
                      <span className="text-xs font-bold text-gold-400 font-mono">
                        {sponsor.name.slice(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-zinc-400 font-medium">
                      {sponsor.tag || 'Official Partner'}
                    </span>
                    {hasLink && (
                      <ExternalLink className="w-3 h-3 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
                    )}
                  </div>
                </div>

                {/* Brand Name & Product */}
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-gold-400 transition-colors">
                    {sponsor.name}
                  </h3>
                  {sponsor.product && (
                    <span className="text-xs text-zinc-400 block">
                      {sponsor.product}
                    </span>
                  )}
                </div>

                {/* Role */}
                <div className="text-[11px] text-zinc-400">
                  {sponsor.role}
                </div>

                {/* Description */}
                {sponsor.description && (
                  <p className="text-xs text-zinc-400 leading-relaxed line-clamp-3">
                    {sponsor.description}
                  </p>
                )}
              </div>

              {/* Bottom Subtle Indicator */}
              <div className="pt-3 mt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-zinc-500">
                <span className="text-[10px] uppercase font-mono tracking-wider">{sponsor.category || 'Partner'}</span>
              </div>
            </CardWrapper>
          );
        })}
      </div>

      {/* Guild Associates & Cultural Partners Strip */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[11px] font-semibold text-zinc-400">
            Cultural Associates & Guild Partners
          </span>
          <span className="text-[10px] font-mono text-zinc-500">
            2026 Season
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {guildList.map((guild, idx) => {
            const hasLink = Boolean(guild.website_url);
            const GuildWrapper = hasLink ? 'a' : 'div';
            const guildProps = hasLink
              ? { href: guild.website_url, target: '_blank', rel: 'noopener noreferrer' }
              : {};

            return (
              <GuildWrapper
                key={guild.id || idx}
                {...guildProps}
                className="bg-[#0D1017] border border-white/[0.06] hover:border-white/[0.14] rounded-md p-2.5 text-center space-y-1 transition-colors group block"
              >
                {guild.logo_url && (
                  <div className="h-6 w-auto mx-auto mb-1 flex items-center justify-center">
                    <img src={guild.logo_url} alt={guild.name} className="max-h-6 max-w-full object-contain" />
                  </div>
                )}
                <div className="flex items-center justify-center gap-1">
                  <span className="block text-xs font-semibold text-white group-hover:text-gold-400 transition-colors line-clamp-1">
                    {guild.name}
                  </span>
                  {hasLink && (
                    <ExternalLink className="w-2.5 h-2.5 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
                  )}
                </div>
                <span className="block text-[10px] text-zinc-500 line-clamp-1">
                  {guild.role}
                </span>
              </GuildWrapper>
            );
          })}
        </div>
      </div>
    </section>
  );
}

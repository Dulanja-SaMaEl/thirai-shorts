"use client";

import { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function LanguageSwitcher() {
  const { currentLanguage, setLanguage, languages, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeLang = languages.find(l => l.code === currentLanguage) || languages[0];

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        title="Change Language / භාෂාව තෝරන්න / மொழியைத் தேர்ந்தெடுக்கவும்"
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-zinc-900/90 border border-gold-500/30 hover:border-gold-400 text-zinc-200 hover:text-gold-300 text-xs font-bold transition-all shadow-sm group"
      >
        <span className="text-sm">{activeLang.flag}</span>
        <span className="font-semibold text-white tracking-wide">{activeLang.nativeLabel}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-gold-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-zinc-950 border border-gold-500/40 shadow-gold-glow-lg py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-1.5 border-b border-zinc-800 text-[10px] uppercase font-bold text-zinc-400 tracking-wider flex items-center justify-between">
            <span>{t('common.selectLanguage', 'Select Language')}</span>
            <Globe className="w-3 h-3 text-gold-400" />
          </div>

          <div className="p-1 space-y-1">
            {languages.map((lang) => {
              const isSelected = lang.code === currentLanguage;

              return (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-gold-500/20 text-gold-300 border border-gold-500/40 font-bold'
                      : 'text-zinc-300 hover:bg-zinc-900 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">{lang.flag}</span>
                    <div className="text-left">
                      <span className="block text-white leading-tight">{lang.nativeLabel}</span>
                      <span className="block text-[10px] text-zinc-400 font-normal">
                        {lang.label} {lang.code === 'en' ? '(Default)' : ''}
                      </span>
                    </div>
                  </div>

                  {isSelected && (
                    <Check className="w-4 h-4 text-gold-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

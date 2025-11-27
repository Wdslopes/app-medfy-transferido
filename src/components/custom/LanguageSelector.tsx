"use client";

import { Globe } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Language } from '@/lib/i18n/translations';

const languages = [
  { code: 'pt-BR' as Language, label: 'Português (BR)', flag: '🇧🇷' },
  { code: 'pt-PT' as Language, label: 'Português (PT)', flag: '🇵🇹' },
  { code: 'en' as Language, label: 'English', flag: '🇺🇸' },
  { code: 'es' as Language, label: 'Español', flag: '🇪🇸' },
];

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="relative group">
      <button className="flex items-center gap-2 p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all">
        <Globe className="w-5 h-5 text-white/70" />
        <span className="text-sm text-white/70 hidden sm:inline">
          {languages.find(l => l.code === language)?.flag}
        </span>
      </button>
      
      <div className="absolute right-0 top-full mt-2 w-48 bg-[#0D0D0D] border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-all first:rounded-t-xl last:rounded-b-xl ${
              language === lang.code ? 'bg-white/10 text-[#FF6F00]' : 'text-white/70'
            }`}
          >
            <span className="text-xl">{lang.flag}</span>
            <span className="text-sm font-medium">{lang.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

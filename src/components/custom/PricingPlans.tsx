"use client";

import { useState } from 'react';
import { Crown, Check, Zap } from 'lucide-react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { CheckoutModal } from './CheckoutModal';

export function PricingPlans() {
  const { plan, upgradeToPremium, getPriceDisplay, limits, usage } = useSubscription();
  const { t } = useLanguage();
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const handleUpgradeClick = () => {
    setCheckoutOpen(true);
  };

  return (
    <>
      <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Crown className="w-5 h-5 text-[#FFD600]" />
              {t('currentPlan')}
            </h2>
            <p className="text-white/60 text-sm mt-1">
              {plan === 'premium' ? t('premiumPlan') : t('freePlan')}
            </p>
          </div>
          {plan === 'free' && (
            <button
              onClick={handleUpgradeClick}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#FF6F00] to-[#FFD600] rounded-xl font-semibold text-[#0D0D0D] hover:opacity-90 transition-all text-sm"
            >
              <Zap className="w-4 h-4" />
              {t('upgradeToPremium')}
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Plano Gratuito */}
          <div className={`relative bg-white/5 border rounded-xl p-6 transition-all ${
            plan === 'free' ? 'border-[#FF6F00] ring-2 ring-[#FF6F00]/20' : 'border-white/10'
          }`}>
            {plan === 'free' && (
              <div className="absolute -top-3 left-4 px-3 py-1 bg-[#FF6F00] rounded-full text-xs font-bold text-[#0D0D0D]">
                {t('currentPlan')}
              </div>
            )}
            
            <h3 className="text-lg font-bold text-white mb-2">{t('freePlan')}</h3>
            <div className="text-3xl font-bold text-white mb-4">
              R$ 0<span className="text-sm text-white/50">/mês</span>
            </div>
            
            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-2 text-sm text-white/70">
                <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span>{limits.laudos} {t('laudosLimit')}</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-white/70">
                <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span>{limits.receitas} {t('receitasLimit')}</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-white/70">
                <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span>IA Básica</span>
              </li>
            </ul>

            {plan === 'free' && (
              <div className="text-xs text-white/50 bg-white/5 rounded-lg p-3">
                <div className="flex justify-between mb-1">
                  <span>Laudos: {usage.laudos}/{limits.laudos}</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-1.5 mb-2">
                  <div 
                    className="bg-[#FF6F00] h-1.5 rounded-full transition-all"
                    style={{ width: `${(usage.laudos / limits.laudos) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between mb-1">
                  <span>Receitas: {usage.receitas}/{limits.receitas}</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-1.5">
                  <div 
                    className="bg-[#FFD600] h-1.5 rounded-full transition-all"
                    style={{ width: `${(usage.receitas / limits.receitas) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Plano Premium */}
          <div className={`relative bg-gradient-to-br from-[#FF6F00]/10 to-[#FFD600]/10 border rounded-xl p-6 transition-all ${
            plan === 'premium' ? 'border-[#FFD600] ring-2 ring-[#FFD600]/20' : 'border-[#FF6F00]/30'
          }`}>
            {plan === 'premium' && (
              <div className="absolute -top-3 left-4 px-3 py-1 bg-gradient-to-r from-[#FF6F00] to-[#FFD600] rounded-full text-xs font-bold text-[#0D0D0D]">
                {t('currentPlan')}
              </div>
            )}
            
            <div className="flex items-center gap-2 mb-2">
              <Crown className="w-5 h-5 text-[#FFD600]" />
              <h3 className="text-lg font-bold text-white">{t('premiumPlan')}</h3>
            </div>
            
            <div className="text-3xl font-bold text-white mb-4">
              {getPriceDisplay()}<span className="text-sm text-white/50">/mês</span>
            </div>
            
            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-2 text-sm text-white/90">
                <Check className="w-4 h-4 text-[#FFD600] mt-0.5 flex-shrink-0" />
                <span className="font-semibold">{t('unlimited')} laudos</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-white/90">
                <Check className="w-4 h-4 text-[#FFD600] mt-0.5 flex-shrink-0" />
                <span className="font-semibold">{t('unlimited')} receitas</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-white/90">
                <Check className="w-4 h-4 text-[#FFD600] mt-0.5 flex-shrink-0" />
                <span className="font-semibold">IA Avançada Especialista</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-white/90">
                <Check className="w-4 h-4 text-[#FFD600] mt-0.5 flex-shrink-0" />
                <span className="font-semibold">Análise de Exames (Raio-X, TC, RM)</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-white/90">
                <Check className="w-4 h-4 text-[#FFD600] mt-0.5 flex-shrink-0" />
                <span className="font-semibold">Upload de Documentos</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-white/90">
                <Check className="w-4 h-4 text-[#FFD600] mt-0.5 flex-shrink-0" />
                <span className="font-semibold">Suporte Prioritário</span>
              </li>
            </ul>

            {plan === 'free' && (
              <button
                onClick={handleUpgradeClick}
                className="w-full py-3 bg-gradient-to-r from-[#FF6F00] to-[#FFD600] rounded-xl font-bold text-[#0D0D0D] hover:opacity-90 transition-all flex items-center justify-center gap-2"
              >
                <Zap className="w-5 h-5" />
                {t('upgradeToPremium')}
              </button>
            )}
          </div>
        </div>
      </div>

      <CheckoutModal 
        isOpen={checkoutOpen} 
        onClose={() => setCheckoutOpen(false)} 
      />
    </>
  );
}

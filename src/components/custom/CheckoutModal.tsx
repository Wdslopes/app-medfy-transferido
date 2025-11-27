"use client";

import { useState } from 'react';
import { X, Check, Crown, Zap } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
  const { t, language } = useLanguage();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('monthly');

  if (!isOpen) return null;

  // Preços por idioma/moeda
  const pricing = {
    'pt-BR': {
      monthly: { value: 97, currency: 'R$', symbol: 'BRL' },
      annually: { value: 697, currency: 'R$', symbol: 'BRL', monthlyEquivalent: 58.08 }
    },
    'pt-PT': {
      monthly: { value: 50, currency: '€', symbol: 'EUR' },
      annually: { value: 400, currency: '€', symbol: 'EUR', monthlyEquivalent: 33.33 }
    },
    'en': {
      monthly: { value: 50, currency: '$', symbol: 'USD' },
      annually: { value: 400, currency: '$', symbol: 'USD', monthlyEquivalent: 33.33 }
    },
    'es': {
      monthly: { value: 50, currency: '€', symbol: 'EUR' },
      annually: { value: 400, currency: '€', symbol: 'EUR', monthlyEquivalent: 33.33 }
    }
  };

  const currentPricing = pricing[language];
  const selectedPrice = billingCycle === 'monthly' ? currentPricing.monthly : currentPricing.annually;
  
  // Calcular economia no plano anual
  const monthlyCost = currentPricing.monthly.value * 12;
  const annualCost = currentPricing.annually.value;
  const savings = monthlyCost - annualCost;
  const savingsPercentage = Math.round((savings / monthlyCost) * 100);

  const benefits = [
    t('benefit1'),
    t('benefit2'),
    t('benefit3'),
    t('benefit4'),
    t('benefit5'),
    t('benefit6'),
    t('benefit7'),
    t('benefit8'),
  ];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0D0D0D] border border-white/10 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-[#FF6F00] to-[#FFD600] p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[#0D0D0D] flex items-center gap-2">
              <Crown className="w-6 h-6" />
              {t('checkoutTitle')}
            </h2>
            <p className="text-[#0D0D0D]/80 text-sm mt-1">{t('checkoutSubtitle')}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-black/10 rounded-xl transition-all"
          >
            <X className="w-5 h-5 text-[#0D0D0D]" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Seletor de Plano */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4">{t('selectPlan')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Plano Mensal */}
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`relative p-6 rounded-xl border-2 transition-all text-left ${
                  billingCycle === 'monthly'
                    ? 'border-[#FF6F00] bg-[#FF6F00]/10'
                    : 'border-white/10 bg-white/5 hover:border-white/20'
                }`}
              >
                {billingCycle === 'monthly' && (
                  <div className="absolute -top-3 left-4 px-3 py-1 bg-[#FF6F00] rounded-full text-xs font-bold text-[#0D0D0D]">
                    {t('currentPlan')}
                  </div>
                )}
                <div className="text-sm text-white/60 mb-2">{t('monthly')}</div>
                <div className="text-3xl font-bold text-white mb-1">
                  {currentPricing.monthly.currency}{currentPricing.monthly.value}
                  <span className="text-sm text-white/50">{t('perMonth')}</span>
                </div>
                <div className="text-xs text-white/40">Cobrado mensalmente</div>
              </button>

              {/* Plano Anual */}
              <button
                onClick={() => setBillingCycle('annually')}
                className={`relative p-6 rounded-xl border-2 transition-all text-left ${
                  billingCycle === 'annually'
                    ? 'border-[#FFD600] bg-[#FFD600]/10'
                    : 'border-white/10 bg-white/5 hover:border-white/20'
                }`}
              >
                <div className="absolute -top-3 right-4 px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full text-xs font-bold text-white">
                  {t('save')} {savingsPercentage}%
                </div>
                {billingCycle === 'annually' && (
                  <div className="absolute -top-3 left-4 px-3 py-1 bg-[#FFD600] rounded-full text-xs font-bold text-[#0D0D0D]">
                    {t('currentPlan')}
                  </div>
                )}
                <div className="text-sm text-white/60 mb-2">{t('annually')}</div>
                <div className="text-3xl font-bold text-white mb-1">
                  {currentPricing.annually.currency}{currentPricing.annually.value}
                  <span className="text-sm text-white/50">{t('perYear')}</span>
                </div>
                <div className="text-xs text-white/40">
                  {currentPricing.annually.currency}{currentPricing.annually.monthlyEquivalent.toFixed(2)}/mês
                </div>
              </button>
            </div>
          </div>

          {/* Benefícios */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-[#FFD600]" />
              {t('benefits')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="p-1 rounded-full bg-[#FFD600]/20 mt-0.5">
                    <Check className="w-4 h-4 text-[#FFD600]" />
                  </div>
                  <span className="text-sm text-white/80">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Resumo do Pedido */}
          <div className="bg-gradient-to-br from-[#FF6F00]/10 to-[#FFD600]/10 border border-[#FF6F00]/30 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Resumo do Pedido</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-white/80">
                <span>Plano Premium - {billingCycle === 'monthly' ? t('monthly') : t('annually')}</span>
                <span className="font-semibold">
                  {selectedPrice.currency}{selectedPrice.value}
                </span>
              </div>
              {billingCycle === 'annually' && (
                <div className="flex justify-between text-green-400 text-sm">
                  <span>Economia total</span>
                  <span className="font-semibold">
                    {currentPricing.monthly.currency}{savings.toFixed(2)}
                  </span>
                </div>
              )}
              <div className="border-t border-white/10 pt-3 flex justify-between text-white font-bold text-lg">
                <span>Total</span>
                <span>
                  {selectedPrice.currency}{selectedPrice.value}
                  {billingCycle === 'monthly' ? t('perMonth') : t('perYear')}
                </span>
              </div>
            </div>
          </div>

          {/* Botão de Assinatura */}
          <button
            onClick={() => {
              // Aqui você integraria com sistema de pagamento (Stripe, etc)
              alert(`Processando pagamento de ${selectedPrice.currency}${selectedPrice.value}...`);
            }}
            className="w-full py-4 bg-gradient-to-r from-[#FF6F00] to-[#FFD600] rounded-xl font-bold text-[#0D0D0D] hover:opacity-90 transition-all flex items-center justify-center gap-2 text-lg"
          >
            <Crown className="w-5 h-5" />
            {t('subscribe')}
          </button>

          <p className="text-center text-xs text-white/40">
            Pagamento seguro • Cancele quando quiser • Suporte 24/7
          </p>
        </div>
      </div>
    </div>
  );
}

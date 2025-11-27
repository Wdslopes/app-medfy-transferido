"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export type SubscriptionPlan = 'free' | 'trial' | 'premium';
export type Currency = 'USD' | 'EUR' | 'BRL';

interface SubscriptionLimits {
  laudos: number;
  receitas: number;
  unlimited: boolean;
}

interface SubscriptionContextType {
  plan: SubscriptionPlan;
  currency: Currency;
  limits: SubscriptionLimits;
  usage: {
    laudos: number;
    receitas: number;
  };
  trialDaysRemaining: number | null;
  isTrialExpired: boolean;
  isDeveloper: boolean;
  canCreate: (type: 'laudo' | 'receita') => boolean;
  upgradeToPremium: () => void;
  getPriceDisplay: () => string;
}

const FREE_LIMITS: SubscriptionLimits = {
  laudos: 5,
  receitas: 5,
  unlimited: false,
};

const TRIAL_LIMITS: SubscriptionLimits = {
  laudos: -1, // Ilimitado durante trial
  receitas: -1,
  unlimited: true,
};

const PREMIUM_LIMITS: SubscriptionLimits = {
  laudos: -1, // -1 significa ilimitado
  receitas: -1,
  unlimited: true,
};

const PREMIUM_PRICES = {
  USD: '$50.00',
  EUR: '€50.00',
  BRL: 'R$ 97,00',
};

const TRIAL_DURATION_DAYS = 7;

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const [plan, setPlan] = useState<SubscriptionPlan>('free');
  const [currency, setCurrency] = useState<Currency>('BRL');
  const [usage, setUsage] = useState({ laudos: 0, receitas: 0 });
  const [user, setUser] = useState<any>(null);
  const [trialDaysRemaining, setTrialDaysRemaining] = useState<number | null>(null);
  const [isTrialExpired, setIsTrialExpired] = useState(false);
  const [isDeveloper, setIsDeveloper] = useState(false);

  useEffect(() => {
    checkUser();
    loadSubscription();
    
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadSubscription();
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    
    // Verificar se é desenvolvedor - MÚLTIPLAS VERIFICAÇÕES
    if (user) {
      const devStatus = 
        user.email === 'dev@test.com' || 
        user.email?.includes('dev@') ||
        user.user_metadata?.is_developer === true ||
        user.app_metadata?.is_developer === true;
      
      setIsDeveloper(devStatus);
      
      console.log('🔍 Verificação de Desenvolvedor:', {
        email: user.email,
        isDev: devStatus,
        user_metadata: user.user_metadata,
        app_metadata: user.app_metadata
      });
    }
  };

  const loadSubscription = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Verificar se é desenvolvedor - PREMIUM DESBLOQUEADO TOTAL
      const devStatus = 
        user.email === 'dev@test.com' || 
        user.email?.includes('dev@') ||
        user.user_metadata?.is_developer === true ||
        user.app_metadata?.is_developer === true;
      
      setIsDeveloper(devStatus);

      if (devStatus) {
        console.log('🚀 MODO DESENVOLVEDOR ATIVADO - Acesso Premium Total Desbloqueado');
        setPlan('premium');
        setTrialDaysRemaining(null);
        setIsTrialExpired(false);
        return;
      }

      // Verificar plano salvo
      const savedPlan = localStorage.getItem(`medfy-plan-${user.id}`) as SubscriptionPlan;
      const trialStartDate = localStorage.getItem(`medfy-trial-start-${user.id}`);

      // Se já é premium, manter
      if (savedPlan === 'premium') {
        setPlan('premium');
        setTrialDaysRemaining(null);
        setIsTrialExpired(false);
        return;
      }

      // Verificar trial
      if (!trialStartDate) {
        // Novo usuário - iniciar trial de 7 dias
        const now = new Date();
        localStorage.setItem(`medfy-trial-start-${user.id}`, now.toISOString());
        setPlan('trial');
        setTrialDaysRemaining(TRIAL_DURATION_DAYS);
        setIsTrialExpired(false);
        console.log('🎉 Trial de 7 dias iniciado para novo usuário');
      } else {
        // Verificar se trial expirou
        const trialStart = new Date(trialStartDate);
        const now = new Date();
        const daysPassed = Math.floor((now.getTime() - trialStart.getTime()) / (1000 * 60 * 60 * 24));
        const daysRemaining = TRIAL_DURATION_DAYS - daysPassed;

        if (daysRemaining > 0) {
          // Trial ainda ativo
          setPlan('trial');
          setTrialDaysRemaining(daysRemaining);
          setIsTrialExpired(false);
          console.log(`⏰ Trial ativo - ${daysRemaining} dias restantes`);
        } else {
          // Trial expirado - bloquear funcionalidades premium
          setPlan('free');
          setTrialDaysRemaining(0);
          setIsTrialExpired(true);
          console.log('🔒 Trial expirado - Upgrade necessário para continuar');
        }
      }

      // Detectar moeda baseada no idioma/localização
      const savedCurrency = localStorage.getItem('medfy-currency') as Currency;
      if (savedCurrency) {
        setCurrency(savedCurrency);
      } else {
        // Auto-detectar baseado no navegador
        const locale = navigator.language;
        if (locale.startsWith('pt-BR')) setCurrency('BRL');
        else if (locale.startsWith('pt-PT') || locale.startsWith('es')) setCurrency('EUR');
        else setCurrency('USD');
      }

      // Calcular uso do mês atual
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const { data: documents } = await supabase
        .from('documents')
        .select('type')
        .eq('user_id', user.id)
        .gte('created_at', firstDayOfMonth.toISOString());

      if (documents) {
        const laudosCount = documents.filter(d => d.type === 'laudo').length;
        const receitasCount = documents.filter(d => d.type === 'receita').length;
        setUsage({ laudos: laudosCount, receitas: receitasCount });
      }
    } catch (error) {
      console.error('Erro ao carregar assinatura:', error);
    }
  };

  const limits = isDeveloper || plan === 'premium' 
    ? PREMIUM_LIMITS 
    : plan === 'trial' 
    ? TRIAL_LIMITS 
    : FREE_LIMITS;

  const canCreate = (type: 'laudo' | 'receita'): boolean => {
    if (!user) return false;
    
    // ✅ DESENVOLVEDOR TEM ACESSO TOTAL - SEM VERIFICAÇÕES
    if (isDeveloper) {
      console.log('✅ Desenvolvedor - Acesso liberado para:', type);
      return true;
    }
    
    // Premium tem acesso ilimitado
    if (plan === 'premium') return true;
    
    // Trial tem acesso ilimitado (se não expirou)
    if (plan === 'trial' && !isTrialExpired) return true;
    
    // Free tem limites
    const currentUsage = type === 'laudo' ? usage.laudos : usage.receitas;
    const limit = type === 'laudo' ? limits.laudos : limits.receitas;
    
    return currentUsage < limit;
  };

  const upgradeToPremium = () => {
    if (!user) {
      alert('Faça login para fazer upgrade');
      return;
    }
    
    // Aqui você integraria com um sistema de pagamento (Stripe, etc)
    // Por enquanto, vamos simular o upgrade
    setPlan('premium');
    localStorage.setItem(`medfy-plan-${user.id}`, 'premium');
    setIsTrialExpired(false);
    setTrialDaysRemaining(null);
    alert('Upgrade para Premium realizado com sucesso! Agora você tem acesso ilimitado.');
  };

  const getPriceDisplay = () => {
    return PREMIUM_PRICES[currency];
  };

  return (
    <SubscriptionContext.Provider 
      value={{ 
        plan, 
        currency, 
        limits, 
        usage, 
        trialDaysRemaining,
        isTrialExpired,
        isDeveloper,
        canCreate, 
        upgradeToPremium,
        getPriceDisplay 
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within SubscriptionProvider');
  }
  return context;
}

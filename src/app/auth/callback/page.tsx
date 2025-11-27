"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Confirmando seu e-mail...');

  useEffect(() => {
    handleAuthCallback();
  }, []);

  const handleAuthCallback = async () => {
    try {
      // Pegar o hash da URL (contém o token)
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      const type = hashParams.get('type');

      if (!accessToken) {
        throw new Error('Token de acesso não encontrado');
      }

      // Definir a sessão com os tokens
      const { data, error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken || '',
      });

      if (error) throw error;

      if (data.user) {
        // Iniciar trial de 7 dias automaticamente
        const now = new Date();
        localStorage.setItem(`medfy-trial-start-${data.user.id}`, now.toISOString());

        setStatus('success');
        setMessage('E-mail confirmado com sucesso! Redirecionando...');

        // Redirecionar para a página inicial após 2 segundos
        setTimeout(() => {
          router.push('/');
        }, 2000);
      }
    } catch (error: any) {
      console.error('Erro ao confirmar e-mail:', error);
      setStatus('error');
      setMessage(error.message || 'Erro ao confirmar e-mail. Tente novamente.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="w-16 h-16 text-[#FF6F00] animate-spin mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Confirmando E-mail</h2>
            <p className="text-white/60">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">E-mail Confirmado! 🎉</h2>
            <p className="text-white/60 mb-4">{message}</p>
            <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-500/30 rounded-xl p-4">
              <p className="text-blue-400 text-sm font-semibold">✅ Seu teste grátis de 7 dias está ativo!</p>
              <p className="text-white/60 text-xs mt-1">Acesso ilimitado a todas as funcionalidades premium</p>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Erro na Confirmação</h2>
            <p className="text-white/60 mb-6">{message}</p>
            <button
              onClick={() => router.push('/auth')}
              className="w-full py-3 bg-gradient-to-r from-[#FF6F00] to-[#FFD600] rounded-xl font-semibold text-[#0D0D0D] hover:opacity-90 transition-all"
            >
              Voltar para Login
            </button>
          </>
        )}
      </div>
    </div>
  );
}

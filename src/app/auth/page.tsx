"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, Sparkles, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { ForgotPassword } from '@/components/custom/ForgotPassword';
import { OnboardingQuiz, type QuizData } from '@/components/custom/OnboardingQuiz';

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [quizOpen, setQuizOpen] = useState(false);
  const [pendingUser, setPendingUser] = useState<any>(null);

  // Login de desenvolvedor - MÚLTIPLOS EMAILS ACEITOS
  const DEV_EMAILS = ['dev@test.com', 'dev@medfy.com', 'developer@test.com'];
  const DEV_PASSWORD = 'dev123456';

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      router.push('/');
    }
  };

  const handleDevLogin = async () => {
    const devEmail = DEV_EMAILS[0]; // Usar primeiro email da lista
    setEmail(devEmail);
    setPassword(DEV_PASSWORD);
    
    try {
      setLoading(true);
      setError('');

      // Tentar fazer login
      let { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: devEmail,
        password: DEV_PASSWORD,
      });

      // Se não existir, criar conta de desenvolvedor
      if (signInError) {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: devEmail,
          password: DEV_PASSWORD,
          options: {
            data: {
              full_name: 'Desenvolvedor',
              is_developer: true
            },
            emailRedirectTo: `${window.location.origin}/auth/callback`
          }
        });

        if (signUpError) throw signUpError;

        // Fazer login após criar
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
          email: devEmail,
          password: DEV_PASSWORD,
        });

        if (loginError) throw loginError;
        data = loginData;
      }

      if (data.user) {
        // Iniciar trial de 7 dias automaticamente
        const now = new Date();
        localStorage.setItem(`medfy-trial-start-${data.user.id}`, now.toISOString());
        router.push('/');
      }
    } catch (error: any) {
      setError(error.message || 'Erro ao fazer login de desenvolvedor');
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Preencha todos os campos');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      if (mode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          // Mensagens de erro mais amigáveis
          if (error.message.includes('Invalid login credentials')) {
            throw new Error('E-mail ou senha incorretos. Verifique seus dados e tente novamente.');
          }
          if (error.message.includes('Email not confirmed')) {
            throw new Error('Por favor, confirme seu e-mail antes de fazer login. Verifique sua caixa de entrada.');
          }
          throw error;
        }

        if (data.user) {
          router.push('/');
        }
      } else {
        // Signup - criar conta e iniciar trial
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: email.split('@')[0], // Nome temporário
            },
            emailRedirectTo: `${window.location.origin}/auth/callback`
          }
        });

        if (error) throw error;

        if (data.user) {
          // Iniciar trial de 7 dias automaticamente
          const now = new Date();
          localStorage.setItem(`medfy-trial-start-${data.user.id}`, now.toISOString());
          
          // Mostrar mensagem de sucesso
          setSuccess('Conta criada com sucesso! Enviamos um e-mail de confirmação para você. Por favor, verifique sua caixa de entrada e clique no link para ativar sua conta e começar seu teste grátis de 7 dias.');
          
          // Limpar formulário
          setEmail('');
          setPassword('');
          
          // Não abrir quiz ainda - usuário precisa confirmar e-mail primeiro
          // setPendingUser(data.user);
          // setQuizOpen(true);
        }
      }
    } catch (error: any) {
      console.error('Erro de autenticação:', error);
      setError(error.message || 'Erro ao autenticar');
    } finally {
      setLoading(false);
    }
  };

  const handleQuizComplete = async (quizData: QuizData) => {
    // Quiz já salva os dados no perfil
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FF6F00] to-[#FFD600] mb-4">
            <Sparkles className="w-8 h-8 text-[#0D0D0D]" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#FF6F00] to-[#FFD600] bg-clip-text text-transparent">
            Medfy
          </h1>
          <p className="text-white/60 mt-2">
            {mode === 'login' ? 'Entre na sua conta' : 'Crie sua conta'}
          </p>
          {mode === 'signup' && (
            <div className="mt-3 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-500/30 rounded-xl p-3">
              <p className="text-blue-400 text-sm font-semibold">🎉 7 dias de teste grátis!</p>
              <p className="text-white/60 text-xs mt-1">Acesso ilimitado a todas as funcionalidades premium</p>
            </div>
          )}
        </div>

        {/* Form */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                E-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-[#FF6F00] focus:ring-1 focus:ring-[#FF6F00] transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-[#FF6F00] focus:ring-1 focus:ring-[#FF6F00] transition-all"
                  required
                />
              </div>
              {mode === 'signup' && (
                <p className="text-xs text-white/40 mt-1">Mínimo de 6 caracteres</p>
              )}
            </div>

            {mode === 'login' && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setForgotPasswordOpen(true)}
                  className="text-sm text-[#FF6F00] hover:text-[#FFD600] transition-colors"
                >
                  Esqueci minha senha
                </button>
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-sm text-red-400 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-sm text-green-400">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold mb-1">✅ E-mail de confirmação enviado!</p>
                    <p className="text-green-300/80">{success}</p>
                    <p className="text-green-300/60 text-xs mt-2">
                      💡 Não recebeu? Verifique sua caixa de SPAM ou lixo eletrônico.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-[#FF6F00] to-[#FFD600] rounded-xl font-semibold text-[#0D0D0D] hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Carregando...' : mode === 'login' ? 'Entrar' : 'Criar Conta Grátis'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={() => {
                setMode(mode === 'login' ? 'signup' : 'login');
                setError('');
                setSuccess('');
              }}
              className="text-sm text-white/60 hover:text-white transition-colors"
            >
              {mode === 'login' 
                ? 'Não tem conta? Criar conta grátis' 
                : 'Já tem conta? Entrar'}
            </button>
          </div>

          {/* Login de Desenvolvedor */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <button
              onClick={handleDevLogin}
              disabled={loading}
              className="w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <User className="w-5 h-5" />
              Login de Desenvolvedor
            </button>
            <p className="text-xs text-white/40 text-center mt-2">
              Acesso rápido para testes (dev@test.com)
            </p>
          </div>
        </div>

        {/* Voltar */}
        <button
          onClick={() => router.push('/')}
          className="mt-6 w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl font-semibold text-white transition-all flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          Voltar ao início
        </button>
      </div>

      <ForgotPassword 
        isOpen={forgotPasswordOpen}
        onClose={() => setForgotPasswordOpen(false)}
        onBackToLogin={() => setForgotPasswordOpen(false)}
      />

      <OnboardingQuiz
        isOpen={quizOpen}
        onClose={() => setQuizOpen(false)}
        onComplete={handleQuizComplete}
      />
    </div>
  );
}

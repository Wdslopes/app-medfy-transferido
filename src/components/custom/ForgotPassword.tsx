"use client";

import { useState } from 'react';
import { X, Mail, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface ForgotPasswordProps {
  isOpen: boolean;
  onClose: () => void;
  onBackToLogin: () => void;
}

export function ForgotPassword({ isOpen, onClose, onBackToLogin }: ForgotPasswordProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Por favor, insira seu e-mail');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setSuccess(true);
    } catch (error: any) {
      console.error('Erro ao enviar e-mail:', error);
      setError(error.message || 'Erro ao enviar e-mail de redefinição');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0D0D0D] border border-white/10 rounded-2xl max-w-md w-full">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Redefinir Senha</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-xl transition-all"
          >
            <X className="w-5 h-5 text-white/70" />
          </button>
        </div>

        <div className="p-6">
          {success ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-white">E-mail Enviado!</h3>
              <div className="space-y-3">
                <p className="text-white/60 text-sm">
                  Enviamos um link de redefinição para <strong className="text-white">{email}</strong>
                </p>
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-left">
                  <p className="text-blue-400 text-sm font-semibold mb-2">📧 Verifique sua caixa de entrada</p>
                  <ul className="text-white/60 text-xs space-y-1">
                    <li>• Verifique também a pasta de SPAM/Lixo Eletrônico</li>
                    <li>• O e-mail pode levar alguns minutos para chegar</li>
                    <li>• Clique no link do e-mail para redefinir sua senha</li>
                  </ul>
                </div>
              </div>
              <button
                onClick={onBackToLogin}
                className="w-full py-3 bg-gradient-to-r from-[#FF6F00] to-[#FFD600] rounded-xl font-semibold text-[#0D0D0D] hover:opacity-90 transition-all"
              >
                Voltar ao Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <p className="text-white/60 text-sm">
                Digite seu e-mail e enviaremos um link para redefinir sua senha.
              </p>

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

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-sm text-red-400 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold mb-1">Erro ao enviar e-mail</p>
                    <p className="text-xs">{error}</p>
                  </div>
                </div>
              )}

              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 text-xs text-yellow-400">
                <p className="font-semibold mb-1">⚠️ Importante:</p>
                <p>Se o e-mail não chegar, verifique se o Supabase está configurado para enviar e-mails. Configure o SMTP no dashboard do Supabase em Authentication → Email Templates.</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-[#FF6F00] to-[#FFD600] rounded-xl font-semibold text-[#0D0D0D] hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-[#0D0D0D]/30 border-t-[#0D0D0D] rounded-full animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Mail className="w-5 h-5" />
                    Enviar Link de Redefinição
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onBackToLogin}
                className="w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl font-semibold text-white transition-all flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" />
                Voltar ao Login
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

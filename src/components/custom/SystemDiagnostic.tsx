"use client";

import { useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface DiagnosticResult {
  name: string;
  status: 'success' | 'error' | 'warning' | 'checking';
  message: string;
  details?: string;
}

export function SystemDiagnostic() {
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [checking, setChecking] = useState(false);

  const runDiagnostic = async () => {
    setChecking(true);
    const diagnostics: DiagnosticResult[] = [];

    // 1. Verificar autenticação
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      
      if (user) {
        diagnostics.push({
          name: 'Autenticação',
          status: 'success',
          message: 'Usuário autenticado',
          details: `Email: ${user.email}`
        });
      } else {
        diagnostics.push({
          name: 'Autenticação',
          status: 'error',
          message: 'Usuário não autenticado',
          details: 'Faça login para continuar'
        });
      }
    } catch (error: any) {
      diagnostics.push({
        name: 'Autenticação',
        status: 'error',
        message: 'Erro ao verificar autenticação',
        details: error.message
      });
    }

    // 2. Verificar Supabase Storage
    try {
      const { data, error } = await supabase.storage.listBuckets();
      
      if (error) throw error;
      
      const medicalBucket = data?.find(b => b.id === 'medical-documents');
      
      if (medicalBucket) {
        diagnostics.push({
          name: 'Supabase Storage',
          status: 'success',
          message: 'Bucket "medical-documents" encontrado',
          details: `Público: ${medicalBucket.public ? 'Sim' : 'Não'}`
        });
      } else {
        diagnostics.push({
          name: 'Supabase Storage',
          status: 'error',
          message: 'Bucket "medical-documents" não encontrado',
          details: 'Execute o SQL de configuração (veja SETUP_SUPABASE_STORAGE.md)'
        });
      }
    } catch (error: any) {
      diagnostics.push({
        name: 'Supabase Storage',
        status: 'error',
        message: 'Erro ao verificar Storage',
        details: error.message
      });
    }

    // 3. Verificar OpenAI API Key
    const openaiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
    if (openaiKey && openaiKey.startsWith('sk-')) {
      diagnostics.push({
        name: 'OpenAI API Key',
        status: 'success',
        message: 'API Key configurada',
        details: `Key: ${openaiKey.substring(0, 10)}...`
      });
    } else {
      diagnostics.push({
        name: 'OpenAI API Key',
        status: 'warning',
        message: 'API Key não configurada ou inválida',
        details: 'Configure NEXT_PUBLIC_OPENAI_API_KEY no .env.local ou via interface'
      });
    }

    // 4. Verificar Supabase URL e Key
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (supabaseUrl && supabaseKey && !supabaseUrl.includes('placeholder')) {
      diagnostics.push({
        name: 'Supabase Config',
        status: 'success',
        message: 'Configuração do Supabase OK',
        details: `URL: ${supabaseUrl}`
      });
    } else {
      diagnostics.push({
        name: 'Supabase Config',
        status: 'error',
        message: 'Supabase não configurado',
        details: 'Configure as variáveis de ambiente do Supabase'
      });
    }

    setResults(diagnostics);
    setChecking(false);
  };

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-400" />;
      case 'checking':
        return <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />;
    }
  };

  const getStatusColor = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return 'bg-green-500/10 border-green-500/30';
      case 'error':
        return 'bg-red-500/10 border-red-500/30';
      case 'warning':
        return 'bg-yellow-500/10 border-yellow-500/30';
      case 'checking':
        return 'bg-blue-500/10 border-blue-500/30';
    }
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-white">Diagnóstico do Sistema</h3>
          <p className="text-sm text-white/60">Verifique a configuração do Supabase e OpenAI</p>
        </div>
        <button
          onClick={runDiagnostic}
          disabled={checking}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#FF6F00] to-[#FFD600] rounded-lg font-semibold text-[#0D0D0D] hover:opacity-90 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} />
          {checking ? 'Verificando...' : 'Executar Diagnóstico'}
        </button>
      </div>

      {results.length > 0 && (
        <div className="space-y-3">
          {results.map((result, index) => (
            <div
              key={index}
              className={`p-4 border rounded-lg ${getStatusColor(result.status)}`}
            >
              <div className="flex items-start gap-3">
                {getStatusIcon(result.status)}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold text-white">{result.name}</h4>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      result.status === 'success' ? 'bg-green-500/20 text-green-400' :
                      result.status === 'error' ? 'bg-red-500/20 text-red-400' :
                      result.status === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {result.status === 'success' ? 'OK' :
                       result.status === 'error' ? 'ERRO' :
                       result.status === 'warning' ? 'AVISO' :
                       'VERIFICANDO'}
                    </span>
                  </div>
                  <p className="text-sm text-white/80">{result.message}</p>
                  {result.details && (
                    <p className="text-xs text-white/60 mt-1">{result.details}</p>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Resumo */}
          <div className="mt-4 p-4 bg-white/5 border border-white/10 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/60">Status Geral:</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-green-400">
                  {results.filter(r => r.status === 'success').length} OK
                </span>
                <span className="text-sm text-yellow-400">
                  {results.filter(r => r.status === 'warning').length} Avisos
                </span>
                <span className="text-sm text-red-400">
                  {results.filter(r => r.status === 'error').length} Erros
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {results.length === 0 && !checking && (
        <div className="text-center py-8">
          <p className="text-white/60">Clique em "Executar Diagnóstico" para verificar a configuração</p>
        </div>
      )}
    </div>
  );
}

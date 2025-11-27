"use client";

import { useState, useEffect } from 'react';
import { Send, Sparkles, FileText, Loader2, AlertCircle, Paperclip, Image as ImageIcon, FileUp } from 'lucide-react';
import { FileUpload } from './FileUpload';
import { analyzeMedicalDocument, MedicalAnalysisRequest } from '@/lib/medical-ai';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/lib/supabase';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  type?: 'text' | 'analysis';
  attachments?: { url: string; name: string; type: string }[];
}

interface MedicalChatProps {
  initialContext?: string;
}

export function MedicalChat({ initialContext }: MedicalChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{ url: string; name: string; type: string }[]>([]);
  const { plan, isDeveloper } = useSubscription();
  const { t } = useLanguage();
  const [userEmail, setUserEmail] = useState<string>('');

  // Verificar se é desenvolvedor - VERIFICAÇÃO APRIMORADA
  useEffect(() => {
    const checkDeveloper = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        setUserEmail(user.email || '');
        
        console.log('🔍 MedicalChat - Verificação de Desenvolvedor:', {
          email: user.email,
          isDeveloperFromContext: isDeveloper,
          metadata: user.user_metadata
        });
      }
    };
    
    checkDeveloper();
    
    // Revalidar quando houver mudança de autenticação
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUserEmail(session.user.email || '');
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [isDeveloper]);

  // Adicionar mensagem inicial quando há contexto
  useEffect(() => {
    if (initialContext && messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: initialContext,
        type: 'text'
      }]);
    }
  }, [initialContext]);

  const handleFileUploaded = (url: string, name: string, type: string) => {
    const newFile = { url, name, type };
    setUploadedFiles(prev => [...prev, newFile]);
    
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: `✅ Arquivo "${name}" anexado com sucesso! ${uploadedFiles.length > 0 ? `Total de ${uploadedFiles.length + 1} arquivo(s) anexado(s).` : ''} Agora me conte sobre o paciente e o que você gostaria que eu analisasse.`,
      type: 'text'
    }]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleAnalyze = async () => {
    if (uploadedFiles.length === 0) {
      alert('Por favor, anexe pelo menos um documento médico primeiro');
      return;
    }

    // ✅ DESENVOLVEDOR TEM ACESSO TOTAL - SEM BLOQUEIOS
    if (!isDeveloper && plan !== 'premium' && plan !== 'trial') {
      alert('A análise de documentos médicos está disponível apenas no plano Premium');
      return;
    }

    if (!input.trim()) {
      alert('Por favor, forneça informações sobre o paciente ou perguntas sobre o exame');
      return;
    }

    setAnalyzing(true);
    
    // Adicionar mensagem do usuário com anexos
    setMessages(prev => [...prev, {
      role: 'user',
      content: input,
      type: 'text',
      attachments: [...uploadedFiles]
    }]);

    try {
      // Analisar o primeiro arquivo (ou você pode fazer análise múltipla)
      const mainFile = uploadedFiles[0];
      
      const analysisRequest: MedicalAnalysisRequest = {
        documentType: detectDocumentType(mainFile.name),
        imageUrl: mainFile.url,
        patientInfo: {
          name: 'Paciente',
          age: '0',
          sex: 'M'
        },
        examDetails: input,
        specificQuestions: input
      };

      const analysis = await analyzeMedicalDocument(analysisRequest);

      const analysisMessage = `
🔬 **ANÁLISE MÉDICA ESPECIALIZADA**

**DOCUMENTO ANALISADO:** ${mainFile.name}
${uploadedFiles.length > 1 ? `**ARQUIVOS ADICIONAIS:** ${uploadedFiles.slice(1).map(f => f.name).join(', ')}` : ''}

**ACHADOS PRINCIPAIS:**
${analysis.findings.map(f => `• ${f}`).join('\n')}

**INTERPRETAÇÃO CLÍNICA:**
${analysis.analysis}

**RECOMENDAÇÕES:**
${analysis.recommendations.map(r => `• ${r}`).join('\n')}

**NÍVEL DE URGÊNCIA:** ${getUrgencyLabel(analysis.urgency)}
**CONFIANÇA DA ANÁLISE:** ${(analysis.confidence * 100).toFixed(0)}%

⚠️ *Esta análise é um auxílio diagnóstico. Sempre correlacione com avaliação clínica completa do paciente.*
`;

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: analysisMessage,
        type: 'analysis'
      }]);

      setInput('');
      setUploadedFiles([]);
    } catch (error: any) {
      console.error('Erro na análise:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `❌ Erro ao analisar documento: ${error.message}. Verifique se a API Key da OpenAI está configurada.`,
        type: 'text'
      }]);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSend = () => {
    if (!input.trim()) return;

    if (uploadedFiles.length > 0) {
      handleAnalyze();
    } else {
      // Chat normal sem documento
      setMessages(prev => [...prev, {
        role: 'user',
        content: input,
        type: 'text'
      }]);

      // Resposta simples
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '📎 Para análise médica especializada, por favor anexe documentos (Raio-X, Tomografia, Exames Laboratoriais, Laudos, etc.) usando o botão de anexo abaixo e forneça informações sobre o paciente.',
        type: 'text'
      }]);

      setInput('');
    }
  };

  // ✅ DESENVOLVEDOR TEM ACESSO TOTAL
  const hasPremiumAccess = isDeveloper || plan === 'premium' || plan === 'trial';

  return (
    <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl overflow-hidden">
      {/* Header com Badge DEV MODE Destacado */}
      <div className="bg-gradient-to-r from-[#FF6F00]/20 to-[#FFD600]/20 border-b border-white/10 p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-[#FF6F00] to-[#FFD600]">
            <Sparkles className="w-5 h-5 text-[#0D0D0D]" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-white">{t('aiAssistant')}</h3>
            <p className="text-xs text-white/60">Análise de Exames e Documentos Médicos</p>
          </div>
          
          {/* Badge DEV MODE - SEMPRE VISÍVEL quando é desenvolvedor */}
          {isDeveloper && (
            <div className="px-4 py-2 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 rounded-full shadow-lg shadow-purple-500/50 animate-pulse">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
                <span className="text-sm font-black text-white tracking-wider">DEV MODE</span>
              </div>
            </div>
          )}
          
          {/* Badge Premium/Trial - apenas para não-desenvolvedores */}
          {!isDeveloper && plan === 'premium' && (
            <div className="px-3 py-1 bg-gradient-to-r from-[#FF6F00] to-[#FFD600] rounded-full text-xs font-bold text-[#0D0D0D]">
              PREMIUM
            </div>
          )}
          
          {!isDeveloper && plan === 'trial' && (
            <div className="px-3 py-1 bg-blue-500/30 rounded-full text-xs font-semibold text-blue-400">
              TRIAL
            </div>
          )}
        </div>
        
        {/* Informação adicional para desenvolvedor */}
        {isDeveloper && (
          <div className="mt-3 px-3 py-2 bg-green-500/10 border border-green-500/30 rounded-lg">
            <p className="text-xs text-green-400 font-semibold">
              ✓ Acesso Total Liberado | Email: {userEmail} | Upload e análise de documentos desbloqueados
            </p>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="h-96 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="p-4 rounded-full bg-gradient-to-br from-[#FF6F00]/20 to-[#FFD600]/20 mb-4">
              <FileText className="w-8 h-8 text-[#FF6F00]" />
            </div>
            <h4 className="text-lg font-semibold text-white mb-2">
              Assistente Médico com IA
            </h4>
            <p className="text-sm text-white/60 max-w-md mb-4">
              📎 Anexe exames médicos (Raio-X, Tomografia, Ressonância, Exames Laboratoriais, Laudos, Fotos) 
              e receba análises especializadas em segundos
            </p>
            <div className="flex items-center gap-2 text-xs text-white/50">
              <Paperclip className="w-4 h-4" />
              <span>Suporta: PDF, Imagens (JPG, PNG), Documentos</span>
            </div>
            {isDeveloper && (
              <div className="mt-4 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl">
                <p className="text-green-400 text-sm font-bold">
                  🚀 Modo Desenvolvedor Ativo - Todas as funcionalidades liberadas
                </p>
              </div>
            )}
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-xl p-4 ${
                  message.role === 'user'
                    ? 'bg-gradient-to-br from-[#FF6F00] to-[#FFD600] text-[#0D0D0D]'
                    : message.type === 'analysis'
                    ? 'bg-gradient-to-br from-green-500/20 to-blue-500/20 border border-green-500/30 text-white'
                    : 'bg-white/10 text-white'
                }`}
              >
                {message.type === 'analysis' ? (
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {message.content}
                  </div>
                ) : (
                  <>
                    <p className="text-sm">{message.content}</p>
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {message.attachments.map((file, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs bg-black/20 rounded-lg p-2">
                            {file.type.startsWith('image/') ? (
                              <ImageIcon className="w-4 h-4" />
                            ) : (
                              <FileUp className="w-4 h-4" />
                            )}
                            <span className="truncate">{file.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          ))
        )}

        {analyzing && (
          <div className="flex justify-start">
            <div className="bg-white/10 rounded-xl p-4 flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-[#FF6F00] animate-spin" />
              <span className="text-sm text-white">Analisando documento médico com IA especializada...</span>
            </div>
          </div>
        )}
      </div>

      {/* Arquivos Anexados */}
      {uploadedFiles.length > 0 && (
        <div className="border-t border-white/10 p-4 bg-white/5">
          <p className="text-xs text-white/60 mb-2">Arquivos anexados ({uploadedFiles.length}):</p>
          <div className="flex flex-wrap gap-2">
            {uploadedFiles.map((file, index) => (
              <div key={index} className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2 text-sm">
                {file.type.startsWith('image/') ? (
                  <ImageIcon className="w-4 h-4 text-[#FF6F00]" />
                ) : (
                  <FileUp className="w-4 h-4 text-[#FF6F00]" />
                )}
                <span className="text-white/80 truncate max-w-[150px]">{file.name}</span>
                <button
                  onClick={() => removeFile(index)}
                  className="text-red-400 hover:text-red-300 transition-colors"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Area - SEMPRE VISÍVEL */}
      <div className="border-t border-white/10 p-4 bg-white/5">
        <FileUpload onFileUploaded={handleFileUploaded} />
        {isDeveloper && (
          <p className="text-xs text-green-400 mt-2 text-center">
            ✓ Upload liberado - Modo Desenvolvedor | Anexe quantos arquivos precisar
          </p>
        )}
        {!hasPremiumAccess && (
          <p className="text-xs text-yellow-400 mt-2 text-center">
            ⚠️ Análise de documentos disponível apenas no plano Premium
          </p>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-white/10 p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder={uploadedFiles.length > 0 
              ? "Descreva o caso clínico ou faça perguntas sobre os exames anexados..." 
              : "Digite sua mensagem ou anexe documentos médicos para análise..."}
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-[#FF6F00] focus:ring-1 focus:ring-[#FF6F00]"
            disabled={analyzing}
          />
          <button
            onClick={handleSend}
            disabled={analyzing || !input.trim()}
            className="px-4 py-3 bg-gradient-to-r from-[#FF6F00] to-[#FFD600] rounded-xl font-semibold text-[#0D0D0D] hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function detectDocumentType(fileName: string): MedicalAnalysisRequest['documentType'] {
  const lower = fileName.toLowerCase();
  if (lower.includes('raio') || lower.includes('rx') || lower.includes('xray')) return 'raio-x';
  if (lower.includes('tomo') || lower.includes('tc') || lower.includes('ct')) return 'tomografia';
  if (lower.includes('ressonancia') || lower.includes('rm') || lower.includes('mri')) return 'ressonancia';
  if (lower.includes('ultra') || lower.includes('us')) return 'ultrassom';
  return 'exame-laboratorial';
}

function getUrgencyLabel(urgency: 'low' | 'medium' | 'high'): string {
  const labels = {
    low: '🟢 Baixa',
    medium: '🟡 Média',
    high: '🔴 Alta'
  };
  return labels[urgency];
}

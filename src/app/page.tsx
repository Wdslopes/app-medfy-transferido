"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  FileText, 
  Pill, 
  FileBarChart, 
  LayoutDashboard,
  Sparkles,
  TrendingUp,
  Clock,
  CheckCircle2,
  Plus,
  Search,
  Bell,
  User,
  ChevronRight,
  LogOut,
  X,
  Loader2,
  Eye,
  MessageSquare,
  AlertCircle
} from "lucide-react";
import { supabase, type Document } from "@/lib/supabase";
import { generateLaudo, generateReceita, generateRelatorio } from "@/lib/openai";
import { LanguageSelector } from "@/components/custom/LanguageSelector";
import { PricingPlans } from "@/components/custom/PricingPlans";
import { MedicalChat } from "@/components/custom/MedicalChat";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSubscription } from "@/contexts/SubscriptionContext";

type TabType = "dashboard" | "laudos" | "receitas" | "relatorios" | "ai-chat";
type ModalType = "laudo" | "receita" | "relatorio" | null;

interface StatCard {
  title: string;
  value: string;
  change: string;
  icon: React.ReactNode;
  trend: "up" | "down";
}

export default function Home() {
  const router = useRouter();
  const { t } = useLanguage();
  const { canCreate, plan, trialDaysRemaining, isTrialExpired, isDeveloper } = useSubscription();
  
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState<ModalType>(null);
  const [modalSubtype, setModalSubtype] = useState("");
  const [generating, setGenerating] = useState(false);
  const [viewingDocument, setViewingDocument] = useState<Document | null>(null);
  const [chatContext, setChatContext] = useState<string>("");

  // Estados dos formulários
  const [laudoForm, setLaudoForm] = useState({
    paciente: "",
    idade: "",
    sexo: "M",
    queixaPrincipal: "",
    historico: "",
    exame: "",
    observacoes: ""
  });

  const [receitaForm, setReceitaForm] = useState({
    paciente: "",
    idade: "",
    sexo: "M",
    diagnostico: "",
    medicamentos: "",
    posologia: "",
    duracao: "",
    observacoes: ""
  });

  const [relatorioForm, setRelatorioForm] = useState({
    paciente: "",
    idade: "",
    sexo: "M",
    motivoInternacao: "",
    evolucao: "",
    procedimentos: "",
    condicaoAlta: "",
    recomendacoes: "",
    observacoes: ""
  });

  // Carregar usuário e documentos
  useEffect(() => {
    checkUser();
    loadDocuments();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadDocuments();
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setDocuments([]);
        return;
      }

      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Erro ao carregar documentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setDocuments([]);
  };

  const handleAuthClick = () => {
    router.push('/auth');
  };

  const openModal = (type: ModalType, subtype: string) => {
    if (!user) {
      alert(t('loginRequired'));
      return;
    }

    // ✅ DESENVOLVEDOR TEM ACESSO TOTAL - ZERO VERIFICAÇÕES
    if (isDeveloper) {
      console.log('✅ Desenvolvedor abrindo modal:', type, subtype);
      setModalOpen(type);
      setModalSubtype(subtype);
      return;
    }

    // Verificar limites do plano apenas para não-desenvolvedores
    if (type === 'laudo' && !canCreate('laudo')) {
      alert('Limite de laudos atingido. Faça upgrade para Premium!');
      return;
    }
    if (type === 'receita' && !canCreate('receita')) {
      alert('Limite de receitas atingido. Faça upgrade para Premium!');
      return;
    }

    setModalOpen(type);
    setModalSubtype(subtype);
    
    // Resetar formulários
    setLaudoForm({
      paciente: "",
      idade: "",
      sexo: "M",
      queixaPrincipal: "",
      historico: "",
      exame: "",
      observacoes: ""
    });
    setReceitaForm({
      paciente: "",
      idade: "",
      sexo: "M",
      diagnostico: "",
      medicamentos: "",
      posologia: "",
      duracao: "",
      observacoes: ""
    });
    setRelatorioForm({
      paciente: "",
      idade: "",
      sexo: "M",
      motivoInternacao: "",
      evolucao: "",
      procedimentos: "",
      condicaoAlta: "",
      recomendacoes: "",
      observacoes: ""
    });
  };

  const openChatForExam = (examType: string) => {
    if (!user) {
      alert(t('loginRequired'));
      return;
    }

    // ✅ DESENVOLVEDOR TEM ACESSO TOTAL - ZERO VERIFICAÇÕES
    if (isDeveloper) {
      console.log('✅ Desenvolvedor acessando análise de exame:', examType);
    } else {
      // Para não-desenvolvedores, verificar plano
      if (!canCreate('laudo')) {
        alert('Análise de exames disponível apenas para usuários Premium. Faça upgrade!');
        return;
      }
    }

    // Definir contexto específico para o tipo de exame
    const contextMessages: { [key: string]: string } = {
      "Raio-X Tórax": "Análise de Raio-X de Tórax - Por favor, anexe a imagem do raio-x para análise detalhada.",
      "Ultrassom Abdominal": "Análise de Ultrassom Abdominal - Anexe as imagens do ultrassom para avaliação completa.",
      "Ressonância Magnética": "Análise de Ressonância Magnética - Envie as imagens da ressonância para diagnóstico preciso.",
      "Tomografia": "Análise de Tomografia Computadorizada - Anexe as imagens da tomografia para análise especializada.",
      "Ecocardiograma": "Análise de Ecocardiograma - Envie as imagens e relatórios para avaliação cardíaca.",
      "Mamografia": "Análise de Mamografia - Anexe as imagens mamográficas para análise detalhada."
    };

    setChatContext(contextMessages[examType] || `Análise de ${examType}`);
    setActiveTab("ai-chat");
  };

  const closeModal = () => {
    setModalOpen(null);
    setModalSubtype("");
    setGenerating(false);
  };

  const handleViewDocument = (doc: Document) => {
    setViewingDocument(doc);
  };

  const closeViewModal = () => {
    setViewingDocument(null);
  };

  const handleGenerateLaudo = async () => {
    if (!user || !laudoForm.paciente || !laudoForm.idade || !laudoForm.queixaPrincipal) {
      alert(t('fillRequired'));
      return;
    }

    try {
      setGenerating(true);
      
      const content = await generateLaudo({
        tipo: modalSubtype,
        ...laudoForm
      });

      const { data, error } = await supabase
        .from('documents')
        .insert({
          user_id: user.id,
          type: 'laudo',
          subtype: modalSubtype,
          patient_name: laudoForm.paciente,
          patient_info: {
            idade: laudoForm.idade,
            sexo: laudoForm.sexo,
            queixaPrincipal: laudoForm.queixaPrincipal,
            historico: laudoForm.historico,
            exame: laudoForm.exame,
            observacoes: laudoForm.observacoes
          },
          content,
          status: 'completed'
        })
        .select()
        .single();

      if (error) throw error;

      await loadDocuments();
      closeModal();
      alert(`Laudo ${t('generatedSuccess')}`);
    } catch (error: any) {
      console.error('Erro ao gerar laudo:', error);
      if (error.message?.includes('API key')) {
        alert(t('configureAPIKey'));
      } else {
        alert(t('errorGenerating'));
      }
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateReceita = async () => {
    if (!user || !receitaForm.paciente || !receitaForm.idade || !receitaForm.diagnostico || !receitaForm.medicamentos) {
      alert(t('fillRequired'));
      return;
    }

    try {
      setGenerating(true);
      
      const content = await generateReceita({
        tipo: modalSubtype,
        ...receitaForm
      });

      const { data, error } = await supabase
        .from('documents')
        .insert({
          user_id: user.id,
          type: 'receita',
          subtype: modalSubtype,
          patient_name: receitaForm.paciente,
          patient_info: {
            idade: receitaForm.idade,
            sexo: receitaForm.sexo,
            diagnostico: receitaForm.diagnostico,
            medicamentos: receitaForm.medicamentos,
            posologia: receitaForm.posologia,
            duracao: receitaForm.duracao,
            observacoes: receitaForm.observacoes
          },
          content,
          status: 'completed'
        })
        .select()
        .single();

      if (error) throw error;

      await loadDocuments();
      closeModal();
      alert(`Receita ${t('generatedSuccess')}`);
    } catch (error: any) {
      console.error('Erro ao gerar receita:', error);
      if (error.message?.includes('API key')) {
        alert(t('configureAPIKey'));
      } else {
        alert(t('errorGenerating'));
      }
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateRelatorio = async () => {
    if (!user || !relatorioForm.paciente || !relatorioForm.idade || !relatorioForm.evolucao || !relatorioForm.procedimentos) {
      alert(t('fillRequired'));
      return;
    }

    try {
      setGenerating(true);
      
      const content = await generateRelatorio({
        tipo: modalSubtype,
        ...relatorioForm
      });

      const { data, error } = await supabase
        .from('documents')
        .insert({
          user_id: user.id,
          type: 'relatorio',
          subtype: modalSubtype,
          patient_name: relatorioForm.paciente,
          patient_info: {
            idade: relatorioForm.idade,
            sexo: relatorioForm.sexo,
            motivoInternacao: relatorioForm.motivoInternacao,
            evolucao: relatorioForm.evolucao,
            procedimentos: relatorioForm.procedimentos,
            condicaoAlta: relatorioForm.condicaoAlta,
            recomendacoes: relatorioForm.recomendacoes,
            observacoes: relatorioForm.observacoes
          },
          content,
          status: 'completed'
        })
        .select()
        .single();

      if (error) throw error;

      await loadDocuments();
      closeModal();
      alert(`Relatório ${t('generatedSuccess')}`);
    } catch (error: any) {
      console.error('Erro ao gerar relatório:', error);
      if (error.message?.includes('API key')) {
        alert(t('configureAPIKey'));
      } else {
        alert(t('errorGenerating'));
      }
    } finally {
      setGenerating(false);
    }
  };

  // Calcular estatísticas
  const stats: StatCard[] = [
    {
      title: t('documentsGenerated'),
      value: documents.length.toString(),
      change: "+12.5%",
      icon: <FileText className="w-5 h-5" />,
      trend: "up"
    },
    {
      title: t('laudosThisMonth'),
      value: documents.filter(d => d.type === 'laudo').length.toString(),
      change: "+8.2%",
      icon: <FileBarChart className="w-5 h-5" />,
      trend: "up"
    },
    {
      title: t('receitasEmitted'),
      value: documents.filter(d => d.type === 'receita').length.toString(),
      change: "+15.3%",
      icon: <Pill className="w-5 h-5" />,
      trend: "up"
    },
    {
      title: t('reports'),
      value: documents.filter(d => d.type === 'relatorio').length.toString(),
      change: "-18.4%",
      icon: <Clock className="w-5 h-5" />,
      trend: "down"
    }
  ];

  const recentItems = documents.slice(0, 4).map(doc => ({
    id: doc.id,
    type: doc.type === 'laudo' ? 'Laudo' : doc.type === 'receita' ? 'Receita' : 'Relatório',
    patient: doc.patient_name,
    date: formatDate(doc.created_at),
    status: doc.status as "completed" | "pending",
    document: doc
  }));

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `Há ${diffMins} min`;
    if (diffHours < 24) return `Há ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    if (diffDays < 7) return `Há ${diffDays} dia${diffDays > 1 ? 's' : ''}`;
    return date.toLocaleDateString('pt-BR');
  }

  const quickActions = [
    { 
      icon: <FileText className="w-6 h-6" />, 
      label: t('newLaudo'), 
      color: "from-[#FF6F00] to-[#FFD600]",
      onClick: () => openModal('laudo', 'Laudo Geral')
    },
    { 
      icon: <Pill className="w-6 h-6" />, 
      label: t('newReceita'), 
      color: "from-[#FFD600] to-[#FF6F00]",
      onClick: () => openModal('receita', 'Receita Simples')
    },
    { 
      icon: <FileBarChart className="w-6 h-6" />, 
      label: t('newRelatorio'), 
      color: "from-[#FF6F00] to-[#FFD600]",
      onClick: () => openModal('relatorio', 'Evolução Clínica')
    },
  ];

  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      {/* Header */}
      <header className="border-b border-white/5 backdrop-blur-xl bg-[#0D0D0D]/80 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF6F00] to-[#FFD600] flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-[#0D0D0D]" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-[#FF6F00] to-[#FFD600] bg-clip-text text-transparent">
                {t('appName')}
              </h1>
              {isDeveloper && (
                <span className="px-2 py-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-xs font-bold text-white">
                  DEV MODE
                </span>
              )}
            </div>

            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="text"
                  placeholder={t('search')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[#FF6F00] focus:ring-1 focus:ring-[#FF6F00] transition-all"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <LanguageSelector />
              <button className="relative p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all">
                <Bell className="w-5 h-5 text-white/70" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-[#FF6F00] rounded-full"></span>
              </button>
              {user ? (
                <>
                  <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5">
                    <User className="w-4 h-4 text-white/70" />
                    <span className="text-sm text-white/70">{user.email}</span>
                  </div>
                  <button 
                    onClick={handleSignOut}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all"
                    title={t('signOut')}
                  >
                    <LogOut className="w-5 h-5 text-white/70" />
                  </button>
                </>
              ) : (
                <button 
                  onClick={handleAuthClick}
                  className="px-4 py-2 rounded-xl bg-gradient-to-br from-[#FF6F00] to-[#FFD600] hover:opacity-90 transition-all text-sm font-semibold text-[#0D0D0D]"
                >
                  {t('signIn')}
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="border-b border-white/5 bg-[#0D0D0D]/50 backdrop-blur-xl sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide">
            {[
              { id: "dashboard", label: t('dashboard'), icon: <LayoutDashboard className="w-4 h-4" /> },
              { id: "laudos", label: t('laudos'), icon: <FileText className="w-4 h-4" /> },
              { id: "receitas", label: t('receitas'), icon: <Pill className="w-4 h-4" /> },
              { id: "relatorios", label: t('relatorios'), icon: <FileBarChart className="w-4 h-4" /> },
              { id: "ai-chat", label: t('aiAssistant'), icon: <MessageSquare className="w-4 h-4" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "text-[#FF6F00] border-b-2 border-[#FF6F00]"
                    : "text-white/60 hover:text-white/90"
                }`}
              >
                {tab.icon}
                {tab.label}
                {tab.id === 'ai-chat' && (plan === 'premium' || plan === 'trial' || isDeveloper) && (
                  <span className="px-2 py-0.5 bg-gradient-to-r from-[#FF6F00] to-[#FFD600] rounded-full text-[10px] font-bold text-[#0D0D0D]">
                    {isDeveloper ? 'DEV' : plan === 'premium' ? 'PRO' : 'TRIAL'}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!user && (
          <div className="mb-8 bg-gradient-to-r from-[#FF6F00]/10 to-[#FFD600]/10 border border-[#FF6F00]/20 rounded-2xl p-6 text-center">
            <p className="text-white/80 mb-4">
              {t('loginPrompt')}
            </p>
            <button 
              onClick={handleAuthClick}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#FF6F00] to-[#FFD600] font-semibold text-[#0D0D0D] hover:opacity-90 transition-all"
            >
              {t('createAccount')}
            </button>
          </div>
        )}

        {/* Banner ÚNICO de Trial e Modo Desenvolvedor */}
        {user && isDeveloper && (
          <div className="mb-8 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-purple-600/20 border-2 border-purple-500/50 rounded-2xl p-6 shadow-lg shadow-purple-500/20">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 animate-pulse">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-1">🚀 Modo Desenvolvedor Ativo</h3>
                <p className="text-white/80 text-sm">
                  Todas as funcionalidades premium estão desbloqueadas para teste. Email: {user.email}
                </p>
              </div>
              <div className="px-4 py-2 bg-green-500/20 border border-green-500/50 rounded-xl">
                <span className="text-green-400 font-bold text-sm">✓ ACESSO TOTAL</span>
              </div>
            </div>
          </div>
        )}

        {user && !isDeveloper && plan === 'trial' && trialDaysRemaining !== null && trialDaysRemaining > 0 && (
          <div className="mb-8 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border-2 border-blue-500/50 rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-1">🎉 Período de Teste Ativo</h3>
                <p className="text-white/80 text-sm">
                  Você tem <span className="font-bold text-cyan-400">{trialDaysRemaining} dias restantes</span> de acesso ilimitado gratuito. 
                  Aproveite todas as funcionalidades premium!
                </p>
              </div>
              <div className="px-4 py-2 bg-cyan-500/20 border border-cyan-500/50 rounded-xl">
                <span className="text-cyan-400 font-bold text-sm">{trialDaysRemaining} DIAS</span>
              </div>
            </div>
          </div>
        )}

        {user && !isDeveloper && isTrialExpired && plan !== 'premium' && (
          <div className="mb-8 bg-gradient-to-r from-red-600/20 to-orange-600/20 border-2 border-red-500/50 rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-gradient-to-r from-red-600 to-orange-600">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-1">⏰ Período de Teste Expirado</h3>
                <p className="text-white/80 text-sm">
                  Seu período de teste de 7 dias terminou. Faça upgrade para Premium e continue com acesso ilimitado!
                </p>
              </div>
              <button
                onClick={() => {
                  const pricingSection = document.getElementById('pricing-plans');
                  pricingSection?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-6 py-3 bg-gradient-to-r from-[#FF6F00] to-[#FFD600] rounded-xl font-bold text-[#0D0D0D] hover:opacity-90 transition-all whitespace-nowrap"
              >
                Fazer Upgrade
              </button>
            </div>
          </div>
        )}

        {activeTab === "dashboard" && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="group relative bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl p-6 hover:border-[#FF6F00]/50 transition-all duration-300 hover:scale-[1.02]"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-[#FF6F00]/20 to-[#FFD600]/20 text-[#FF6F00]">
                      {stat.icon}
                    </div>
                    <div className={`flex items-center gap-1 text-xs font-medium ${
                      stat.trend === "up" ? "text-green-400" : "text-[#FFD600]"
                    }`}>
                      <TrendingUp className="w-3 h-3" />
                      {stat.change}
                    </div>
                  </div>
                  <h3 className="text-white/60 text-sm mb-1">{stat.title}</h3>
                  <p className="text-3xl font-bold text-white">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Pricing Plans */}
            <PricingPlans />

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#FF6F00]" />
                {t('quickActions')}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={action.onClick}
                    disabled={!user}
                    className="group relative bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#FF6F00]/50 rounded-xl p-6 transition-all duration-300 hover:scale-[1.02] text-left overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
                    <div className="relative flex items-center gap-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${action.color} text-[#0D0D0D]`}>
                        {action.icon}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-white">{action.label}</p>
                        <p className="text-xs text-white/50 mt-1">{t('withAI')}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-[#FF6F00] transition-colors" />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#FF6F00]" />
                  {t('recentActivity')}
                </h2>
                <button className="text-sm text-[#FF6F00] hover:text-[#FFD600] transition-colors">
                  {t('viewAll')}
                </button>
              </div>
              {loading ? (
                <div className="text-center py-8 text-white/50">Carregando...</div>
              ) : recentItems.length === 0 ? (
                <div className="text-center py-8 text-white/50">
                  {t('noDocuments')}
                </div>
              ) : (
                <div className="space-y-3">
                  {recentItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleViewDocument(item.document)}
                      className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl transition-all group cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${
                          item.status === "completed" 
                            ? "bg-green-500/20 text-green-400" 
                            : "bg-[#FFD600]/20 text-[#FFD600]"
                        }`}>
                          {item.status === "completed" ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : (
                            <Clock className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-white">{item.type}</p>
                          <p className="text-sm text-white/50">{item.patient}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-white/40">{item.date}</span>
                        <Eye className="w-4 h-4 text-white/20 group-hover:text-[#FF6F00] transition-colors" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "ai-chat" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">{t('aiAssistant')}</h2>
              <p className="text-white/60">{t('specialistMode')} - Análise de Raio-X, Tomografias, Ressonâncias e Exames Laboratoriais</p>
              {isDeveloper && (
                <p className="text-green-400 text-sm mt-2">✓ Modo Desenvolvedor: Chat com IA desbloqueado</p>
              )}
            </div>
            <MedicalChat initialContext={chatContext} />
          </div>
        )}

        {activeTab === "laudos" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Laudos Médicos</h2>
                <p className="text-white/60">Análise especializada com IA - Anexe seus exames para diagnóstico preciso</p>
                {isDeveloper && (
                  <p className="text-green-400 text-sm mt-2">✓ Modo Desenvolvedor: Todas as funcionalidades desbloqueadas</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {["Raio-X Tórax", "Ultrassom Abdominal", "Ressonância Magnética", "Tomografia", "Ecocardiograma", "Mamografia"].map((type, index) => (
                <button
                  key={index}
                  onClick={() => openChatForExam(type)}
                  disabled={!user}
                  className="group bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 hover:border-[#FF6F00]/50 rounded-2xl p-6 text-left transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-[#FF6F00]/20 to-[#FFD600]/20">
                      <FileText className="w-6 h-6 text-[#FF6F00]" />
                    </div>
                    <MessageSquare className="w-5 h-5 text-[#FF6F00] opacity-70" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{type}</h3>
                  <p className="text-sm text-white/50">Clique para abrir chat e anexar exame</p>
                  <div className="mt-4 flex items-center gap-2 text-xs text-[#FF6F00]">
                    <Sparkles className="w-3 h-3" />
                    <span>Análise com IA Especializada</span>
                  </div>
                </button>
              ))}
            </div>

            {documents.filter(d => d.type === 'laudo').length > 0 && (
              <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl p-6 mt-8">
                <h3 className="text-xl font-bold text-white mb-4">Seus Laudos</h3>
                <div className="space-y-3">
                  {documents.filter(d => d.type === 'laudo').map((doc) => (
                    <div 
                      key={doc.id} 
                      onClick={() => handleViewDocument(doc)}
                      className="p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 cursor-pointer transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-white">{doc.subtype}</p>
                          <p className="text-sm text-white/50">{doc.patient_name}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-white/40">{formatDate(doc.created_at)}</span>
                          <Eye className="w-4 h-4 text-white/20 group-hover:text-[#FF6F00] transition-colors" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "receitas" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Receitas Médicas</h2>
                <p className="text-white/60">Prescrições digitais com validação automática</p>
                {isDeveloper && (
                  <p className="text-green-400 text-sm mt-2">✓ Modo Desenvolvedor: Todas as funcionalidades desbloqueadas</p>
                )}
              </div>
              <button 
                onClick={() => openModal('receita', 'Receita Simples')}
                disabled={!user}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#FF6F00] to-[#FFD600] rounded-xl font-semibold text-[#0D0D0D] hover:opacity-90 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-5 h-5" />
                {t('newReceita')}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {["Receita Simples", "Receita Controlada", "Receita Especial", "Receita Antimicrobiana"].map((type, index) => (
                <button
                  key={index}
                  onClick={() => openModal('receita', type)}
                  disabled={!user}
                  className="group bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 hover:border-[#FF6F00]/50 rounded-2xl p-6 text-left transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-[#FFD600]/20 to-[#FF6F00]/20">
                      <Pill className="w-6 h-6 text-[#FFD600]" />
                    </div>
                    <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-[#FF6F00] transition-colors" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{type}</h3>
                  <p className="text-sm text-white/50">Conforme legislação vigente</p>
                </button>
              ))}
            </div>

            {documents.filter(d => d.type === 'receita').length > 0 && (
              <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl p-6 mt-8">
                <h3 className="text-xl font-bold text-white mb-4">Suas Receitas</h3>
                <div className="space-y-3">
                  {documents.filter(d => d.type === 'receita').map((doc) => (
                    <div 
                      key={doc.id} 
                      onClick={() => handleViewDocument(doc)}
                      className="p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 cursor-pointer transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-white">{doc.subtype}</p>
                          <p className="text-sm text-white/50">{doc.patient_name}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-white/40">{formatDate(doc.created_at)}</span>
                          <Eye className="w-4 h-4 text-white/20 group-hover:text-[#FF6F00] transition-colors" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "relatorios" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Relatórios Médicos</h2>
                <p className="text-white/60">Documentação completa e detalhada</p>
                {isDeveloper && (
                  <p className="text-green-400 text-sm mt-2">✓ Modo Desenvolvedor: Todas as funcionalidades desbloqueadas</p>
                )}
              </div>
              <button 
                onClick={() => openModal('relatorio', 'Evolução Clínica')}
                disabled={!user}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#FF6F00] to-[#FFD600] rounded-xl font-semibold text-[#0D0D0D] hover:opacity-90 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-5 h-5" />
                {t('newRelatorio')}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {["Evolução Clínica", "Alta Hospitalar", "Atestado Médico", "Relatório Cirúrgico", "Parecer Técnico", "Sumário de Internação"].map((type, index) => (
                <button
                  key={index}
                  onClick={() => openModal('relatorio', type)}
                  disabled={!user}
                  className="group bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 hover:border-[#FF6F00]/50 rounded-2xl p-6 text-left transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-[#FF6F00]/20 to-[#FFD600]/20">
                      <FileBarChart className="w-6 h-6 text-[#FF6F00]" />
                    </div>
                    <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-[#FF6F00] transition-colors" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{type}</h3>
                  <p className="text-sm text-white/50">Geração inteligente com IA</p>
                </button>
              ))}
            </div>

            {documents.filter(d => d.type === 'relatorio').length > 0 && (
              <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl p-6 mt-8">
                <h3 className="text-xl font-bold text-white mb-4">Seus Relatórios</h3>
                <div className="space-y-3">
                  {documents.filter(d => d.type === 'relatorio').map((doc) => (
                    <div 
                      key={doc.id} 
                      onClick={() => handleViewDocument(doc)}
                      className="p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 cursor-pointer transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-white">{doc.subtype}</p>
                          <p className="text-sm text-white/50">{doc.patient_name}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-white/40">{formatDate(doc.created_at)}</span>
                          <Eye className="w-4 h-4 text-white/20 group-hover:text-[#FF6F00] transition-colors" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modal de Visualização de Documento */}
      {viewingDocument && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0D0D0D] border border-white/10 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-[#0D0D0D] border-b border-white/10 p-6 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-white">{viewingDocument.subtype}</h3>
                <p className="text-white/60 text-sm mt-1">Paciente: {viewingDocument.patient_name}</p>
              </div>
              <button onClick={closeViewModal} className="p-2 hover:bg-white/10 rounded-xl transition-all">
                <X className="w-5 h-5 text-white/70" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <div className="prose prose-invert max-w-none">
                  <div className="whitespace-pre-wrap text-white/90 leading-relaxed">
                    {viewingDocument.content}
                  </div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-[#0D0D0D] border-t border-white/10 p-6 flex gap-3">
              <button
                onClick={closeViewModal}
                className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-semibold text-white transition-all"
              >
                {t('close')}
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(viewingDocument.content);
                  alert(t('contentCopied'));
                }}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-[#FF6F00] to-[#FFD600] rounded-xl font-semibold text-[#0D0D0D] hover:opacity-90 transition-all"
              >
                {t('copyContent')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modais de Criação (Laudo, Receita, Relatório) */}
      {modalOpen === 'laudo' && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0D0D0D] border border-white/10 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-[#0D0D0D] border-b border-white/10 p-6 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-white">Novo Laudo - {modalSubtype}</h3>
              <button onClick={closeModal} className="p-2 hover:bg-white/10 rounded-xl transition-all">
                <X className="w-5 h-5 text-white/70" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Nome do Paciente *</label>
                  <input
                    type="text"
                    value={laudoForm.paciente}
                    onChange={(e) => setLaudoForm({...laudoForm, paciente: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#FF6F00]"
                    placeholder="Nome completo"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Idade *</label>
                  <input
                    type="text"
                    value={laudoForm.idade}
                    onChange={(e) => setLaudoForm({...laudoForm, idade: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#FF6F00]"
                    placeholder="Ex: 45 anos"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Sexo</label>
                <select
                  value={laudoForm.sexo}
                  onChange={(e) => setLaudoForm({...laudoForm, sexo: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#FF6F00]"
                >
                  <option value="M">Masculino</option>
                  <option value="F">Feminino</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Queixa Principal *</label>
                <textarea
                  value={laudoForm.queixaPrincipal}
                  onChange={(e) => setLaudoForm({...laudoForm, queixaPrincipal: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#FF6F00] min-h-[80px]"
                  placeholder="Descreva a queixa principal do paciente"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Histórico Clínico</label>
                <textarea
                  value={laudoForm.historico}
                  onChange={(e) => setLaudoForm({...laudoForm, historico: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#FF6F00] min-h-[80px]"
                  placeholder="Histórico médico relevante"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Exame Físico</label>
                <textarea
                  value={laudoForm.exame}
                  onChange={(e) => setLaudoForm({...laudoForm, exame: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#FF6F00] min-h-[80px]"
                  placeholder="Achados do exame físico"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Observações</label>
                <textarea
                  value={laudoForm.observacoes}
                  onChange={(e) => setLaudoForm({...laudoForm, observacoes: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#FF6F00] min-h-[60px]"
                  placeholder="Observações adicionais"
                />
              </div>
            </div>

            <div className="sticky bottom-0 bg-[#0D0D0D] border-t border-white/10 p-6 flex gap-3">
              <button
                onClick={closeModal}
                disabled={generating}
                className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-semibold text-white transition-all disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleGenerateLaudo}
                disabled={generating}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-[#FF6F00] to-[#FFD600] rounded-xl font-semibold text-[#0D0D0D] hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Gerar Laudo com IA
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {modalOpen === 'receita' && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0D0D0D] border border-white/10 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-[#0D0D0D] border-b border-white/10 p-6 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-white">Nova Receita - {modalSubtype}</h3>
              <button onClick={closeModal} className="p-2 hover:bg-white/10 rounded-xl transition-all">
                <X className="w-5 h-5 text-white/70" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Nome do Paciente *</label>
                  <input
                    type="text"
                    value={receitaForm.paciente}
                    onChange={(e) => setReceitaForm({...receitaForm, paciente: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#FF6F00]"
                    placeholder="Nome completo"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Idade *</label>
                  <input
                    type="text"
                    value={receitaForm.idade}
                    onChange={(e) => setReceitaForm({...receitaForm, idade: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#FF6F00]"
                    placeholder="Ex: 45 anos"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Diagnóstico *</label>
                <input
                  type="text"
                  value={receitaForm.diagnostico}
                  onChange={(e) => setReceitaForm({...receitaForm, diagnostico: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#FF6F00]"
                  placeholder="CID ou diagnóstico clínico"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Medicamentos *</label>
                <textarea
                  value={receitaForm.medicamentos}
                  onChange={(e) => setReceitaForm({...receitaForm, medicamentos: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#FF6F00] min-h-[100px]"
                  placeholder="Liste os medicamentos (um por linha)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Posologia</label>
                <textarea
                  value={receitaForm.posologia}
                  onChange={(e) => setReceitaForm({...receitaForm, posologia: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#FF6F00] min-h-[80px]"
                  placeholder="Como usar cada medicamento"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Duração do Tratamento</label>
                <input
                  type="text"
                  value={receitaForm.duracao}
                  onChange={(e) => setReceitaForm({...receitaForm, duracao: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#FF6F00]"
                  placeholder="Ex: 7 dias, 30 dias, uso contínuo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Observações</label>
                <textarea
                  value={receitaForm.observacoes}
                  onChange={(e) => setReceitaForm({...receitaForm, observacoes: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#FF6F00] min-h-[60px]"
                  placeholder="Orientações adicionais"
                />
              </div>
            </div>

            <div className="sticky bottom-0 bg-[#0D0D0D] border-t border-white/10 p-6 flex gap-3">
              <button
                onClick={closeModal}
                disabled={generating}
                className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-semibold text-white transition-all disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleGenerateReceita}
                disabled={generating}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-[#FF6F00] to-[#FFD600] rounded-xl font-semibold text-[#0D0D0D] hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Gerar Receita com IA
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {modalOpen === 'relatorio' && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0D0D0D] border border-white/10 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-[#0D0D0D] border-b border-white/10 p-6 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-white">Novo Relatório - {modalSubtype}</h3>
              <button onClick={closeModal} className="p-2 hover:bg-white/10 rounded-xl transition-all">
                <X className="w-5 h-5 text-white/70" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Nome do Paciente *</label>
                  <input
                    type="text"
                    value={relatorioForm.paciente}
                    onChange={(e) => setRelatorioForm({...relatorioForm, paciente: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#FF6F00]"
                    placeholder="Nome completo"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Idade *</label>
                  <input
                    type="text"
                    value={relatorioForm.idade}
                    onChange={(e) => setRelatorioForm({...relatorioForm, idade: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#FF6F00]"
                    placeholder="Ex: 45 anos"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Motivo da Internação</label>
                <input
                  type="text"
                  value={relatorioForm.motivoInternacao}
                  onChange={(e) => setRelatorioForm({...relatorioForm, motivoInternacao: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#FF6F00]"
                  placeholder="Motivo principal"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Evolução Clínica *</label>
                <textarea
                  value={relatorioForm.evolucao}
                  onChange={(e) => setRelatorioForm({...relatorioForm, evolucao: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#FF6F00] min-h-[100px]"
                  placeholder="Descreva a evolução do paciente"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Procedimentos Realizados *</label>
                <textarea
                  value={relatorioForm.procedimentos}
                  onChange={(e) => setRelatorioForm({...relatorioForm, procedimentos: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#FF6F00] min-h-[80px]"
                  placeholder="Liste os procedimentos realizados"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Condição de Alta</label>
                <input
                  type="text"
                  value={relatorioForm.condicaoAlta}
                  onChange={(e) => setRelatorioForm({...relatorioForm, condicaoAlta: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#FF6F00]"
                  placeholder="Ex: Estável, melhorado, curado"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Recomendações</label>
                <textarea
                  value={relatorioForm.recomendacoes}
                  onChange={(e) => setRelatorioForm({...relatorioForm, recomendacoes: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#FF6F00] min-h-[80px]"
                  placeholder="Recomendações pós-alta"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Observações</label>
                <textarea
                  value={relatorioForm.observacoes}
                  onChange={(e) => setRelatorioForm({...relatorioForm, observacoes: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#FF6F00] min-h-[60px]"
                  placeholder="Observações adicionais"
                />
              </div>
            </div>

            <div className="sticky bottom-0 bg-[#0D0D0D] border-t border-white/10 p-6 flex gap-3">
              <button
                onClick={closeModal}
                disabled={generating}
                className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-semibold text-white transition-all disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleGenerateRelatorio}
                disabled={generating}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-[#FF6F00] to-[#FFD600] rounded-xl font-semibold text-[#0D0D0D] hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Gerar Relatório com IA
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

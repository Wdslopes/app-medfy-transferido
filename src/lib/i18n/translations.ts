// Sistema de traduções para 4 idiomas
export type Language = 'pt-BR' | 'pt-PT' | 'en' | 'es';

export const translations = {
  'pt-BR': {
    // Header
    appName: 'Medfy',
    search: 'Buscar paciente, documento...',
    notifications: 'Notificações',
    signOut: 'Sair',
    signIn: 'Entrar',
    
    // Navigation
    dashboard: 'Dashboard',
    laudos: 'Laudos',
    receitas: 'Receitas',
    relatorios: 'Relatórios',
    
    // Dashboard
    documentsGenerated: 'Documentos Gerados',
    laudosThisMonth: 'Laudos Este Mês',
    receitasEmitted: 'Receitas Emitidas',
    reports: 'Relatórios',
    quickActions: 'Ações Rápidas',
    recentActivity: 'Atividade Recente',
    viewAll: 'Ver todos',
    noDocuments: 'Nenhum documento criado ainda. Use as ações rápidas acima!',
    
    // Actions
    newLaudo: 'Novo Laudo',
    newReceita: 'Nova Receita',
    newRelatorio: 'Novo Relatório',
    withAI: 'Com IA em segundos',
    
    // Auth
    loginPrompt: 'Faça login para acessar seus documentos e criar novos laudos, receitas e relatórios',
    createAccount: 'Criar Conta ou Entrar',
    email: 'E-mail',
    password: 'Senha',
    forgotPassword: 'Esqueci minha senha',
    resetPassword: 'Redefinir Senha',
    sendResetEmail: 'Enviar E-mail de Redefinição',
    backToLogin: 'Voltar ao Login',
    resetEmailSent: 'E-mail de redefinição enviado! Verifique sua caixa de entrada.',
    
    // Forms
    patientName: 'Nome do Paciente',
    age: 'Idade',
    sex: 'Sexo',
    male: 'M',
    female: 'F',
    mainComplaint: 'Queixa Principal',
    clinicalHistory: 'Histórico Clínico',
    examPerformed: 'Exame Realizado',
    additionalObservations: 'Observações Adicionais',
    diagnosis: 'Diagnóstico',
    medications: 'Medicamentos',
    posology: 'Posologia',
    treatmentDuration: 'Duração do Tratamento',
    hospitalizationReason: 'Motivo da Internação',
    clinicalEvolution: 'Evolução Clínica',
    proceduresPerformed: 'Procedimentos Realizados',
    dischargeCondition: 'Condição na Alta',
    recommendations: 'Recomendações',
    
    // Buttons
    cancel: 'Cancelar',
    generate: 'Gerar',
    generating: 'Gerando...',
    generateWithAI: 'Gerar com IA',
    close: 'Fechar',
    copyContent: 'Copiar Conteúdo',
    subscribe: 'Assinar Agora',
    
    // Messages
    fillRequired: 'Preencha todos os campos obrigatórios',
    generatedSuccess: 'gerado com sucesso!',
    configureAPIKey: 'Configure sua API Key da OpenAI nas variáveis de ambiente',
    errorGenerating: 'Erro ao gerar. Tente novamente.',
    loginRequired: 'Faça login para criar documentos',
    contentCopied: 'Conteúdo copiado para a área de transferência!',
    
    // Subscription
    freePlan: 'Plano Gratuito',
    premiumPlan: 'Plano Premium',
    upgradeToPremium: 'Upgrade para Premium',
    unlimited: 'Ilimitado',
    limited: 'Limitado',
    laudosLimit: 'laudos/mês',
    receitasLimit: 'receitas/mês',
    currentPlan: 'Plano Atual',
    monthly: 'Mensal',
    annually: 'Anual',
    perMonth: '/mês',
    perYear: '/ano',
    save: 'Economize',
    
    // Checkout
    checkoutTitle: 'Assine o Plano Premium',
    checkoutSubtitle: 'Desbloqueie todo o potencial do Medfy',
    benefits: 'Benefícios Inclusos',
    benefit1: 'Laudos ilimitados por mês',
    benefit2: 'Receitas ilimitadas por mês',
    benefit3: 'IA Avançada com análise especializada',
    benefit4: 'Análise de exames de imagem (Raio-X, TC, RM)',
    benefit5: 'Upload ilimitado de documentos médicos',
    benefit6: 'Suporte prioritário 24/7',
    benefit7: 'Atualizações e novos recursos em primeira mão',
    benefit8: 'Armazenamento seguro em nuvem',
    selectPlan: 'Selecione seu plano',
    
    // Quiz
    quizTitle: 'Bem-vindo ao Medfy!',
    quizSubtitle: 'Vamos personalizar sua experiência',
    quizStep: 'Passo',
    quizOf: 'de',
    next: 'Próximo',
    previous: 'Anterior',
    finish: 'Finalizar',
    fullName: 'Nome Completo',
    crm: 'CRM',
    specialty: 'Especialidade',
    selectSpecialty: 'Selecione sua especialidade',
    mainUse: 'Principal uso do aplicativo',
    selectMainUse: 'Selecione o uso principal',
    additionalNeeds: 'Necessidades adicionais',
    tellUsMore: 'Conte-nos mais sobre suas necessidades...',
    
    // Specialties
    generalPractitioner: 'Clínico Geral',
    cardiologist: 'Cardiologista',
    pediatrician: 'Pediatra',
    orthopedist: 'Ortopedista',
    dermatologist: 'Dermatologista',
    gynecologist: 'Ginecologista',
    psychiatrist: 'Psiquiatra',
    neurologist: 'Neurologista',
    other: 'Outra',
    
    // Main Uses
    generateReports: 'Gerar laudos médicos',
    writePrescriptions: 'Escrever receitas',
    analyzeExams: 'Analisar exames de imagem',
    patientManagement: 'Gestão de pacientes',
    
    // Medical AI
    uploadDocument: 'Anexar Documento',
    analyzeDocument: 'Analisar com IA',
    analyzing: 'Analisando...',
    medicalAnalysis: 'Análise Médica',
    aiAssistant: 'Assistente IA Médica',
    specialistMode: 'Modo Especialista',
  },
  
  'pt-PT': {
    // Header
    appName: 'Medfy',
    search: 'Pesquisar paciente, documento...',
    notifications: 'Notificações',
    signOut: 'Terminar sessão',
    signIn: 'Entrar',
    
    // Navigation
    dashboard: 'Painel',
    laudos: 'Relatórios',
    receitas: 'Receitas',
    relatorios: 'Relatórios',
    
    // Dashboard
    documentsGenerated: 'Documentos Gerados',
    laudosThisMonth: 'Relatórios Este Mês',
    receitasEmitted: 'Receitas Emitidas',
    reports: 'Relatórios',
    quickActions: 'Acções Rápidas',
    recentActivity: 'Actividade Recente',
    viewAll: 'Ver todos',
    noDocuments: 'Nenhum documento criado ainda. Use as acções rápidas acima!',
    
    // Actions
    newLaudo: 'Novo Relatório',
    newReceita: 'Nova Receita',
    newRelatorio: 'Novo Relatório',
    withAI: 'Com IA em segundos',
    
    // Auth
    loginPrompt: 'Faça login para aceder aos seus documentos e criar novos relatórios, receitas e relatórios',
    createAccount: 'Criar Conta ou Entrar',
    email: 'E-mail',
    password: 'Palavra-passe',
    forgotPassword: 'Esqueci-me da palavra-passe',
    resetPassword: 'Redefinir Palavra-passe',
    sendResetEmail: 'Enviar E-mail de Redefinição',
    backToLogin: 'Voltar ao Login',
    resetEmailSent: 'E-mail de redefinição enviado! Verifique a sua caixa de entrada.',
    
    // Forms
    patientName: 'Nome do Paciente',
    age: 'Idade',
    sex: 'Sexo',
    male: 'M',
    female: 'F',
    mainComplaint: 'Queixa Principal',
    clinicalHistory: 'Histórico Clínico',
    examPerformed: 'Exame Realizado',
    additionalObservations: 'Observações Adicionais',
    diagnosis: 'Diagnóstico',
    medications: 'Medicamentos',
    posology: 'Posologia',
    treatmentDuration: 'Duração do Tratamento',
    hospitalizationReason: 'Motivo da Internação',
    clinicalEvolution: 'Evolução Clínica',
    proceduresPerformed: 'Procedimentos Realizados',
    dischargeCondition: 'Condição na Alta',
    recommendations: 'Recomendações',
    
    // Buttons
    cancel: 'Cancelar',
    generate: 'Gerar',
    generating: 'A gerar...',
    generateWithAI: 'Gerar com IA',
    close: 'Fechar',
    copyContent: 'Copiar Conteúdo',
    subscribe: 'Subscrever Agora',
    
    // Messages
    fillRequired: 'Preencha todos os campos obrigatórios',
    generatedSuccess: 'gerado com sucesso!',
    configureAPIKey: 'Configure a sua API Key da OpenAI nas variáveis de ambiente',
    errorGenerating: 'Erro ao gerar. Tente novamente.',
    loginRequired: 'Faça login para criar documentos',
    contentCopied: 'Conteúdo copiado para a área de transferência!',
    
    // Subscription
    freePlan: 'Plano Gratuito',
    premiumPlan: 'Plano Premium',
    upgradeToPremium: 'Actualizar para Premium',
    unlimited: 'Ilimitado',
    limited: 'Limitado',
    laudosLimit: 'relatórios/mês',
    receitasLimit: 'receitas/mês',
    currentPlan: 'Plano Actual',
    monthly: 'Mensal',
    annually: 'Anual',
    perMonth: '/mês',
    perYear: '/ano',
    save: 'Poupe',
    
    // Checkout
    checkoutTitle: 'Subscreva o Plano Premium',
    checkoutSubtitle: 'Desbloqueie todo o potencial do Medfy',
    benefits: 'Benefícios Incluídos',
    benefit1: 'Relatórios ilimitados por mês',
    benefit2: 'Receitas ilimitadas por mês',
    benefit3: 'IA Avançada com análise especializada',
    benefit4: 'Análise de exames de imagem (Raio-X, TC, RM)',
    benefit5: 'Upload ilimitado de documentos médicos',
    benefit6: 'Suporte prioritário 24/7',
    benefit7: 'Actualizações e novos recursos em primeira mão',
    benefit8: 'Armazenamento seguro na nuvem',
    selectPlan: 'Selecione o seu plano',
    
    // Quiz
    quizTitle: 'Bem-vindo ao Medfy!',
    quizSubtitle: 'Vamos personalizar a sua experiência',
    quizStep: 'Passo',
    quizOf: 'de',
    next: 'Próximo',
    previous: 'Anterior',
    finish: 'Finalizar',
    fullName: 'Nome Completo',
    crm: 'Número de Ordem',
    specialty: 'Especialidade',
    selectSpecialty: 'Selecione a sua especialidade',
    mainUse: 'Principal uso da aplicação',
    selectMainUse: 'Selecione o uso principal',
    additionalNeeds: 'Necessidades adicionais',
    tellUsMore: 'Conte-nos mais sobre as suas necessidades...',
    
    // Specialties
    generalPractitioner: 'Clínico Geral',
    cardiologist: 'Cardiologista',
    pediatrician: 'Pediatra',
    orthopedist: 'Ortopedista',
    dermatologist: 'Dermatologista',
    gynecologist: 'Ginecologista',
    psychiatrist: 'Psiquiatra',
    neurologist: 'Neurologista',
    other: 'Outra',
    
    // Main Uses
    generateReports: 'Gerar relatórios médicos',
    writePrescriptions: 'Escrever receitas',
    analyzeExams: 'Analisar exames de imagem',
    patientManagement: 'Gestão de pacientes',
    
    // Medical AI
    uploadDocument: 'Anexar Documento',
    analyzeDocument: 'Analisar com IA',
    analyzing: 'A analisar...',
    medicalAnalysis: 'Análise Médica',
    aiAssistant: 'Assistente IA Médica',
    specialistMode: 'Modo Especialista',
  },
  
  'en': {
    // Header
    appName: 'Medfy',
    search: 'Search patient, document...',
    notifications: 'Notifications',
    signOut: 'Sign Out',
    signIn: 'Sign In',
    
    // Navigation
    dashboard: 'Dashboard',
    laudos: 'Reports',
    receitas: 'Prescriptions',
    relatorios: 'Medical Reports',
    
    // Dashboard
    documentsGenerated: 'Documents Generated',
    laudosThisMonth: 'Reports This Month',
    receitasEmitted: 'Prescriptions Issued',
    reports: 'Reports',
    quickActions: 'Quick Actions',
    recentActivity: 'Recent Activity',
    viewAll: 'View all',
    noDocuments: 'No documents created yet. Use the quick actions above!',
    
    // Actions
    newLaudo: 'New Report',
    newReceita: 'New Prescription',
    newRelatorio: 'New Medical Report',
    withAI: 'With AI in seconds',
    
    // Auth
    loginPrompt: 'Sign in to access your documents and create new reports, prescriptions and medical reports',
    createAccount: 'Create Account or Sign In',
    email: 'Email',
    password: 'Password',
    forgotPassword: 'Forgot password',
    resetPassword: 'Reset Password',
    sendResetEmail: 'Send Reset Email',
    backToLogin: 'Back to Login',
    resetEmailSent: 'Reset email sent! Check your inbox.',
    
    // Forms
    patientName: 'Patient Name',
    age: 'Age',
    sex: 'Sex',
    male: 'M',
    female: 'F',
    mainComplaint: 'Main Complaint',
    clinicalHistory: 'Clinical History',
    examPerformed: 'Exam Performed',
    additionalObservations: 'Additional Observations',
    diagnosis: 'Diagnosis',
    medications: 'Medications',
    posology: 'Dosage',
    treatmentDuration: 'Treatment Duration',
    hospitalizationReason: 'Hospitalization Reason',
    clinicalEvolution: 'Clinical Evolution',
    proceduresPerformed: 'Procedures Performed',
    dischargeCondition: 'Discharge Condition',
    recommendations: 'Recommendations',
    
    // Buttons
    cancel: 'Cancel',
    generate: 'Generate',
    generating: 'Generating...',
    generateWithAI: 'Generate with AI',
    close: 'Close',
    copyContent: 'Copy Content',
    subscribe: 'Subscribe Now',
    
    // Messages
    fillRequired: 'Fill in all required fields',
    generatedSuccess: 'generated successfully!',
    configureAPIKey: 'Configure your OpenAI API Key in environment variables',
    errorGenerating: 'Error generating. Try again.',
    loginRequired: 'Sign in to create documents',
    contentCopied: 'Content copied to clipboard!',
    
    // Subscription
    freePlan: 'Free Plan',
    premiumPlan: 'Premium Plan',
    upgradeToPremium: 'Upgrade to Premium',
    unlimited: 'Unlimited',
    limited: 'Limited',
    laudosLimit: 'reports/month',
    receitasLimit: 'prescriptions/month',
    currentPlan: 'Current Plan',
    monthly: 'Monthly',
    annually: 'Annually',
    perMonth: '/month',
    perYear: '/year',
    save: 'Save',
    
    // Checkout
    checkoutTitle: 'Subscribe to Premium Plan',
    checkoutSubtitle: 'Unlock the full potential of Medfy',
    benefits: 'Included Benefits',
    benefit1: 'Unlimited reports per month',
    benefit2: 'Unlimited prescriptions per month',
    benefit3: 'Advanced AI with specialized analysis',
    benefit4: 'Medical imaging analysis (X-Ray, CT, MRI)',
    benefit5: 'Unlimited medical document uploads',
    benefit6: '24/7 priority support',
    benefit7: 'Early access to updates and new features',
    benefit8: 'Secure cloud storage',
    selectPlan: 'Select your plan',
    
    // Quiz
    quizTitle: 'Welcome to Medfy!',
    quizSubtitle: "Let's personalize your experience",
    quizStep: 'Step',
    quizOf: 'of',
    next: 'Next',
    previous: 'Previous',
    finish: 'Finish',
    fullName: 'Full Name',
    crm: 'Medical License',
    specialty: 'Specialty',
    selectSpecialty: 'Select your specialty',
    mainUse: 'Main use of the app',
    selectMainUse: 'Select main use',
    additionalNeeds: 'Additional needs',
    tellUsMore: 'Tell us more about your needs...',
    
    // Specialties
    generalPractitioner: 'General Practitioner',
    cardiologist: 'Cardiologist',
    pediatrician: 'Pediatrician',
    orthopedist: 'Orthopedist',
    dermatologist: 'Dermatologist',
    gynecologist: 'Gynecologist',
    psychiatrist: 'Psychiatrist',
    neurologist: 'Neurologist',
    other: 'Other',
    
    // Main Uses
    generateReports: 'Generate medical reports',
    writePrescriptions: 'Write prescriptions',
    analyzeExams: 'Analyze medical imaging',
    patientManagement: 'Patient management',
    
    // Medical AI
    uploadDocument: 'Attach Document',
    analyzeDocument: 'Analyze with AI',
    analyzing: 'Analyzing...',
    medicalAnalysis: 'Medical Analysis',
    aiAssistant: 'Medical AI Assistant',
    specialistMode: 'Specialist Mode',
  },
  
  'es': {
    // Header
    appName: 'Medfy',
    search: 'Buscar paciente, documento...',
    notifications: 'Notificaciones',
    signOut: 'Cerrar sesión',
    signIn: 'Iniciar sesión',
    
    // Navigation
    dashboard: 'Panel',
    laudos: 'Informes',
    receitas: 'Recetas',
    relatorios: 'Informes Médicos',
    
    // Dashboard
    documentsGenerated: 'Documentos Generados',
    laudosThisMonth: 'Informes Este Mes',
    receitasEmitted: 'Recetas Emitidas',
    reports: 'Informes',
    quickActions: 'Acciones Rápidas',
    recentActivity: 'Actividad Reciente',
    viewAll: 'Ver todos',
    noDocuments: '¡Aún no se han creado documentos. ¡Usa las acciones rápidas arriba!',
    
    // Actions
    newLaudo: 'Nuevo Informe',
    newReceita: 'Nueva Receta',
    newRelatorio: 'Nuevo Informe Médico',
    withAI: 'Con IA en segundos',
    
    // Auth
    loginPrompt: 'Inicia sesión para acceder a tus documentos y crear nuevos informes, recetas e informes médicos',
    createAccount: 'Crear Cuenta o Iniciar Sesión',
    email: 'Correo electrónico',
    password: 'Contraseña',
    forgotPassword: 'Olvidé mi contraseña',
    resetPassword: 'Restablecer Contraseña',
    sendResetEmail: 'Enviar Correo de Restablecimiento',
    backToLogin: 'Volver al Login',
    resetEmailSent: '¡Correo de restablecimiento enviado! Revisa tu bandeja de entrada.',
    
    // Forms
    patientName: 'Nombre del Paciente',
    age: 'Edad',
    sex: 'Sexo',
    male: 'M',
    female: 'F',
    mainComplaint: 'Queja Principal',
    clinicalHistory: 'Historia Clínica',
    examPerformed: 'Examen Realizado',
    additionalObservations: 'Observaciones Adicionales',
    diagnosis: 'Diagnóstico',
    medications: 'Medicamentos',
    posology: 'Posología',
    treatmentDuration: 'Duración del Tratamiento',
    hospitalizationReason: 'Motivo de Hospitalización',
    clinicalEvolution: 'Evolución Clínica',
    proceduresPerformed: 'Procedimientos Realizados',
    dischargeCondition: 'Condición al Alta',
    recommendations: 'Recomendaciones',
    
    // Buttons
    cancel: 'Cancelar',
    generate: 'Generar',
    generating: 'Generando...',
    generateWithAI: 'Generar con IA',
    close: 'Cerrar',
    copyContent: 'Copiar Contenido',
    subscribe: 'Suscribirse Ahora',
    
    // Messages
    fillRequired: 'Complete todos los campos obligatorios',
    generatedSuccess: '¡generado con éxito!',
    configureAPIKey: 'Configure su API Key de OpenAI en las variables de entorno',
    errorGenerating: 'Error al generar. Inténtelo de nuevo.',
    loginRequired: 'Inicie sesión para crear documentos',
    contentCopied: '¡Contenido copiado al portapapeles!',
    
    // Subscription
    freePlan: 'Plan Gratuito',
    premiumPlan: 'Plan Premium',
    upgradeToPremium: 'Actualizar a Premium',
    unlimited: 'Ilimitado',
    limited: 'Limitado',
    laudosLimit: 'informes/mes',
    receitasLimit: 'recetas/mes',
    currentPlan: 'Plan Actual',
    monthly: 'Mensual',
    annually: 'Anual',
    perMonth: '/mes',
    perYear: '/año',
    save: 'Ahorre',
    
    // Checkout
    checkoutTitle: 'Suscríbase al Plan Premium',
    checkoutSubtitle: 'Desbloquee todo el potencial de Medfy',
    benefits: 'Beneficios Incluidos',
    benefit1: 'Informes ilimitados por mes',
    benefit2: 'Recetas ilimitadas por mes',
    benefit3: 'IA Avanzada con análisis especializado',
    benefit4: 'Análisis de imágenes médicas (Rayos X, TC, RM)',
    benefit5: 'Carga ilimitada de documentos médicos',
    benefit6: 'Soporte prioritario 24/7',
    benefit7: 'Acceso anticipado a actualizaciones y nuevas funciones',
    benefit8: 'Almacenamiento seguro en la nube',
    selectPlan: 'Seleccione su plan',
    
    // Quiz
    quizTitle: '¡Bienvenido a Medfy!',
    quizSubtitle: 'Personalicemos su experiencia',
    quizStep: 'Paso',
    quizOf: 'de',
    next: 'Siguiente',
    previous: 'Anterior',
    finish: 'Finalizar',
    fullName: 'Nombre Completo',
    crm: 'Licencia Médica',
    specialty: 'Especialidad',
    selectSpecialty: 'Seleccione su especialidad',
    mainUse: 'Uso principal de la aplicación',
    selectMainUse: 'Seleccione el uso principal',
    additionalNeeds: 'Necesidades adicionales',
    tellUsMore: 'Cuéntenos más sobre sus necesidades...',
    
    // Specialties
    generalPractitioner: 'Médico General',
    cardiologist: 'Cardiólogo',
    pediatrician: 'Pediatra',
    orthopedist: 'Ortopedista',
    dermatologist: 'Dermatólogo',
    gynecologist: 'Ginecólogo',
    psychiatrist: 'Psiquiatra',
    neurologist: 'Neurólogo',
    other: 'Otra',
    
    // Main Uses
    generateReports: 'Generar informes médicos',
    writePrescriptions: 'Escribir recetas',
    analyzeExams: 'Analizar imágenes médicas',
    patientManagement: 'Gestión de pacientes',
    
    // Medical AI
    uploadDocument: 'Adjuntar Documento',
    analyzeDocument: 'Analizar con IA',
    analyzing: 'Analizando...',
    medicalAnalysis: 'Análisis Médico',
    aiAssistant: 'Asistente IA Médica',
    specialistMode: 'Modo Especialista',
  },
};

export function getTranslation(lang: Language, key: keyof typeof translations['pt-BR']): string {
  return translations[lang][key] || translations['pt-BR'][key];
}

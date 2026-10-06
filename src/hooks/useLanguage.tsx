import { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'pt' | 'en' | 'es';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  pt: {
    // Common
    'common.export': 'Exportar',
    'common.configure': 'Configurar',
    'common.fromLastMonth': 'em relação ao mês passado',
    'common.completed': 'concluídos',
    'common.abandoned': 'abandonados',
    'common.critical': 'Crítico',
    'common.warning': 'Aviso',
    'common.info': 'Info',
    'common.admin': 'Admin',
    'common.logout': 'Sair',
    'common.profile': 'Perfil',
    'common.settings': 'Configurações',
    
    // Menu
    'menu.dashboard': 'Dashboard',
    'menu.clients': 'Pacientes',
    'menu.agenda': 'Agenda',
    'menu.financial': 'Financeiro',
    'menu.whatsapp': 'WhatsApp',
    'menu.iachat': 'IAChat',
    'menu.n8n': 'N8N',
    'menu.reports': 'Relatórios',
    
    // IAChat
    'iachat.title': 'Análise IAChat',
    'iachat.subtitle': 'Monitoramento e análise de desempenho do atendimento automatizado',
    'iachat.completedScheduled': 'Concluídos e Agendados',
    'iachat.completedNoSchedule': 'Concluídos sem Agendamento',
    'iachat.failures': 'Falhas',
    'iachat.flowAbandonment': 'Abandono do Fluxo',
    'iachat.followUp': 'Follow Up',
    'iachat.conversionRate': 'Taxa de Conversão',
    'iachat.overview': 'Visão Geral',
    'iachat.flowAnalysis': 'Análise de Fluxo',
    'iachat.performance': 'Desempenho',
    'iachat.alerts': 'Alertas',
    'iachat.successfulInteractions': 'Interações Bem-sucedidas',
    'iachat.withScheduling': 'Com Agendamento',
    'iachat.withoutScheduling': 'Sem Agendamento',
    'iachat.informationOnly': 'Apenas Informação',
    'iachat.userEngagement': 'Engajamento do Usuário',
    'iachat.averageRating': 'Avaliação Média',
    'iachat.responseTime': 'Tempo de Resposta',
    'iachat.sessionDuration': 'Duração da Sessão',
    'iachat.messagesPerSession': 'Mensagens por Sessão',
    'iachat.conversationFlow': 'Fluxo de Conversação',
    'iachat.flowDescription': 'Análise detalhada dos estágios do fluxo conversacional',
    'iachat.initialContact': 'Contato Inicial',
    'iachat.needsIdentification': 'Identificação de Necessidades',
    'iachat.proposal': 'Proposta',
    'iachat.scheduling': 'Agendamento',
    'iachat.confirmation': 'Confirmação',
    'iachat.responseQuality': 'Qualidade das Respostas',
    'iachat.accurateResponses': 'Respostas Precisas',
    'iachat.understandingRate': 'Taxa de Compreensão',
    'iachat.escalationRate': 'Taxa de Escalação',
    'iachat.businessImpact': 'Impacto no Negócio',
    'iachat.leadGeneration': 'Geração de Leads',
    'iachat.costReduction': 'Redução de Custos',
    'iachat.customerSatisfaction': 'Satisfação do Cliente',
    'iachat.activeAlerts': 'Alertas Ativos',
    'iachat.highAbandonmentRate': 'Alta Taxa de Abandono',
    'iachat.abandonmentDescription': 'Taxa de abandono acima de 20% na etapa de proposta',
    'iachat.slowResponseTime': 'Tempo de Resposta Lento',
    'iachat.responseDescription': 'Tempo médio de resposta acima de 2 segundos',
    'iachat.integrationUpdate': 'Atualização de Integração',
    'iachat.updateDescription': 'Nova versão do N8N disponível para atualização',
    
    // Auth
    'auth.login': 'Entrar',
    'auth.email': 'Email',
    'auth.password': 'Senha',
    'auth.adminAccess': 'Acesso Administrativo',
    'auth.userAccess': 'Acesso de Usuário',
    
    // SaaS
    'saas.user': 'Usuário',
    'saas.tenant': 'Usuário',
    'saas.selectTenant': 'Selecionar Usuário',
    'saas.adminPanel': 'Painel Administrativo',
    'saas.tenantManagement': 'Gestão de Usuários',
    'saas.userManagement': 'Gestão de Usuários',
    'saas.systemSettings': 'Configurações do Sistema',
    'saas.addUser': 'Adicionar Usuário',
    
    // WhatsApp
    'whatsapp.connected': 'WhatsApp Conectado',
    'whatsapp.disconnected': 'WhatsApp Desconectado',
    'whatsapp.connect': 'Conectar WhatsApp'
  },
  en: {
    // Common
    'common.export': 'Export',
    'common.configure': 'Configure',
    'common.fromLastMonth': 'from last month',
    'common.completed': 'completed',
    'common.abandoned': 'abandoned',
    'common.critical': 'Critical',
    'common.warning': 'Warning',
    'common.info': 'Info',
    'common.admin': 'Admin',
    'common.logout': 'Logout',
    'common.profile': 'Profile',
    'common.settings': 'Settings',
    
    // Menu
    'menu.dashboard': 'Dashboard',
    'menu.clients': 'Clients',
    'menu.agenda': 'Agenda',
    'menu.financial': 'Financial',
    'menu.whatsapp': 'WhatsApp',
    'menu.iachat': 'IAChat',
    'menu.n8n': 'N8N',
    'menu.reports': 'Reports',
    
    // IAChat
    'iachat.title': 'IAChat Analytics',
    'iachat.subtitle': 'Monitoring and performance analysis of automated customer service',
    'iachat.completedScheduled': 'Completed & Scheduled',
    'iachat.completedNoSchedule': 'Completed without Schedule',
    'iachat.failures': 'Failures',
    'iachat.flowAbandonment': 'Flow Abandonment',
    'iachat.followUp': 'Follow Up',
    'iachat.conversionRate': 'Conversion Rate',
    'iachat.overview': 'Overview',
    'iachat.flowAnalysis': 'Flow Analysis',
    'iachat.performance': 'Performance',
    'iachat.alerts': 'Alerts',
    'iachat.successfulInteractions': 'Successful Interactions',
    'iachat.withScheduling': 'With Scheduling',
    'iachat.withoutScheduling': 'Without Scheduling',
    'iachat.informationOnly': 'Information Only',
    'iachat.userEngagement': 'User Engagement',
    'iachat.averageRating': 'Average Rating',
    'iachat.responseTime': 'Response Time',
    'iachat.sessionDuration': 'Session Duration',
    'iachat.messagesPerSession': 'Messages per Session',
    'iachat.conversationFlow': 'Conversation Flow',
    'iachat.flowDescription': 'Detailed analysis of conversational flow stages',
    'iachat.initialContact': 'Initial Contact',
    'iachat.needsIdentification': 'Needs Identification',
    'iachat.proposal': 'Proposal',
    'iachat.scheduling': 'Scheduling',
    'iachat.confirmation': 'Confirmation',
    'iachat.responseQuality': 'Response Quality',
    'iachat.accurateResponses': 'Accurate Responses',
    'iachat.understandingRate': 'Understanding Rate',
    'iachat.escalationRate': 'Escalation Rate',
    'iachat.businessImpact': 'Business Impact',
    'iachat.leadGeneration': 'Lead Generation',
    'iachat.costReduction': 'Cost Reduction',
    'iachat.customerSatisfaction': 'Customer Satisfaction',
    'iachat.activeAlerts': 'Active Alerts',
    'iachat.highAbandonmentRate': 'High Abandonment Rate',
    'iachat.abandonmentDescription': 'Abandonment rate above 20% in proposal stage',
    'iachat.slowResponseTime': 'Slow Response Time',
    'iachat.responseDescription': 'Average response time above 2 seconds',
    'iachat.integrationUpdate': 'Integration Update',
    'iachat.updateDescription': 'New N8N version available for update',
    
    // Auth
    'auth.login': 'Login',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.adminAccess': 'Admin Access',
    'auth.userAccess': 'User Access',
    
    // SaaS
    'saas.user': 'User',
    'saas.tenant': 'User',
    'saas.selectTenant': 'Select User',
    'saas.adminPanel': 'Admin Panel',
    'saas.tenantManagement': 'User Management',
    'saas.userManagement': 'User Management',
    'saas.systemSettings': 'System Settings',
    'saas.addUser': 'Add User',
    
    // WhatsApp
    'whatsapp.connected': 'WhatsApp Connected',
    'whatsapp.disconnected': 'WhatsApp Disconnected',
    'whatsapp.connect': 'Connect WhatsApp'
  },
  es: {
    // Common
    'common.export': 'Exportar',
    'common.configure': 'Configurar',
    'common.fromLastMonth': 'del mes pasado',
    'common.completed': 'completados',
    'common.abandoned': 'abandonados',
    'common.critical': 'Crítico',
    'common.warning': 'Advertencia',
    'common.info': 'Info',
    'common.admin': 'Admin',
    'common.logout': 'Cerrar Sesión',
    'common.profile': 'Perfil',
    'common.settings': 'Configuración',
    
    // Menu
    'menu.dashboard': 'Dashboard',
    'menu.clients': 'Pacientes',
    'menu.agenda': 'Agenda',
    'menu.financial': 'Financiero',
    'menu.whatsapp': 'WhatsApp',
    'menu.iachat': 'IAChat',
    'menu.n8n': 'N8N',
    'menu.reports': 'Informes',
    
    // IAChat
    'iachat.title': 'Análisis IAChat',
    'iachat.subtitle': 'Monitoreo y análisis de rendimiento del servicio automatizado',
    'iachat.completedScheduled': 'Completados y Programados',
    'iachat.completedNoSchedule': 'Completados sin Programar',
    'iachat.failures': 'Fallas',
    'iachat.flowAbandonment': 'Abandono de Flujo',
    'iachat.followUp': 'Seguimiento',
    'iachat.conversionRate': 'Tasa de Conversión',
    'iachat.overview': 'Resumen',
    'iachat.flowAnalysis': 'Análisis de Flujo',
    'iachat.performance': 'Rendimiento',
    'iachat.alerts': 'Alertas',
    'iachat.successfulInteractions': 'Interacciones Exitosas',
    'iachat.withScheduling': 'Con Programación',
    'iachat.withoutScheduling': 'Sin Programación',
    'iachat.informationOnly': 'Solo Información',
    'iachat.userEngagement': 'Compromiso del Usuario',
    'iachat.averageRating': 'Calificación Promedio',
    'iachat.responseTime': 'Tiempo de Respuesta',
    'iachat.sessionDuration': 'Duración de Sesión',
    'iachat.messagesPerSession': 'Mensajes por Sesión',
    'iachat.conversationFlow': 'Flujo de Conversación',
    'iachat.flowDescription': 'Análisis detallado de las etapas del flujo conversacional',
    'iachat.initialContact': 'Contacto Inicial',
    'iachat.needsIdentification': 'Identificación de Necesidades',
    'iachat.proposal': 'Propuesta',
    'iachat.scheduling': 'Programación',
    'iachat.confirmation': 'Confirmación',
    'iachat.responseQuality': 'Calidad de Respuestas',
    'iachat.accurateResponses': 'Respuestas Precisas',
    'iachat.understandingRate': 'Tasa de Comprensión',
    'iachat.escalationRate': 'Tasa de Escalación',
    'iachat.businessImpact': 'Impacto en el Negocio',
    'iachat.leadGeneration': 'Generación de Leads',
    'iachat.costReduction': 'Reducción de Costos',
    'iachat.customerSatisfaction': 'Satisfacción del Cliente',
    'iachat.activeAlerts': 'Alertas Activas',
    'iachat.highAbandonmentRate': 'Alta Tasa de Abandono',
    'iachat.abandonmentDescription': 'Tasa de abandono superior al 20% en etapa de propuesta',
    'iachat.slowResponseTime': 'Tiempo de Respuesta Lento',
    'iachat.responseDescription': 'Tiempo promedio de respuesta superior a 2 segundos',
    'iachat.integrationUpdate': 'Actualización de Integración',
    'iachat.updateDescription': 'Nueva versión de N8N disponible para actualización',
    
    // Auth
    'auth.login': 'Iniciar Sesión',
    'auth.email': 'Email',
    'auth.password': 'Contraseña',
    'auth.adminAccess': 'Acceso Administrativo',
    'auth.userAccess': 'Acceso de Usuario',
    
    // SaaS
    'saas.user': 'Usuario',
    'saas.tenant': 'Usuario',
    'saas.selectTenant': 'Seleccionar Usuario',
    'saas.adminPanel': 'Panel de Administración',
    'saas.tenantManagement': 'Gestión de Usuarios',
    'saas.userManagement': 'Gestión de Usuarios',
    'saas.systemSettings': 'Configuración del Sistema',
    'saas.addUser': 'Agregar Usuario',
    
    // WhatsApp
    'whatsapp.connected': 'WhatsApp Conectado',
    'whatsapp.disconnected': 'WhatsApp Desconectado',
    'whatsapp.connect': 'Conectar WhatsApp'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('pt');

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
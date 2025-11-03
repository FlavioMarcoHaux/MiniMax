import { useStore } from './store';
import { AgentId } from './types';

export interface GuideStep {
  element: string; // CSS selector for the target element
  title: string;
  text: string;
  action?: () => void; // Optional action to run before showing the step
}

const mainDesktopTour: GuideStep[] = [
    {
      element: '[data-guide-id="guide-step-0"]',
      title: 'Seu Radar de Coerência (USV)',
      text: 'Este é o seu radar. Ele mede seu estado atual em 4 dimensões. Seu objetivo é expandir e equilibrar esta área para aumentar sua harmonia interior.',
    },
    {
      element: '[data-guide-id="guide-step-1"]',
      title: 'Sua Pontuação de Coerência (Φ)',
      text: 'Este é o seu Φ (Phi), uma pontuação que representa sua coerência geral. O aplicativo irá recomendar um mentor para ajudá-lo a aumentar essa pontuação.',
    },
    {
      element: '[data-guide-id="guide-step-2"]',
      title: 'Navegue até os Mentores',
      text: 'Os Mentores são IAs especializadas prontas para ajudá-lo. Clique aqui para conhecê-los.',
      action: () => useStore.getState().setView('agents'),
    },
    {
      element: '[data-guide-id="guide-step-3"]',
      title: 'Escolha um Mentor',
      text: 'Cada mentor oferece uma perspectiva única e ferramentas específicas. Vamos começar com o Mentor de Coerência. Clique nele para iniciar uma conversa.',
      action: () => useStore.getState().startSession({ type: 'agent', id: AgentId.COHERENCE }),
    },
    {
      element: '[data-guide-id="guide-step-4"]',
      title: 'Converse com seu Mentor',
      text: 'Você pode conversar com seu mentor por texto ou voz. Descreva o que você está sentindo ou pensando para receber orientação.',
    },
    {
      element: '[data-guide-id="guide-step-6"]',
      title: 'Use uma Ferramenta',
      text: 'Cada ferramenta tem uma função específica, como criar uma meditação ou analisar padrões de pensamento. Clique em uma ferramenta para explorá-la.',
    },
];

const mainMobileTour: GuideStep[] = [
    ...mainDesktopTour.slice(0, 4), // Steps 0 to 3 are the same
    {
      element: '[data-guide-id="guide-step-4"]',
      title: 'Converse com seu Mentor',
      text: 'Você pode conversar com seu mentor por texto ou voz. Descreva o que você está sentindo ou pensando para receber orientação.',
    },
    {
      element: '[data-guide-id="guide-step-5"]',
      title: 'Acesse as Ferramentas',
      text: 'As ferramentas do mentor estão aqui. Elas ajudam você a agir sobre os insights da conversa. Clique para ver as opções.',
    },
];


export const guides: Record<string, GuideStep[]> = {
  main_desktop: mainDesktopTour,
  main_mobile: mainMobileTour,
  mentor: [
    {
      element: '[data-guide-id="agent-room-header"]',
      title: 'Você está na Sala do Mentor',
      text: 'Aqui você pode conversar com ${agent.name}. Use este espaço para explorar seus pensamentos e obter orientação.',
    },
    {
      element: '[data-guide-id="guide-step-4"]',
      title: 'Envie sua Mensagem',
      text: 'Digite sua mensagem aqui ou use o microfone para falar. Pressione Enter ou o botão de envio para conversar.',
    },
    {
      element: '[data-guide-id="guide-step-6"]',
      title: 'Explore as Ferramentas',
      text: 'Quando estiver pronto para agir, explore as ferramentas do mentor aqui. Elas são projetadas para aplicar os insights da sua conversa.',
    },
  ],
  tool_meditation: [
     {
      element: '[data-guide-id="tool-meditation"]',
      title: 'Ferramenta: Meditação Guiada',
      text: 'Bem-vindo(a) à Meditação Guiada. Aqui você pode criar uma meditação de voz personalizada com base em sua intenção.',
    },
    {
      element: '[data-guide-id="meditation-prompt"]',
      title: 'Defina sua Intenção',
      text: 'Escreva sobre o que você gostaria de meditar. Se você veio de uma conversa com um mentor, uma sugestão será preenchida automaticamente.',
    },
     {
      element: '[data-guide-id="meditation-duration"]',
      title: 'Escolha a Duração',
      text: 'Ajuste o tempo da sua meditação aqui, de 1 a 15 minutos.',
    },
     {
      element: '[data-guide-id="meditation-generate-button"]',
      title: 'Gere sua Meditação',
      text: 'Quando estiver pronto, clique aqui. A IA criará um roteiro, uma imagem de fundo e o áudio para sua experiência.',
    },
  ],
  tool_content_analyzer: [{
      element: '[data-guide-id="tool-content_analyzer"]',
      title: 'Ferramenta: Analisador Consciente',
      text: 'Esta ferramenta analisa qualquer texto ou imagem sob a ótica do Princípio da Informação Consciente, oferecendo uma perspectiva mais profunda.',
  }],
  tool_guided_prayer: [{
      element: '[data-guide-id="tool-guided_prayer"]',
      title: 'Ferramenta: Oração Guiada',
      text: 'Defina uma intenção para receber uma oração profunda e personalizada, com opções para gerar áudio e uma imagem de suporte.',
  }],
  tool_prayer_pills: [{
      element: '[data-guide-id="tool-prayer_pills"]',
      title: 'Ferramenta: Pílulas de Oração',
      text: 'Receba uma dose rápida de inspiração. Defina uma intenção ou peça uma oração universal para o seu momento.',
  }],
  tool_dissonance_analyzer: [{
      element: '[data-guide-id="tool-dissonance_analyzer"]',
      title: 'Ferramenta: Analisador de Dissonância',
      text: 'Esta ferramenta analisa sua conversa recente com o mentor para identificar padrões de pensamento e crenças limitantes, ajudando você a encontrar pontos de crescimento.',
  }],
  tool_therapeutic_journal: [{
      element: '[data-guide-id="tool-therapeutic_journal"]',
      title: 'Ferramenta: Diário Terapêutico',
      text: 'Escreva seus pensamentos, sentimentos ou sonhos aqui. O mentor irá ler sua entrada e fornecer um feedback valioso para aumentar sua coerência.',
  }],
  tool_quantum_simulator: [{
      element: '[data-guide-id="tool-quantum_simulator"]',
      title: 'Ferramenta: Simulador Quântico',
      text: 'Este é um modelo conceitual para explorar como sua consciência e observação cocriam a realidade. Clique em "Observar" para colapsar uma possibilidade quântica.',
  }],
  tool_phi_frontier_radar: [{
      element: '[data-guide-id="tool-phi_frontier_radar"]',
      title: 'Ferramenta: Radar de Fronteira de Φ',
      text: 'Descubra conceitos de tecnologias futuristas que estão alinhadas com a evolução da consciência. Clique em "Rastrear" para receber uma ideia.',
  }],
  tool_dosh_diagnosis: [{
      element: '[data-guide-id="tool-dosh_diagnosis"]',
      title: 'Ferramenta: Diagnóstico Informacional',
      text: 'Responda a uma série de perguntas para que o mentor possa identificar seu padrão de desequilíbrio Ayurvédico (Dosha) e ajudá-lo a restaurar a harmonia.',
  }],
   tool_wellness_visualizer: [{
      element: '[data-guide-id="tool-wellness_visualizer"]',
      title: 'Ferramenta: Visualizador de Bem-Estar',
      text: 'Use estes controles deslizantes para registrar seu estado físico e emocional atual. Este feedback ajuda seus mentores a fornecerem orientações mais precisas.',
  }],
  tool_routine_aligner: [{
      element: '[data-guide-id="tool-routine_aligner"]',
      title: 'Ferramenta: Alinhador de Rotina',
      text: 'Com base no seu diagnóstico de Dosha, esta ferramenta criará uma rotina diária personalizada (Dinacharya) para otimizar sua energia e bem-estar.',
  }],
  tool_belief_resignifier: [{
      element: '[data-guide-id="tool-belief_resignifier"]',
      title: 'Ferramenta: Ressignificador de Crenças',
      text: 'Digite uma crença limitante sobre dinheiro, e o mentor irá ajudá-lo a transformá-la em uma afirmação de poder e abundância.',
  }],
  tool_emotional_spending_map: [{
      element: '[data-guide-id="tool-emotional_spending_map"]',
      title: 'Ferramenta: Mapa Emocional de Gastos',
      text: 'Esta ferramenta (em breve) irá ajudá-lo a conectar suas despesas com suas emoções, revelando padrões para uma vida financeira mais consciente.',
  }],
  tool_risk_calculator: [{
      element: '[data-guide-id="tool-risk_calculator"]',
      title: 'Ferramenta: Calculadora de Risco Lógico',
      text: 'Descreva um cenário de investimento para receber uma análise lógica e imparcial dos riscos, livre de viés emocional.',
  }],
  tool_archetype_journey: [{
      element: '[data-guide-id="tool-archetype_journey"]',
      title: 'Ferramenta: Jornada do Arquétipo',
      text: 'Descreva um desafio pessoal para que o Arquiteto da Consciência o reinterprete como parte de sua "Jornada do Herói", revelando o arquétipo que você está vivendo.',
  }],
  tool_verbal_frequency_analysis: [{
      element: '[data-guide-id="tool-verbal_frequency_analysis"]',
      title: 'Ferramenta: Análise de Frequência Verbal',
      text: 'Esta ferramenta mede a coerência emocional de sua conversa com um mentor, fornecendo um insight sobre seu estado vibracional e recomendando o próximo passo.',
  }],
  tool_live_conversation: [{
      element: '[data-guide-id="tool-live_conversation"]',
      title: 'Ferramenta: Diálogo com o Arquiteto',
      text: 'Inicie uma conversa de voz em tempo real com o Arquiteto da Consciência para uma orientação profunda e interativa.',
  }],
  tool_scheduled_session: [{
      element: '[data-guide-id="tool-scheduled_session"]',
      title: 'Ferramenta: Sessão Agendada',
      text: 'Agende uma chamada de voz proativa de um mentor para um horário específico, garantindo um momento dedicado para sua prática e desenvolvimento.',
  }],
};
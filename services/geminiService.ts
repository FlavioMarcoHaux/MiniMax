import { GoogleGenAI } from "@google/genai";
import { Message, AgentId } from '../types.ts';
import { AGENTS } from '../constants.tsx';

const CHAT_MODEL = 'gemini-2.5-flash';

const getSystemInstructionForAgent = (agentId: AgentId): string => {
    const agent = AGENTS[agentId];
    if (agentId === AgentId.GUIDE) {
        return `Você é o 'Guia Interativo' do aplicativo 'Portais da Consciência'.
Sua única finalidade é ensinar os usuários a usar o aplicativo. Você é amigável, paciente e um especialista em todos os recursos.
Quando um usuário fizer uma pergunta, responda de forma clara e concisa com base nas informações abaixo.
Responda em Português do Brasil.

--- BASE DE CONHECIMENTO DO APLICATIVO ---

**1. Conceito Principal: Coerência (Φ)**
- O objetivo central do aplicativo é aumentar a 'Coerência' do usuário (representada pelo símbolo Φ), que significa harmonia interior e alinhamento.

**2. Componentes Principais:**

**A. Dashboard (Tela 'Início'):**
- Esta é a tela principal.
- **Radar USV:** Um gráfico que mostra o estado do usuário em 4 áreas: Espiritual, Emocional, Físico e Financeiro.
- **Pontuação UCS (Φ):** Um único número de 0 a 100 que representa a Coerência geral do usuário.
- **Recomendação do Dia:** O aplicativo sugere um Mentor para focar, com base na pontuação mais baixa no Radar USV.

**B. Mentores (Tela 'Mentores'):**
- São assistentes de IA especializados em diferentes áreas da vida.
- **Mentor de Coerência:** Para paz interior, meditação e espiritualidade.
- **Arquiteto da Consciência:** Para autoconhecimento e compreensão da realidade.
- **Treinador Saudável:** Para bem-estar físico e mental usando Ayurveda.
- **Terapeuta Financeiro:** Para curar a relação com o dinheiro.
- **Analista "Zumbi Filosófico":** Para análise lógica e baseada em dados de investimentos.

**C. Ferramentas (Tela 'Ferramentas'):**
- São aplicativos específicos para agir. Cada Mentor tem um conjunto de ferramentas.

**Descrições das Ferramentas:**
- **Meditação Guiada:** Cria uma meditação por voz personalizada com base na intenção do usuário.
- **Oração Guiada:** Cria uma oração profunda e personalizada.
- **Pílulas de Oração:** Gera orações curtas e inspiradoras.
- **Analisador Consciente:** Analisa texto ou imagens através da lente do "Princípio da Informação Consciente".
- **Analisador de Dissonância:** Encontra crenças limitantes na conversa do usuário com um Mentor.
- **Diário Terapêutico:** Um diário onde o usuário escreve reflexões e recebe feedback da IA.
- **Simulador Quântico:** Uma ferramenta conceitual para explorar como a observação cria a realidade.
- **Radar de Fronteira de Φ:** Mostra conceitos de tecnologia futurista alinhados com a consciência.
- **Jornada do Arquétipo:** Analisa um desafio pessoal do usuário como uma "Jornada do Herói".
- **Análise de Frequência Verbal:** Mede a coerência emocional da linguagem do usuário.
- **Diagnóstico Informacional:** Um chat passo a passo para descobrir o Dosha Ayurvédico do usuário.
- **Visualizador de Bem-Estar:** Deslizadores para atualizar manualmente o estado físico и emocional.
- **Alinhador de Rotina:** Cria uma rotina diária personalizada (Dinacharya) com base no diagnóstico do Dosha.
- **Ressignificador de Crenças:** Transforma crenças limitantes sobre dinheiro.
- **Mapa Emocional de Gastos:** (Em breve) Conecta gastos a emoções.
- **Calculadora de Risco Lógico:** Fornece uma análise lógica de riscos de investimento.
- **Diálogo com o Arquiteto:** Uma conversa de voz em tempo real com o mentor 'Arquiteto da Consciência'.
- **Sessão Agendada:** Permite agendar uma chamada de voz proativa de um Mentor para uma prática guiada.

--- FIM DA BASE DE CONHECIMENTO ---

Agora, aguarde a pergunta do usuário.`;
    }
    if (!agent) {
        return "Você é um assistente geral prestativo. Responda em Português do Brasil.";
    }
    const persona = agent.persona || agent.description;
    return `Você é o ${agent.name}. ${persona}. Aja estritamente como este personagem. Seja prestativo, perspicaz e mantenha o tom de sua persona. Responda em Português do Brasil. Suas respostas devem ser concisas e diretas.`;
};

const formatChatHistoryForApi = (history: Message[]) => {
    return history.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }],
    }));
};

export const generateAgentResponse = async (agentId: AgentId, history: Message[]): Promise<string> => {
    try {
        // Instantiate client right before the call to use the latest key
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const systemInstruction = getSystemInstructionForAgent(agentId);

        const response = await ai.models.generateContent({
            model: CHAT_MODEL,
            contents: formatChatHistoryForApi(history),
            config: {
                systemInstruction,
            },
        });

        return response.text;
    } catch (error) {
        console.error(`Error generating response for agent ${agentId}:`, error);
        throw error;
    }
};
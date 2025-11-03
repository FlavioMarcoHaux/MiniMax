import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { produce } from 'immer';
import { Chat } from '@google/genai';

import {
    AgentId,
    Message,
    Schedule,
    Session,
    ToastMessage,
    ToolStates,
    CoherenceVector,
    View,
    GuideState,
    ToolId,
} from './types.ts';
import { generateAgentResponse } from './services/geminiService.ts';
import { createDoshaChat, startDoshaConversation, continueDoshaConversation } from './services/geminiDoshaService.ts';
import { createRoutineAlignerChat, startRoutineAlignerConversation, continueRoutineAlignerConversation } from './services/geminiRoutineAlignerService.ts';
import { AGENTS } from './constants.tsx';
import { getFriendlyErrorMessage } from './utils/errorUtils.ts';
import { useAistudioKey } from './hooks/useAistudioKey.ts';

// Helper to calculate UCS from the new 7-dimension vector
const calculateUcs = (vector: CoherenceVector): number => {
    const { proposito, mental, relacional, emocional, somatico, eticoAcao, recursos } = vector;
    // Emotional is inverted (higher is worse), so we use (100 - emotional)
    const avg = (proposito + mental + relacional + (100 - emocional) + somatico + eticoAcao + recursos) / 7;
    return Math.round(avg);
};

// Helper to get recommendation from the new 7-dimension vector
const getPicRecommendation = (vector: CoherenceVector): { agentId: AgentId, dimensionName: string } => {
    const dimensions: { key: keyof CoherenceVector, agent: AgentId, name: string }[] = [
        { key: 'proposito', agent: AgentId.SELF_KNOWLEDGE, name: 'Propósito' },
        { key: 'mental', agent: AgentId.SELF_KNOWLEDGE, name: 'Mental' },
        { key: 'relacional', agent: AgentId.COHERENCE, name: 'Relacional' },
        { key: 'emocional', agent: AgentId.COHERENCE, name: 'Emocional' },
        { key: 'somatico', agent: AgentId.HEALTH, name: 'Somático' },
        { key: 'eticoAcao', agent: AgentId.COHERENCE, name: 'Ético-Ação' },
        { key: 'recursos', agent: AgentId.EMOTIONAL_FINANCE, name: 'Recursos' },
    ];
    
    const scores = dimensions.map(dim => ({
        ...dim,
        value: dim.key === 'emocional' ? 100 - vector[dim.key] : vector[dim.key]
    }));

    const lowest = scores.sort((a, b) => a.value - b.value)[0];
    return { agentId: lowest.agent, dimensionName: lowest.name };
};


// Centralized error handler to check for API key issues
const handleApiError = (error: any, defaultMessage: string, addToast: AppState['addToast']): string => {
    const friendlyMessage = getFriendlyErrorMessage(error, defaultMessage);
    if (friendlyMessage.includes("API") && friendlyMessage.includes("inválida")) {
        // This is a key error. Reset the key state to force re-selection.
        useAistudioKey.getState().resetKey();
    }
    addToast(friendlyMessage, 'error');
    return friendlyMessage;
};


interface VisitedState {
    mentors: AgentId[];
    tools: ToolId[];
}

type FontSize = 'small' | 'normal' | 'large';

interface AppState {
    coherenceVector: CoherenceVector;
    ucs: number;
    recommendation: AgentId | null;
    recommendationName: string;
    activeView: View;
    currentSession: Session | null;
    lastAgentContext: AgentId | null;
    chatHistories: Record<AgentId, Message[]>;
    isLoadingMessage: boolean;
    toolStates: ToolStates;
    toasts: ToastMessage[];
    doshaChat: Chat | null;
    routineAlignerChat: Chat | null;
    isOnboardingVisible: boolean;
    schedules: Schedule[];
    guideState: GuideState;
    visited: VisitedState;
    pendingGuide: { type: 'tool', id: ToolId } | null;
    isSelectingKey: boolean;
    fontSize: FontSize;

    // Actions
    setView: (view: View) => void;
    startSession: (session: Session) => void;
    endSession: () => void;
    switchAgent: (agentId: AgentId) => void;
    addInitialMessage: (agentId: AgentId) => void;
    handleSendMessage: (agentId: AgentId, text: string) => Promise<void>;
    handleDoshaSendMessage: (text: string) => Promise<void>;
    initDoshaChat: () => Promise<void>;
    handleRoutineAlignerSendMessage: (text: string) => Promise<void>;
    initRoutineAlignerChat: () => Promise<void>;
    setToolState: <T extends keyof ToolStates>(toolId: T, state: ToolStates[T]) => void;
    addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
    removeToast: (id: string) => void;
    closeOnboarding: () => void;
    addSchedule: (schedule: Omit<Schedule, 'id' | 'status'>) => void;
    updateScheduleStatus: (scheduleId: string, status: Schedule['status']) => void;
    updateCoherenceDimensions: (updates: Partial<Pick<CoherenceVector, 'somatico' | 'emocional'>>) => void;
    goBackToAgentRoom: () => void;
    startGuide: (tourId: string, context?: any) => void;
    nextGuideStep: () => void;
    endGuide: () => void;
    markAsVisited: (type: 'mentor' | 'tool', id: AgentId | ToolId) => void;
    setPendingGuide: (guide: { type: 'tool', id: ToolId } | null) => void;
    setIsSelectingKey: (isSelecting: boolean) => void;
    setFontSize: (size: FontSize) => void;
}

export const useStore = create<AppState>()(
    persist(
        (set, get) => ({
            // State
            coherenceVector: { proposito: 60, mental: 75, relacional: 65, emocional: 50, somatico: 70, eticoAcao: 80, recursos: 55 },
            ucs: 66, // Initial calculation
            recommendation: AgentId.EMOTIONAL_FINANCE,
            recommendationName: 'Recursos',
            activeView: 'dashboard',
            currentSession: null,
            lastAgentContext: null,
            chatHistories: {
                [AgentId.COHERENCE]: [],
                [AgentId.SELF_KNOWLEDGE]: [],
                [AgentId.HEALTH]: [],
                [AgentId.EMOTIONAL_FINANCE]: [],
                [AgentId.INVESTMENTS]: [],
                [AgentId.GUIDE]: [],
            },
            isLoadingMessage: false,
            toolStates: {
                therapeuticJournal: { entry: '', feedback: null, error: null },
                doshaDiagnosis: { messages: [], isFinished: false, error: null },
                routineAligner: { messages: [], isFinished: false, error: null },
                doshaResult: null,
            },
            toasts: [],
            doshaChat: null,
            routineAlignerChat: null,
            isOnboardingVisible: true,
            schedules: [],
            guideState: { isActive: false, step: 0, tourId: null, context: {} },
            visited: { mentors: [], tools: [] },
            pendingGuide: null,
            isSelectingKey: false,
            fontSize: 'normal',

            // Actions
            setFontSize: (size) => set({ fontSize: size }),

            setView: (view) => set({ activeView: view }),

            startSession: (session) => {
                // For interactive chat tools, always re-initialize to get fresh context
                if (session.type === 'dosh_diagnosis') {
                    get().initDoshaChat();
                }
                if (session.type === 'routine_aligner') {
                    get().initRoutineAlignerChat();
                }

                if (session.type === 'agent') {
                    set({ currentSession: session, lastAgentContext: session.id });
                    get().addInitialMessage(session.id);
                } else {
                    set({ currentSession: session });
                }
            },

            endSession: () => set({ currentSession: null }),
            
            switchAgent: (agentId) => {
                set({ 
                    currentSession: { type: 'agent', id: agentId },
                    lastAgentContext: agentId,
                });
                get().addInitialMessage(agentId);
            },

            addInitialMessage: (agentId) => {
                set(produce((draft: AppState) => {
                    const agent = AGENTS[agentId];
                    if (agent?.initialMessage && draft.chatHistories[agentId]?.length === 0) {
                        const initialMessage: Message = {
                            id: `agent-initial-${agentId}`,
                            sender: 'agent',
                            text: agent.initialMessage,
                            timestamp: Date.now()
                        };
                        draft.chatHistories[agentId].push(initialMessage);
                    }
                }));
            },

            handleSendMessage: async (agentId, text) => {
                const userMessage: Message = { id: `user-${Date.now()}`, sender: 'user', text, timestamp: Date.now() };
                
                set(produce((draft: AppState) => {
                    if (!draft.chatHistories[agentId]) draft.chatHistories[agentId] = [];
                    draft.chatHistories[agentId].push(userMessage);
                    draft.isLoadingMessage = true;
                }));

                try {
                    const history = get().chatHistories[agentId];
                    const agentResponseText = await generateAgentResponse(agentId, history);
                    
                    const agentMessage: Message = { id: `agent-${Date.now()}`, sender: 'agent', text: agentResponseText, timestamp: Date.now() };
                    
                    set(produce((draft: AppState) => {
                        draft.chatHistories[agentId].push(agentMessage);
                    }));

                } catch (error) {
                    const defaultMessage = `Desculpe, não consegui processar sua mensagem com ${AGENTS[agentId].name}.`;
                    const errorText = handleApiError(error, defaultMessage, get().addToast);
                    
                    const errorMessage: Message = { id: `agent-error-${Date.now()}`, sender: 'agent', text: errorText, timestamp: Date.now() };
                    set(produce((draft: AppState) => {
                        draft.chatHistories[agentId].push(errorMessage);
                    }));
                } finally {
                    set({ isLoadingMessage: false });
                }
            },
            
            initDoshaChat: async () => {
                set(produce((draft: AppState) => {
                    draft.isLoadingMessage = true;
                    draft.toolStates.doshaDiagnosis = { messages: [], isFinished: false, error: null };
                }));
                try {
                    const chat = createDoshaChat();
                    const firstMessage = await startDoshaConversation(chat);
                    set(produce((draft: AppState) => {
                        draft.doshaChat = chat as any; // Handle Zustand+Immer+Promise type issue
                        if(draft.toolStates.doshaDiagnosis) {
                            draft.toolStates.doshaDiagnosis.messages.push({
                                id: `agent-${Date.now()}`, sender: 'agent', text: firstMessage, timestamp: Date.now()
                            });
                        }
                    }));
                } catch (error) {
                    const errorMsg = handleApiError(error, "Não foi possível iniciar o diagnóstico. Tente novamente.", get().addToast);
                    set(produce((draft: AppState) => {
                         if(draft.toolStates.doshaDiagnosis) draft.toolStates.doshaDiagnosis.error = errorMsg;
                    }));
                } finally {
                    set({ isLoadingMessage: false });
                }
            },
            
            handleDoshaSendMessage: async (text) => {
                const chat = get().doshaChat;
                if (!chat) return;

                const userMessage: Message = { id: `user-${Date.now()}`, sender: 'user', text, timestamp: Date.now() };

                set(produce((draft: AppState) => {
                    if(draft.toolStates.doshaDiagnosis) {
                        draft.toolStates.doshaDiagnosis.messages.push(userMessage);
                        draft.isLoadingMessage = true;
                        draft.toolStates.doshaDiagnosis.error = null;
                    }
                }));

                try {
                    const responseText = await continueDoshaConversation(chat, text);
                    const isFinished = responseText.includes("Dissonância Dominante");
                    const agentMessage: Message = { id: `agent-${Date.now()}`, sender: 'agent', text: responseText, timestamp: Date.now() };
                    
                    set(produce((draft: AppState) => {
                        const doshaDiagnosisState = draft.toolStates.doshaDiagnosis;
                        if(doshaDiagnosisState) {
                           doshaDiagnosisState.messages.push(agentMessage);
                           doshaDiagnosisState.isFinished = isFinished;
                           if (isFinished) {
                               const doshaMatch = responseText.match(/Dissonância Dominante \(Desequilíbrio\):\s*(\w+)/i);
                               if (doshaMatch && doshaMatch[1]) {
                                   const dosha = doshaMatch[1] as 'Vata' | 'Pitta' | 'Kapha';
                                   draft.toolStates.doshaResult = dosha;
                                   get().addToast(`Diagnóstico concluído: Desequilíbrio de ${dosha} detectado.`, 'info');
                               }
                           }
                        }
                    }));
                } catch (error) {
                     const errorMsg = handleApiError(error, "Ocorreu um erro ao processar sua resposta. Tente novamente.", get().addToast);
                     set(produce((draft: AppState) => {
                        if(draft.toolStates.doshaDiagnosis) draft.toolStates.doshaDiagnosis.error = errorMsg;
                    }));
                } finally {
                     set({ isLoadingMessage: false });
                }
            },

            initRoutineAlignerChat: async () => {
                set(produce((draft: AppState) => {
                    draft.isLoadingMessage = true;
                    draft.toolStates.routineAligner = { messages: [], isFinished: false, error: null };
                }));
                try {
                    const chat = createRoutineAlignerChat();
                    const doshaResult = get().toolStates.doshaResult;
                    const firstMessage = await startRoutineAlignerConversation(chat, doshaResult);
                    set(produce((draft: AppState) => {
                        draft.routineAlignerChat = chat as any;
                        if(draft.toolStates.routineAligner) {
                            draft.toolStates.routineAligner.messages.push({
                                id: `agent-${Date.now()}`, sender: 'agent', text: firstMessage, timestamp: Date.now()
                            });
                        }
                    }));
                } catch (error) {
                    const errorMsg = handleApiError(error, "Não foi possível iniciar o alinhador. Tente novamente.", get().addToast);
                    set(produce((draft: AppState) => {
                         if(draft.toolStates.routineAligner) draft.toolStates.routineAligner.error = errorMsg;
                    }));
                } finally {
                    set({ isLoadingMessage: false });
                }
            },
            
            handleRoutineAlignerSendMessage: async (text) => {
                const chat = get().routineAlignerChat;
                if (!chat) return;

                const userMessage: Message = { id: `user-${Date.now()}`, sender: 'user', text, timestamp: Date.now() };

                set(produce((draft: AppState) => {
                    if(draft.toolStates.routineAligner) {
                        draft.toolStates.routineAligner.messages.push(userMessage);
                        draft.isLoadingMessage = true;
                        draft.toolStates.routineAligner.error = null;
                    }
                }));

                try {
                    const responseText = await continueRoutineAlignerConversation(chat, text);
                    const isFinished = responseText.includes("esta rotina é um algoritmo, não uma prisão");
                    const agentMessage: Message = { id: `agent-${Date.now()}`, sender: 'agent', text: responseText, timestamp: Date.now() };
                    
                    set(produce((draft: AppState) => {
                        if(draft.toolStates.routineAligner) {
                           draft.toolStates.routineAligner.messages.push(agentMessage);
                           draft.toolStates.routineAligner.isFinished = isFinished;
                        }
                    }));
                } catch (error) {
                     const errorMsg = handleApiError(error, "Ocorreu um erro ao processar sua resposta. Tente novamente.", get().addToast);
                     set(produce((draft: AppState) => {
                        if(draft.toolStates.routineAligner) draft.toolStates.routineAligner.error = errorMsg;
                    }));
                } finally {
                     set({ isLoadingMessage: false });
                }
            },
            
            setToolState: (toolId, state) => {
                set(produce((draft: AppState) => {
                    draft.toolStates[toolId] = state as any;
                }));
            },

            addToast: (message: string, type: 'success' | 'error' | 'info' = 'info') => {
                const id = `toast-${Date.now()}`;
                const newToast: ToastMessage = { id, message, type };
                set(state => ({ toasts: [...state.toasts, newToast] }));
            },

            removeToast: (id) => {
                set(state => ({ toasts: state.toasts.filter(t => t.id !== id) }));
            },

            closeOnboarding: () => set({ isOnboardingVisible: false }),

            addSchedule: (schedule) => {
                const newSchedule: Schedule = {
                    ...schedule,
                    id: `schedule-${Date.now()}`,
                    status: 'scheduled',
                };
                set(produce((draft: AppState) => {
                    draft.schedules.push(newSchedule);
                }));
                get().addToast(`Sessão agendada para ${new Date(schedule.time).toLocaleString()}`, 'success');
            },
            
            updateScheduleStatus: (scheduleId, status) => {
                set(produce((draft: AppState) => {
                    const schedule = draft.schedules.find(s => s.id === scheduleId);
                    if (schedule) {
                        schedule.status = status;
                    }
                }));
            },
            
            updateCoherenceDimensions: (updates) => {
                set(produce((draft: AppState) => {
                    if (updates.somatico !== undefined) {
                        draft.coherenceVector.somatico = Math.max(0, Math.min(100, updates.somatico));
                    }
                    if (updates.emocional !== undefined) {
                        draft.coherenceVector.emocional = Math.max(0, Math.min(100, updates.emocional));
                    }
                }));
            },

            goBackToAgentRoom: () => {
                const lastAgentId = get().lastAgentContext;
                if (lastAgentId) {
                    get().startSession({ type: 'agent', id: lastAgentId });
                } else {
                    // Fallback: if there's no context, just end the session.
                    get().endSession();
                }
            },

            startGuide: (tourId, context = {}) => {
                // Only reset the view for the main tour. Contextual tours should overlay the current view.
                if (tourId === 'main') {
                    set({
                        isOnboardingVisible: false,
                        currentSession: null,
                        activeView: 'dashboard',
                        guideState: { isActive: true, step: 0, tourId, context }
                    });
                } else {
                    set({
                        guideState: { isActive: true, step: 0, tourId, context }
                    });
                }
            },

            nextGuideStep: () => {
                set(produce((draft: AppState) => {
                    draft.guideState.step += 1;
                }));
            },

            endGuide: () => {
                set({ guideState: { isActive: false, step: 0, tourId: null, context: {} } });
            },

            markAsVisited: (type, id) => {
                set(produce((draft: AppState) => {
                    if (type === 'mentor' && !draft.visited.mentors.includes(id as AgentId)) {
                        draft.visited.mentors.push(id as AgentId);
                    } else if (type === 'tool' && !draft.visited.tools.includes(id as ToolId)) {
                        draft.visited.tools.push(id as ToolId);
                    }
                }));
            },

            setPendingGuide: (guide) => {
                set({ pendingGuide: guide });
            },
            
            setIsSelectingKey: (isSelecting: boolean) => set({ isSelectingKey: isSelecting }),

        }),
        {
            name: 'coherence-hub-storage-v2', // version bump for new data structure
            storage: createJSONStorage(() => localStorage),
            partialize: (state) =>
                Object.fromEntries(
                    Object.entries(state).filter(([key]) => !['doshaChat', 'routineAlignerChat', 'guideState', 'pendingGuide', 'toasts', 'isLoadingMessage', 'isSelectingKey'].includes(key))
                ),
            onRehydrateStorage: () => (state) => {
                if (state) {
                    const ucs = calculateUcs(state.coherenceVector);
                    const { agentId, dimensionName } = getPicRecommendation(state.coherenceVector);
                    state.ucs = ucs;
                    state.recommendation = agentId;
                    state.recommendationName = dimensionName;
                }
            },
        }
    )
);

// Update derived state whenever coherenceVector changes
useStore.subscribe(
    (state, prevState) => {
        if (state.coherenceVector !== prevState.coherenceVector) {
            const newUcs = calculateUcs(state.coherenceVector);
            const { agentId, dimensionName } = getPicRecommendation(state.coherenceVector);
            useStore.setState({ ucs: newUcs, recommendation: agentId, recommendationName: dimensionName });
        }
    }
);
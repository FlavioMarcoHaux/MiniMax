import React, { useEffect } from 'react';
import Sidebar from './components/Sidebar.tsx';
import Dashboard from './components/Dashboard.tsx';
import AgentDirectory from './components/AgentDirectory.tsx';
import ToolsDirectory from './components/ToolsDirectory.tsx';
import AgentRoom from './components/AgentRoom.tsx';
import GuidedMeditation from './components/GuidedMeditation.tsx';
import ContentAnalyzer from './components/ContentAnalyzer.tsx';
import GuidedPrayer from './components/GuidedPrayer.tsx';
import PrayerPills from './components/PrayerPills.tsx';
import DissonanceAnalyzer from './components/DissonanceAnalyzer.tsx';
import TherapeuticJournal from './components/TherapeuticJournal.tsx';
import QuantumSimulator from './components/QuantumSimulator.tsx';
import PhiFrontierRadar from './components/PhiFrontierRadar.tsx';
import DoshaDiagnosis from './components/DoshaDiagnosis.tsx';
import WellnessVisualizer from './components/WellnessVisualizer.tsx';
import BeliefResignifier from './components/BeliefResignifier.tsx';
import EmotionalSpendingMap from './components/EmotionalSpendingMap.tsx';
import RiskCalculator from './components/RiskCalculator.tsx';
import ArchetypeJourney from './components/ArchetypeJourney.tsx';
import LiveConversation from './components/LiveConversation.tsx';
import Onboarding from './components/Onboarding.tsx';
import Toast from './components/Toast.tsx';
import Scheduler from './components/Scheduler.tsx';
import ScheduledSessionHandler from './components/ScheduledSessionHandler.tsx';
import GuidedMeditationVoice from './components/GuidedMeditationVoice.tsx';
import RoutineAligner from './components/RoutineAligner.tsx';
import HelpCenter from './components/HelpCenter.tsx';
import ApiKeyWrapper from './components/ApiKeyWrapper.tsx'; // Import the wrapper
import InteractiveGuide from './components/InteractiveGuide.tsx'; // Import the guide
import { useStore } from './store.ts';
import { AGENTS, toolMetadata } from './constants.tsx';
// FIX: Import the missing 'VerbalFrequencyAnalysis' component to resolve a reference error.
import VerbalFrequencyAnalysis from './components/VerbalFrequencyAnalysis.tsx';
import { useToolGuide } from './hooks/useToolGuide.ts';

const App: React.FC = () => {
    const { 
        currentSession, 
        endSession, 
        toasts, 
        removeToast, 
        isOnboardingVisible,
        closeOnboarding,
        activeView,
        isSelectingKey,
        fontSize,
    } = useStore();
    
    // Proactive check for scheduled sessions
    useEffect(() => {
        const checkSchedulesInterval = setInterval(() => {
            const { currentSession, schedules, updateScheduleStatus, startSession, addToast } = useStore.getState();
            
            if (currentSession) return;

            const now = Date.now();
            const dueSchedule = schedules.find(s => s.status === 'scheduled' && s.time <= now);
            
            if (dueSchedule) {
                updateScheduleStatus(dueSchedule.id, 'completed');
                const activityName = toolMetadata[dueSchedule.activity]?.title || 'sessão';
                addToast(`Seu mentor está ligando para a sua ${activityName}.`, 'info');
                startSession({ type: 'scheduled_session_handler', schedule: dueSchedule });
            }
        }, 5000);

        return () => clearInterval(checkSchedulesInterval);
    }, []);

    // Add font size class to root element
    useEffect(() => {
        const root = document.documentElement;
        root.classList.remove('font-size-small', 'font-size-normal', 'font-size-large');
        root.classList.add(`font-size-${fontSize}`);
    }, [fontSize]);


    const renderView = () => {
        switch (activeView) {
            case 'agents':
                return <AgentDirectory />;
            case 'tools':
                return <ToolsDirectory />;
            case 'dashboard':
            default:
                return <Dashboard />;
        }
    };
    
    // A simple component wrapper to inject the tool guide hook
    const withToolGuide = (Component: React.FC<any>, toolId: any) => {
        const WrappedComponent: React.FC<any> = (props) => {
            useToolGuide(toolId);
            return <Component {...props} />;
        };
        return WrappedComponent;
    };


    const renderSession = () => {
        if (!currentSession) return null;

        const sessionProps = { onExit: endSession };

        const wrapInApiKeyCheck = (component: React.ReactNode) => (
            <ApiKeyWrapper>{component}</ApiKeyWrapper>
        );

        switch (currentSession.type) {
            case 'agent':
                const agent = AGENTS[currentSession.id];
                if (!agent) return null;
                return wrapInApiKeyCheck(<AgentRoom agent={agent} {...sessionProps} />);
            case 'meditation':
                const GuidedMeditationWithGuide = withToolGuide(GuidedMeditation, 'meditation');
                return wrapInApiKeyCheck(<GuidedMeditationWithGuide {...sessionProps} />);
            case 'content_analyzer':
                const ContentAnalyzerWithGuide = withToolGuide(ContentAnalyzer, 'content_analyzer');
                return wrapInApiKeyCheck(<ContentAnalyzerWithGuide {...sessionProps} />);
            case 'guided_prayer':
                 const GuidedPrayerWithGuide = withToolGuide(GuidedPrayer, 'guided_prayer');
                return wrapInApiKeyCheck(<GuidedPrayerWithGuide {...sessionProps} />);
            case 'prayer_pills':
                 const PrayerPillsWithGuide = withToolGuide(PrayerPills, 'prayer_pills');
                return wrapInApiKeyCheck(<PrayerPillsWithGuide {...sessionProps} />);
            case 'dissonance_analyzer':
                const DissonanceAnalyzerWithGuide = withToolGuide(DissonanceAnalyzer, 'dissonance_analyzer');
                return wrapInApiKeyCheck(<DissonanceAnalyzerWithGuide {...sessionProps} />);
            case 'therapeutic_journal':
                const TherapeuticJournalWithGuide = withToolGuide(TherapeuticJournal, 'therapeutic_journal');
                return wrapInApiKeyCheck(<TherapeuticJournalWithGuide {...sessionProps} />);
            case 'quantum_simulator':
                const QuantumSimulatorWithGuide = withToolGuide(QuantumSimulator, 'quantum_simulator');
                return wrapInApiKeyCheck(<QuantumSimulatorWithGuide {...sessionProps} />);
            case 'phi_frontier_radar':
                // This tool doesn't use the API, so it doesn't need the wrapper.
                const PhiFrontierRadarWithGuide = withToolGuide(PhiFrontierRadar, 'phi_frontier_radar');
                return <PhiFrontierRadarWithGuide {...sessionProps} />;
            case 'dosh_diagnosis':
                const DoshaDiagnosisWithGuide = withToolGuide(DoshaDiagnosis, 'dosh_diagnosis');
                return wrapInApiKeyCheck(<DoshaDiagnosisWithGuide {...sessionProps} />);
            case 'wellness_visualizer':
                // This tool doesn't use the API.
                const WellnessVisualizerWithGuide = withToolGuide(WellnessVisualizer, 'wellness_visualizer');
                return <WellnessVisualizerWithGuide {...sessionProps} />;
            case 'routine_aligner':
                const RoutineAlignerWithGuide = withToolGuide(RoutineAligner, 'routine_aligner');
                return wrapInApiKeyCheck(<RoutineAlignerWithGuide {...sessionProps} />);
            case 'belief_resignifier':
                 const BeliefResignifierWithGuide = withToolGuide(BeliefResignifier, 'belief_resignifier');
                return <BeliefResignifierWithGuide {...sessionProps} />;
            case 'emotional_spending_map':
                // This is a placeholder.
                const EmotionalSpendingMapWithGuide = withToolGuide(EmotionalSpendingMap, 'emotional_spending_map');
                return <EmotionalSpendingMapWithGuide {...sessionProps} />;
            case 'risk_calculator':
                 const RiskCalculatorWithGuide = withToolGuide(RiskCalculator, 'risk_calculator');
                return <RiskCalculatorWithGuide {...sessionProps} />;
            case 'archetype_journey':
                const ArchetypeJourneyWithGuide = withToolGuide(ArchetypeJourney, 'archetype_journey');
                return wrapInApiKeyCheck(<ArchetypeJourneyWithGuide {...sessionProps} />);
            case 'verbal_frequency_analysis':
                const VerbalFrequencyAnalysisWithGuide = withToolGuide(VerbalFrequencyAnalysis, 'verbal_frequency_analysis');
                return wrapInApiKeyCheck(<VerbalFrequencyAnalysisWithGuide {...sessionProps} />);
            case 'live_conversation':
                const LiveConversationWithGuide = withToolGuide(LiveConversation, 'live_conversation');
                return wrapInApiKeyCheck(<LiveConversationWithGuide {...sessionProps} />);
            case 'scheduled_session':
                 // Scheduler itself doesn't need a key, but the handler will.
                const SchedulerWithGuide = withToolGuide(Scheduler, 'scheduled_session');
                return <SchedulerWithGuide {...sessionProps} />;
            case 'scheduled_session_handler':
                return wrapInApiKeyCheck(<ScheduledSessionHandler schedule={currentSession.schedule} {...sessionProps} />);
             case 'guided_meditation_voice':
                return wrapInApiKeyCheck(<GuidedMeditationVoice schedule={currentSession.schedule} {...sessionProps} />);
            case 'help_center':
                return <HelpCenter {...sessionProps} />;
            default:
                return null;
        }
    };
    
    return (
        <div className="bg-gray-900 text-white font-sans w-screen h-screen flex">
             <Onboarding show={isOnboardingVisible} onClose={closeOnboarding} />
            <Sidebar />
            <main className="flex-1 h-screen overflow-y-auto relative no-scrollbar">
                {renderView()}
            </main>
            
            {currentSession && (
                <div className={`fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center transition-opacity duration-300 ${isSelectingKey ? 'opacity-0 pointer-events-none' : 'animate-fade-in'}`}>
                    <div className="w-full h-full max-w-7xl max-h-[90vh] my-auto">
                         {renderSession()}
                    </div>
                </div>
            )}
            
             {/* Toast Container */}
            <div className="fixed top-5 right-5 z-[101] w-full max-w-sm space-y-2">
                {toasts.map(toast => (
                    <Toast key={toast.id} toast={toast} onClose={removeToast} />
                ))}
            </div>

            {/* Interactive Guide Orchestrator */}
            <InteractiveGuide />
        </div>
    );
};

export default App;
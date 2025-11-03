import React, { useState, useEffect } from 'react';
// FIX: Imported the missing 'X' icon from 'lucide-react' to be used in the exit button.
import { HeartHandshake, TrendingUp, HeartPulse, Smile, X } from 'lucide-react';
import { useStore } from '../store.ts';

const WellnessVisualizer: React.FC<{ onExit: () => void }> = ({ onExit }) => {
    const { coherenceVector, updateCoherenceDimensions, addToast, goBackToAgentRoom } = useStore();

    // Initialize local state from the global store
    const [somatico, setSomatico] = useState(coherenceVector.somatico);
    const [emocional, setEmocional] = useState(100 - coherenceVector.emocional);

    // Sync local state if global state changes from another source
    useEffect(() => {
        setSomatico(coherenceVector.somatico);
        setEmocional(100 - coherenceVector.emocional);
    }, [coherenceVector]);
    
    const handleSave = () => {
        updateCoherenceDimensions({
            somatico: somatico,
            emocional: 100 - emocional, // Invert back for the store
        });
        addToast('Seu estado de bem-estar foi atualizado!', 'success');
        onExit();
    };

    return (
        <div className="h-full w-full flex flex-col p-1 glass-pane rounded-2xl animate-fade-in">
             <header className="flex items-center justify-between p-4 border-b border-gray-700/50">
                <div className="flex items-center gap-3">
                    <HeartHandshake className="w-8 h-8 text-green-400" />
                    <h1 className="text-xl font-bold text-gray-200">Visualizador de Bem-Estar</h1>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={goBackToAgentRoom}
                        className="text-gray-300 hover:text-white transition-colors text-sm font-semibold py-1 px-3 rounded-md border border-gray-600 hover:border-gray-400"
                        aria-label="Voltar para o Mentor"
                    >
                        Voltar
                    </button>
                    <button onClick={onExit} className="text-gray-400 hover:text-white transition-colors" aria-label="Exit Wellness Visualizer">
                        <X size={24} />
                    </button>
                </div>
            </header>
            <main className="flex-1 flex flex-col items-center justify-center p-8 text-center" data-guide-id="tool-wellness_visualizer">
                <p className="text-lg text-gray-400 mb-10 max-w-md">
                    Registre como você se sente agora. Este feedback ajuda seus mentores a guiarem sua jornada com mais precisão.
                </p>

                <div className="w-full max-w-lg space-y-8">
                    {/* Somatic Energy Slider */}
                    <div>
                        <label htmlFor="somatic-energy" className="flex items-center justify-center text-xl font-semibold text-gray-200 mb-3">
                            <HeartPulse className="w-6 h-6 mr-2 text-green-400" />
                            Energia Somática (Corpo)
                        </label>
                        <div className="relative">
                            <input
                                type="range" id="somatic-energy" min="0" max="100"
                                value={somatico}
                                onChange={(e) => setSomatico(parseInt(e.target.value, 10))}
                                className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500"
                            />
                             <span className="absolute -bottom-6 left-0 text-xs text-gray-400">Baixa</span>
                             <span className="absolute -bottom-6 right-0 text-xs text-gray-400">Alta</span>
                        </div>
                        <span className="mt-8 inline-block text-5xl font-bold text-green-400">{somatico}</span>
                    </div>

                    {/* Emotional Coherence Slider */}
                    <div>
                        <label htmlFor="emotional-coherence" className="flex items-center justify-center text-xl font-semibold text-gray-200 mb-3">
                            <Smile className="w-6 h-6 mr-2 text-blue-400" />
                            Coerência Emocional
                        </label>
                         <div className="relative">
                            <input
                                type="range" id="emotional-coherence" min="0" max="100"
                                value={emocional}
                                onChange={(e) => setEmocional(parseInt(e.target.value, 10))}
                                className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                            />
                             <span className="absolute -bottom-6 left-0 text-xs text-gray-400">Caótica</span>
                             <span className="absolute -bottom-6 right-0 text-xs text-gray-400">Coerente</span>
                        </div>
                        <span className="mt-8 inline-block text-5xl font-bold text-blue-400">{emocional}</span>
                    </div>
                </div>

                <button onClick={handleSave} className="mt-12 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-full text-lg flex items-center gap-2">
                    <TrendingUp size={20} />
                    Atualizar meu Estado
                </button>
            </main>
        </div>
    );
};

export default WellnessVisualizer;
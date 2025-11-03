import React from 'react';
import { useStore } from '../store.ts';
import { Agent, AgentId } from '../types.ts';
import CoherenceGeometry from './CoherenceGeometry.tsx';
import { AGENTS } from '../constants.tsx';
import FontSizeSelector from './FontSizeSelector.tsx';

const Dashboard: React.FC = () => {
    const { coherenceVector, ucs, recommendation, recommendationName, startSession } = useStore();
    const recommendedAgent = recommendation ? AGENTS[recommendation] : null;

    return (
        <div className="p-4 sm:p-8 animate-fade-in">
            <header className="mb-12">
                 <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-100">Hub de Coerência</h1>
                        <p className="text-lg md:text-xl text-gray-400 mt-2">Bem-vindo(a) ao seu espaço de alinhamento interior.</p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:items-start">
                <div data-guide-id="guide-step-0" className="lg:col-span-3 glass-pane rounded-2xl p-6 flex items-center justify-center">
                    <CoherenceGeometry vector={coherenceVector} />
                </div>

                <div className="lg:col-span-2 flex flex-col gap-8">
                    <FontSizeSelector />

                    <div data-guide-id="guide-step-1" className="glass-pane rounded-2xl p-6 text-center">
                        <p className="text-gray-400 text-lg">Sua Coerência (Φ)</p>
                        <p className="text-6xl font-bold text-indigo-400 my-2">{ucs}</p>
                        <p className="text-gray-500">Um reflexo de sua harmonia interior.</p>
                    </div>

                    {recommendedAgent && (
                        <div className="glass-pane rounded-2xl p-6 animate-fade-in">
                             <h3 className="font-bold text-xl mb-4 text-indigo-400">Recomendação do Dia</h3>
                             <div 
                                className="flex items-center gap-4 cursor-pointer group"
                                onClick={() => startSession({ type: 'agent', id: recommendedAgent.id })}
                             >
                                 <recommendedAgent.icon className={`w-12 h-12 ${recommendedAgent.themeColor} transition-transform group-hover:scale-110`} />
                                 <div>
                                     <h4 className="font-semibold text-lg">{recommendedAgent.name}</h4>
                                     <p className="text-sm text-gray-400">Focar em {recommendationName} pode aumentar sua coerência.</p>
                                 </div>
                             </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
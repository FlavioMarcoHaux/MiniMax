import React from 'react';
import { useStore } from '../store.ts';

const FontSizeSelector: React.FC = () => {
    const { fontSize, setFontSize } = useStore();

    const sizes = [
        { id: 'small', label: 'pequeno' },
        { id: 'normal', label: 'Medio' },
        { id: 'large', label: 'Grande' },
    ] as const;

    return (
        <div className="glass-pane rounded-2xl p-6 w-full">
            <h3 className="font-bold text-lg mb-4 text-indigo-400">Tamanho da Letra</h3>
            <div className="flex justify-stretch items-center gap-2">
                {sizes.map(size => (
                    <button
                        key={size.id}
                        onClick={() => setFontSize(size.id)}
                        className={`py-2 rounded-md text-sm font-semibold transition-colors flex-1 text-center border ${
                            fontSize === size.id
                                ? 'bg-indigo-600 text-white border-indigo-500'
                                : 'bg-transparent text-gray-300 hover:bg-gray-700/50 border-gray-600'
                        }`}
                    >
                        {size.label}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default FontSizeSelector;
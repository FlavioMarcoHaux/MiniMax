import { useState, useCallback, useEffect } from 'react';
import { create } from 'zustand';

// Use a simple zustand store to manage the key state globally
// This allows other parts of the app (like the main store's error handler)
// to reset the key state if an API call fails due to an invalid key.
interface AistudioKeyState {
    hasKey: boolean | null;
    setHasKey: (hasKey: boolean | null) => void;
    resetKey: () => void;
}
export const useAistudioKey = create<AistudioKeyState>((set) => ({
    hasKey: null,
    setHasKey: (hasKey) => set({ hasKey }),
    resetKey: () => set({ hasKey: false }),
}));


// This is the hook that components will use
export const useAistudioKeyManager = (enabled: boolean = true) => {
    const { hasKey, setHasKey } = useAistudioKey();

    const checkKey = useCallback(async () => {
        if (!enabled) {
            setHasKey(true);
            return;
        }
        try {
            // This will throw an error if window.aistudio is not defined,
            // which will be caught below. This correctly handles the race condition
            // where the aistudio object is not immediately available.
            const hasApiKey = await window.aistudio.hasSelectedApiKey();
            setHasKey(hasApiKey);
        } catch (error) {
            console.error("Could not check for AI Studio API key (this is expected in local dev):", error);
            // If checking fails for any reason (e.g., aistudio object not ready), assume no key is present.
            setHasKey(false);
        }
    }, [enabled, setHasKey]);
    
    useEffect(() => {
        // Only check the key on initial mount if the status is unknown
        if (hasKey === null) {
            checkKey();
        }
    }, [checkKey, hasKey]);
    
    const selectKey = useCallback(async () => {
        if (!enabled) return;
        try {
            // This will throw if the AI Studio API is not available
            await window.aistudio.openSelectKey();
            // Optimistically update state to true, assuming the user selected a key.
            // A subsequent failed API call or re-check can correct this if they cancelled.
            setHasKey(true);
        } catch (error) {
            console.error("Could not open AI Studio key selection (this is expected in local dev):", error);
            // Propagate the error so the calling component can handle it (e.g., show a toast).
            throw new Error("A funcionalidade de seleção de chave de API não está disponível.");
        }
    }, [enabled, setHasKey]);

    return { hasKey, selectKey, checkKey };
};


declare global {
    interface AIStudio {
        hasSelectedApiKey: () => Promise<boolean>;
        openSelectKey: () => Promise<void>;
    }

    interface Window {
        aistudio?: AIStudio;
    }
}
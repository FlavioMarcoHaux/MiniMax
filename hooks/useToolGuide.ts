import { useEffect } from 'react';
import { useStore } from '../store.ts';
import { ToolId } from '../types.ts';

export const useToolGuide = (toolId: ToolId) => {
    const { pendingGuide, startGuide, setPendingGuide, markAsVisited } = useStore(state => ({
        pendingGuide: state.pendingGuide,
        startGuide: state.startGuide,
        setPendingGuide: state.setPendingGuide,
        markAsVisited: state.markAsVisited
    }));

    useEffect(() => {
        if (pendingGuide && pendingGuide.type === 'tool' && pendingGuide.id === toolId) {
            // Use a short timeout to allow the tool component to fully render
            setTimeout(() => {
                markAsVisited('tool', toolId);
                startGuide(`tool_${toolId}`);
                setPendingGuide(null); // Clear the pending guide after it's been triggered
            }, 300);
        }
    }, [pendingGuide, toolId, startGuide, setPendingGuide, markAsVisited]);
};

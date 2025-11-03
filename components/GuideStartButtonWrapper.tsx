import React from 'react';
import { useAistudioKeyManager, useAistudioKey } from '../hooks/useAistudioKey.ts';
import { useStore } from '../store.ts';

interface GuideStartButtonWrapperProps {
    children: React.ReactNode;
    tourId: string;
    context?: any;
}

const GuideStartButtonWrapper: React.FC<GuideStartButtonWrapperProps> = ({ children, tourId, context }) => {
    const { hasKey, selectKey } = useAistudioKeyManager(true);
    const { startGuide, addToast, setIsSelectingKey } = useStore();

    const handleClick = async () => {
        if (hasKey) {
            startGuide(tourId, context);
            return;
        }

        // Hide app modals to show the AI Studio dialog
        setIsSelectingKey(true);
        addToast('É necessário selecionar uma chave de API para o tour.', 'info');
        
        try {
            await selectKey();
        } catch (e) {
            console.error("Error opening key selection for guide:", e);
            addToast(e instanceof Error ? e.message : 'Ocorreu um erro ao selecionar a chave.', 'error');
        } finally {
            // This block ensures the UI always becomes visible again,
            // regardless of whether key selection succeeded or failed.
            setIsSelectingKey(false);
            
            // Check if the key is now selected before starting the guide.
            // This handles the case where the user successfully selected a key.
            const keyIsNowSelected = await window.aistudio?.hasSelectedApiKey();
            if (keyIsNowSelected) {
                // If the key state was false, update it.
                if (!hasKey) {
                    useAistudioKey.getState().setHasKey(true);
                }
                addToast('Chave de API selecionada!', 'success');
                // Wait for the modal fade-in animation to complete before starting the guide
                setTimeout(() => startGuide(tourId, context), 300);
            } else {
                 if (hasKey) { // It was optimistically set to true but user cancelled
                    useAistudioKey.getState().setHasKey(false);
                }
                addToast('O tour foi cancelado pois a chave de API é necessária.', 'info');
            }
        }
    };

    const child = React.Children.only(children);
    // Clone the child element (the button) and inject the new onClick handler
    const childWithHandler = React.cloneElement(child as React.ReactElement<any>, {
        onClick: handleClick,
        // Disable the button while the initial key check is loading
        disabled: hasKey === null || (child as React.ReactElement<any>).props.disabled,
    });

    return childWithHandler;
};

export default GuideStartButtonWrapper;
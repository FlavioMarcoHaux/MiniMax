import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { useStore } from '../store.ts';
import { guides, GuideStep } from '../guides.ts';
import GuideTooltip from './GuideTooltip.tsx';
import useMediaQuery from '../hooks/useMediaQuery.ts';

const InteractiveGuide: React.FC = () => {
    const { guideState, nextGuideStep, endGuide } = useStore();
    const { isActive, step, tourId, context } = guideState;
    const isMobile = !useMediaQuery('(min-width: 1024px)');

    const [spotlightStyle, setSpotlightStyle] = useState<React.CSSProperties>({ display: 'none' });
    const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({ visibility: 'hidden' });
    const [currentStep, setCurrentStep] = useState<GuideStep | null>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);

    const effectiveTourId = tourId === 'main' ? (isMobile ? 'main_mobile' : 'main_desktop') : tourId;
    const tour = effectiveTourId ? guides[effectiveTourId] : null;

    useEffect(() => {
        if (!isActive || !tour) {
            setCurrentStep(null);
            return;
        }

        const stepToShow = tour[step];

        if (stepToShow) {
            if (stepToShow.action) {
                stepToShow.action();
            }
            setCurrentStep(stepToShow);
        } else {
            endGuide();
        }
    }, [isActive, effectiveTourId, step, tour, nextGuideStep, endGuide]);

    useLayoutEffect(() => {
        if (!isActive || !currentStep || !currentStep.element) {
            setSpotlightStyle({ display: 'none' });
            setTooltipStyle({ visibility: 'hidden' });
            return;
        }

        let attempts = 0;
        const maxAttempts = 30; // 3 seconds timeout (30 * 100ms)
        let intervalId: number;

        const findAndPosition = () => {
            const targetElement = document.querySelector(currentStep.element) as HTMLElement;

            if (targetElement && targetElement.offsetWidth > 0 && targetElement.offsetHeight > 0) {
                clearInterval(intervalId);

                targetElement.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });

                const scrollTimeout = setTimeout(() => {
                    const targetRect = targetElement.getBoundingClientRect();

                    // 1. Set Spotlight Position
                    setSpotlightStyle({
                        width: `${targetRect.width + 12}px`,
                        height: `${targetRect.height + 12}px`,
                        top: `${targetRect.top - 6}px`,
                        left: `${targetRect.left - 6}px`,
                        display: 'block',
                    });

                    // 2. Calculate and Set Tooltip Position (viewport-aware)
                    const tooltipNode = tooltipRef.current;
                    const tooltipWidth = 320;
                    const tooltipHeight = tooltipNode ? tooltipNode.offsetHeight : 150;
                    const margin = 12;

                    let top = targetRect.bottom + margin;
                    let left = targetRect.left;

                    if (top + tooltipHeight > window.innerHeight) {
                        top = targetRect.top - tooltipHeight - margin;
                    }
                    if (top < 0) {
                        top = margin;
                    }
                    if (left + tooltipWidth > window.innerWidth) {
                        left = window.innerWidth - tooltipWidth - margin;
                    }
                    if (left < 0) {
                        left = margin;
                    }

                    setTooltipStyle({
                        top: `${top}px`,
                        left: `${left}px`,
                        visibility: 'visible',
                    });

                }, 400); // Wait for scroll to settle

                return () => clearTimeout(scrollTimeout);
            } else {
                attempts++;
                if (attempts > maxAttempts) {
                    clearInterval(intervalId);
                    console.warn(`Guide element not found:`, currentStep.element);
                    endGuide();
                }
            }
        };

        intervalId = setInterval(findAndPosition, 100) as unknown as number;

        return () => clearInterval(intervalId);
    }, [currentStep, isActive, endGuide]);

    if (!isActive || !currentStep || !tour) {
        return null;
    }

    const handleNext = () => {
        if (step >= tour.length - 1) {
            endGuide();
        } else {
            nextGuideStep();
        }
    };

    const handleSkip = () => {
        endGuide();
    };

    const content = {
        title: currentStep.title.replace(/\$\{agent\.name\}/g, context?.agent?.name || 'seu mentor'),
        text: currentStep.text.replace(/\$\{agent\.name\}/g, context?.agent?.name || 'seu mentor'),
    };
    
    return (
        <>
            <div 
                className="guide-overlay" 
                style={{ 
                    opacity: isActive ? 1 : 0, 
                    pointerEvents: isActive ? 'auto' : 'none' 
                }} 
                onClick={handleSkip} 
            />
            <div 
                className="guide-spotlight guide-spotlight-pulse" 
                style={spotlightStyle} 
            />
            <GuideTooltip
                ref={tooltipRef}
                step={step}
                totalSteps={tour.length}
                content={content}
                style={tooltipStyle}
                onNext={handleNext}
                onSkip={handleSkip}
            />
        </>
    );
};

export default InteractiveGuide;
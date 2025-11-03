import { useState, useEffect } from 'react';

const useMediaQuery = (query: string): boolean => {
    // FIX: Initialize state by checking the media query immediately.
    // This prevents a flash of incorrect layout on initial render.
    const [matches, setMatches] = useState(() => {
        if (typeof window !== 'undefined') {
            return window.matchMedia(query).matches;
        }
        return false;
    });

    useEffect(() => {
        // Double-check for window existence for safety in non-browser environments.
        if (typeof window === 'undefined') {
            return;
        }
        
        const media = window.matchMedia(query);
        // Update state if it has changed since the initial render.
        if (media.matches !== matches) {
            setMatches(media.matches);
        }
        
        // Use the modern addEventListener/removeEventListener API for better performance and compatibility.
        const listener = (event: MediaQueryListEvent) => setMatches(event.matches);
        media.addEventListener('change', listener);
        
        return () => media.removeEventListener('change', listener);
    }, [matches, query]);

    return matches;
};

export default useMediaQuery;

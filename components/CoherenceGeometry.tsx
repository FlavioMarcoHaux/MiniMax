import React from 'react';
import { CoherenceVector } from '../types.ts';

interface CoherenceGeometryProps {
    vector: CoherenceVector;
}

const CoherenceGeometry: React.FC<CoherenceGeometryProps> = ({ vector }) => {
    const size = 350;
    const padding = 40; // Create space for labels
    const radius = (size / 2) - padding; // Radius of the main chart grid
    const center = size / 2;

    const dimensions: { key: keyof CoherenceVector; name: string; }[] = [
        { key: 'proposito', name: 'Propósito' },
        { key: 'mental', name: 'Mental' },
        { key: 'relacional', name: 'Relacional' },
        { key: 'emocional', name: 'Emocional' },
        { key: 'somatico', name: 'Somático' },
        { key: 'eticoAcao', name: 'Ético-Ação' },
        { key: 'recursos', name: 'Recursos' },
    ];

    const values = dimensions.map(dim => {
        const value = vector[dim.key];
        // Invert emotional for display, as it represents dissonance (lower is better)
        return dim.key === 'emocional' ? 100 - value : value;
    });

    const angleStep = (2 * Math.PI) / dimensions.length;
    const startAngle = -Math.PI / 2; // Start at the top

    const points = values.map((value, i) => {
        const angle = startAngle + i * angleStep;
        const pointRadius = (value / 100) * radius;
        const x = center + pointRadius * Math.cos(angle);
        const y = center + pointRadius * Math.sin(angle);
        return `${x},${y}`;
    }).join(' ');
    
    const labelPoints = dimensions.map((dim, i) => {
        const angle = startAngle + i * angleStep;
        const labelRadius = radius + 18; // Place labels just outside the main grid
        const x = center + labelRadius * Math.cos(angle);
        const y = center + labelRadius * Math.sin(angle);
        
        let textAnchor: 'start' | 'middle' | 'end' = 'middle';
        let dominantBaseline: 'auto' | 'hanging' | 'middle' | 'alphabetic' = 'middle';
        let dy = 0;

        // Precise alignment for each of the 7 points
        switch(i) {
            case 0: // Top
                textAnchor = 'middle';
                dominantBaseline = 'alphabetic';
                dy = -4; // Nudge up
                break;
            case 1: // Top-right
                textAnchor = 'start';
                dominantBaseline = 'middle';
                break;
            case 2: // Bottom-right
                textAnchor = 'start';
                dominantBaseline = 'middle';
                break;
            case 3: // Bottom-ish right (angle is ~64deg)
                textAnchor = 'start';
                dominantBaseline = 'hanging';
                dy = 4; // Nudge down
                break;
            case 4: // Bottom-ish left (angle is ~115deg)
                textAnchor = 'end';
                dominantBaseline = 'hanging';
                dy = 4; // Nudge down
                break;
            case 5: // Bottom-left
                textAnchor = 'end';
                dominantBaseline = 'middle';
                break;
            case 6: // Top-left
                textAnchor = 'end';
                dominantBaseline = 'middle';
                break;
        }

        return { x, y, dy, label: dim.name, textAnchor, dominantBaseline };
    });

    return (
        <svg width="100%" height="100%" viewBox={`0 0 ${size} ${size}`}>
            <defs>
                <radialGradient id="glow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                    <stop offset="0%" style={{ stopColor: 'rgba(79, 70, 229, 0.4)', stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: 'rgba(79, 70, 229, 0)', stopOpacity: 0 }} />
                </radialGradient>
            </defs>
            
            {/* Central Glow */}
            <circle cx={center} cy={center} r={radius * 0.6} fill="url(#glow)" />

            {/* Concentric Circles */}
            {[0.25, 0.5, 0.75, 1].map(r => (
                 <circle
                    key={r}
                    cx={center}
                    cy={center}
                    r={radius * r}
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.1)"
                    strokeWidth="1"
                />
            ))}
             {/* Radial Lines */}
            {values.map((_, i) => (
                <line
                    key={i}
                    x1={center}
                    y1={center}
                    x2={center + radius * Math.cos(startAngle + i * angleStep)}
                    y2={center + radius * Math.sin(startAngle + i * angleStep)}
                    stroke="rgba(255, 255, 255, 0.1)"
                    strokeWidth="1"
                />
            ))}
           
            {/* Data Polygon */}
            <polygon
                points={points}
                fill="rgba(79, 70, 229, 0.3)" 
                stroke="#4F46E5"
                strokeWidth="2"
            />

            {/* Labels */}
            {labelPoints.map(({ x, y, dy, label, textAnchor, dominantBaseline }) => (
                <text
                    key={label}
                    x={x}
                    y={y}
                    dy={dy}
                    fill="rgba(255, 255, 255, 0.9)"
                    fontSize="12"
                    textAnchor={textAnchor}
                    dominantBaseline={dominantBaseline as any}
                    className="font-medium chart-label"
                >
                    {label}
                </text>
            ))}
        </svg>
    );
};

export default CoherenceGeometry;
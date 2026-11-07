import React, { useMemo } from 'react';
import { Nuqta } from './Icon';

/**
 * DawaProgress (Formerly MoonProgress)
 * Redesigned to completely align with bedigital visual identity:
 * - Geometric circular worship meter with 24-grid inspired precision
 * - Deep navy (#0B1F3A) background with crisp teal (#0FB5AE) and gold (#E0A526) indicators
 * - Signature gold Nuqta diamond accent
 * - Crisp pixel typography with zero overlapping UI artifacts
 */

export default function DawaProgress({ percentage = 0, size = 150, showLabel = true, label = 'إنجاز اليوم' }) {
    const clampedPct = Math.min(100, Math.max(0, percentage));

    const progressConfig = useMemo(() => {
        const strokeWidth = 8;
        const r = size / 2 - strokeWidth - 2;
        const cx = size / 2;
        const cy = size / 2;
        const circumference = 2 * Math.PI * r;
        const offset = circumference - (clampedPct / 100) * circumference;
        const isComplete = clampedPct >= 100;

        return { r, cx, cy, strokeWidth, circumference, offset, isComplete };
    }, [clampedPct, size]);

    return (
        <div
            className="dawa-progress"
            style={{
                position: 'relative',
                display: 'inline-flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                userSelect: 'none',
            }}
        >
            <div
                style={{
                    position: 'relative',
                    width: `${size}px`,
                    height: `${size}px`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <svg
                    width={size}
                    height={size}
                    viewBox={`0 0 ${size} ${size}`}
                    style={{ transform: 'rotate(-90deg)', filter: 'drop-shadow(3px 3px 0px #050E1A)' }}
                >
                    <defs>
                        <linearGradient id="dawaProgressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#0FB5AE" />
                            <stop offset="60%" stopColor="#0FB5AE" />
                            <stop offset="100%" stopColor="#E0A526" />
                        </linearGradient>
                    </defs>

                    {/* Dark inner circle container */}
                    <circle
                        cx={progressConfig.cx}
                        cy={progressConfig.cy}
                        r={progressConfig.r}
                        fill="#0B1F3A"
                        stroke="#16365C"
                        strokeWidth={progressConfig.strokeWidth}
                    />

                    {/* Active progress arc */}
                    {clampedPct > 0 && (
                        <circle
                            cx={progressConfig.cx}
                            cy={progressConfig.cy}
                            r={progressConfig.r}
                            fill="none"
                            stroke="url(#dawaProgressGrad)"
                            strokeWidth={progressConfig.strokeWidth}
                            strokeDasharray={progressConfig.circumference}
                            strokeDashoffset={progressConfig.offset}
                            strokeLinecap="butt"
                            style={{
                                transition: 'stroke-dashoffset 0.6s cubic-bezier(0.2, 0, 0, 1)',
                            }}
                        />
                    )}

                    {/* 4 Quadrant tick marks (pixel style) */}
                    {[0, 90, 180, 270].map(deg => (
                        <line
                            key={deg}
                            x1={progressConfig.cx + (progressConfig.r - 4) * Math.cos((deg * Math.PI) / 180)}
                            y1={progressConfig.cy + (progressConfig.r - 4) * Math.sin((deg * Math.PI) / 180)}
                            x2={progressConfig.cx + (progressConfig.r + 4) * Math.cos((deg * Math.PI) / 180)}
                            y2={progressConfig.cy + (progressConfig.r + 4) * Math.sin((deg * Math.PI) / 180)}
                            stroke="#050E1A"
                            strokeWidth="2"
                        />
                    ))}
                </svg>

                {/* Center Content: Floating Nuqta + Percentage + Status */}
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        pointerEvents: 'none',
                        textAlign: 'center',
                    }}
                >
                    {/* Nuqta Gold Diamond */}
                    <div
                        style={{
                            width: `${Math.max(8, size * 0.07)}px`,
                            height: `${Math.max(8, size * 0.07)}px`,
                            background: '#E0A526',
                            transform: 'rotate(45deg)',
                            marginBottom: '4px',
                            boxShadow: '0 0 8px rgba(224, 165, 38, 0.4)',
                        }}
                    />

                    {/* Numeric Percentage */}
                    <span
                        style={{
                            fontFamily: "'Space Grotesk', 'Silkscreen', monospace",
                            fontSize: `${size * 0.22}px`,
                            fontWeight: 800,
                            lineHeight: 1,
                            color: progressConfig.isComplete ? '#E0A526' : '#FFFFFF',
                            letterSpacing: '-0.5px',
                        }}
                    >
                        {Math.round(clampedPct)}%
                    </span>

                    {/* Small Status Note */}
                    <span
                        style={{
                            font: 'var(--text-pixel)',
                            fontSize: `${Math.max(10, size * 0.075)}px`,
                            color: progressConfig.isComplete ? '#0FB5AE' : 'var(--bd-teal-300, #7BD6D3)',
                            marginTop: '4px',
                            fontWeight: 600,
                        }}
                    >
                        {progressConfig.isComplete ? 'تم الإتمام' : label}
                    </span>
                </div>
            </div>

            {showLabel && (
                <div style={{ marginTop: 'var(--space-2)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Nuqta size={6} color={progressConfig.isComplete ? '#E0A526' : '#0FB5AE'} />
                    <span
                        style={{
                            font: 'var(--text-label-md)',
                            color: progressConfig.isComplete ? 'var(--bd-gold)' : 'var(--color-on-surface-variant)',
                            fontWeight: 600,
                        }}
                    >
                        {progressConfig.isComplete ? 'تقبل الله طاعاتكم اليومية' : 'متابعة جدول العبادات'}
                    </span>
                    <Nuqta size={6} color={progressConfig.isComplete ? '#E0A526' : '#0FB5AE'} />
                </div>
            )}
        </div>
    );
}

// Backward compatibility export
export { DawaProgress as MoonProgress };

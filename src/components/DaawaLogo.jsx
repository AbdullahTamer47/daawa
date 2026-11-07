import React from 'react';
import { Nuqta } from './Icon';

/**
 * Official «دعوة» App Logo & Visual Emblem
 * Designed strictly according to the bedigital Brand Identity:
 * - 24x24 pixel grid alignment
 * - 2-unit stroke with stepped miter joins (zero rounded curves)
 * - Teal (#0FB5AE) digital accent bar
 * - Signature 45° gold Nuqta (#E0A526) diamond
 * - Pure geometric Arabic typography
 */

export function DaawaEmblem({ size = 36, className = '', style = {} }) {
    const teal = '#0FB5AE';
    const gold = '#E0A526';
    const stroke = '#FFFFFF';

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 32 32"
            fill="none"
            className={`daawa-emblem ${className}`}
            style={{
                display: 'inline-block',
                verticalAlign: 'middle',
                flexShrink: 0,
                filter: 'drop-shadow(2px 2px 0px #050E1A)',
                ...style,
            }}
        >
            {/* Background square container with stepped pixel corners */}
            <rect x="2" y="2" width="28" height="28" fill="#0B1F3A" stroke="#16365C" strokeWidth="1.5" />

            {/* Stepped Islamic Arch / Mihrab Frame (2-unit stroke, sharp stepped joins) */}
            <path
                d="M8 26 V14 H10 V10 H12 V7 H14 V5 H18 V7 H20 V10 H22 V14 H24 V26"
                stroke={stroke}
                strokeWidth="2"
                strokeLinecap="square"
                strokeLinejoin="miter"
                fill="none"
            />

            {/* Stepped Minaret Cap / Beacon */}
            <path
                d="M15 3 H17 V5 H15 Z"
                fill={teal}
            />

            {/* The Central Radiant Gold Nuqta (45° diamond) */}
            <polygon
                points="16,13 19,16 16,19 13,16"
                fill={gold}
            />

            {/* Teal Digital Accent Baseline */}
            <rect x="10" y="22" width="12" height="2" fill={teal} />

            {/* Base platform steps */}
            <line x1="6" y1="26" x2="26" y2="26" stroke={stroke} strokeWidth="2" strokeLinecap="square" />

            {/* Pixel dissolve trail (bedigital signature) */}
            <rect x="25" y="6" width="2" height="2" fill={teal} />
            <rect x="27" y="8" width="2" height="2" fill={teal} opacity="0.6" />
        </svg>
    );
}

export default function DaawaLogo({
    size = 'medium', // 'small' | 'medium' | 'large'
    showSubtitle = true,
    showCompanyBadge = false,
    className = '',
    style = {},
}) {
    const emblemSizes = { small: 28, medium: 38, large: 56 };
    const titleSizes = { small: '1.25rem', medium: '1.65rem', large: '2.4rem' };
    const emblemSize = emblemSizes[size] || 38;
    const titleSize = titleSizes[size] || '1.65rem';

    return (
        <div
            className={`daawa-brand-logo ${className}`}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '12px',
                userSelect: 'none',
                ...style,
            }}
        >
            <DaawaEmblem size={emblemSize} />

            <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'right' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span
                        style={{
                            fontFamily: "'Space Grotesk', system-ui, -apple-system, sans-serif",
                            fontSize: titleSize,
                            fontWeight: 900,
                            letterSpacing: '-0.5px',
                            color: 'var(--bd-white, #FFFFFF)',
                            lineHeight: 1.1,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                        }}
                    >
                        دعوة
                    </span>
                    <Nuqta size={size === 'large' ? 10 : 8} color="var(--bd-gold, #E0A526)" />
                </div>

                {showSubtitle && (
                    <span
                        style={{
                            font: 'var(--text-pixel, 0.7rem monospace)',
                            color: 'var(--bd-teal-300, #7BD6D3)',
                            fontSize: size === 'small' ? '0.65rem' : '0.75rem',
                            letterSpacing: '0.5px',
                            marginTop: '2px',
                        }}
                    >
                        رفيق المسلم اليومي
                    </span>
                )}

                {showCompanyBadge && (
                    <span
                        style={{
                            font: 'var(--text-pixel, 0.6rem monospace)',
                            color: 'var(--bd-gold, #E0A526)',
                            fontSize: '0.6rem',
                            marginTop: '2px',
                        }}
                    >
                        من bedigital
                    </span>
                )}
            </div>
        </div>
    );
}


import React from 'react';

/**
 * bedigital Brand Icon System
 * Designed strictly following Page 7 of bedigital Brand Identity:
 * - 24 x 24 pixel grid
 * - 2-unit stroke (never thinner, never thicker)
 * - Corners are stair steps, never curves
 * - One teal accent (#0FB5AE) per icon as a bar or block
 * - One gold nuqta (#E0A526) per icon, always a 45° diamond
 * - Dark version: White stroke on Navy (#0B1F3A)
 */

export default function Icon({ name, size = 24, color = 'currentColor', className = '', style = {} }) {
    const teal = '#0FB5AE';
    const gold = '#E0A526';
    const stroke = color === 'currentColor' ? 'currentColor' : color;

    // Helper: Nuqta Gold Diamond (always diamond, 4 points)
    const nuqta = (cx, cy, s = 2) => (
        <polygon
            points={`${cx},${cy - s} ${cx + s},${cy} ${cx},${cy + s} ${cx - s},${cy}`}
            fill={gold}
        />
    );

    const renderPaths = () => {
        switch (name) {
            // ── Main Navigation & Core ──
            case 'home':
                return (
                    <>
                        {/* Stepped roof */}
                        <path d="M12 3 L3 11 H6 V20 H18 V11 H21 Z" stroke={stroke} strokeWidth="2" strokeLinejoin="miter" fill="none" />
                        {/* Teal door accent */}
                        <rect x="10" y="14" width="4" height="6" fill={teal} />
                        {/* Gold Nuqta in attic */}
                        {nuqta(12, 8, 1.8)}
                    </>
                );

            case 'menu_book':
            case 'book':
            case 'auto_stories':
            case 'quran':
                return (
                    <>
                        {/* Open Mushaf pages */}
                        <path d="M12 6 L4 8 V19 L12 17 L20 19 V8 Z" stroke={stroke} strokeWidth="2" strokeLinejoin="miter" fill="none" />
                        <line x1="12" y1="6" x2="12" y2="17" stroke={stroke} strokeWidth="2" />
                        {/* Teal line on left page */}
                        <rect x="6" y="11" width="4" height="2" fill={teal} />
                        {/* Gold Nuqta on right page */}
                        {nuqta(16, 12, 1.8)}
                    </>
                );

            case 'volunteer_activism':
            case 'self_improvement':
            case 'dhikr':
                return (
                    <>
                        {/* Stepped pixel heart / hands */}
                        <path d="M12 19 L4 11 V7 H8 L12 10 L16 7 H20 V11 Z" stroke={stroke} strokeWidth="2" strokeLinejoin="miter" fill="none" />
                        {/* Teal accent bar */}
                        <rect x="9" y="13" width="6" height="2" fill={teal} />
                        {/* Gold Nuqta */}
                        {nuqta(12, 8, 1.8)}
                    </>
                );

            case 'explore':
            case 'compass':
            case 'my_location':
                return (
                    <>
                        {/* Stepped square compass frame */}
                        <rect x="3" y="3" width="18" height="18" stroke={stroke} strokeWidth="2" strokeLinejoin="miter" fill="none" />
                        {/* Cardinal ticks */}
                        <rect x="11" y="1" width="2" height="3" fill={stroke} />
                        <rect x="11" y="20" width="2" height="3" fill={stroke} />
                        <rect x="1" y="11" width="3" height="2" fill={stroke} />
                        <rect x="20" y="11" width="3" height="2" fill={stroke} />
                        {/* Diagonal needle with Teal pointer */}
                        <polygon points="12,12 16,8 14,14" fill={teal} />
                        <polygon points="12,12 8,16 10,10" fill={stroke} opacity="0.6" />
                        {/* Gold Nuqta pivot */}
                        {nuqta(12, 12, 1.6)}
                    </>
                );

            case 'insights':
            case 'bar_chart':
            case 'growth':
                // Straight from Brand Guidelines Page 7 (Growth)
                return (
                    <>
                        <rect x="4" y="13" width="3" height="8" stroke={stroke} strokeWidth="2" fill="none" />
                        <rect x="10" y="8" width="4" height="13" fill={teal} />
                        <rect x="17" y="4" width="3" height="17" stroke={stroke} strokeWidth="2" fill="none" />
                        {nuqta(12, 4, 1.8)}
                    </>
                );

            // ── Prayers & Times ──
            case 'wb_twilight': // Fajr / Dawn
                return (
                    <>
                        {/* Horizon line */}
                        <line x1="3" y1="18" x2="21" y2="18" stroke={teal} strokeWidth="2" />
                        {/* Stepped rising sun */}
                        <path d="M7 18 V12 H17 V18" stroke={stroke} strokeWidth="2" strokeLinejoin="miter" fill="none" />
                        <line x1="12" y1="6" x2="12" y2="9" stroke={stroke} strokeWidth="2" />
                        <line x1="5" y1="9" x2="7" y2="11" stroke={stroke} strokeWidth="2" />
                        <line x1="19" y1="9" x2="17" y2="11" stroke={stroke} strokeWidth="2" />
                        {/* Gold Nuqta dawn star */}
                        {nuqta(12, 14, 1.8)}
                    </>
                );

            case 'light_mode':
            case 'wb_sunny': // Dhuhr / Duha / Sun
                return (
                    <>
                        {/* Stepped square sun */}
                        <rect x="8" y="8" width="8" height="8" stroke={stroke} strokeWidth="2" fill="none" />
                        {/* Cardinal rays */}
                        <rect x="11" y="2" width="2" height="4" fill={stroke} />
                        <rect x="11" y="18" width="2" height="4" fill={stroke} />
                        <rect x="2" y="11" width="4" height="2" fill={stroke} />
                        <rect x="18" y="11" width="4" height="2" fill={stroke} />
                        {/* Teal center bar */}
                        <rect x="10" y="11" width="4" height="2" fill={teal} />
                        {/* Gold Nuqta corner dot */}
                        {nuqta(17, 7, 1.4)}
                    </>
                );

            case 'nightlight':
            case 'nights_stay':
            case 'dark_mode':
            case 'bedtime': // Isha / Qiyam / Night
                return (
                    <>
                        {/* Stepped pixel crescent */}
                        <path
                            d="M16 4 H12 V6 H9 V9 H7 V15 H9 V18 H12 V20 H16 V18 H13 V15 H11 V9 H13 V6 H16 Z"
                            fill={stroke}
                        />
                        {/* Teal evening star dot */}
                        <rect x="16" y="8" width="2.5" height="2.5" fill={teal} />
                        {/* Gold Nuqta */}
                        {nuqta(17, 14, 1.8)}
                    </>
                );

            case 'mosque':
                return (
                    <>
                        {/* Dome & Walls */}
                        <path d="M5 20 V12 L10 7 L15 12 V20 Z" stroke={stroke} strokeWidth="2" strokeLinejoin="miter" fill="none" />
                        {/* Minaret on right */}
                        <path d="M17 20 V6 H20 V20" stroke={stroke} strokeWidth="2" strokeLinejoin="miter" fill="none" />
                        <rect x="18" y="3" width="2" height="2" fill={stroke} />
                        {/* Teal entrance arch */}
                        <rect x="8" y="15" width="4" height="5" fill={teal} />
                        {/* Gold Nuqta atop dome */}
                        {nuqta(10, 4, 1.6)}
                    </>
                );

            case 'schedule':
            case 'history':
                return (
                    <>
                        {/* Stepped square clock */}
                        <rect x="3" y="3" width="18" height="18" stroke={stroke} strokeWidth="2" fill="none" />
                        {/* Teal Minute hand (pointing to 12) */}
                        <rect x="11" y="6" width="2" height="6" fill={teal} />
                        {/* Hour hand (pointing to 3) */}
                        <rect x="12" y="11" width="5" height="2" fill={stroke} />
                        {/* Gold Nuqta center pivot */}
                        {nuqta(12, 12, 1.6)}
                    </>
                );

            case 'calendar_month':
            case 'calendar':
            case 'event':
                return (
                    <>
                        {/* Calendar frame */}
                        <rect x="3" y="5" width="18" height="15" stroke={stroke} strokeWidth="2" fill="none" />
                        {/* Teal header bar */}
                        <rect x="3" y="5" width="18" height="4" fill={teal} />
                        {/* Top rings */}
                        <rect x="7" y="2" width="2" height="4" fill={stroke} />
                        <rect x="15" y="2" width="2" height="4" fill={stroke} />
                        {/* Gold Nuqta highlighted day */}
                        {nuqta(12, 14, 1.8)}
                    </>
                );

            case 'touch_app':
            case 'fingerprint':
                return (
                    <>
                        {/* Stepped Misbaha / Beads ring */}
                        <rect x="5" y="8" width="4" height="4" stroke={stroke} strokeWidth="2" fill="none" />
                        <rect x="15" y="8" width="4" height="4" stroke={stroke} strokeWidth="2" fill="none" />
                        <rect x="7" y="4" width="4" height="4" stroke={stroke} strokeWidth="2" fill="none" />
                        <rect x="13" y="4" width="4" height="4" stroke={stroke} strokeWidth="2" fill="none" />
                        {/* Teal Tassel at bottom */}
                        <path d="M12 14 V19 M10 21 H14" stroke={teal} strokeWidth="2" />
                        {/* Gold Nuqta focal bead */}
                        {nuqta(12, 9, 2)}
                    </>
                );

            // ── Administration, System & Security ──
            case 'admin_panel_settings':
            case 'shield':
            case 'security':
                // Straight from Brand Guidelines Page 7 (Security)
                return (
                    <>
                        <path
                            d="M4 4 H20 V12 L12 21 L4 12 Z"
                            stroke={stroke}
                            strokeWidth="2"
                            strokeLinejoin="miter"
                            fill="none"
                        />
                        <rect x="6" y="6" width="12" height="3" fill={teal} />
                        {nuqta(12, 13, 2)}
                    </>
                );

            case 'logout':
                return (
                    <>
                        {/* Door outline */}
                        <path d="M11 4 H4 V20 H11" stroke={stroke} strokeWidth="2" strokeLinejoin="miter" fill="none" />
                        {/* Arrow out */}
                        <line x1="9" y1="12" x2="20" y2="12" stroke={teal} strokeWidth="2" />
                        <path d="M16 8 L20 12 L16 16" stroke={teal} strokeWidth="2" strokeLinejoin="miter" fill="none" />
                        {/* Gold Nuqta */}
                        {nuqta(7, 9, 1.4)}
                    </>
                );

            case 'campaign':
                return (
                    <>
                        {/* Megaphone body */}
                        <path d="M4 10 H7 L13 6 V18 L7 14 H4 Z" stroke={stroke} strokeWidth="2" strokeLinejoin="miter" fill="none" />
                        {/* Handle */}
                        <rect x="6" y="14" width="2" height="5" stroke={stroke} strokeWidth="2" fill="none" />
                        {/* Teal sound rays */}
                        <path d="M16 8 V16 M19 6 V18" stroke={teal} strokeWidth="2" />
                        {/* Gold Nuqta */}
                        {nuqta(8, 12, 1.4)}
                    </>
                );

            // ── Actions & States ──
            case 'check':
            case 'done':
            case 'check_circle':
                return (
                    <>
                        {/* Crisp 2.5-unit pixel checkmark */}
                        <polyline points="4,12 9,17 20,6" stroke={teal} strokeWidth="2.5" strokeLinecap="square" strokeLinejoin="miter" fill="none" />
                        {nuqta(20, 6, 1.4)}
                    </>
                );

            case 'content_copy':
            case 'copy':
                return (
                    <>
                        {/* Back sheet */}
                        <rect x="3" y="3" width="12" height="13" stroke={stroke} strokeWidth="2" opacity="0.5" fill="none" />
                        {/* Front sheet */}
                        <rect x="8" y="7" width="13" height="14" stroke={stroke} strokeWidth="2" fill="none" />
                        {/* Teal header */}
                        <rect x="10" y="9" width="9" height="2" fill={teal} />
                        {/* Gold Nuqta */}
                        {nuqta(14, 15, 1.6)}
                    </>
                );

            case 'add':
                return (
                    <>
                        <line x1="12" y1="4" x2="12" y2="20" stroke={stroke} strokeWidth="2" />
                        <line x1="4" y1="12" x2="20" y2="12" stroke={teal} strokeWidth="2" />
                        {nuqta(12, 12, 1.2)}
                    </>
                );

            case 'remove':
                return (
                    <>
                        <line x1="4" y1="12" x2="20" y2="12" stroke={teal} strokeWidth="2.5" />
                        {nuqta(12, 8, 1.2)}
                    </>
                );

            case 'arrow_forward':
            case 'chevron_right':
                return (
                    <>
                        <line x1="4" y1="12" x2="18" y2="12" stroke={stroke} strokeWidth="2" />
                        <polyline points="13,7 18,12 13,17" stroke={teal} strokeWidth="2" strokeLinejoin="miter" fill="none" />
                        {nuqta(8, 12, 1.4)}
                    </>
                );

            case 'arrow_back':
            case 'chevron_left':
                return (
                    <>
                        <line x1="20" y1="12" x2="6" y2="12" stroke={stroke} strokeWidth="2" />
                        <polyline points="11,7 6,12 11,17" stroke={teal} strokeWidth="2" strokeLinejoin="miter" fill="none" />
                        {nuqta(16, 12, 1.4)}
                    </>
                );

            case 'refresh':
            case 'sync':
            case 'restart_alt':
                return (
                    <>
                        {/* Stepped pixel circular arrow */}
                        <path d="M12 4 A8 8 0 1 1 5 12" stroke={stroke} strokeWidth="2" fill="none" />
                        <polyline points="5,7 5,12 10,12" stroke={teal} strokeWidth="2" fill="none" />
                        {nuqta(12, 12, 1.8)}
                    </>
                );

            case 'notifications':
            case 'notifications_active':
                return (
                    <>
                        {/* Stepped bell */}
                        <path d="M12 3 V5 M6 17 H18 L16 9 A4 4 0 0 0 8 9 L6 17 Z" stroke={stroke} strokeWidth="2" strokeLinejoin="miter" fill="none" />
                        <rect x="10" y="19" width="4" height="2" fill={teal} />
                        {nuqta(12, 12, 1.8)}
                    </>
                );

            case 'notifications_off':
                return (
                    <>
                        <path d="M6 17 H18 L16 9 A4 4 0 0 0 8 9 L6 17 Z" stroke={stroke} strokeWidth="2" opacity="0.6" strokeLinejoin="miter" fill="none" />
                        <line x1="3" y1="3" x2="21" y2="21" stroke={teal} strokeWidth="2" />
                        {nuqta(12, 12, 1.6)}
                    </>
                );

            case 'person':
            case 'group':
                return (
                    <>
                        {/* Square head */}
                        <rect x="8" y="3" width="8" height="7" stroke={stroke} strokeWidth="2" fill="none" />
                        {/* Shoulders */}
                        <path d="M4 21 V16 H20 V21" stroke={stroke} strokeWidth="2" strokeLinejoin="miter" fill="none" />
                        {/* Teal chest accent */}
                        <rect x="10" y="16" width="4" height="2" fill={teal} />
                        {/* Gold Nuqta */}
                        {nuqta(12, 7, 1.4)}
                    </>
                );

            case 'local_fire_department':
            case 'flame':
                return (
                    <>
                        {/* Pixel flame contour */}
                        <path d="M12 3 L15 8 L18 12 C18 17 15 21 12 21 C9 21 6 17 6 12 L9 8 Z" stroke={stroke} strokeWidth="2" strokeLinejoin="miter" fill="none" />
                        {/* Teal inner flame */}
                        <path d="M12 13 L14 16 C14 18 13 19 12 19 C11 19 10 18 10 16 Z" fill={teal} />
                        {/* Gold Nuqta at apex */}
                        {nuqta(12, 7, 1.6)}
                    </>
                );

            case 'star':
            case 'stars':
            case 'diamond':
            case 'military_tech':
            case 'workspace_premium':
            case 'crown':
            case 'eco':
            case 'auto_awesome':
            case 'emoji_events':
                return (
                    <>
                        {/* 4-point stepped star */}
                        <polygon
                            points="12,2 14,9 21,12 14,15 12,22 10,15 3,12 10,9"
                            stroke={stroke}
                            strokeWidth="2"
                            strokeLinejoin="miter"
                            fill="none"
                        />
                        {/* Teal inner bar */}
                        <rect x="11" y="11" width="2" height="2" fill={teal} />
                        {/* Gold Nuqta in center */}
                        {nuqta(12, 12, 2.5)}
                    </>
                );

            case 'radio':
            case 'headphones':
                return (
                    <>
                        {/* Retro pixel radio / audio */}
                        <rect x="3" y="7" width="18" height="13" stroke={stroke} strokeWidth="2" fill="none" />
                        <line x1="6" y1="7" x2="10" y2="3" stroke={stroke} strokeWidth="2" />
                        <rect x="6" y="11" width="5" height="5" stroke={teal} strokeWidth="2" fill="none" />
                        <line x1="14" y1="11" x2="18" y2="11" stroke={stroke} strokeWidth="2" />
                        <line x1="14" y1="15" x2="18" y2="15" stroke={stroke} strokeWidth="2" />
                        {nuqta(8.5, 13.5, 1.4)}
                    </>
                );

            case 'search':
                return (
                    <>
                        <rect x="5" y="5" width="10" height="10" stroke={stroke} strokeWidth="2" fill="none" />
                        <line x1="13" y1="13" x2="20" y2="20" stroke={teal} strokeWidth="2.5" />
                        {nuqta(10, 10, 1.6)}
                    </>
                );

            case 'delete':
                return (
                    <>
                        <path d="M5 6 H19 M9 6 V3 H15 V6 M7 6 V19 H17 V6" stroke={stroke} strokeWidth="2" strokeLinejoin="miter" fill="none" />
                        <line x1="10" y1="10" x2="10" y2="15" stroke={teal} strokeWidth="2" />
                        <line x1="14" y1="10" x2="14" y2="15" stroke={teal} strokeWidth="2" />
                    </>
                );

            case 'edit':
            case 'edit_note':
                return (
                    <>
                        <path d="M4 20 L8 19 L19 8 L15 4 L4 15 Z" stroke={stroke} strokeWidth="2" strokeLinejoin="miter" fill="none" />
                        <line x1="12" y1="7" x2="16" y2="11" stroke={teal} strokeWidth="2" />
                        {nuqta(6, 17, 1.2)}
                    </>
                );

            case 'bookmark':
            case 'bookmarks':
                return (
                    <>
                        <path d="M5 4 H19 V20 L12 16 L5 20 Z" stroke={stroke} strokeWidth="2" strokeLinejoin="miter" fill="none" />
                        <rect x="8" y="7" width="8" height="2" fill={teal} />
                        {nuqta(12, 12, 1.8)}
                    </>
                );

            case 'back_hand':
                return (
                    <>
                        {/* Stepped Dua Hands */}
                        <path d="M6 18 V10 H9 V18 M9 18 V6 H12 V18 M12 18 V8 H15 V18 M15 18 V12 H18 V18" stroke={stroke} strokeWidth="2" strokeLinejoin="miter" fill="none" />
                        <rect x="6" y="18" width="12" height="3" fill={teal} />
                        {nuqta(12, 15, 1.6)}
                    </>
                );

            // ── Default / Fallback: Official bedigital Pixel Monitor ──
            default:
                return (
                    <>
                        <rect x="3" y="4" width="18" height="13" stroke={stroke} strokeWidth="2" strokeLinejoin="miter" fill="none" />
                        <rect x="11" y="17" width="2" height="3" fill={stroke} />
                        <rect x="7" y="20" width="10" height="2" fill={stroke} />
                        <rect x="6" y="8" width="12" height="2" fill={teal} />
                        {nuqta(12, 13, 2)}
                    </>
                );
        }
    };

    return (
        <span
            className={`bedigital-icon ${className}`}
            style={{
                width: `${size}px`,
                height: `${size}px`,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                lineHeight: 1,
                verticalAlign: 'middle',
                ...style,
            }}
        >
            <svg
                width={size}
                height={size}
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ display: 'block', overflow: 'visible' }}
            >
                {renderPaths()}
            </svg>
        </span>
    );
}

// ── Nuqta (Signature Gold Diamond from bedigital Brand Guidelines Page 2 & 4) ──
export function Nuqta({ size = 10, color = 'var(--bd-gold, #E0A526)', className = '', style = {} }) {
    return (
        <span
            className={`brand-nuqta ${className}`}
            style={{
                width: `${size}px`,
                height: `${size}px`,
                background: color,
                transform: 'rotate(45deg)',
                display: 'inline-block',
                verticalAlign: 'middle',
                flexShrink: 0,
                boxShadow: 'none',
                ...style,
            }}
        />
    );
}

// ── Official bedigital "Monitor Ba" Mark (Brand Guidelines Page 2 & 3) ──
export function MonitorBa({ size = 32, inverted = false, showStand = true, className = '', style = {} }) {
    const strokeColor = inverted ? '#0B1F3A' : '#FFFFFF';
    const bgFill = inverted ? '#FFFFFF' : '#0B1F3A';
    const nuqtaColor = '#E0A526';

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 48 48"
            fill="none"
            className={className}
            style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
        >
            {/* Monitor screen frame with 2-unit stroke & stair-step corners */}
            <path d="M8 8 H40 V34 H8 Z" fill={bgFill} stroke={strokeColor} strokeWidth="2.5" strokeLinejoin="miter" />
            {/* Arabic letter Ba (ب) */}
            <path
                d="M16 16 V24 H32 V16"
                stroke={strokeColor}
                strokeWidth="2.5"
                strokeLinecap="square"
                strokeLinejoin="miter"
                fill="none"
            />
            {/* Nuqta (Gold Diamond) beneath Ba */}
            <polygon points="24,26 27,29 24,32 21,29" fill={nuqtaColor} />
            {/* Stand and base in 2-unit stroke */}
            {showStand && (
                <>
                    <rect x="22" y="34" width="4" height="4" fill={strokeColor} />
                    <rect x="14" y="38" width="20" height="2.5" fill={strokeColor} />
                </>
            )}
            {/* Trailing pixel accents */}
            <rect x="36" y="36" width="2.5" height="2.5" fill="var(--bd-teal, #0FB5AE)" />
            <rect x="40" y="36" width="2.5" height="2.5" fill="var(--bd-teal, #0FB5AE)" opacity="0.6" />
        </svg>
    );
}

// ── Complete bedigital Brand Lockup (Monitor Mark + Wordmark + Pixel dissolve) ──
export function BeDigitalLogo({ height = 28, variant = 'reversed', className = '', style = {} }) {
    const isReversed = variant === 'reversed';
    const textColor = isReversed ? '#FFFFFF' : '#0B1F3A';
    const tealColor = '#0FB5AE';

    return (
        <div
            className={`bedigital-logo-lockup ${className}`}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                userSelect: 'none',
                fontFamily: "'Space Grotesk', sans-serif",
                lineHeight: 1,
                ...style,
            }}
        >
            <MonitorBa size={height * 1.2} inverted={!isReversed} />
            <span
                style={{
                    fontSize: `${height * 0.75}px`,
                    fontWeight: 700,
                    color: textColor,
                    letterSpacing: '-0.5px',
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: '2px',
                }}
            >
                bedigital
                {/* Pixel dissolve tail */}
                <span style={{ display: 'inline-flex', gap: '2px', marginRight: '3px' }}>
                    <span style={{ width: '3px', height: '3px', background: tealColor, display: 'inline-block' }} />
                    <span style={{ width: '3px', height: '3px', background: tealColor, opacity: 0.7, display: 'inline-block' }} />
                    <span style={{ width: '3px', height: '3px', background: tealColor, opacity: 0.4, display: 'inline-block' }} />
                </span>
            </span>
        </div>
    );
}

// ── Pixel-notch avatar container (Brand Guidelines Page 6: two steps) ──
export function PixelAvatar({ children, size = 44, borderColor = 'var(--bd-teal, #0FB5AE)', className = '', style = {} }) {
    return (
        <div
            className={`pixel-avatar ${className}`}
            style={{
                width: `${size}px`,
                height: `${size}px`,
                background: 'var(--color-surface-container, #122B4A)',
                border: `2px solid ${borderColor}`,
                boxShadow: '3px 3px 0px #050E1A',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                clipPath: 'polygon(6px 0%, calc(100% - 6px) 0%, 100% 6px, 100% calc(100% - 6px), calc(100% - 6px) 100%, 6px 100%, 0% calc(100% - 6px), 0% 6px)',
                ...style,
            }}
        >
            {children}
        </div>
    );
}

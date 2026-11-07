import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import Icon, { Nuqta } from './Icon';

/**
 * Pixel Mosaic & Minaret Contribution Grid
 * Inspired by GitHub commit graph & bedigital 24-grid visual language
 * Reflects worship consistency across all 365 days of the year
 */

export default function PixelMosaicGrid() {
    const { state } = useApp();
    const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'minaret'
    const [selectedDay, setSelectedDay] = useState(null);

    // Generate 52 weeks (364 days + today) data mapped with user's actual history
    const history = state.history || {};

    const annualData = useMemo(() => {
        const days = [];
        const today = new Date();

        // 26 weeks back + 26 weeks ahead or 365 days back
        for (let i = 180; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const key = d.toISOString().slice(0, 10);
            const entry = history[key] || null;

            const percentage = entry ? (entry.percentage || 0) : (i === 0 ? (state.todayPercentage || 0) : 0);
            days.push({
                date: d,
                key,
                percentage,
                dayOfWeek: d.getDay(),
                dayNum: d.getDate(),
                monthName: d.toLocaleDateString('ar-EG', { month: 'short' }),
                isToday: i === 0,
            });
        }
        return days;
    }, [history, state.todayPercentage]);

    // Statistics summary
    const perfectDaysCount = annualData.filter(d => d.percentage >= 100).length;
    const activeDaysCount = annualData.filter(d => d.percentage > 0).length;
    const consistencyRate = Math.round((activeDaysCount / Math.max(1, annualData.length)) * 100);

    const getColorForPct = (pct, isToday = false) => {
        if (pct >= 100) return '#E0A526'; // Nuqta Gold
        if (pct >= 75) return '#0FB5AE';  // Signal Teal
        if (pct >= 40) return '#0D717A';  // Medium Teal
        if (pct > 0) return '#0C4C5D';    // Deep Teal
        return isToday ? '#1C3E66' : '#0D1E33'; // Empty Navy
    };

    return (
        <div className="card-glow mb-5 anim-fade-in" style={{ padding: 'var(--space-5)' }}>
            {/* Header with Switcher */}
            <div className="flex-between mb-4">
                <div>
                    <h2 style={{ font: 'var(--text-title-lg)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--bd-white)' }}>
                        <Icon name="insights" size={24} color="var(--bd-teal)" />
                        لوحة الفسيفساء الإيمانية (365 يوماً)
                    </h2>
                    <p style={{ font: 'var(--text-body-sm)', color: 'var(--bd-teal-300)', opacity: 0.85, margin: '4px 0 0' }}>
                        سجلك البصري المتكامل لصلواتك وأورادك على مدار العام
                    </p>
                </div>

                {/* View Mode Switcher */}
                <div style={{ display: 'flex', gap: '4px', background: 'var(--color-surface)', padding: '2px', border: '1px solid var(--color-outline)' }}>
                    <button
                        onClick={() => setViewMode('grid')}
                        style={{
                            padding: '4px 8px',
                            background: viewMode === 'grid' ? 'var(--bd-teal)' : 'transparent',
                            color: viewMode === 'grid' ? 'var(--bd-navy)' : 'var(--color-on-surface-variant)',
                            border: 'none',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                        }}
                    >
                        شبكة الفسيفساء
                    </button>
                    <button
                        onClick={() => setViewMode('minaret')}
                        style={{
                            padding: '4px 8px',
                            background: viewMode === 'minaret' ? 'var(--bd-teal)' : 'transparent',
                            color: viewMode === 'minaret' ? 'var(--bd-navy)' : 'var(--color-on-surface-variant)',
                            border: 'none',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                        }}
                    >
                        المئذنة الشاهقة
                    </button>
                </div>
            </div>

            {/* KEY METRICS SUMMARY */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
                <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-outline)', padding: '8px 10px', textAlign: 'center' }}>
                    <div style={{ font: 'var(--text-pixel)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--bd-gold)' }}>
                        {perfectDaysCount}
                    </div>
                    <div style={{ font: 'var(--text-body-sm)', fontSize: '0.7rem', color: 'var(--bd-slate)' }}>
                        أيام تامة (100%)
                    </div>
                </div>

                <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-outline)', padding: '8px 10px', textAlign: 'center' }}>
                    <div style={{ font: 'var(--text-pixel)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--bd-teal)' }}>
                        {activeDaysCount}
                    </div>
                    <div style={{ font: 'var(--text-body-sm)', fontSize: '0.7rem', color: 'var(--bd-slate)' }}>
                        أيام مسجلة
                    </div>
                </div>

                <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-outline)', padding: '8px 10px', textAlign: 'center' }}>
                    <div style={{ font: 'var(--text-pixel)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--bd-white)' }}>
                        {consistencyRate}%
                    </div>
                    <div style={{ font: 'var(--text-body-sm)', fontSize: '0.7rem', color: 'var(--bd-slate)' }}>
                        نسبة المداومة
                    </div>
                </div>
            </div>

            {/* VIEW 1: PIXEL MOSAIC GRID (Scrollable horizontal grid) */}
            {viewMode === 'grid' ? (
                <div>
                    <div
                        className="no-scrollbar"
                        style={{
                            overflowX: 'auto',
                            padding: 'var(--space-2) 0',
                            border: '1px solid var(--color-outline)',
                            background: '#071526',
                            borderRadius: '0px',
                        }}
                    >
                        <div
                            style={{
                                display: 'grid',
                                gridAutoFlow: 'column',
                                gridTemplateRows: 'repeat(7, 12px)',
                                gap: '3px',
                                padding: '8px',
                                minWidth: 'max-content',
                            }}
                        >
                            {annualData.map((day) => {
                                const color = getColorForPct(day.percentage, day.isToday);
                                return (
                                    <div
                                        key={day.key}
                                        onClick={() => setSelectedDay(day)}
                                        title={`${day.key}: ${day.percentage}%`}
                                        style={{
                                            width: '12px',
                                            height: '12px',
                                            background: color,
                                            border: day.isToday ? '1px solid var(--bd-white)' : 'none',
                                            cursor: 'pointer',
                                            transition: 'transform 0.1s ease',
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.4)'}
                                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                    />
                                );
                            })}
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="flex-between mt-3" style={{ fontSize: '0.7rem', color: 'var(--bd-slate)' }}>
                        <span>أقل التزاماً</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <span style={{ width: 10, height: 10, background: '#0D1E33', display: 'inline-block' }} />
                            <span style={{ width: 10, height: 10, background: '#0C4C5D', display: 'inline-block' }} />
                            <span style={{ width: 10, height: 10, background: '#0D717A', display: 'inline-block' }} />
                            <span style={{ width: 10, height: 10, background: '#0FB5AE', display: 'inline-block' }} />
                            <span style={{ width: 10, height: 10, background: '#E0A526', display: 'inline-block' }} />
                        </div>
                        <span style={{ color: 'var(--bd-gold)' }}>100% يوم تام</span>
                    </div>

                    {/* Selected Day Info Popup */}
                    {selectedDay && (
                        <div
                            className="mt-3 anim-scale-in"
                            style={{
                                background: 'rgba(15, 181, 174, 0.12)',
                                border: '1px solid var(--bd-teal)',
                                padding: '8px 12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                            }}
                        >
                            <div>
                                <span style={{ fontWeight: 700, color: 'var(--bd-white)' }}>
                                    {selectedDay.key} {selectedDay.isToday && '(اليوم)'}
                                </span>
                                <span style={{ font: 'var(--text-body-sm)', color: 'var(--bd-teal-300)', marginRight: '10px' }}>
                                    نسبة إتمام العبادات: {selectedDay.percentage}%
                                </span>
                            </div>
                            <button onClick={() => setSelectedDay(null)} className="btn-icon" style={{ padding: '2px' }}>
                                <Icon name="check" size={14} />
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                /* VIEW 2: PIXEL MINARET (Building up with consistency) */
                <div style={{ textAlign: 'center', padding: 'var(--space-4) 0', background: '#071526', border: '1px solid var(--color-outline)' }}>
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                        {/* Minaret Construction SVG */}
                        <svg width="100" height="220" viewBox="0 0 100 220" fill="none">
                            {/* Spire with Gold Nuqta */}
                            <line x1="50" y1="10" x2="50" y2="28" stroke="#FFFFFF" strokeWidth="2" />
                            <polygon points="50,14 54,18 50,22 46,18" fill="#E0A526" />

                            {/* Minaret Dome & Upper Balcony */}
                            <path d="M40 28 H60 V34 H66 V40 H34 V34 H40 Z" fill="#0B1F3A" stroke="#FFFFFF" strokeWidth="2" />
                            <rect x="42" y="34" width="16" height="4" fill="#0FB5AE" />

                            {/* Mid Tower Tiers (Built blocks based on perfect days) */}
                            {[...Array(8)].map((_, idx) => {
                                const tierIndex = 7 - idx;
                                const isBuilt = perfectDaysCount > tierIndex * 3;
                                const y = 42 + idx * 16;
                                return (
                                    <g key={idx}>
                                        <rect
                                            x="36"
                                            y={y}
                                            width="28"
                                            height="14"
                                            fill={isBuilt ? (tierIndex % 2 === 0 ? '#0FB5AE' : '#E0A526') : '#10243C'}
                                            stroke="#FFFFFF"
                                            strokeWidth="1.5"
                                        />
                                        {/* Windows */}
                                        <rect x="46" y={y + 3} width="8" height="8" fill={isBuilt ? '#FFFFFF' : '#0B1F3A'} />
                                    </g>
                                );
                            })}

                            {/* Base Pedestal */}
                            <path d="M26 172 H74 V190 H80 V205 H20 V190 H26 Z" fill="#0B1F3A" stroke="#FFFFFF" strokeWidth="2" />
                            <rect x="34" y="180" width="32" height="6" fill="#0FB5AE" />
                            <line x1="14" y1="205" x2="86" y2="205" stroke="#FFFFFF" strokeWidth="3" />
                        </svg>

                        <div style={{ marginTop: 'var(--space-2)' }}>
                            <div style={{ font: 'var(--text-title-md)', fontWeight: 800, color: 'var(--bd-white)' }}>
                                صرح المئذنة البكسلية
                            </div>
                            <p style={{ font: 'var(--text-body-sm)', color: 'var(--bd-teal-300)', maxWidth: '280px', margin: '4px auto 0' }}>
                                كل 3 أيام تامة (100%) تشيد طابقاً هندسياً جديداً في صرح عبادتك السنوي
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}


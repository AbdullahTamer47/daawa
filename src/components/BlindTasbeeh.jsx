import React, { useState, useEffect, useRef } from 'react';
import Icon, { Nuqta } from './Icon';

export default function BlindTasbeeh({ onClose, initialCount = 0 }) {
    const [count, setCount] = useState(initialCount);
    const [cycleCount, setCycleCount] = useState(Math.floor(initialCount / 33));
    const [wakeLockActive, setWakeLockActive] = useState(false);
    const wakeLockRef = useRef(null);

    // Request Wake Lock to prevent screen sleep while performing dhikr
    useEffect(() => {
        let isMounted = true;

        async function requestWakeLock() {
            if ('wakeLock' in navigator) {
                try {
                    const lock = await navigator.wakeLock.request('screen');
                    wakeLockRef.current = lock;
                    if (isMounted) setWakeLockActive(true);
                    lock.addEventListener('release', () => {
                        if (isMounted) setWakeLockActive(false);
                    });
                } catch (err) {
                    console.log('Wake Lock request failed:', err);
                }
            }
        }

        requestWakeLock();

        return () => {
            isMounted = false;
            if (wakeLockRef.current) {
                wakeLockRef.current.release().catch(() => {});
                wakeLockRef.current = null;
            }
        };
    }, []);

    // Full screen tap handler
    const handleTap = (e) => {
        // Prevent trigger if clicking on the exit button
        if (e.target.closest('.no-tap')) return;

        const nextCount = count + 1;
        setCount(nextCount);

        const currentInCycle = nextCount % 33;
        if (currentInCycle === 0) {
            setCycleCount(c => c + 1);
            // Triple strong vibration when completing a cycle (33)
            if ('vibrate' in navigator) {
                try {
                    navigator.vibrate([50, 70, 50, 70, 80]);
                } catch { /* ignore */ }
            }
        } else {
            // Light tap vibration
            if ('vibrate' in navigator) {
                try {
                    navigator.vibrate(25);
                } catch { /* ignore */ }
            }
        }
    };

    const handleReset = (e) => {
        e.stopPropagation();
        setCount(0);
        setCycleCount(0);
        if ('vibrate' in navigator) {
            try { navigator.vibrate([30, 40, 30]); } catch { /* ignore */ }
        }
    };

    return (
        <div
            onClick={handleTap}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: '#000000',
                color: '#FFFFFF',
                zIndex: 99999,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '24px',
                userSelect: 'none',
                cursor: 'pointer'
            }}
        >
            {/* Top Bar */}
            <div className="flex-between no-tap" style={{ width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Nuqta size={10} />
                    <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--bd-teal)' }}>
                        التسبيح بدون نظر (OLED)
                    </span>
                    {wakeLockActive && (
                        <span style={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            padding: '2px 6px',
                            border: '1px solid var(--bd-teal)',
                            color: 'var(--bd-teal)',
                            background: 'rgba(15, 181, 174, 0.1)'
                        }}>
                            الشاشة متيقظة
                        </span>
                    )}
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        className="btn no-tap"
                        onClick={handleReset}
                        style={{
                            padding: '6px 12px',
                            border: '1.5px solid #333',
                            background: '#111',
                            color: '#AAA',
                            fontSize: '0.8rem',
                            fontWeight: 700
                        }}
                    >
                        تصفير
                    </button>
                    <button
                        className="btn no-tap"
                        onClick={onClose}
                        style={{
                            padding: '6px 14px',
                            border: '1.5px solid var(--bd-coral)',
                            background: '#1A0808',
                            color: 'var(--bd-coral)',
                            fontSize: '0.8rem',
                            fontWeight: 800
                        }}
                    >
                        خروج
                    </button>
                </div>
            </div>

            {/* Center Area (Massive Tap Target & Counter) */}
            <div style={{ textAlign: 'center', pointerEvents: 'none' }}>
                <div style={{
                    fontSize: '6.5rem',
                    fontWeight: 900,
                    fontFamily: 'monospace',
                    color: 'var(--bd-gold)',
                    textShadow: '0 0 25px rgba(224, 165, 38, 0.4)',
                    lineHeight: 1
                }}>
                    {count}
                </div>

                <div style={{ marginTop: '16px', fontSize: '1.2rem', fontWeight: 800, color: 'var(--bd-teal)' }}>
                    الدورة الحالية: {count % 33} من 33
                </div>

                <div style={{ marginTop: '8px', fontSize: '0.9rem', color: '#666', fontWeight: 700 }}>
                    مجموع الدورات المكتملة: {cycleCount} دورة
                </div>
            </div>

            {/* Bottom Instruction */}
            <div style={{ textAlign: 'center', opacity: 0.6, fontSize: '0.8rem', fontWeight: 700, pointerEvents: 'none' }}>
                المس أي مكان في الشاشة للتسبيح • سيهتز الجهاز عند كل تسبيحة وعند اكتمال 33
            </div>
        </div>
    );
}

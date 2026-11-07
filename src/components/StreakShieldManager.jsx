import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import Icon, { Nuqta } from './Icon';

export default function StreakShieldManager() {
    const { state, dispatch } = useApp();
    const [showRepairModal, setShowRepairModal] = useState(false);
    const [repairSuccess, setRepairSuccess] = useState(false);

    const prayerStreak = state.prayerStreak || 0;
    const quranStreak = state.quranStreak || 0;
    const repairsLeft = state.streakRepairsLeft !== undefined ? state.streakRepairsLeft : 3;
    const isTraveler = state.travelerMode || false;
    const isExemption = state.exemptionMode || false;

    const handleRepair = (type) => {
        if (repairsLeft <= 0) {
            alert('لقد استنفدت رصيد رخص ترجيع الستريك لهذا الشهر (3 رخص). سيتجدد الرصيد مع بداية الشهر القادم.');
            return;
        }

        dispatch({ type: 'REPAIR_STREAK', streakType: type });
        setRepairSuccess(true);
        setTimeout(() => {
            setRepairSuccess(false);
            setShowRepairModal(false);
        }, 1500);
    };

    return (
        <div className="card-glow mb-16 anim-fade-in" style={{
            padding: '20px',
            border: '2px solid var(--bd-black)',
            boxShadow: '4px 4px 0 var(--bd-black)',
            background: 'var(--color-surface)',
            position: 'relative'
        }}>
            {/* Header */}
            <div className="flex-between mb-16" style={{ borderBottom: '2px solid var(--border-color)', paddingBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '8px', height: '8px', background: 'var(--bd-teal)', transform: 'rotate(45deg)' }}></span>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: 'var(--color-text)' }}>
                        مركز السلسلة ودروع الحماية
                    </h3>
                </div>

                <div style={{
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    padding: '4px 8px',
                    border: '1.5px solid var(--bd-black)',
                    background: repairsLeft > 0 ? 'rgba(15, 181, 174, 0.15)' : 'rgba(235, 87, 87, 0.15)',
                    color: repairsLeft > 0 ? 'var(--bd-teal)' : 'var(--bd-coral)',
                    boxShadow: '1px 1px 0 var(--bd-black)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                }}>
                    <Icon name="history" size={14} color="currentColor" />
                    <span>رخص الترجيع: {repairsLeft}/3 هذا الشهر</span>
                </div>
            </div>

            {/* Dual Streaks Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                {/* 1. Prayer Streak */}
                <div style={{
                    padding: '14px',
                    border: '2px solid var(--bd-black)',
                    boxShadow: '3px 3px 0 var(--bd-black)',
                    background: 'var(--color-surface-card)',
                    textAlign: 'center'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '6px' }}>
                        <Icon name="local_fire_department" size={20} color="var(--bd-gold)" />
                        <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--bd-gold)' }}>ستريك الصلاة</span>
                    </div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 900, fontFamily: 'monospace', color: 'var(--color-text)' }}>
                        {prayerStreak}
                    </div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-dim)', marginTop: '2px' }}>
                        أيام صلاة متتالية
                    </div>
                </div>

                {/* 2. Quran Streak */}
                <div style={{
                    padding: '14px',
                    border: '2px solid var(--bd-black)',
                    boxShadow: '3px 3px 0 var(--bd-black)',
                    background: 'var(--color-surface-card)',
                    textAlign: 'center'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '6px' }}>
                        <Icon name="menu_book" size={20} color="var(--bd-teal)" />
                        <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--bd-teal)' }}>ستريك القرآن</span>
                    </div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 900, fontFamily: 'monospace', color: 'var(--color-text)' }}>
                        {quranStreak}
                    </div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-dim)', marginTop: '2px' }}>
                        أيام ورد متتالية
                    </div>
                </div>
            </div>

            {/* Smart Adaptive Shields (Traveler & Exemption) */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
                {/* Traveler Shield */}
                <button
                    className="btn"
                    onClick={() => dispatch({ type: 'TOGGLE_TRAVELER_MODE' })}
                    style={{
                        flex: 1,
                        padding: '10px 12px',
                        border: '2px solid var(--bd-black)',
                        background: isTraveler ? 'var(--bd-gold)' : 'var(--color-surface-card)',
                        color: isTraveler ? '#000' : 'var(--color-text)',
                        fontWeight: 800,
                        fontSize: '0.85rem',
                        boxShadow: '2px 2px 0 var(--bd-black)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                    }}
                >
                    <Icon name="flight" size={16} color={isTraveler ? "#000" : "var(--bd-gold)"} />
                    <span>{isTraveler ? 'درع السفر مفعل (قصر وجمع)' : 'تفعيل رخصة السفر'}</span>
                </button>

                {/* Exemption Shield */}
                <button
                    className="btn"
                    onClick={() => dispatch({ type: 'TOGGLE_EXEMPTION_MODE' })}
                    style={{
                        flex: 1,
                        padding: '10px 12px',
                        border: '2px solid var(--bd-black)',
                        background: isExemption ? 'var(--bd-teal)' : 'var(--color-surface-card)',
                        color: isExemption ? '#000' : 'var(--color-text)',
                        fontWeight: 800,
                        fontSize: '0.85rem',
                        boxShadow: '2px 2px 0 var(--bd-black)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                    }}
                >
                    <Icon name="favorite" size={16} color={isExemption ? "#000" : "var(--bd-teal)"} />
                    <span>{isExemption ? 'درع العذر مفعّل (حماية)' : 'تفعيل رخصة العذر'}</span>
                </button>
            </div>

            {/* Active Shield Notification Notice */}
            {(isTraveler || isExemption) && (
                <div className="anim-slide-down" style={{
                    padding: '10px 14px',
                    border: '1.5px solid var(--bd-black)',
                    background: isTraveler ? 'rgba(224, 165, 38, 0.1)' : 'rgba(15, 181, 174, 0.1)',
                    marginBottom: '12px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    lineHeight: '1.5'
                }}>
                    <span style={{ color: isTraveler ? 'var(--bd-gold)' : 'var(--bd-teal)', fontWeight: 800 }}>
                        {isTraveler ? 'درع المسافر نشط:' : 'درع العذر نشط:'}
                    </span>{' '}
                    سلسلة الستريك مجمدة ومحمية تلقائياً دون انقطاع ولن تخصم من رخص الترجيع الشهرية.
                </div>
            )}

            {/* Broken Streak Action Button */}
            <button
                className="btn w-full"
                onClick={() => setShowRepairModal(true)}
                style={{
                    padding: '10px',
                    border: '2px solid var(--bd-black)',
                    background: 'transparent',
                    color: 'var(--color-text)',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    boxShadow: '2px 2px 0 var(--bd-black)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                }}
            >
                <Icon name="build" size={16} color="var(--bd-teal)" />
                <span>إدارة واستعادة الستريك المكسور ({repairsLeft} فرص متاحة)</span>
            </button>

            {/* Streak Repair Modal */}
            {showRepairModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.75)',
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '16px'
                }} onClick={() => setShowRepairModal(false)}>
                    <div className="anim-slide-up" style={{
                        background: 'var(--color-surface)',
                        border: '3px solid var(--bd-black)',
                        boxShadow: '6px 6px 0 var(--bd-black)',
                        padding: '24px',
                        maxWidth: '480px',
                        width: '100%'
                    }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
                                <Nuqta size={10} />
                                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-text)' }}>
                                    استعادة الستريك المكسور
                                </h3>
                                <Nuqta size={10} />
                            </div>
                            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-dim)', fontWeight: 700, margin: '4px 0 0' }}>
                                يتيح لك النظام 3 رخص شهرياً لاستعادة سلسلتك عند النسيان أو السهو دون انقطاع الحماس
                            </p>
                        </div>

                        {repairSuccess ? (
                            <div style={{
                                padding: '16px',
                                textAlign: 'center',
                                background: 'rgba(15, 181, 174, 0.15)',
                                border: '2px solid var(--bd-teal)',
                                color: 'var(--bd-teal)',
                                fontWeight: 800,
                                marginBottom: '16px'
                            }}>
                                تم استعادة سلسلتك بنجاح ومتابعة الأيام المتتالية!
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                                <div style={{
                                    padding: '10px 14px',
                                    border: '1.5px solid var(--border-color)',
                                    background: 'var(--color-surface-card)',
                                    fontSize: '0.85rem',
                                    fontWeight: 700
                                }}>
                                    الرصيد المتبقي لك: <strong style={{ color: 'var(--bd-teal)' }}>{repairsLeft} من 3 رخص</strong> لشهر {state.streakRepairsMonth || 'الجاري'}
                                </div>

                                <button
                                    className="btn"
                                    onClick={() => handleRepair('prayer')}
                                    disabled={repairsLeft <= 0}
                                    style={{
                                        padding: '12px',
                                        border: '2px solid var(--bd-black)',
                                        background: 'var(--bd-gold)',
                                        color: '#000',
                                        fontWeight: 800,
                                        boxShadow: '2px 2px 0 var(--bd-black)',
                                        opacity: repairsLeft <= 0 ? 0.5 : 1
                                    }}
                                >
                                    ترجيع ستريك الصلاة المكسور
                                </button>

                                <button
                                    className="btn"
                                    onClick={() => handleRepair('quran')}
                                    disabled={repairsLeft <= 0}
                                    style={{
                                        padding: '12px',
                                        border: '2px solid var(--bd-black)',
                                        background: 'var(--bd-teal)',
                                        color: '#000',
                                        fontWeight: 800,
                                        boxShadow: '2px 2px 0 var(--bd-black)',
                                        opacity: repairsLeft <= 0 ? 0.5 : 1
                                    }}
                                >
                                    ترجيع ستريك ورد القرآن المكسور
                                </button>

                                <button
                                    className="btn"
                                    onClick={() => handleRepair('both')}
                                    disabled={repairsLeft <= 0}
                                    style={{
                                        padding: '12px',
                                        border: '2px solid var(--bd-black)',
                                        background: 'var(--color-surface-card)',
                                        color: 'var(--color-text)',
                                        fontWeight: 800,
                                        boxShadow: '2px 2px 0 var(--bd-black)',
                                        opacity: repairsLeft <= 0 ? 0.5 : 1
                                    }}
                                >
                                    ترجيع كلاهما معاً (يستهلك رخصة واحدة)
                                </button>
                            </div>
                        )}

                        <button
                            className="btn w-full"
                            onClick={() => setShowRepairModal(false)}
                            style={{
                                padding: '8px',
                                border: '2px solid var(--border-color)',
                                background: 'transparent',
                                color: 'var(--color-text-dim)',
                                fontWeight: 700
                            }}
                        >
                            إغلاق
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

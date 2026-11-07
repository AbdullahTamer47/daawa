import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import Icon, { Nuqta } from './Icon';

const PRAYER_NAMES = [
    { key: 'fajr', label: 'الفجر' },
    { key: 'dhuhr', label: 'الظهر' },
    { key: 'asr', label: 'العصر' },
    { key: 'maghrib', label: 'المغرب' },
    { key: 'isha', label: 'العشاء' }
];

export default function QadaaPlanner() {
    const { state, dispatch } = useApp();
    const [isEditing, setIsEditing] = useState(false);

    const qadaaPrayers = state.qadaaPrayers || { fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 };
    const qadaaFulfilled = state.qadaaFulfilled || { fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 };
    const qadaaFasting = state.qadaaFasting || 0;
    const qadaaFastingFulfilled = state.qadaaFastingFulfilled || 0;

    const [tempDebts, setTempDebts] = useState({ ...qadaaPrayers });
    const [tempFasting, setTempFasting] = useState(qadaaFasting);

    const totalPrayerDebt = Object.values(qadaaPrayers).reduce((a, b) => a + b, 0);
    const totalPrayerFulfilled = Object.values(qadaaFulfilled).reduce((a, b) => a + b, 0);
    const totalPrayerAll = totalPrayerDebt + totalPrayerFulfilled;
    const prayerProgress = totalPrayerAll > 0 ? Math.round((totalPrayerFulfilled / totalPrayerAll) * 100) : 100;

    const handleSaveDebts = () => {
        dispatch({ type: 'SET_QADAA_PRAYERS', payload: tempDebts });
        dispatch({ type: 'SET_QADAA_FASTING', days: tempFasting });
        setIsEditing(false);
    };

    const handleFulfillPrayer = (prayerKey) => {
        if ((qadaaPrayers[prayerKey] || 0) <= 0) return;
        dispatch({ type: 'FULFILL_QADAA_PRAYER', prayer: prayerKey });
    };

    const handleFulfillFasting = () => {
        if (qadaaFasting <= 0) return;
        dispatch({ type: 'FULFILL_QADAA_FASTING' });
    };

    return (
        <div className="card-glow anim-fade-in" style={{
            padding: '20px',
            border: '2px solid var(--bd-black)',
            boxShadow: '4px 4px 0 var(--bd-black)',
            background: 'var(--color-surface)',
            marginBottom: '16px'
        }}>
            {/* Header */}
            <div className="flex-between mb-16" style={{ borderBottom: '2px solid var(--border-color)', paddingBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Nuqta size={8} />
                    <Icon name="event_repeat" size={24} color="var(--bd-teal)" />
                    <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--color-text)' }}>
                        مُجدول قضاء الفوائت
                    </h2>
                </div>

                <button
                    className="btn"
                    onClick={() => {
                        if (isEditing) {
                            handleSaveDebts();
                        } else {
                            setTempDebts({ ...qadaaPrayers });
                            setTempFasting(qadaaFasting);
                            setIsEditing(true);
                        }
                    }}
                    style={{
                        padding: '6px 12px',
                        border: '1.5px solid var(--bd-black)',
                        background: isEditing ? 'var(--bd-teal)' : 'var(--color-surface-card)',
                        color: isEditing ? '#000' : 'var(--color-text)',
                        fontWeight: 800,
                        fontSize: '0.8rem',
                        boxShadow: '1px 1px 0 var(--bd-black)'
                    }}
                >
                    <Icon name={isEditing ? "check" : "edit"} size={14} color="currentColor" />
                    <span>{isEditing ? 'حفظ الأعداد' : 'تعديل الفوائت'}</span>
                </button>
            </div>

            {/* Overall Debt Progress */}
            <div style={{
                padding: '16px',
                background: 'var(--color-surface-card)',
                border: '2px solid var(--bd-black)',
                boxShadow: '2px 2px 0 var(--bd-black)',
                marginBottom: '16px'
            }}>
                <div className="flex-between mb-8">
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-text)' }}>
                        تقدم إبراء الذمة (الصلوات الفائتة):
                    </span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 900, color: 'var(--bd-teal)' }}>
                        {totalPrayerDebt === 0 ? 'ذمتك بريئة بحمد الله' : `${totalPrayerDebt} صلاة متبقية`}
                    </span>
                </div>

                <div className="progress-bar" style={{ height: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--bd-black)' }}>
                    <div style={{ width: `${prayerProgress}%`, height: '100%', background: 'var(--bd-teal)' }}></div>
                </div>

                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-dim)', fontWeight: 700, marginTop: '6px' }}>
                    تم قضاء {totalPrayerFulfilled} صلاة حتى الآن • النسبة: {prayerProgress}%
                </div>
            </div>

            {/* Prayers Breakdown */}
            <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--bd-gold)', marginBottom: '10px' }}>
                    صلوات الفريضة:
                </div>

                <div style={{ display: 'grid', gap: '8px' }}>
                    {PRAYER_NAMES.map(p => {
                        const debt = qadaaPrayers[p.key] || 0;
                        const fulfilled = qadaaFulfilled[p.key] || 0;

                        return (
                            <div
                                key={p.key}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '10px 14px',
                                    border: '1.5px solid var(--border-color)',
                                    background: debt > 0 ? 'var(--color-surface-card)' : 'rgba(15, 181, 174, 0.05)'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{
                                        width: '6px',
                                        height: '6px',
                                        background: debt > 0 ? 'var(--bd-gold)' : 'var(--bd-teal)',
                                        transform: 'rotate(45deg)'
                                    }}></span>
                                    <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--color-text)' }}>
                                        صلاة {p.label}
                                    </span>
                                </div>

                                {isEditing ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <input
                                            type="number"
                                            min="0"
                                            value={tempDebts[p.key] || 0}
                                            onChange={(e) => {
                                                const val = Math.max(0, parseInt(e.target.value) || 0);
                                                setTempDebts(prev => ({ ...prev, [p.key]: val }));
                                            }}
                                            style={{
                                                width: '70px',
                                                padding: '6px',
                                                border: '1.5px solid var(--bd-black)',
                                                background: 'var(--color-surface)',
                                                color: 'var(--color-text)',
                                                textAlign: 'center',
                                                fontWeight: 800
                                            }}
                                        />
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{ textAlign: 'left' }}>
                                            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: debt > 0 ? 'var(--bd-gold)' : 'var(--bd-teal)' }}>
                                                {debt} متبقي
                                            </div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-dim)', fontWeight: 700 }}>
                                                (أُنجز {fulfilled})
                                            </div>
                                        </div>

                                        <button
                                            className="btn"
                                            disabled={debt <= 0}
                                            onClick={() => handleFulfillPrayer(p.key)}
                                            style={{
                                                padding: '6px 12px',
                                                border: '1.5px solid var(--bd-black)',
                                                background: debt > 0 ? 'var(--bd-teal)' : 'transparent',
                                                color: debt > 0 ? '#000' : 'var(--color-text-dim)',
                                                fontWeight: 800,
                                                fontSize: '0.75rem',
                                                boxShadow: debt > 0 ? '1px 1px 0 var(--bd-black)' : 'none',
                                                opacity: debt <= 0 ? 0.3 : 1
                                            }}
                                        >
                                            + قضاء 1
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Fasting Qadaa */}
            <div style={{
                padding: '14px',
                border: '1.5px solid var(--border-color)',
                background: 'var(--color-surface-card)',
                marginBottom: '16px'
            }}>
                <div className="flex-between">
                    <div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--bd-gold)' }}>
                            قضاء أيام الصيام
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-dim)', fontWeight: 700, marginTop: '2px' }}>
                            أيام صيام أفطرتها لسفر أو مرض أو عذر وتريد قضاءها
                        </div>
                    </div>

                    {isEditing ? (
                        <input
                            type="number"
                            min="0"
                            value={tempFasting}
                            onChange={(e) => setTempFasting(Math.max(0, parseInt(e.target.value) || 0))}
                            style={{
                                width: '70px',
                                padding: '6px',
                                border: '1.5px solid var(--bd-black)',
                                background: 'var(--color-surface)',
                                color: 'var(--color-text)',
                                textAlign: 'center',
                                fontWeight: 800
                            }}
                        />
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ textAlign: 'left' }}>
                                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: qadaaFasting > 0 ? 'var(--bd-gold)' : 'var(--bd-teal)' }}>
                                    {qadaaFasting} يوم متبقي
                                </div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--color-text-dim)', fontWeight: 700 }}>
                                    (صمت {qadaaFastingFulfilled})
                                </div>
                            </div>

                            <button
                                className="btn"
                                disabled={qadaaFasting <= 0}
                                onClick={handleFulfillFasting}
                                style={{
                                    padding: '6px 12px',
                                    border: '1.5px solid var(--bd-black)',
                                    background: qadaaFasting > 0 ? 'var(--bd-gold)' : 'transparent',
                                    color: qadaaFasting > 0 ? '#000' : 'var(--color-text-dim)',
                                    fontWeight: 800,
                                    fontSize: '0.75rem',
                                    boxShadow: qadaaFasting > 0 ? '1px 1px 0 var(--bd-black)' : 'none',
                                    opacity: qadaaFasting <= 0 ? 0.3 : 1
                                }}
                            >
                                + صمت يوماً
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Strategy Recommendation Note */}
            <div style={{
                padding: '10px 14px',
                background: 'rgba(0,0,0,0.15)',
                border: '1px solid var(--border-color)',
                fontSize: '0.8rem',
                color: 'var(--color-text-dim)',
                lineHeight: '1.6',
                fontWeight: 700
            }}>
                نصيحة نبوية عملية: صَلِّ مع كل فرض حاضر فرضاً من الفوائت (مثلاً فجر قضاء مع كل فجر حاضر)، وبذلك تقضي 5 صلوات فائتة يومياً دون مشقة حتى تفرغ ذمتك تماماً.
            </div>
        </div>
    );
}

import React, { useState } from 'react';
import { useApp, LEVELS, BADGES } from '../context/AppContext';
import Icon, { Nuqta, MonitorBa } from '../components/Icon';
import CompanyFooter from '../components/CompanyFooter';
import PixelMosaicGrid from '../components/PixelMosaicGrid';
import DaawaBackup from '../components/DaawaBackup';

const PRAYER_NAMES = { fajr: 'الفجر', dhuhr: 'الظهر', asr: 'العصر', maghrib: 'المغرب', isha: 'العشاء' };
const STREAK_KEYS = { fajr: 'fajrStreak', dhuhr: 'dhuhrStreak', asr: 'asrStreak', maghrib: 'maghribStreak', isha: 'ishaStreak' };

export default function Statistics() {
    const { state, currentLevel } = useApp();
    const s = state.stats || {};
    const [expandedDay, setExpandedDay] = useState(null);
    const [showPrayerLog, setShowPrayerLog] = useState(false);

    const historyDays = Object.entries(state.history || {}).sort((a, b) => b[0].localeCompare(a[0]));
    const perfectDays = historyDays.filter(([, d]) => d.percentage >= 100).length;
    const incompleteDays = historyDays.filter(([, d]) => d.percentage < 100).length;
    const unlockedCount = BADGES.filter(b => b.condition(s)).length;

    return (
        <div className="page anim-fade-in" style={{ paddingBottom: '96px' }}>
            {/* Header */}
            <div className="flex-between mb-4">
                <div>
                    <h1 style={{ font: 'var(--text-headline-md)', margin: 0, display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <Nuqta size={8} />
                        <Icon name="insights" size={26} color="var(--bd-teal)" /> الإحصائيات وسجل العبادات
                    </h1>
                    <p style={{ font: 'var(--text-body-sm)', color: 'var(--bd-teal-300)', opacity: 0.85, marginTop: '2px' }}>
                        تقدمك الإيماني وإنجازاتك في تطبيق دعوة
                    </p>
                </div>
            </div>

            {/* Level Hero Card */}
            <div
                className="card-glow text-center mb-5"
                style={{
                    padding: 'var(--space-6) var(--space-4)',
                    background: 'radial-gradient(circle at top, #16365C 0%, #0B1F3A 100%)',
                    border: '1.5px solid var(--bd-gold)',
                }}
            >
                <div style={{ display: 'inline-flex', padding: '12px', borderRadius: '50%', background: 'rgba(224, 165, 38, 0.15)', border: '1px solid var(--bd-gold)', marginBottom: 'var(--space-2)' }}>
                    <Icon name={currentLevel.icon} size={48} color="var(--bd-gold)" />
                </div>
                <h2 style={{ font: 'var(--text-headline-sm)', color: 'var(--bd-gold)', margin: 'var(--space-1) 0' }}>
                    {currentLevel.name}
                </h2>
                <p style={{ font: 'var(--text-title-md)', fontWeight: 700, color: 'var(--color-on-surface)', margin: 0 }}>
                    {state.totalPoints} نقطة
                </p>

                <div className="progress-bar mt-3" style={{ maxWidth: '240px', margin: 'var(--space-3) auto 0' }}>
                    <div
                        className="fill"
                        style={{
                            width: `${Math.min(100, Math.max(5, ((state.totalPoints - currentLevel.min) / (Math.max(1, currentLevel.max - currentLevel.min))) * 100))}%`,
                        }}
                    />
                </div>
                <p style={{ font: 'var(--text-label-sm)', color: 'var(--bd-teal-300)', marginTop: 'var(--space-2)', opacity: 0.9 }}>
                    {currentLevel.max === Infinity ? 'أعلى مستوى مبارك!' : `${Math.max(0, currentLevel.max - state.totalPoints)} نقطة للارتقاء إلى المستوى التالي`}
                </p>
            </div>

            {/* Account Profile & 6-Digit Recovery Code Card */}
            <div
                className="card mb-5"
                style={{
                    background: 'var(--color-surface)',
                    border: '1.5px solid var(--bd-teal)',
                    padding: 'var(--space-4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 'var(--space-3)',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <div
                        style={{
                            width: '42px',
                            height: '42px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'rgba(245, 184, 56, 0.15)',
                            border: '1px solid var(--bd-gold)',
                        }}
                    >
                        <Icon name="account_circle" size={24} color="var(--bd-gold)" />
                    </div>
                    <div>
                        <div style={{ font: 'var(--text-title-sm)', fontWeight: 700, color: 'var(--color-on-surface)' }}>
                            {state.userName || 'المستخدم'}
                        </div>
                        <div style={{ font: 'var(--text-body-sm)', color: 'var(--bd-slate)', fontSize: '0.78rem' }}>
                            كود الدخول المخصص لحسابك (احفظه للدخول من أي جهاز)
                        </div>
                    </div>
                </div>

                {state.userId && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span
                            style={{
                                font: 'var(--text-pixel)',
                                fontSize: '1.2rem',
                                fontWeight: 800,
                                color: 'var(--bd-gold)',
                                background: 'rgba(245, 184, 56, 0.1)',
                                border: '1.5px dashed var(--bd-gold)',
                                padding: '4px 12px',
                                letterSpacing: '3px',
                            }}
                        >
                            {state.userId}
                        </span>
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(state.userId);
                                alert(`تم نسخ كود الدخول الخاص بك: ${state.userId}`);
                            }}
                            className="btn btn-outlined"
                            style={{ padding: '6px 12px', fontSize: '0.8rem', fontWeight: 700 }}
                        >
                            <Icon name="content_copy" size={14} color="var(--bd-teal)" />
                            <span>نسخ الكود</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Annual 365-Day Pixel Mosaic Grid & Minaret */}
            <PixelMosaicGrid />

            {/* Numerical Stats Grid */}
            <h2 className="section-title">
                <Icon name="bar_chart" size={20} color="var(--bd-teal)" /> إحصائيات العبادات
            </h2>
            <div className="responsive-grid-3 mb-5">
                <div className="stat-card">
                    <span className="stat-value" style={{ color: 'var(--bd-teal)' }}>{state.totalPoints}</span>
                    <span className="stat-label">إجمالي النقاط</span>
                </div>
                <div className="stat-card">
                    <span className="stat-value" style={{ color: 'var(--bd-success, #3FC4BE)' }}>{s.totalPrayers || 0}</span>
                    <span className="stat-label">صلوات مؤداة</span>
                </div>
                <div className="stat-card">
                    <span className="stat-value" style={{ color: 'var(--bd-gold)' }}>{s.totalPages || 0}</span>
                    <span className="stat-label">صفحات قرآن مقروءة</span>
                </div>
                <div className="stat-card">
                    <span className="stat-value" style={{ color: 'var(--bd-teal-300)' }}>{s.fastingDays || 0}</span>
                    <span className="stat-label">أيام الصيام</span>
                </div>
                <div className="stat-card">
                    <span className="stat-value" style={{ color: 'var(--bd-success, #3FC4BE)' }}>{perfectDays}</span>
                    <span className="stat-label">أيام مكتملة (100%)</span>
                </div>
                <div className="stat-card">
                    <span className="stat-value" style={{ color: 'var(--bd-gold)' }}>{s.quranKhatm || 0}</span>
                    <span className="stat-label">ختمات القرآن</span>
                </div>
            </div>

            {/* Prayer Streaks */}
            <h2 className="section-title">
                <Icon name="local_fire_department" size={20} color="var(--bd-gold)" /> سلسلة المداومة على الصلوات
            </h2>
            <div className="responsive-grid-3 mb-5">
                {Object.entries(PRAYER_NAMES).map(([key, name]) => (
                    <div key={key} className="stat-card">
                        <span className="stat-value" style={{ color: (s[STREAK_KEYS[key]] || 0) > 0 ? 'var(--bd-teal)' : 'var(--color-outline)' }}>
                            {s[STREAK_KEYS[key]] || 0}
                        </span>
                        <span className="stat-label">{name}</span>
                    </div>
                ))}
                <div className="stat-card">
                    <span className="stat-value" style={{ color: (s.allPrayersStreak || 0) > 0 ? 'var(--bd-success)' : 'var(--color-outline)' }}>
                        {s.allPrayersStreak || 0}
                    </span>
                    <span className="stat-label">كل الصلوات</span>
                </div>
            </div>

            {/* Badges Grid */}
            <div className="flex-between mb-3">
                <h2 className="section-title" style={{ margin: 0 }}>
                    <Icon name="military_tech" size={20} color="var(--bd-gold)" /> الأوسمة المكتسبة ({unlockedCount}/{BADGES.length})
                </h2>
            </div>
            <div className="responsive-grid-4 mb-5">
                {BADGES.map(b => {
                    const unlocked = b.condition(s);
                    return (
                        <div
                            key={b.id}
                            className={`badge-card ${unlocked ? 'unlocked' : 'locked'}`}
                            style={{
                                border: unlocked ? '1.5px solid var(--bd-gold)' : '1px solid var(--color-outline)',
                                background: unlocked ? 'rgba(224, 165, 38, 0.12)' : 'var(--color-surface)',
                                padding: 'var(--space-3) var(--space-2)',
                            }}
                        >
                            <Icon name={b.icon} size={32} color={unlocked ? 'var(--bd-gold)' : 'var(--color-outline)'} />
                            <span className="badge-name" style={{ fontWeight: 700, color: unlocked ? 'var(--bd-white)' : 'inherit', marginTop: '4px' }}>
                                {b.name}
                            </span>
                            <span className="badge-desc" style={{ fontSize: '0.72rem', opacity: 0.8 }}>
                                {b.desc}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Prayer Log History */}
            <div className="flex-between mb-3">
                <h2 className="section-title" style={{ margin: 0 }}>
                    <Icon name="history" size={20} color="var(--bd-teal)" /> سجل الصلوات السابق
                </h2>
                <button className="btn btn-text" onClick={() => setShowPrayerLog(!showPrayerLog)}>
                    {showPrayerLog ? 'إخفاء' : 'عرض السجل'}
                </button>
            </div>
            {showPrayerLog && (
                <div className="flex-col gap-2 mb-6 anim-slide-up">
                    {historyDays.length > 0 ? historyDays.slice(0, 10).map(([date, data]) => (
                        <div
                            key={date}
                            className="card"
                            style={{ padding: 'var(--space-3) var(--space-4)', cursor: 'pointer' }}
                            onClick={() => setExpandedDay(expandedDay === date ? null : date)}
                        >
                            <div className="flex-between">
                                <span style={{ font: 'var(--text-body-md)', fontWeight: 600 }}>{date}</span>
                                <div style={{ display: 'flex', gap: '4px' }}>
                                    {data.prayers && Object.entries(data.prayers).map(([key, val]) => (
                                        <span
                                            key={key}
                                            style={{
                                                width: '22px',
                                                height: '22px',
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                background: val ? 'var(--bd-teal)' : 'var(--bd-teal-900)',
                                                color: val ? 'var(--bd-navy)' : 'var(--color-outline)',
                                                fontSize: '9px',
                                                fontWeight: 'bold',
                                            }}
                                        >
                                            {PRAYER_NAMES[key]?.charAt(0)}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )) : (
                        <p className="text-center" style={{ font: 'var(--text-body-sm)', color: 'var(--color-outline)' }}>
                            لا توجد أيام مسجلة بعد، استمر في أداء العبادات!
                        </p>
                    )}
                </div>
            )}

            {/* Encrypted Local Backup & Restore */}
            <DaawaBackup />

            {/* ════════════════════════════════════════════════════════════════════
               THE OFFICIAL COMPANY SHOWCASE FOOTER (ON THE LAST PAGE)
               Explicitly requested by user:
               "وضيف في الصفحة الاخيرة من تحت ان البرنامج ده اتعمل من الشركة"
               ════════════════════════════════════════════════════════════════════ */}
            <CompanyFooter showFullCard={true} />
        </div>
    );
}

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import Icon, { Nuqta } from '../components/Icon';
import SemanticComfortSearch from '../components/SemanticComfortSearch';
import SujoodSahwGuide from '../components/SujoodSahwGuide';
import QadaaPlanner from '../components/QadaaPlanner';

const DUAS_COLLECTION = [
    {
        category: 'الصيام والقيام',
        title: 'دعاء الإفطار المأثور',
        arabic: 'ذَهَبَ الظَّمَأُ، وَابْتَلَّتِ الْعُرُوقُ، وَثَبَتَ الأَجْرُ إِنْ شَاءَ اللَّهُ.',
        source: 'سنن أبي داود (صحيح)',
    },
    {
        category: 'الصيام والقيام',
        title: 'دعاء الصائم عند فطره',
        arabic: 'اللَّهُمَّ لَكَ صُمْتُ، وَعَلَى رِزْقِكَ أَفْطَرْتُ.',
        source: 'مأثور',
    },
    {
        category: 'الصيام والقيام',
        title: 'دعاء ليلة القدر والوتر',
        arabic: 'اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي.',
        source: 'جامع الترمذي',
    },
    {
        category: 'تفريج الكرب',
        title: 'دعاء ذي النون في بطن الحوت',
        arabic: 'لَّا إِلَٰهَ إِلَّا أَنتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ.',
        source: 'سورة الأنبياء: 87',
    },
    {
        category: 'تفريج الكرب',
        title: 'دعاء تفريج الهم والغم',
        arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَالْعَجْزِ وَالْكَسَلِ، وَالْبُخْلِ وَالْجُبْنِ، وَضَلَعِ الدَّيْنِ، وَغَلَبَةِ الرِّجَالِ.',
        source: 'صحيح البخاري',
    },
    {
        category: 'جامعة',
        title: 'أكثر دعاء النبي ﷺ',
        arabic: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ.',
        source: 'سورة البقرة: 201',
    },
    {
        category: 'جامعة',
        title: 'سؤال الهداية والثبات',
        arabic: 'يَا مُقَلِّبَ الْقُلُوبِ ثَبِّتْ قَلْبِي عَلَى دِينِكَ.',
        source: 'جامع الترمذي',
    },
    {
        category: 'سفر واستخارة',
        title: 'دعاء السفر',
        arabic: 'سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ، وَإِنَّا إِلَى رَبِّنَا لَمُنقَلِبُونَ.',
        source: 'سورة الزخرف: 13-14',
    },
];

// Qibla Calculator (Direction to Kaaba in Makkah: Lat 21.4225, Lng 39.8262)
function calculateQiblaAngle(lat, lng) {
    const kaabaLat = 21.422487 * (Math.PI / 180);
    const kaabaLng = 39.826206 * (Math.PI / 180);
    const userLat = lat * (Math.PI / 180);
    const userLng = lng * (Math.PI / 180);

    const deltaLng = kaabaLng - userLng;
    const y = Math.sin(deltaLng);
    const x = Math.cos(userLat) * Math.tan(kaabaLat) - Math.sin(userLat) * Math.cos(deltaLng);

    let qibla = Math.atan2(y, x) * (180 / Math.PI);
    return Math.round((qibla + 360) % 360);
}

// Generate Cairo / Monthly 30-Day schedule
function generateMonthlySchedule() {
    const list = [];
    const baseFajrHour = 4;
    const baseFajrMin = 50;
    const baseMaghribHour = 17;
    const baseMaghribMin = 48;

    for (let day = 1; day <= 30; day++) {
        // Fasting gets longer by ~1 min per day
        const fajrMin = Math.max(15, baseFajrMin - Math.floor(day * 1.1));
        const imsakMin = Math.max(5, fajrMin - 10);
        const maghribMin = baseMaghribMin + Math.floor(day * 0.9);

        list.push({
            day,
            imsak: `0${baseFajrHour}:${String(imsakMin).padStart(2, '0')} ص`,
            fajr: `0${baseFajrHour}:${String(fajrMin).padStart(2, '0')} ص`,
            sunrise: `06:${String((fajrMin + 70) % 60).padStart(2, '0')} ص`,
            dhuhr: '12:05 م',
            asr: '03:28 م',
            maghrib: `0${baseMaghribHour - 12}:${String(maghribMin % 60).padStart(2, '0')} م`,
            isha: `07:${String((maghribMin + 80) % 60).padStart(2, '0')} م`,
        });
    }
    return list;
}

export default function IslamicTools() {
    const { state, daawaDay } = useApp();
    const [activeTab, setActiveTab] = useState('qibla'); // 'qibla' | 'imsakiyah' | 'tasbeeh' | 'duas'
    
    // Qibla state
    const [qiblaAngle, setQiblaAngle] = useState(136); // Default Cairo
    const [compassHeading, setCompassHeading] = useState(0);
    const [manualRotation, setManualRotation] = useState(0);
    const [hasCompassSensor, setHasCompassSensor] = useState(false);
    const [copiedDuaIndex, setCopiedDuaIndex] = useState(null);

    // Tasbeeh state
    const [selectedDhikr, setSelectedDhikr] = useState('سبحان الله وبحمده');
    const [tasbeehCount, setTasbeehCount] = useState(0);
    const [tasbeehTarget, setTasbeehTarget] = useState(33);
    const [totalTasbeehSession, setTotalTasbeehSession] = useState(0);
    const [isVibrateOn, setIsVibrateOn] = useState(true);

    // Filter Duas
    const [selectedDuaCat, setSelectedDuaCat] = useState('الكل');

    // Setup Qibla and Device Orientation
    useEffect(() => {
        // Try getting user's position for exact Qibla angle
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const angle = calculateQiblaAngle(pos.coords.latitude, pos.coords.longitude);
                    setQiblaAngle(angle);
                },
                () => {
                    // Cairo default is 136°
                    setQiblaAngle(136);
                }
            );
        }

        const handleOrientation = (e) => {
            let heading = e.webkitCompassHeading || e.alpha;
            if (heading !== undefined && heading !== null) {
                setHasCompassSensor(true);
                setCompassHeading(Math.round(heading));
            }
        };

        window.addEventListener('deviceorientation', handleOrientation, true);
        return () => window.removeEventListener('deviceorientation', handleOrientation, true);
    }, []);

    // Tasbeeh tap handler with haptic feedback
    const handleTasbeehTap = () => {
        const nextCount = tasbeehCount + 1;
        setTotalTasbeehSession(prev => prev + 1);

        if (isVibrateOn && 'vibrate' in navigator) {
            try {
                if (nextCount % tasbeehTarget === 0) {
                    navigator.vibrate([40, 60, 40]);
                } else {
                    navigator.vibrate(20);
                }
            } catch { /* ignore */ }
        }

        if (nextCount >= tasbeehTarget) {
            setTasbeehCount(0);
        } else {
            setTasbeehCount(nextCount);
        }
    };

    const handleCopyDua = (text, idx) => {
        navigator.clipboard.writeText(text);
        setCopiedDuaIndex(idx);
        setTimeout(() => setCopiedDuaIndex(null), 2500);
    };

    const monthlyDays = generateMonthlySchedule();
    const effectiveAngle = hasCompassSensor ? (qiblaAngle - compassHeading + 360) % 360 : (qiblaAngle - manualRotation + 360) % 360;
    const isAligned = Math.abs(effectiveAngle) <= 5 || Math.abs(effectiveAngle - 360) <= 5;

    const filteredDuas = selectedDuaCat === 'الكل'
        ? DUAS_COLLECTION
        : DUAS_COLLECTION.filter(d => d.category === selectedDuaCat);

    return (
        <div className="page anim-fade-in" style={{ paddingBottom: '96px' }}>
            {/* Header */}
            <div className="flex-between mb-4">
                <div>
                    <h1 style={{ font: 'var(--text-headline-md)', margin: 0, display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <Nuqta size={8} />
                        <Icon name="explore" size={26} color="var(--bd-teal)" /> بوصلة القبلة والأدوات
                    </h1>
                    <p style={{ font: 'var(--text-body-sm)', color: 'var(--bd-teal-300)', opacity: 0.85, marginTop: '2px' }}>
                        القبلة الدقيقة، مواقيت الصلاة، والسبحة الذكية
                    </p>
                </div>
            </div>

            {/* M3 Segmented Navigation Tabs */}
            <div
                style={{
                    display: 'flex',
                    background: 'var(--color-surface-container, #122B4A)',
                    border: '1px solid var(--color-outline, #2C4769)',
                    borderRadius: 'var(--shape-full, 9999px)',
                    padding: '4px',
                    marginBottom: 'var(--space-5)',
                    overflowX: 'auto',
                    scrollbarWidth: 'none',
                }}
            >
                {[
                    { id: 'qibla', name: 'القبلة', icon: 'explore' },
                    { id: 'comfort', name: 'الباحث الشعوري', icon: 'search' },
                    { id: 'sahw', name: 'سجود السهو', icon: 'help' },
                    { id: 'qadaa', name: 'قضاء الفوائت', icon: 'event_repeat' },
                    { id: 'imsakiyah', name: 'مواقيت الشهر', icon: 'calendar_month' },
                    { id: 'tasbeeh', name: 'السبحة الذكية', icon: 'touch_app' },
                    { id: 'duas', name: 'الأدعية المأثورة', icon: 'auto_stories' },
                ].map(tab => {
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                flex: 1,
                                minWidth: '75px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px',
                                padding: '8px 12px',
                                borderRadius: 'var(--shape-full)',
                                border: 'none',
                                background: isActive ? 'var(--bd-teal, #0FB5AE)' : 'transparent',
                                color: isActive ? 'var(--bd-navy, #0B1F3A)' : 'var(--color-on-surface-variant, #A5B8D0)',
                                fontWeight: isActive ? 700 : 500,
                                font: 'var(--text-title-sm)',
                                cursor: 'pointer',
                                transition: 'all 0.2s cubic-bezier(0.2, 0, 0, 1)',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            <Icon name={tab.icon} size={18} color={isActive ? 'var(--bd-navy)' : 'currentColor'} />
                            <span>{tab.name}</span>
                        </button>
                    );
                })}
            </div>

            {/* TAB 1: QIBLA COMPASS */}
            {activeTab === 'qibla' && (
                <div className="anim-fade-in">
                    <div
                        className="card text-center mb-5"
                        style={{
                            padding: 'var(--space-6) var(--space-4)',
                            background: 'radial-gradient(circle at center, #143054 0%, #0B1F3A 100%)',
                            border: isAligned ? '2px solid var(--bd-teal, #0FB5AE)' : '1px solid var(--color-outline, #2C4769)',
                            boxShadow: isAligned ? '0 0 25px rgba(15, 181, 174, 0.4)' : 'var(--elevation-2)',
                            transition: 'all 0.3s ease',
                        }}
                    >
                        {/* Status Chip */}
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: 'var(--shape-full)', background: isAligned ? 'rgba(15, 181, 174, 0.2)' : 'rgba(224, 165, 38, 0.15)', border: `1px solid ${isAligned ? 'var(--bd-teal)' : 'var(--bd-gold)'}`, color: isAligned ? 'var(--bd-teal)' : 'var(--bd-gold)', marginBottom: 'var(--space-4)', font: 'var(--text-label-md)', fontWeight: 600 }}>
                            <Nuqta size={8} color={isAligned ? 'var(--bd-teal)' : 'var(--bd-gold)'} />
                            {isAligned ? 'أنت باتجاه القبلة الآن تماماً' : `زاوية القبلة: ${qiblaAngle}° من الشمال`}
                        </div>

                        {/* Interactive Compass Dial */}
                        <div
                            style={{
                                width: '240px',
                                height: '240px',
                                margin: '0 auto',
                                position: 'relative',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            {/* Outer Degree Ring */}
                            <div
                                style={{
                                    position: 'absolute',
                                    inset: 0,
                                    borderRadius: '50%',
                                    border: '3px dashed var(--bd-teal-700)',
                                    transform: `rotate(${-(hasCompassSensor ? compassHeading : manualRotation)}deg)`,
                                    transition: hasCompassSensor ? 'none' : 'transform 0.2s cubic-bezier(0.2, 0, 0, 1)',
                                }}
                            >
                                {/* Cardinal Points */}
                                <span style={{ position: 'absolute', top: '6px', left: '50%', transform: 'translateX(-50%)', fontWeight: 800, color: 'var(--bd-error)', font: 'var(--text-title-sm)' }}>ش</span>
                                <span style={{ position: 'absolute', bottom: '6px', left: '50%', transform: 'translateX(-50%)', fontWeight: 600, color: 'var(--bd-teal-300)', font: 'var(--text-title-sm)' }}>ج</span>
                                <span style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', fontWeight: 600, color: 'var(--bd-teal-300)', font: 'var(--text-title-sm)' }}>شـرق</span>
                                <span style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', fontWeight: 600, color: 'var(--bd-teal-300)', font: 'var(--text-title-sm)' }}>غـرب</span>
                            </div>

                            {/* Inner Kaaba Pointer Dial */}
                            <div
                                style={{
                                    width: '180px',
                                    height: '180px',
                                    borderRadius: '50%',
                                    background: 'var(--color-surface-container, #122B4A)',
                                    border: '2px solid var(--bd-teal)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    position: 'relative',
                                    transform: `rotate(${effectiveAngle}deg)`,
                                    transition: hasCompassSensor ? 'none' : 'transform 0.2s cubic-bezier(0.2, 0, 0, 1)',
                                }}
                            >
                                {/* Kaaba Icon at the tip */}
                                <div style={{ position: 'absolute', top: '10px', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <div
                                        style={{
                                            width: '28px',
                                            height: '28px',
                                            background: '#050E1A',
                                            border: '2px solid var(--bd-gold)',
                                            borderRadius: '4px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            boxShadow: '0 0 10px rgba(224, 165, 38, 0.5)',
                                        }}
                                    >
                                        <div style={{ width: '18px', height: '3px', background: 'var(--bd-gold)', position: 'absolute', top: '4px' }} />
                                        <Nuqta size={6} />
                                    </div>
                                    <div style={{ width: '0', height: '0', borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: '8px solid var(--bd-gold)', marginTop: '2px' }} />
                                </div>

                                {/* Center Hub */}
                                <div
                                    style={{
                                        width: '42px',
                                        height: '42px',
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, var(--bd-teal-900), #081629)',
                                        border: '2px solid var(--bd-teal)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        boxShadow: '0 0 12px rgba(15, 181, 174, 0.3)',
                                    }}
                                >
                                    <Nuqta size={12} color={isAligned ? 'var(--bd-teal)' : 'var(--bd-gold)'} />
                                </div>
                            </div>
                        </div>

                        {/* Manual Calibration Slider (for desktop/laptop or devices without magnetometer) */}
                        {!hasCompassSensor && (
                            <div className="mt-4" style={{ maxWidth: '300px', margin: 'var(--space-4) auto 0' }}>
                                <label style={{ font: 'var(--text-body-sm)', color: 'var(--bd-teal-200)', display: 'block', marginBottom: 'var(--space-1)' }}>
                                    تدوير البوصلة يدوياً للمحاذاة: ({manualRotation}°)
                                </label>
                                <input
                                    type="range"
                                    min="0"
                                    max="360"
                                    value={manualRotation}
                                    onChange={(e) => setManualRotation(Number(e.target.value))}
                                    style={{ width: '100%', accentColor: 'var(--bd-teal)' }}
                                />
                            </div>
                        )}

                        <div className="mt-4" style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-4)', font: 'var(--text-body-sm)', color: 'var(--bd-teal-200)' }}>
                            <span>المسافة للكعبة: ~1,270 كم</span>
                            <span>•</span>
                            <span>الاتجاه: جنوب شرق (136°)</span>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB: SEMANTIC COMFORT SEARCH */}
            {activeTab === 'comfort' && (
                <SemanticComfortSearch />
            )}

            {/* TAB: SUJOOD AS-SAHW GUIDE */}
            {activeTab === 'sahw' && (
                <SujoodSahwGuide />
            )}

            {/* TAB: QADAA PLANNER */}
            {activeTab === 'qadaa' && (
                <QadaaPlanner />
            )}

            {/* TAB 2: MONTHLY SCHEDULE */}
            {activeTab === 'imsakiyah' && (
                <div className="anim-fade-in">
                    <div className="flex-between mb-3">
                        <span style={{ font: 'var(--text-title-sm)', color: 'var(--bd-teal-200)' }}>
                            جدول مواقيت الصلاة الشهري (القاهرة 1447 هـ)
                        </span>
                        <span className="chip active" style={{ font: 'var(--text-pixel)', fontSize: '0.7rem' }}>
                            اليوم {daawaDay}
                        </span>
                    </div>

                    <div className="card" style={{ padding: 0, overflowX: 'auto', border: '1px solid var(--color-outline)' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', font: 'var(--text-body-sm)', textAlign: 'center' }}>
                            <thead style={{ background: 'var(--bd-teal-900, #0C4C5D)', color: 'var(--bd-white)' }}>
                                <tr>
                                    <th style={{ padding: '10px 8px' }}>اليوم</th>
                                    <th style={{ padding: '10px 8px', color: 'var(--bd-gold)' }}>الإمساك</th>
                                    <th style={{ padding: '10px 8px' }}>الفجر</th>
                                    <th style={{ padding: '10px 8px' }}>الشروق</th>
                                    <th style={{ padding: '10px 8px' }}>الظهر</th>
                                    <th style={{ padding: '10px 8px' }}>العصر</th>
                                    <th style={{ padding: '10px 8px', color: 'var(--bd-teal)' }}>المغرب</th>
                                    <th style={{ padding: '10px 8px' }}>العشاء</th>
                                </tr>
                            </thead>
                            <tbody>
                                {monthlyDays.map(r => {
                                    const isCurrentDay = r.day === daawaDay;
                                    return (
                                        <tr
                                            key={r.day}
                                            style={{
                                                background: isCurrentDay ? 'rgba(15, 181, 174, 0.15)' : 'transparent',
                                                borderBottom: '1px solid var(--color-outline-variant, #1C324E)',
                                                fontWeight: isCurrentDay ? 700 : 400,
                                            }}
                                        >
                                            <td style={{ padding: '8px 4px', color: isCurrentDay ? 'var(--bd-teal)' : 'inherit' }}>
                                                {r.day} {isCurrentDay && ' (اليوم)'}
                                            </td>
                                            <td style={{ padding: '8px 4px', color: 'var(--bd-gold)' }}>{r.imsak}</td>
                                            <td style={{ padding: '8px 4px' }}>{r.fajr}</td>
                                            <td style={{ padding: '8px 4px', opacity: 0.8 }}>{r.sunrise}</td>
                                            <td style={{ padding: '8px 4px' }}>{r.dhuhr}</td>
                                            <td style={{ padding: '8px 4px' }}>{r.asr}</td>
                                            <td style={{ padding: '8px 4px', color: 'var(--bd-teal)', fontWeight: 700 }}>{r.maghrib}</td>
                                            <td style={{ padding: '8px 4px' }}>{r.isha}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB 3: SMART MISBAHA (TASBEEH) */}
            {activeTab === 'tasbeeh' && (
                <div className="anim-fade-in text-center">
                    {/* Dhikr Selector Chips */}
                    <div style={{ display: 'flex', gap: 'var(--space-2)', overflowX: 'auto', paddingBottom: 'var(--space-3)', scrollbarWidth: 'none', marginBottom: 'var(--space-4)' }}>
                        {[
                            'سبحان الله وبحمده',
                            'أستغفر الله العظيم وأتوب إليه',
                            'لا إله إلا الله وحده لا شريك له',
                            'الحمد لله رب العالمين',
                            'الله أكبر كبيراً',
                            'اللهم صلِّ وسلم على نبينا محمد',
                            'لا حول ولا قوة إلا بالله',
                        ].map(d => (
                            <button
                                key={d}
                                onClick={() => { setSelectedDhikr(d); setTasbeehCount(0); }}
                                style={{
                                    flexShrink: 0,
                                    padding: '6px 14px',
                                    borderRadius: 'var(--shape-full)',
                                    border: `1px solid ${selectedDhikr === d ? 'var(--bd-teal)' : 'var(--color-outline)'}`,
                                    background: selectedDhikr === d ? 'rgba(15, 181, 174, 0.2)' : 'var(--color-surface)',
                                    color: selectedDhikr === d ? 'var(--bd-teal)' : 'var(--color-on-surface-variant)',
                                    font: 'var(--text-title-sm)',
                                    fontWeight: selectedDhikr === d ? 700 : 400,
                                    cursor: 'pointer',
                                }}
                            >
                                {d}
                            </button>
                        ))}
                    </div>

                    {/* Giant Digital Tasbeeh Tap Button */}
                    <div
                        className="card-glow"
                        style={{
                            maxWidth: '340px',
                            margin: '0 auto var(--space-4)',
                            padding: 'var(--space-6) var(--space-4)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                        }}
                    >
                        <h2 style={{ font: 'var(--text-headline-sm)', margin: '0 0 var(--space-3)', color: 'var(--bd-white)' }}>
                            {selectedDhikr}
                        </h2>

                        <button
                            onClick={handleTasbeehTap}
                            style={{
                                width: '180px',
                                height: '180px',
                                borderRadius: '50%',
                                background: 'radial-gradient(circle at 30% 30%, #153A66, #09192F)',
                                border: '3px solid var(--bd-teal)',
                                boxShadow: '0 0 30px rgba(15, 181, 174, 0.35), inset 0 2px 10px rgba(255,255,255,0.2)',
                                cursor: 'pointer',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                outline: 'none',
                                userSelect: 'none',
                                transition: 'transform 0.08s ease',
                                WebkitTapHighlightColor: 'transparent',
                            }}
                            onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
                            onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            onTouchStart={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
                            onTouchEnd={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            <span style={{ font: 'var(--text-display-md)', fontWeight: 800, color: 'var(--bd-teal)', lineHeight: 1 }}>
                                {tasbeehCount}
                            </span>
                            <span style={{ font: 'var(--text-label-sm)', color: 'var(--bd-gold)', marginTop: '4px' }}>
                                الهدف: {tasbeehTarget}
                            </span>
                        </button>

                        <div className="flex-between w-full mt-4" style={{ maxWidth: '280px' }}>
                            <button
                                className="btn btn-outlined"
                                onClick={() => setTasbeehCount(0)}
                                style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: 'var(--shape-full)' }}
                            >
                                <Icon name="refresh" size={16} /> تصفير
                            </button>

                            <button
                                className="btn btn-text"
                                onClick={() => setIsVibrateOn(!isVibrateOn)}
                                style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                            >
                                <Icon name={isVibrateOn ? 'vibration' : 'smartphone'} size={18} color={isVibrateOn ? 'var(--bd-teal)' : 'var(--bd-slate)'} />
                                {isVibrateOn ? 'الاهتزاز مفعل' : 'الاهتزاز مغلق'}
                            </button>

                            <div style={{ display: 'flex', gap: '4px' }}>
                                {[33, 100].map(tgt => (
                                    <button
                                        key={tgt}
                                        onClick={() => { setTasbeehTarget(tgt); setTasbeehCount(0); }}
                                        style={{
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            border: `1px solid ${tasbeehTarget === tgt ? 'var(--bd-gold)' : 'var(--color-outline)'}`,
                                            background: tasbeehTarget === tgt ? 'rgba(224, 165, 38, 0.2)' : 'transparent',
                                            color: tasbeehTarget === tgt ? 'var(--bd-gold)' : 'var(--color-on-surface-variant)',
                                            fontSize: '0.75rem',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        {tgt}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="mt-3" style={{ font: 'var(--text-body-sm)', color: 'var(--bd-teal-300)', opacity: 0.8 }}>
                            إجمالي التسبيحات في هذه الجلسة: <strong>{totalTasbeehSession}</strong>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 4: ESSENTIAL DUAS */}
            {activeTab === 'duas' && (
                <div className="anim-fade-in">
                    {/* Category Filter Chips */}
                    <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-4)', overflowX: 'auto', scrollbarWidth: 'none' }}>
                        {['الكل', 'الصيام والقيام', 'تفريج الكرب', 'جامعة', 'سفر واستخارة'].map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedDuaCat(cat)}
                                style={{
                                    flexShrink: 0,
                                    padding: '6px 14px',
                                    borderRadius: 'var(--shape-full)',
                                    border: `1px solid ${selectedDuaCat === cat ? 'var(--bd-teal)' : 'var(--color-outline)'}`,
                                    background: selectedDuaCat === cat ? 'var(--bd-teal)' : 'var(--color-surface)',
                                    color: selectedDuaCat === cat ? 'var(--bd-navy)' : 'var(--color-on-surface-variant)',
                                    fontWeight: selectedDuaCat === cat ? 700 : 500,
                                    font: 'var(--text-title-sm)',
                                    cursor: 'pointer',
                                }}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Dua Cards (Responsive Grid on Desktop) */}
                    <div className="responsive-grid-2">
                        {filteredDuas.map((d, idx) => (
                            <div key={idx} className="card" style={{ padding: 'var(--space-4)', position: 'relative' }}>
                                <div className="flex-between mb-2">
                                    <span style={{ font: 'var(--text-title-sm)', fontWeight: 700, color: 'var(--bd-teal)' }}>
                                        {d.title}
                                    </span>
                                    <span style={{ font: 'var(--text-label-sm)', color: 'var(--bd-gold)', background: 'rgba(224, 165, 38, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                                        {d.category}
                                    </span>
                                </div>
                                <p style={{ font: 'var(--text-body-lg)', lineHeight: 1.8, margin: 'var(--space-2) 0', color: 'var(--bd-white)' }}>
                                    "{d.arabic}"
                                </p>
                                <div className="flex-between mt-3" style={{ borderTop: '1px solid var(--color-outline-variant)', paddingTop: 'var(--space-2)' }}>
                                    <span style={{ font: 'var(--text-body-sm)', color: 'var(--bd-slate)' }}>{d.source}</span>
                                    <button
                                        className="btn btn-outlined"
                                        onClick={() => handleCopyDua(d.arabic, idx)}
                                        style={{ padding: '4px 12px', fontSize: '0.75rem', borderRadius: 'var(--shape-full)' }}
                                    >
                                        <Icon name={copiedDuaIndex === idx ? 'done' : 'content_copy'} size={14} color={copiedDuaIndex === idx ? 'var(--bd-teal)' : 'currentColor'} />
                                        {copiedDuaIndex === idx ? 'تم النسخ' : 'نسخ الدعاء'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}


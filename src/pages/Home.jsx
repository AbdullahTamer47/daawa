import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp, LEVELS, POINT_VALUES } from '../context/AppContext';
import DawaProgress from '../components/MoonProgress';
import Badges from '../components/Badges';
import Icon, { Nuqta, MonitorBa } from '../components/Icon';
import DaawaLogo, { DaawaEmblem } from '../components/DaawaLogo';
import { daawaDailyContent, getDailyContentForDate } from '../data/daawaContent';
import { calculateLocalPrayerTimes } from '../services/prayerTimes';
import { getHijriDate, getSunnahFastingNotice } from '../services/hijriCalendar';
import PixelCardExporter from '../components/PixelCardExporter';
import MicroSquads from '../components/MicroSquads';
import StreakShieldManager from '../components/StreakShieldManager';

const PRAYERS = [
    { key: 'fajr', name: 'الفجر', icon: 'wb_twilight', points: 20 },
    { key: 'dhuhr', name: 'الظهر', icon: 'light_mode', points: 15 },
    { key: 'asr', name: 'العصر', icon: 'wb_sunny', points: 15 },
    { key: 'maghrib', name: 'المغرب', icon: 'wb_twilight', points: 15 },
    { key: 'isha', name: 'العشاء', icon: 'nightlight', points: 15 },
];

const SUNNAH = [
    { key: 'sunnahFajr', name: 'سنة الفجر (ركعتان)', icon: 'wb_twilight', points: 10 },
    { key: 'sunnahDhuhrBefore', name: 'سنة الظهر القبلية (4 ركعات)', icon: 'light_mode', points: 10 },
    { key: 'sunnahDhuhrAfter', name: 'سنة الظهر البعدية (ركعتان)', icon: 'light_mode', points: 10 },
    { key: 'sunnahMaghrib', name: 'سنة المغرب (ركعتان)', icon: 'wb_twilight', points: 10 },
    { key: 'sunnahIsha', name: 'سنة العشاء (ركعتان)', icon: 'nightlight', points: 10 },
    { key: 'shafaWitr', name: 'الشفع والوتر (3 ركعات)', icon: 'star', points: 15 },
];

const STREAK_KEYS = { fajr: 'fajrStreak', dhuhr: 'dhuhrStreak', asr: 'asrStreak', maghrib: 'maghribStreak', isha: 'ishaStreak' };

export default function Home() {
    const { state, dispatch, todayPoints, todayPercentage, currentLevel, daawaDay } = useApp();
    const [showBadges, setShowBadges] = useState(false);
    const [showSunnah, setShowSunnah] = useState(false);
    const [prayerTimes, setPrayerTimes] = useState(null);
    const [isLoadingTimes, setIsLoadingTimes] = useState(true);
    const [locationName, setLocationName] = useState(localStorage.getItem('daawa_location_name') || 'القاهرة');
    const [adhanEnabled, setAdhanEnabled] = useState(() => localStorage.getItem('daawa_adhan') === 'true');
    const [adhanPlayed, setAdhanPlayed] = useState({});
    const [nextPrayerInfo, setNextPrayerInfo] = useState({ name: 'الفجر', countdown: '--:--:--', isIftar: false });
    const [copiedContent, setCopiedContent] = useState(null);
    const adhanAudioRef = useRef(null);
    const navigate = useNavigate();

    // 365-Day perpetual calendar & sunnah fasting
    const hijriInfo = useMemo(() => getHijriDate(new Date()), []);
    const fastingNotice = useMemo(() => getSunnahFastingNotice(new Date()), []);
    const dailyContent = useMemo(() => getDailyContentForDate(new Date()), []);

    // 100% Offline Instant Prayer Times using adhan
    useEffect(() => {
        const local = calculateLocalPrayerTimes(30.0444, 31.2357, new Date(), 'Egyptian', state.prayerOffsets || {});
        if (local && local.timings) {
            setPrayerTimes(local.timings);
            setIsLoadingTimes(false);
        }
    }, [state.prayerOffsets]);

    // Fetch Prayer Times (defaults to Cairo: 30.0444, 31.2357)
    const fetchPrayerTimesForLocation = useCallback(async (lat, lng, cityName = 'القاهرة') => {
        try {
            setIsLoadingTimes(true);
            const today = new Date();
            const dd = String(today.getDate()).padStart(2, '0');
            const mm = String(today.getMonth() + 1).padStart(2, '0');
            const yyyy = today.getFullYear();
            const dateString = `${dd}-${mm}-${yyyy}`;

            const response = await fetch(`https://api.aladhan.com/v1/timings/${dateString}?latitude=${lat}&longitude=${lng}&method=5`);
            const data = await response.json();

            if (data.code === 200) {
                // Apply any admin manual offsets if configured
                const rawTimings = data.data.timings;
                const offsets = state.prayerOffsets || {};
                const adjustedTimings = { ...rawTimings };

                Object.keys(offsets).forEach(pKey => {
                    if (adjustedTimings[pKey] && offsets[pKey] !== 0) {
                        const [h, m] = adjustedTimings[pKey].split(':').map(Number);
                        const totalM = h * 60 + m + (offsets[pKey] || 0);
                        const newH = Math.floor((totalM + 1440) % 1440 / 60);
                        const newM = (totalM + 1440) % 1440 % 60;
                        adjustedTimings[pKey] = `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
                    }
                });

                setPrayerTimes(adjustedTimings);
                setLocationName(cityName);
                localStorage.setItem('daawa_location_name', cityName);
            }
        } catch (error) {
            console.error("Error fetching prayer times:", error);
        } finally {
            setIsLoadingTimes(false);
        }
    }, [state.prayerOffsets]);

    useEffect(() => {
        fetchPrayerTimesForLocation(30.0444, 31.2357, 'القاهرة');
    }, [fetchPrayerTimesForLocation]);

    // Live countdown to next prayer calculation every 1 second
    useEffect(() => {
        if (!prayerTimes) return;

        const updateCountdown = () => {
            const now = new Date();
            const currentTotalSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

            const parseToSeconds = (timeStr) => {
                if (!timeStr) return 0;
                const [h, m] = timeStr.split(':').map(Number);
                return h * 3600 + m * 60;
            };

            const prayerList = [
                { key: 'Fajr', name: 'الفجر', seconds: parseToSeconds(prayerTimes.Fajr) },
                { key: 'Sunrise', name: 'الشروق', seconds: parseToSeconds(prayerTimes.Sunrise) },
                { key: 'Dhuhr', name: 'الظهر', seconds: parseToSeconds(prayerTimes.Dhuhr) },
                { key: 'Asr', name: 'العصر', seconds: parseToSeconds(prayerTimes.Asr) },
                { key: 'Maghrib', name: 'المغرب', seconds: parseToSeconds(prayerTimes.Maghrib), isIftar: false },
                { key: 'Isha', name: 'العشاء', seconds: parseToSeconds(prayerTimes.Isha) },
            ];

            let nextP = prayerList.find(p => p.seconds > currentTotalSeconds);
            let diffSeconds = 0;

            if (nextP) {
                diffSeconds = nextP.seconds - currentTotalSeconds;
            } else {
                // Next is tomorrow's Fajr
                nextP = prayerList[0];
                diffSeconds = (86400 - currentTotalSeconds) + nextP.seconds;
            }

            const hrs = Math.floor(diffSeconds / 3600);
            const mins = Math.floor((diffSeconds % 3600) / 60);
            const secs = diffSeconds % 60;
            const formatted = `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

            setNextPrayerInfo({
                name: nextP.name,
                key: nextP.key,
                countdown: formatted,
                isIftar: nextP.isIftar || false,
            });
        };

        updateCountdown();
        const timerId = setInterval(updateCountdown, 1000);
        return () => clearInterval(timerId);
    }, [prayerTimes]);

    const toggleAdhan = () => {
        const newVal = !adhanEnabled;
        setAdhanEnabled(newVal);
        localStorage.setItem('daawa_adhan', newVal ? 'true' : 'false');
        if (!newVal && adhanAudioRef.current) {
            adhanAudioRef.current.pause();
            adhanAudioRef.current.currentTime = 0;
        }
    };

    const handleCopy = (text, type) => {
        navigator.clipboard.writeText(text);
        setCopiedContent(type);
        setTimeout(() => setCopiedContent(null), 2000);
    };

    const taraweehPoints = Math.floor(state.taraweehRakaat / 2) * POINT_VALUES.taraweehPerPair;
    const customContent = state.customDailyContent?.[daawaDay];
    const activeHadith = customContent?.hadith || dailyContent.hadith;
    const activeDua = customContent?.dua || dailyContent.dua;

    return (
        <div className="page anim-fade-in" style={{ paddingBottom: '96px' }}>
            {/* Top M3 App Bar (Mobile Only - Desktop has DesktopNavbar) */}
            <header
                className="mobile-only"
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 'var(--space-2) 0 var(--space-4)',
                    borderBottom: '1px solid var(--color-outline-variant, #1C324E)',
                    marginBottom: 'var(--space-4)',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <DaawaEmblem size={38} />
                    <div>
                        <h1
                            style={{
                                font: 'var(--text-title-lg)',
                                fontWeight: 800,
                                margin: 0,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                color: 'var(--bd-white)',
                            }}
                        >
                            دعوة
                            <Nuqta size={8} />
                        </h1>
                        <div style={{ font: 'var(--text-body-sm)', color: 'var(--bd-teal-300)', opacity: 0.9, display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span>{state.userName ? `مرحباً، ${state.userName}` : 'رفيقك الإيماني اليومي'}</span>
                            <span>·</span>
                            <span style={{ color: 'var(--bd-gold)', fontWeight: 600 }}>{hijriInfo.formattedArabic}</span>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    {/* Theme Mode Toggle (Light / Dark) */}
                    <button
                        onClick={() => dispatch({ type: 'TOGGLE_THEME' })}
                        className="btn-icon"
                        title={state.theme === 'light' ? 'الوضع الداكن' : 'الوضع النهاري'}
                    >
                        <Icon name={state.theme === 'light' ? 'dark_mode' : 'light_mode'} size={18} color="var(--bd-teal)" />
                    </button>

                    {/* Day Pill Badge */}
                    <div
                        style={{
                            background: 'rgba(15, 181, 174, 0.15)',
                            border: '1px solid var(--bd-teal)',
                            borderRadius: '0px',
                            padding: '4px 12px',
                            textAlign: 'center',
                        }}
                    >
                        <span style={{ font: 'var(--text-pixel)', fontSize: '0.75rem', color: 'var(--bd-teal)', fontWeight: 700 }}>
                            اليوم {daawaDay}
                        </span>
                    </div>

                    <button
                        onClick={() => { if (confirm('هل تريد تسجيل الخروج؟')) dispatch({ type: 'LOGOUT' }); }}
                        className="btn-icon"
                        title="تسجيل الخروج"
                    >
                        <Icon name="logout" size={20} />
                    </button>
                </div>
            </header>

            {/* Global Announcement Banner from Admin (if enabled) */}
            {state.announcement?.enabled && state.announcement?.text && (
                <div
                    className="card mb-4 anim-slide-down"
                    style={{
                        background: 'linear-gradient(135deg, rgba(15, 181, 174, 0.2) 0%, rgba(11, 31, 58, 0.8) 100%)',
                        border: '1px solid var(--bd-teal)',
                        padding: 'var(--space-3) var(--space-4)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-3)',
                    }}
                >
                    <Icon name="campaign" size={24} color="var(--bd-teal)" />
                    <div style={{ flex: 1, font: 'var(--text-body-sm)', color: 'var(--bd-white)' }}>
                        {state.announcement.text}
                    </div>
                </div>
            )}

            {/* NEXT PRAYER & COUNTDOWN HERO CARD */}
            <div
                className="card-glow mb-5"
                style={{
                    position: 'relative',
                    overflow: 'hidden',
                    background: 'radial-gradient(ellipse at top, #14355E 0%, #0B1F3A 100%)',
                    border: '1.5px solid var(--bd-teal)',
                    boxShadow: 'var(--bd-shadow-teal, 0 4px 20px rgba(15, 181, 174, 0.25))',
                    padding: 'var(--space-5)',
                }}
            >
                <div className="flex-between mb-3">
                    <span style={{ font: 'var(--text-label-md)', color: 'var(--bd-gold)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Nuqta size={8} />
                        الصلاة القادمة: {nextPrayerInfo.name}
                    </span>
                    <span style={{ font: 'var(--text-pixel)', fontSize: '0.75rem', color: 'var(--bd-teal-300)' }}>
                        {locationName}
                    </span>
                </div>

                <div style={{ textAlign: 'center', margin: 'var(--space-3) 0' }}>
                    <div
                        style={{
                            font: 'var(--text-display-md)',
                            fontWeight: 900,
                            letterSpacing: '2px',
                            color: 'var(--bd-white)',
                            direction: 'ltr',
                            fontFamily: 'monospace',
                            textShadow: '0 0 20px rgba(15, 181, 174, 0.5)',
                        }}
                    >
                        {nextPrayerInfo.countdown}
                    </div>
                    <p style={{ font: 'var(--text-body-sm)', color: 'var(--bd-teal-200)', marginTop: 'var(--space-1)', opacity: 0.9 }}>
                        الوقت المتبقي لرفع أذان {nextPrayerInfo.name}
                    </p>
                </div>

                {/* Smart Sunnah Fasting Notice */}
                {fastingNotice && (
                    <div
                        style={{
                            background: fastingNotice.isSunnahToday || fastingNotice.isSunnahTonight ? 'rgba(224, 165, 38, 0.18)' : 'rgba(15, 181, 174, 0.12)',
                            border: `1px solid ${fastingNotice.isSunnahToday || fastingNotice.isSunnahTonight ? 'var(--bd-gold)' : 'var(--bd-teal)'}`,
                            padding: '6px 12px',
                            margin: 'var(--space-2) 0 var(--space-3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: '4px',
                        }}
                    >
                        <span style={{ font: 'var(--text-label-sm)', fontWeight: 700, color: 'var(--bd-white)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Nuqta size={6} color={fastingNotice.isSunnahToday || fastingNotice.isSunnahTonight ? 'var(--bd-gold)' : 'var(--bd-teal)'} />
                            {fastingNotice.title}
                        </span>
                        <span style={{ font: 'var(--text-body-sm)', fontSize: '0.72rem', color: 'var(--bd-teal-200)' }}>
                            {fastingNotice.message}
                        </span>
                    </div>
                )}

                {/* Fasting & Imsak Pill Row */}
                <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-4)' }}>
                    <button
                        onClick={() => dispatch({ type: 'TOGGLE_FASTING' })}
                        style={{
                            flex: 1,
                            padding: '8px 12px',
                            borderRadius: 'var(--shape-full)',
                            border: `1.5px solid ${state.fastingToday ? 'var(--bd-teal)' : 'var(--color-outline)'}`,
                            background: state.fastingToday ? 'rgba(15, 181, 174, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                            color: state.fastingToday ? 'var(--bd-white)' : 'var(--color-on-surface-variant)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            font: 'var(--text-label-md)',
                            fontWeight: 600,
                            transition: 'all 0.2s ease',
                        }}
                    >
                        <Icon name={state.fastingToday ? 'check_circle' : 'radio_button_unchecked'} size={18} color={state.fastingToday ? 'var(--bd-teal)' : 'currentColor'} />
                        <span>{state.fastingToday ? 'صائم اليوم (مُسجل)' : 'تسجيل صيام اليوم'}</span>
                    </button>

                    <button
                        onClick={toggleAdhan}
                        style={{
                            padding: '8px 14px',
                            borderRadius: 'var(--shape-full)',
                            border: `1px solid ${adhanEnabled ? 'var(--bd-teal)' : 'var(--color-outline)'}`,
                            background: adhanEnabled ? 'rgba(15, 181, 174, 0.2)' : 'transparent',
                            color: adhanEnabled ? 'var(--bd-teal)' : 'var(--color-on-surface-variant)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            font: 'var(--text-label-sm)',
                        }}
                    >
                        <Icon name={adhanEnabled ? 'notifications_active' : 'notifications_off'} size={18} />
                        <span>{adhanEnabled ? 'الأذان مفعّل' : 'تفعيل الأذان'}</span>
                    </button>
                </div>
            </div>

            {/* Streak & Shield Manager (Dual Streaks, Monthly Repairs, Traveler & Exemption Shields) */}
            <StreakShieldManager />

            {/* Prayer Times Grid Horizontal Scroll */}
            <div className="mb-5">
                <div className="flex-between mb-3">
                    <h2 className="section-title" style={{ margin: 0 }}>
                        <Icon name="schedule" size={20} color="var(--bd-teal)" /> مواقيت الصلاة اليوم
                    </h2>
                </div>

                {isLoadingTimes ? (
                    <div className="card text-center" style={{ padding: 'var(--space-5)' }}>
                        <Icon name="sync" size={24} className="anim-pulse" color="var(--bd-teal)" />
                        <p style={{ marginTop: 'var(--space-2)', font: 'var(--text-body-sm)' }}>جاري تحديث المواقيت...</p>
                    </div>
                ) : prayerTimes ? (
                    <div
                        className="no-scrollbar"
                        style={{
                            display: 'flex',
                            gap: 'var(--space-2)',
                            overflowX: 'auto',
                            paddingBottom: 'var(--space-2)',
                        }}
                    >
                        {[
                            { name: 'الفجر', key: 'Fajr', icon: 'wb_twilight' },
                            { name: 'الشروق', key: 'Sunrise', icon: 'light_mode' },
                            { name: 'الظهر', key: 'Dhuhr', icon: 'light_mode' },
                            { name: 'العصر', key: 'Asr', icon: 'wb_sunny' },
                            { name: 'المغرب', key: 'Maghrib', icon: 'wb_twilight' },
                            { name: 'العشاء', key: 'Isha', icon: 'nightlight' },
                        ].map(pt => {
                            const [hoursStr, minutesStr] = (prayerTimes[pt.key] || '00:00').split(':');
                            const hours = parseInt(hoursStr, 10);
                            const period = hours >= 12 ? 'م' : 'ص';
                            const hours12 = hours % 12 || 12;
                            const isCurrentNext = nextPrayerInfo.name.includes(pt.name);

                            return (
                                <div
                                    key={pt.key}
                                    className="card"
                                    style={{
                                        flexShrink: 0,
                                        width: '88px',
                                        padding: 'var(--space-3) var(--space-2)',
                                        textAlign: 'center',
                                        background: isCurrentNext ? 'rgba(15, 181, 174, 0.18)' : 'var(--color-surface)',
                                        border: isCurrentNext ? '1.5px solid var(--bd-teal)' : '1px solid var(--color-outline)',
                                        borderRadius: 'var(--shape-md)',
                                    }}
                                >
                                    <Icon name={pt.icon} size={22} color={isCurrentNext ? 'var(--bd-teal)' : 'var(--bd-teal-300)'} />
                                    <div style={{ marginTop: 'var(--space-2)', font: 'var(--text-label-md)', fontWeight: isCurrentNext ? 700 : 500 }}>
                                        {pt.name}
                                    </div>
                                    <div style={{ marginTop: '4px', font: 'var(--text-body-sm)', fontWeight: 700, color: 'var(--bd-white)', direction: 'ltr' }}>
                                        {hours12}:{minutesStr} {period}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : null}
            </div>

            {/* Quick Action Chips to New Features */}
            <div style={{ display: 'flex', gap: 'var(--space-2)', overflowX: 'auto', paddingBottom: 'var(--space-3)', scrollbarWidth: 'none', marginBottom: 'var(--space-5)' }}>
                {[
                    { label: 'المصحف الشريف', path: '/quran', icon: 'menu_book' },
                    { label: 'بوصلة القبلة', path: '/tools', icon: 'explore' },
                    { label: 'السبحة الذكية', path: '/tools', icon: 'touch_app' },
                    { label: 'أذكار الصباح والمساء', path: '/istighfar', icon: 'self_improvement' },
                    { label: 'مواقيت الصلاة والتقويم', path: '/tools', icon: 'calendar_month' },
                ].map(action => (
                    <button
                        key={action.label}
                        onClick={() => navigate(action.path)}
                        style={{
                            flexShrink: 0,
                            padding: '8px 14px',
                            borderRadius: 'var(--shape-full)',
                            border: '1px solid var(--bd-teal-700)',
                            background: 'var(--color-surface-container, #122B4A)',
                            color: 'var(--bd-white)',
                            font: 'var(--text-label-md)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            cursor: 'pointer',
                        }}
                    >
                        <Icon name={action.icon} size={16} color="var(--bd-teal)" />
                        <span>{action.label}</span>
                    </button>
                ))}
            </div>

            {/* Daily Worship Progress Circle & Level */}
            <div className="card-glow text-center mb-6" style={{ padding: 'var(--space-5)' }}>
                <DawaProgress percentage={todayPercentage} size={140} />
                <div className="level-bar mt-4">
                    <Icon name={currentLevel.icon} size={28} color="var(--bd-gold)" />
                    <div className="level-info" style={{ textAlign: 'right' }}>
                        <div className="level-name">المستوى: {currentLevel.name}</div>
                        <div className="level-points">{state.totalPoints} نقطة تراكمية</div>
                    </div>
                    <div style={{ font: 'var(--text-headline-sm)', color: 'var(--bd-teal)', fontWeight: 800 }}>
                        +{todayPoints}
                    </div>
                </div>
            </div>

            {/* Fard Prayers Section */}
            <h2 className="section-title">
                <Icon name="mosque" size={20} color="var(--bd-teal)" /> الصلوات المفروضة
            </h2>
            <div className="card mb-5">
                {PRAYERS.map(prayer => (
                    <div
                        key={prayer.key}
                        className={`worship-check ${state.prayers[prayer.key] ? 'checked' : ''}`}
                        onClick={() => dispatch({ type: 'TOGGLE_PRAYER', prayer: prayer.key })}
                    >
                        <div className="checkbox"><span className="check-icon"><Icon name="check" size={14} color="var(--bd-navy)" /></span></div>
                        <div className="info">
                            <div className="name">{prayer.name}</div>
                            <div className="points">+{prayer.points} نقطة</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                            {state.stats[STREAK_KEYS[prayer.key]] > 0 && (
                                <span className="streak-badge">
                                    <Icon name="local_fire_department" size={14} /> {state.stats[STREAK_KEYS[prayer.key]]}
                                </span>
                            )}
                            <Icon name={prayer.icon} size={26} color={state.prayers[prayer.key] ? 'var(--bd-teal)' : 'var(--color-outline)'} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Sunnah Prayers Toggle Section */}
            <div className="flex-between mb-3">
                <h2 className="section-title" style={{ margin: 0 }}>
                    <Icon name="volunteer_activism" size={20} color="var(--bd-teal)" /> السنن والقيام
                </h2>
                <button className="btn btn-text" onClick={() => setShowSunnah(!showSunnah)}>
                    {showSunnah ? 'إخفاء' : 'عرض السنن'}
                </button>
            </div>
            {showSunnah && (
                <div className="card mb-5 anim-slide-up">
                    {SUNNAH.map(s => (
                        <div
                            key={s.key}
                            className={`worship-check ${state.sunnah[s.key] ? 'checked' : ''}`}
                            onClick={() => dispatch({ type: 'TOGGLE_SUNNAH', prayer: s.key })}
                        >
                            <div className="checkbox"><span className="check-icon"><Icon name="check" size={14} color="var(--bd-navy)" /></span></div>
                            <div className="info">
                                <div className="name">{s.name}</div>
                                <div className="points">+{s.points} نقطة</div>
                            </div>
                            <Icon name={s.icon} size={22} color={state.sunnah[s.key] ? 'var(--bd-teal)' : 'var(--color-outline)'} />
                        </div>
                    ))}
                    {/* Qiyam al-Layl */}
                    <div className={`worship-check ${state.qiyam ? 'checked' : ''}`} onClick={() => dispatch({ type: 'TOGGLE_QIYAM' })}>
                        <div className="checkbox"><span className="check-icon"><Icon name="check" size={14} color="var(--bd-navy)" /></span></div>
                        <div className="info">
                            <div className="name">قيام الليل والتهجد</div>
                            <div className="points">+30 نقطة {state.qiyamRakaat > 0 ? `(${state.qiyamRakaat} ركعات)` : ''}</div>
                        </div>
                        <Icon name="dark_mode" size={24} color={state.qiyam ? 'var(--bd-teal)' : 'var(--color-outline)'} />
                    </div>
                </div>
            )}

            {/* Qiyam & Tahajjud Night Prayers */}
            <h2 className="section-title">
                <Icon name="nights_stay" size={20} color="var(--bd-teal)" /> صلاة التطوع والقيام (التهجد)
            </h2>
            <div className="card mb-5">
                <div className={`worship-check ${state.taraweeh ? 'checked' : ''}`} onClick={() => dispatch({ type: 'TOGGLE_TARAWEEH' })}>
                    <div className="checkbox"><span className="check-icon"><Icon name="check" size={14} color="var(--bd-navy)" /></span></div>
                    <div className="info">
                        <div className="name">صلاة التطوع والتهجد</div>
                        <div className="points">+{taraweehPoints} نقطة ({state.taraweehRakaat} ركعة)</div>
                    </div>
                    <Icon name="mosque" size={26} color={state.taraweeh ? 'var(--bd-teal)' : 'var(--color-outline)'} />
                </div>
                {state.taraweeh && (
                    <div style={{ padding: 'var(--space-3) var(--space-4)', borderTop: '1px solid var(--color-outline-variant)' }}>
                        <div className="flex-between">
                            <span style={{ font: 'var(--text-body-sm)' }}>عدد الركعات المؤداة:</span>
                            <div className="counter">
                                <button className="btn-counter" onClick={() => dispatch({ type: 'SET_TARAWEEH_RAKAAT', value: Math.max(0, state.taraweehRakaat - 2) })}>
                                    <Icon name="remove" size={16} />
                                </button>
                                <span className="value">{state.taraweehRakaat}</span>
                                <button className="btn-counter" onClick={() => dispatch({ type: 'SET_TARAWEEH_RAKAAT', value: Math.min(20, state.taraweehRakaat + 2) })}>
                                    <Icon name="add" size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Daily Adhkar Check-ins */}
            <h2 className="section-title">
                <Icon name="auto_stories" size={20} color="var(--bd-teal)" /> ورد الأذكار اليومي
            </h2>
            <div className="card mb-5">
                <div className={`worship-check ${state.adhkarMorning ? 'checked' : ''}`} onClick={() => dispatch({ type: 'TOGGLE_ADHKAR_MORNING' })}>
                    <div className="checkbox"><span className="check-icon"><Icon name="check" size={14} color="var(--bd-navy)" /></span></div>
                    <div className="info">
                        <div className="name">أذكار الصباح</div>
                        <div className="points">+10 نقطة</div>
                    </div>
                    <Icon name="light_mode" size={22} color={state.adhkarMorning ? 'var(--bd-teal)' : 'var(--color-outline)'} />
                </div>
                <div className="divider" style={{ margin: '0 var(--space-4)' }} />
                <div className={`worship-check ${state.adhkarEvening ? 'checked' : ''}`} onClick={() => dispatch({ type: 'TOGGLE_ADHKAR_EVENING' })}>
                    <div className="checkbox"><span className="check-icon"><Icon name="check" size={14} color="var(--bd-navy)" /></span></div>
                    <div className="info">
                        <div className="name">أذكار المساء</div>
                        <div className="points">+10 نقطة</div>
                    </div>
                    <Icon name="nightlight" size={22} color={state.adhkarEvening ? 'var(--bd-teal)' : 'var(--color-outline)'} />
                </div>
                <div className="divider" style={{ margin: '0 var(--space-4)' }} />
                <div className={`worship-check ${state.adhkarSleep ? 'checked' : ''}`} onClick={() => dispatch({ type: 'TOGGLE_ADHKAR_SLEEP' })}>
                    <div className="checkbox"><span className="check-icon"><Icon name="check" size={14} color="var(--bd-navy)" /></span></div>
                    <div className="info">
                        <div className="name">أذكار النوم</div>
                        <div className="points">+10 نقطة</div>
                    </div>
                    <Icon name="bedtime" size={22} color={state.adhkarSleep ? 'var(--bd-teal)' : 'var(--color-outline)'} />
                </div>
            </div>

            {/* Daily Quran Wird Card */}
            <h2 className="section-title">
                <Icon name="menu_book" size={20} color="var(--bd-teal)" /> ورد القرآن اليومي
            </h2>
            <div className="card mb-5" style={{ padding: 'var(--space-4)' }}>
                <div className="flex-between mb-3">
                    <div>
                        <div style={{ font: 'var(--text-title-sm)', fontWeight: 700 }}>صفحات مقروءة اليوم</div>
                        <div style={{ font: 'var(--text-body-sm)', color: 'var(--bd-gold)' }}>+20 نقطة ورد</div>
                    </div>
                    <div className="counter">
                        <button className="btn-counter" onClick={() => dispatch({ type: 'SET_QURAN_PAGES', value: Math.max(0, state.quranPagesRead - 1) })}>
                            <Icon name="remove" size={16} />
                        </button>
                        <span className="value">{state.quranPagesRead}</span>
                        <button className="btn-counter" onClick={() => dispatch({ type: 'SET_QURAN_PAGES', value: state.quranPagesRead + 1 })}>
                            <Icon name="add" size={16} />
                        </button>
                    </div>
                </div>
                <button className="btn btn-filled w-full" onClick={() => navigate('/quran')} style={{ marginTop: 'var(--space-2)' }}>
                    <Icon name="menu_book" size={18} /> فتح المصحف الذكي والتلاوات
                </button>
            </div>

            {/* Nafahat of the Day: Hadith & Dua */}
            <div className="card-glow mb-5">
                <div className="flex-between mb-3">
                    <h2 className="section-title" style={{ margin: 0, color: 'inherit' }}>
                        <Icon name="star" size={22} color="var(--bd-gold)" /> نفحات اليوم ({daawaDay})
                    </h2>
                </div>

                {/* Hadith */}
                <div className="card mb-3" style={{ padding: 'var(--space-3)' }}>
                    <div className="flex-between mb-2">
                        <span style={{ font: 'var(--text-title-sm)', color: 'var(--bd-teal)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Icon name="auto_stories" size={18} /> حديث اليوم
                        </span>
                        <div style={{ display: 'flex', gap: '6px' }}>
                            <PixelCardExporter title="حديث اليوم" bodyText={activeHadith} sourceText="تطبيق دعوة · رفيقك الإيماني" buttonLabel="مشاركة" />
                            <button
                                className="btn btn-icon"
                                onClick={() => handleCopy(activeHadith, 'hadith')}
                                title="نسخ الحديث"
                            >
                                <Icon name={copiedContent === 'hadith' ? 'done' : 'content_copy'} size={16} color={copiedContent === 'hadith' ? 'var(--bd-teal)' : 'currentColor'} />
                            </button>
                        </div>
                    </div>
                    <p style={{ margin: 0, font: 'var(--text-body-md)', lineHeight: 1.7, color: 'var(--bd-white)' }}>
                        "{activeHadith}"
                    </p>
                </div>

                {/* Dua */}
                <div className="card" style={{ padding: 'var(--space-3)' }}>
                    <div className="flex-between mb-2">
                        <span style={{ font: 'var(--text-title-sm)', color: 'var(--bd-gold)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Icon name="back_hand" size={18} /> دعاء اليوم
                        </span>
                        <div style={{ display: 'flex', gap: '6px' }}>
                            <PixelCardExporter title="دعاء اليوم" bodyText={activeDua} sourceText="تطبيق دعوة · رفيقك الإيماني" buttonLabel="مشاركة" />
                            <button
                                className="btn btn-icon"
                                onClick={() => handleCopy(activeDua, 'dua')}
                                title="نسخ الدعاء"
                            >
                                <Icon name={copiedContent === 'dua' ? 'done' : 'content_copy'} size={16} color={copiedContent === 'dua' ? 'var(--bd-gold)' : 'currentColor'} />
                            </button>
                        </div>
                    </div>
                    <p style={{ margin: 0, font: 'var(--text-body-md)', lineHeight: 1.7, color: 'var(--bd-white)' }}>
                        "{activeDua}"
                    </p>
                </div>
            </div>

            {/* Micro-Squads (حلقات الصحبة المصغرة) */}
            <MicroSquads />
        </div>
    );
}

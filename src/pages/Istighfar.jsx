import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { getTodayKey } from '../services/storage';
import Icon, { Nuqta } from '../components/Icon';
import {
    morningAdhkar, eveningAdhkar, sleepAdhkar,
    postPrayerAdhkar, tasbeehAdhkar, wakingUpAdhkar,
    quranicDuas, prophetsDuas
} from '../data/adhkar';
import { ASMA_UL_HUSNA_DATA } from '../data/asmaUlHusna';
import HadithReader from '../components/quran/HadithReader';
import BlindTasbeeh from '../components/BlindTasbeeh';

const CATEGORIES = [
    { id: 'rosary', name: 'السبحة', icon: 'touch_app', data: null, color: 'var(--bd-teal)' },
    { id: 'morning', name: 'أذكار الصباح', icon: 'wb_twilight', data: morningAdhkar, color: '#f59e0b' },
    { id: 'evening', name: 'أذكار المساء', icon: 'nights_stay', data: eveningAdhkar, color: '#3b82f6' },
    { id: 'postPrayer', name: 'أذكار الصلاة', icon: 'mosque', data: postPrayerAdhkar, color: '#10b981' },
    { id: 'tasbeeh', name: 'تسابيح', icon: 'fingerprint', data: tasbeehAdhkar, color: '#8b5cf6' },
    { id: 'sleep', name: 'أذكار النوم', icon: 'bedtime', data: sleepAdhkar, color: '#6366f1' },
    { id: 'wakingUp', name: 'أذكار الاستيقاظ', icon: 'light_mode', data: wakingUpAdhkar, color: '#f59e0b' },
    { id: 'quranic', name: 'أدعية قرآنية', icon: 'menu_book', data: quranicDuas, color: '#14b8a6' },
    { id: 'prophets', name: 'أدعية الأنبياء', icon: 'history_edu', data: prophetsDuas, color: '#ec4899' },
    { id: 'asma', name: 'أسماء الله الحسنى', icon: 'menu_book', data: null, color: '#0ea5e9' },
    { id: 'hadiths', name: 'الحديث الشريف', icon: 'auto_stories', data: null, color: '#f59e0b' }
];

export default function Istighfar() {
    const { state, dispatch } = useApp();
    const todayKey = state.challengeKey || getTodayKey();

    const [activeCategory, setActiveCategory] = useState(null);
    const [rosaryCount, setRosaryCount] = useState(0);
    const [adhkarProgress, setAdhkarProgress] = useState(null);
    const [showBlindTasbeeh, setShowBlindTasbeeh] = useState(false);

    const [asmaData, setAsmaData] = useState([]);
    const [isLoadingAsma, setIsLoadingAsma] = useState(false);

    const [playingIndex, setPlayingIndex] = useState(null);
    const [isPlayingAll, setIsPlayingAll] = useState(false);
    const audioRef = useRef(new Audio());

    useEffect(() => {
        if (activeCategory === 'asma' && asmaData.length === 0) {
            setAsmaData(ASMA_UL_HUSNA_DATA);
        }
    }, [activeCategory, asmaData.length]);

    const playAudioFile = (index) => {
        if (!asmaData[index]) {
            setIsPlayingAll(false);
            setPlayingIndex(null);
            return;
        }

        setPlayingIndex(index);

        audioRef.current.pause();
        audioRef.current.currentTime = 0;

        audioRef.current.src = `https://islamicapi.com${asmaData[index].audio}`;

        audioRef.current.play().catch(e => {
            console.error("Audio playback error:", e);
        });

        audioRef.current.onended = () => {
            if (isPlayingAllRef.current) {
                if (index < asmaData.length - 1) {
                    playAudioFile(index + 1);
                } else {
                    setIsPlayingAll(false);
                    setPlayingIndex(null);
                }
            } else {
                setPlayingIndex(null);
            }
        };
    };

    const isPlayingAllRef = useRef(isPlayingAll);
    useEffect(() => {
        isPlayingAllRef.current = isPlayingAll;
    }, [isPlayingAll]);

    const togglePlayAll = () => {
        if (isPlayingAll) {
            audioRef.current.pause();
            setIsPlayingAll(false);
            setPlayingIndex(null);
        } else {
            setIsPlayingAll(true);
            playAudioFile(playingIndex !== null ? playingIndex : 0);
        }
    };

    const playNext = () => {
        if (playingIndex !== null && playingIndex < asmaData.length - 1) {
            playAudioFile(playingIndex + 1);
        }
    };

    const playPrev = () => {
        if (playingIndex !== null && playingIndex > 0) {
            playAudioFile(playingIndex - 1);
        }
    };

    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.src = "";
            }
        };
    }, []);

    useEffect(() => {
        const initProgress = (list) => list ? list.reduce((acc, item) => ({ ...acc, [item.id]: item.count }), {}) : {};
        const defaultProgress = {
            morning: initProgress(morningAdhkar),
            evening: initProgress(eveningAdhkar),
            postPrayer: initProgress(postPrayerAdhkar),
            tasbeeh: initProgress(tasbeehAdhkar),
            sleep: initProgress(sleepAdhkar),
            wakingUp: initProgress(wakingUpAdhkar),
            quranic: initProgress(quranicDuas),
            prophets: initProgress(prophetsDuas)
        };

        let loadedAdhkar = defaultProgress;
        const savedAdhkar = localStorage.getItem(`daawa_adhkar_${todayKey}`);
        if (savedAdhkar) {
            try {
                loadedAdhkar = { ...defaultProgress, ...JSON.parse(savedAdhkar) };
            } catch (e) {
                loadedAdhkar = defaultProgress;
            }
        }
        setAdhkarProgress(loadedAdhkar);

        let loadedRosary = 0;
        const savedRosary = localStorage.getItem(`daawa_rosary_${todayKey}`);
        if (savedRosary) {
            loadedRosary = parseInt(savedRosary) || 0;
        } else {
            const legacyRosary = localStorage.getItem('daawa_istighfar_count');
            if (legacyRosary) {
                loadedRosary = parseInt(legacyRosary) || 0;
                localStorage.removeItem('daawa_istighfar_count');
            }
        }
        setRosaryCount(loadedRosary);

    }, [todayKey]);

    useEffect(() => {
        if (adhkarProgress !== null) {
            localStorage.setItem(`daawa_adhkar_${todayKey}`, JSON.stringify(adhkarProgress));
            localStorage.setItem(`daawa_rosary_${todayKey}`, rosaryCount);

            const checkCompletion = (type, stateKey, dispatchType) => {
                if (!adhkarProgress[type]) return;
                const vals = Object.values(adhkarProgress[type]);
                if (vals.length === 0) return;
                const isAllDone = vals.every(count => count <= 0);
                if (isAllDone && !state[stateKey]) {
                    dispatch({ type: dispatchType });
                }
            };

            checkCompletion('morning', 'adhkarMorning', 'TOGGLE_ADHKAR_MORNING');
            checkCompletion('evening', 'adhkarEvening', 'TOGGLE_ADHKAR_EVENING');
            checkCompletion('sleep', 'adhkarSleep', 'TOGGLE_ADHKAR_SLEEP');
        }
    }, [adhkarProgress, rosaryCount, todayKey, state, dispatch]);

    const handleRosaryTap = () => {
        setRosaryCount(c => c + 1);
        if (navigator.vibrate) navigator.vibrate(50);
    };

    const handleRosaryReset = () => {
        if (confirm('هل تريد تصفير العداد؟')) setRosaryCount(0);
    };

    const handleDhikrTap = (type, id) => {
        if (adhkarProgress[type] && adhkarProgress[type][id] > 0) {
            setAdhkarProgress(prev => ({
                ...prev,
                [type]: {
                    ...prev[type],
                    [id]: Math.max(0, prev[type][id] - 1)
                }
            }));
            if (navigator.vibrate) navigator.vibrate(50);
        }
    };

    const handleDhikrReset = (type, id, originalCount) => {
        setAdhkarProgress(prev => ({
            ...prev,
            [type]: {
                ...prev[type],
                [id]: originalCount
            }
        }));
    };

    const renderRosary = () => (
        <div className="anim-slide-up" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: 'var(--space-6) 0' }}>
            {/* Collective Pulse */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 14px',
                border: '1.5px solid var(--bd-black)',
                background: 'rgba(15, 181, 174, 0.1)',
                boxShadow: '2px 2px 0 var(--bd-black)',
                marginBottom: '16px',
                fontSize: '0.8rem',
                fontWeight: 800,
                color: 'var(--bd-teal)'
            }}>
                <span style={{ width: '8px', height: '8px', background: 'var(--bd-teal)', transform: 'rotate(45deg)', display: 'inline-block' }}></span>
                <span>النبض الحي للذاكرين: أكثر من 18,500 تسبيحة رُفعت اليوم</span>
            </div>

            <div
                className="card-glow"
                style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', userSelect: 'none', position: 'relative', overflow: 'hidden', padding: 'var(--space-8)', width: '100%',
                    border: '2px solid var(--bd-black)', boxShadow: '4px 4px 0 var(--bd-black)'
                }}
                onClick={handleRosaryTap}
            >
                <div style={{
                    width: '180px', height: '180px',
                    border: '3px solid var(--bd-black)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(15, 181, 174, 0.12)',
                    boxShadow: '3px 3px 0 var(--bd-black)'
                }}>
                    <span style={{ fontSize: '3.8rem', fontWeight: 900, color: 'var(--bd-gold)', fontFamily: 'monospace' }}>{rosaryCount}</span>
                </div>
                <p style={{ marginTop: 'var(--space-4)', opacity: 0.8, font: 'var(--text-body-sm)', fontWeight: 700 }}>المس الإطار للتسبيح (+1)</p>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '16px', width: '100%' }}>
                <button
                    className="btn"
                    onClick={() => setShowBlindTasbeeh(true)}
                    style={{
                        flex: 1,
                        padding: '10px',
                        border: '2px solid var(--bd-black)',
                        background: '#000',
                        color: 'var(--bd-teal)',
                        fontWeight: 800,
                        fontSize: '0.85rem',
                        boxShadow: '2px 2px 0 var(--bd-black)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                    }}
                >
                    <Icon name="dark_mode" size={16} color="var(--bd-teal)" />
                    <span>التسبيح بدون نظر (OLED)</span>
                </button>

                <button
                    className="btn"
                    onClick={handleRosaryReset}
                    style={{
                        padding: '10px 14px',
                        border: '2px solid var(--bd-black)',
                        background: 'var(--color-surface-card)',
                        color: 'var(--color-text)',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        boxShadow: '2px 2px 0 var(--bd-black)'
                    }}
                >
                    <Icon name="restart_alt" size={16} /> تصفير
                </button>
            </div>

            {showBlindTasbeeh && (
                <BlindTasbeeh
                    onClose={() => setShowBlindTasbeeh(false)}
                    initialCount={rosaryCount}
                />
            )}
        </div>
    );

    const renderAsmaUlHusna = () => {
        return (
            <div className="anim-slide-up" style={{ paddingBottom: 'var(--space-6)' }}>
                <h2 style={{ font: 'var(--text-headline-sm)', marginBottom: 'var(--space-4)', color: 'var(--bd-teal)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <Nuqta size={8} />
                    <Icon name="menu_book" size={28} color="var(--bd-teal)" /> أسماء الله الحسنى
                </h2>

                {isLoadingAsma ? (
                    <div className="card text-center" style={{ padding: 'var(--space-6)', opacity: 0.7 }}>
                        <Icon name="sync" size={24} className="anim-pulse" />
                        <p style={{ marginTop: 'var(--space-2)', font: 'var(--text-body-sm)' }}>جاري تحميل الأسماء الحسنى...</p>
                    </div>
                ) : (
                    <>
                        {/* Audio Player Controller */}
                        <div className="card mb-4" style={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center',
                            background: 'var(--bd-teal-900)',
                            color: 'var(--bd-teal-200)',
                            padding: 'var(--space-4)', borderRadius: 'var(--shape-xl)',
                            border: '1px solid var(--bd-teal-700)'
                        }}>
                            <h3 style={{ margin: '0 0 var(--space-3) 0', font: 'var(--text-title-md)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                <Icon name="graphic_eq" size={24} color="var(--bd-teal)" /> المشغل الصوتي
                            </h3>
                            <div className="flex-center" style={{ gap: 'var(--space-4)' }}>
                                <button className="btn btn-filled-tonal" onClick={playPrev} disabled={playingIndex === null || playingIndex === 0} style={{ padding: 'var(--space-2)', minWidth: 'auto', borderRadius: '50%' }}>
                                    <Icon name="skip_next" size={28} />
                                </button>

                                <button className="btn btn-filled" onClick={togglePlayAll} style={{ padding: 'var(--space-3) var(--space-6)', borderRadius: 'var(--shape-full)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)', font: 'var(--text-label-lg)' }}>
                                    <Icon name={isPlayingAll ? "pause" : "play_arrow"} size={28} />
                                    {isPlayingAll ? 'إيقاف' : 'تشغيل الكل'}
                                </button>

                                <button className="btn btn-filled-tonal" onClick={playNext} disabled={playingIndex === null || playingIndex === asmaData.length - 1} style={{ padding: 'var(--space-2)', minWidth: 'auto', borderRadius: '50%' }}>
                                    <Icon name="skip_previous" size={28} />
                                </button>
                            </div>
                            {playingIndex !== null && asmaData[playingIndex] && (
                                <div style={{ marginTop: 'var(--space-4)', fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--bd-teal)', fontFamily: 'var(--font-display-ar)' }}>
                                    {asmaData[playingIndex].name}
                                </div>
                            )}
                        </div>

                        {/* Asma Grid: Small Squares */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 'var(--space-3)' }}>
                            {asmaData.map((item, index) => {
                                const isCurrent = playingIndex === index;
                                return (
                                    <div
                                        key={item.number}
                                        className={`card-glow ${isCurrent ? 'active' : ''}`}
                                        onClick={() => { setIsPlayingAll(false); playAudioFile(index); }}
                                        style={{
                                            position: 'relative', overflow: 'hidden', padding: 'var(--space-3)',
                                            display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
                                            cursor: 'pointer',
                                            border: isCurrent ? '2px solid var(--bd-teal)' : '1px solid transparent',
                                            background: isCurrent ? 'rgba(15, 181, 174, 0.1)' : 'var(--color-surface-variant)',
                                            transform: isCurrent ? 'scale(1.05)' : 'scale(1)',
                                            transition: 'all 0.3s ease'
                                        }}
                                    >
                                        <div style={{
                                            position: 'absolute', top: 'var(--space-2)', right: 'var(--space-2)',
                                            background: 'var(--bd-gold)',
                                            color: 'var(--bd-navy)',
                                            width: '24px', height: '24px', borderRadius: '50%',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            font: 'var(--text-pixel)', fontWeight: 'bold', fontSize: '0.7rem'
                                        }}>
                                            {item.number}
                                        </div>

                                        <h3 style={{ font: 'var(--text-display-sm)', fontSize: '1.6rem', color: isCurrent ? 'var(--bd-teal)' : 'inherit', margin: 'var(--space-5) 0 var(--space-2) 0' }}>
                                            {item.name}
                                        </h3>
                                        <div style={{ font: 'var(--text-body-sm)', color: 'var(--color-on-surface-variant)', direction: 'ltr' }}>
                                            {item.transliteration}
                                        </div>
                                        <p style={{ margin: 'var(--space-2) 0 0 0', font: 'var(--text-body-sm)', opacity: 0.8, lineHeight: '1.4' }}>
                                            {item.en.meaning}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>
        );
    };

    const renderAdhkarList = (list, type) => {
        if (!adhkarProgress[type]) return null;
        const vals = Object.values(adhkarProgress[type]);
        const isCompleted = vals.length > 0 && vals.every(c => c <= 0);

        return (
            <div style={{ paddingBottom: 'var(--space-6)' }}>
                {isCompleted && (
                    <div className="card mb-4 anim-fade-in" style={{ background: 'rgba(125, 220, 122, 0.1)', borderColor: 'var(--bd-success)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                        <Icon name="check_circle" size={28} color="var(--bd-success)" />
                        <div>
                            <h3 style={{ margin: 0, color: 'var(--bd-success)', font: 'var(--text-title-md)' }}>جزاك الله خيراً</h3>
                            <p style={{ margin: 0, font: 'var(--text-body-sm)', opacity: 0.9 }}>لقد أتممت هذه الأذكار بنجاح.</p>
                        </div>
                    </div>
                )}
                {list.map((item, index) => {
                    const remaining = adhkarProgress[type][item.id] || 0;
                    const done = remaining <= 0;

                    return (
                        <div key={item.id} className="card mb-4" style={{
                            position: 'relative',
                            overflow: 'hidden',
                            borderColor: done ? 'var(--bd-success)' : 'var(--color-outline)',
                            opacity: done ? 0.8 : 1,
                            transition: 'all 0.3s ease'
                        }}>
                            <div style={{
                                position: 'absolute', top: 0, right: 0, bottom: 0,
                                width: `${((item.count - remaining) / item.count) * 100}%`,
                                background: 'rgba(15, 181, 174, 0.05)',
                                zIndex: 0, transition: 'width 0.3s ease'
                            }}></div>

                            <div style={{ position: 'relative', zIndex: 1, padding: 'var(--space-4)' }}>
                                <div className="flex-between mb-4">
                                    <span style={{
                                        background: done ? 'var(--bd-success)' : 'var(--bd-gold)',
                                        color: done ? '#fff' : 'var(--bd-navy)',
                                        width: '28px', height: '28px', borderRadius: '50%',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        font: 'var(--text-label-md)', fontWeight: 'bold'
                                    }}>
                                        {done ? <Icon name="check" size={16} color="#fff" /> : index + 1}
                                    </span>
                                    {done && (
                                        <button className="btn btn-text" onClick={() => handleDhikrReset(type, item.id, item.count)} style={{ padding: 'var(--space-1) var(--space-2)', minHeight: 'auto', font: 'var(--text-body-sm)' }}>
                                            <Icon name="refresh" size={16} /> إعادة
                                        </button>
                                    )}
                                </div>

                                <p style={{ fontSize: '1.2rem', lineHeight: '1.8', whiteSpace: 'pre-line', marginBottom: 'var(--space-4)', fontWeight: 'bold', fontFamily: 'var(--font-body-ar)' }}>
                                    {item.text}
                                </p>

                                {item.fadeText && (
                                    <p style={{ font: 'var(--text-body-sm)', opacity: 0.7, marginBottom: 'var(--space-2)', borderRight: '2px solid var(--bd-teal)', paddingRight: 'var(--space-3)' }}>
                                        {item.fadeText}
                                    </p>
                                )}

                                <div className="flex-between" style={{ marginTop: 'var(--space-4)', borderTop: '1px solid var(--color-outline-variant)', paddingTop: 'var(--space-4)' }}>
                                    <span style={{ font: 'var(--text-body-sm)', opacity: 0.6 }}>{item.reference}</span>

                                    <button
                                        className={`btn ${done ? 'btn-text' : 'btn-filled'}`}
                                        onClick={() => handleDhikrTap(type, item.id)}
                                        disabled={done}
                                        style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', padding: 'var(--space-2) var(--space-5)', borderRadius: 'var(--shape-full)' }}
                                    >
                                        <span style={{ fontSize: '1.2rem', fontWeight: 'bold', fontFamily: 'var(--font-pixel)' }}>{remaining}</span>
                                        <span style={{ font: 'var(--text-body-sm)' }}>مرات</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    const renderCategoriesGrid = () => (
        <div className="anim-fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 'var(--space-4)', paddingBottom: 'var(--space-6)' }}>
            {CATEGORIES.map(cat => (
                <div key={cat.id} className="card-glow" onClick={() => setActiveCategory(cat.id)} style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                    padding: 'var(--space-6) var(--space-3)', textAlign: 'center', transition: 'all 0.3s ease'
                }}>
                    <div style={{
                        background: `color-mix(in srgb, ${cat.color} 15%, transparent)`,
                        padding: 'var(--space-4)', borderRadius: '50%', marginBottom: 'var(--space-4)'
                    }}>
                        <Icon name={cat.icon} size={36} color={cat.color} />
                    </div>
                    <span style={{ font: 'var(--text-body-lg)', fontWeight: 'bold' }}>{cat.name}</span>
                </div>
            ))}
        </div>
    );

    return (
        <div className="page" style={{ height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column' }}>
            <div className="mb-4">
                <div className="flex-between" style={{ marginBottom: 'var(--space-4)' }}>
                    <h1 style={{ font: 'var(--text-headline-sm)', margin: 0, display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                        <Nuqta size={8} />
                        <Icon name="book" size={28} color="var(--bd-teal)" /> الأذكار والتسبيح
                    </h1>
                </div>

                {activeCategory && (
                    <button className="btn btn-filled-tonal anim-fade-in" onClick={() => setActiveCategory(null)} style={{ marginBottom: 'var(--space-4)', borderRadius: 'var(--shape-full)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <Icon name="arrow_forward" size={20} /> العودة للتصنيفات
                    </button>
                )}
            </div>

            <div className="no-scrollbar" style={{ flex: 1, overflowY: 'auto', paddingRight: 'var(--space-1)' }}>
                {!activeCategory && renderCategoriesGrid()}

                {activeCategory === 'rosary' && renderRosary()}
                {activeCategory === 'asma' && renderAsmaUlHusna()}
                {activeCategory === 'hadiths' && <HadithReader />}

                {activeCategory && activeCategory !== 'rosary' && activeCategory !== 'asma' && activeCategory !== 'hadiths' && (() => {
                    const catInfo = CATEGORIES.find(c => c.id === activeCategory);
                    if (catInfo && catInfo.data) {
                        return (
                            <div className="anim-slide-up">
                                <h2 style={{ font: 'var(--text-headline-sm)', marginBottom: 'var(--space-4)', color: catInfo.color, display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                    <Icon name={catInfo.icon} size={28} color={catInfo.color} /> {catInfo.name}
                                </h2>
                                {renderAdhkarList(catInfo.data, activeCategory)}
                            </div>
                        )
                    }
                    return null;
                })()}
            </div>
        </div>
    );
}
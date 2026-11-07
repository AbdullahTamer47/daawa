import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import Icon from '../Icon';

const TOTAL_QURAN_PAGES = 604;

// بيانات السور المختصرة (رقم، اسم، عدد الآيات، أول صفحة)
const SURAHS_INFO = [
    { n: 1, name: 'الفاتحة', ayahs: 7, page: 1 }, { n: 2, name: 'البقرة', ayahs: 286, page: 2 }, { n: 3, name: 'آل عمران', ayahs: 200, page: 50 }, { n: 4, name: 'النساء', ayahs: 176, page: 77 },
    { n: 5, name: 'المائدة', ayahs: 120, page: 106 }, { n: 6, name: 'الأنعام', ayahs: 165, page: 128 }, { n: 7, name: 'الأعراف', ayahs: 206, page: 151 }, { n: 8, name: 'الأنفال', ayahs: 75, page: 177 },
    { n: 9, name: 'التوبة', ayahs: 129, page: 187 }, { n: 10, name: 'يونس', ayahs: 109, page: 208 }, { n: 11, name: 'هود', ayahs: 123, page: 221 }, { n: 12, name: 'يوسف', ayahs: 111, page: 235 },
    { n: 13, name: 'الرعد', ayahs: 43, page: 249 }, { n: 14, name: 'إبراهيم', ayahs: 52, page: 255 }, { n: 15, name: 'الحجر', ayahs: 99, page: 262 }, { n: 16, name: 'النحل', ayahs: 128, page: 267 },
    { n: 17, name: 'الإسراء', ayahs: 111, page: 282 }, { n: 18, name: 'الكهف', ayahs: 110, page: 293 }, { n: 19, name: 'مريم', ayahs: 98, page: 305 }, { n: 20, name: 'طه', ayahs: 135, page: 312 },
    { n: 21, name: 'الأنبياء', ayahs: 112, page: 322 }, { n: 22, name: 'الحج', ayahs: 78, page: 332 }, { n: 23, name: 'المؤمنون', ayahs: 118, page: 342 }, { n: 24, name: 'النور', ayahs: 64, page: 350 },
    { n: 25, name: 'الفرقان', ayahs: 77, page: 359 }, { n: 26, name: 'الشعراء', ayahs: 227, page: 367 }, { n: 27, name: 'النمل', ayahs: 93, page: 377 }, { n: 28, name: 'القصص', ayahs: 88, page: 385 },
    { n: 29, name: 'العنكبوت', ayahs: 69, page: 396 }, { n: 30, name: 'الروم', ayahs: 60, page: 404 }, { n: 31, name: 'لقمان', ayahs: 34, page: 411 }, { n: 32, name: 'السجدة', ayahs: 30, page: 415 },
    { n: 33, name: 'الأحزاب', ayahs: 73, page: 418 }, { n: 34, name: 'سبأ', ayahs: 54, page: 428 }, { n: 35, name: 'فاطر', ayahs: 45, page: 434 }, { n: 36, name: 'يس', ayahs: 83, page: 440 },
    { n: 37, name: 'الصافات', ayahs: 182, page: 446 }, { n: 38, name: 'ص', ayahs: 88, page: 453 }, { n: 39, name: 'الزمر', ayahs: 75, page: 458 }, { n: 40, name: 'غافر', ayahs: 85, page: 467 },
    { n: 41, name: 'فصلت', ayahs: 54, page: 477 }, { n: 42, name: 'الشورى', ayahs: 53, page: 483 }, { n: 43, name: 'الزخرف', ayahs: 89, page: 489 }, { n: 44, name: 'الدخان', ayahs: 59, page: 496 },
    { n: 45, name: 'الجاثية', ayahs: 37, page: 499 }, { n: 46, name: 'الأحقاف', ayahs: 35, page: 502 }, { n: 47, name: 'محمد', ayahs: 38, page: 507 }, { n: 48, name: 'الفتح', ayahs: 29, page: 511 },
    { n: 49, name: 'الحجرات', ayahs: 18, page: 515 }, { n: 50, name: 'ق', ayahs: 45, page: 518 }, { n: 51, name: 'الذاريات', ayahs: 60, page: 520 }, { n: 52, name: 'الطور', ayahs: 49, page: 523 },
    { n: 53, name: 'النجم', ayahs: 62, page: 526 }, { n: 54, name: 'القمر', ayahs: 55, page: 528 }, { n: 55, name: 'الرحمن', ayahs: 78, page: 531 }, { n: 56, name: 'الواقعة', ayahs: 96, page: 534 },
    { n: 57, name: 'الحديد', ayahs: 29, page: 537 }, { n: 58, name: 'المجادلة', ayahs: 22, page: 542 }, { n: 59, name: 'الحشر', ayahs: 24, page: 545 }, { n: 60, name: 'الممتحنة', ayahs: 13, page: 549 },
    { n: 61, name: 'الصف', ayahs: 14, page: 551 }, { n: 62, name: 'الجمعة', ayahs: 11, page: 553 }, { n: 63, name: 'المنافقون', ayahs: 11, page: 554 }, { n: 64, name: 'التغابن', ayahs: 18, page: 556 },
    { n: 65, name: 'الطلاق', ayahs: 12, page: 558 }, { n: 66, name: 'التحريم', ayahs: 12, page: 560 }, { n: 67, name: 'الملك', ayahs: 30, page: 562 }, { n: 68, name: 'القلم', ayahs: 52, page: 564 },
    { n: 69, name: 'الحاقة', ayahs: 52, page: 566 }, { n: 70, name: 'المعارج', ayahs: 44, page: 568 }, { n: 71, name: 'نوح', ayahs: 28, page: 570 }, { n: 72, name: 'الجن', ayahs: 28, page: 572 },
    { n: 73, name: 'المزمل', ayahs: 20, page: 574 }, { n: 74, name: 'المدثر', ayahs: 56, page: 575 }, { n: 75, name: 'القيامة', ayahs: 40, page: 577 }, { n: 76, name: 'الإنسان', ayahs: 31, page: 578 },
    { n: 77, name: 'المرسلات', ayahs: 50, page: 580 }, { n: 78, name: 'النبأ', ayahs: 40, page: 582 }, { n: 79, name: 'النازعات', ayahs: 46, page: 583 }, { n: 80, name: 'عبس', ayahs: 42, page: 585 },
    { n: 81, name: 'التكوير', ayahs: 29, page: 586 }, { n: 82, name: 'الانفطار', ayahs: 19, page: 587 }, { n: 83, name: 'المطففين', ayahs: 36, page: 587 }, { n: 84, name: 'الانشقاق', ayahs: 25, page: 589 },
    { n: 85, name: 'البروج', ayahs: 22, page: 590 }, { n: 86, name: 'الطارق', ayahs: 17, page: 591 }, { n: 87, name: 'الأعلى', ayahs: 19, page: 591 }, { n: 88, name: 'الغاشية', ayahs: 26, page: 592 },
    { n: 89, name: 'الفجر', ayahs: 30, page: 593 }, { n: 90, name: 'البلد', ayahs: 20, page: 594 }, { n: 91, name: 'الشمس', ayahs: 15, page: 595 }, { n: 92, name: 'الليل', ayahs: 21, page: 595 },
    { n: 93, name: 'الضحى', ayahs: 11, page: 596 }, { n: 94, name: 'الشرح', ayahs: 8, page: 596 }, { n: 95, name: 'التين', ayahs: 8, page: 597 }, { n: 96, name: 'العلق', ayahs: 19, page: 597 },
    { n: 97, name: 'القدر', ayahs: 5, page: 598 }, { n: 98, name: 'البينة', ayahs: 8, page: 598 }, { n: 99, name: 'الزلزلة', ayahs: 8, page: 599 }, { n: 100, name: 'العاديات', ayahs: 11, page: 599 },
    { n: 101, name: 'القارعة', ayahs: 11, page: 600 }, { n: 102, name: 'التكاثر', ayahs: 8, page: 600 }, { n: 103, name: 'العصر', ayahs: 3, page: 601 }, { n: 104, name: 'الهمزة', ayahs: 9, page: 601 },
    { n: 105, name: 'الفيل', ayahs: 5, page: 601 }, { n: 106, name: 'قريش', ayahs: 4, page: 602 }, { n: 107, name: 'الماعون', ayahs: 7, page: 602 }, { n: 108, name: 'الكوثر', ayahs: 3, page: 602 },
    { n: 109, name: 'الكافرون', ayahs: 6, page: 603 }, { n: 110, name: 'النصر', ayahs: 3, page: 603 }, { n: 111, name: 'المسد', ayahs: 5, page: 603 }, { n: 112, name: 'الإخلاص', ayahs: 4, page: 604 },
    { n: 113, name: 'الفلق', ayahs: 5, page: 604 }, { n: 114, name: 'الناس', ayahs: 6, page: 604 }
];

export default function QuranJourney() {
    const { state, dispatch } = useApp();
    const completed = state.completedSurahs || [];
    const totalRead = state.totalPagesRead || 0;
    const currentSurahNum = state.currentSurahNumber || 1;
    const [showGrid, setShowGrid] = useState(false);

    const pageProgress = Math.min(100, Math.round((totalRead / TOTAL_QURAN_PAGES) * 100));

    const toggleSurah = (surahNum) => {
        dispatch({ type: 'TOGGLE_SURAH_COMPLETE', surahNumber: surahNum });
    };

    const markAllUpTo = (surahNum) => {
        for (let i = 1; i <= surahNum; i++) {
            if (!completed.includes(i)) {
                dispatch({ type: 'TOGGLE_SURAH_COMPLETE', surahNumber: i });
            }
        }
    };

    const getSurahByPage = (pageNum) => {
        for (let i = SURAHS_INFO.length - 1; i >= 0; i--) {
            if (SURAHS_INFO[i].page <= pageNum) return SURAHS_INFO[i];
        }
        return SURAHS_INFO[0];
    };

    const estimatedSurah = getSurahByPage(totalRead);
    const currentSurahName = SURAHS_INFO.find(s => s.n === currentSurahNum)?.name || 'الفاتحة';

    return (
        <div className="mb-16">
            <div className="card-glow mb-12" style={{
                padding: '18px',
                border: '2px solid var(--bd-black)',
                boxShadow: '3px 3px 0 var(--bd-black)',
                background: 'var(--color-surface)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                    <span style={{ width: '8px', height: '8px', background: 'var(--bd-teal)', transform: 'rotate(45deg)' }}></span>
                    <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--bd-teal)' }}>
                        رحلة ختم المصحف الشريف
                    </span>
                </div>

                {/* شريط التقدم بالصفحات */}
                <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 800 }}>
                        <span>{totalRead} صفحة مقروءة</span>
                        <span style={{ color: 'var(--bd-gold)' }}>{pageProgress}%</span>
                    </div>
                    <div className="progress-bar" style={{
                        height: '10px',
                        background: 'rgba(0,0,0,0.3)',
                        border: '1.5px solid var(--bd-black)',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            width: `${pageProgress}%`,
                            height: '100%',
                            background: 'var(--bd-teal)',
                            transition: 'width 0.3s ease'
                        }}></div>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-dim)', marginTop: '6px', fontWeight: 700 }}>
                        {completed.length} سورة مكتملة من إجمالي 114 سورة
                    </div>
                </div>

                {/* الموقع الحالي محسوب من الصفحات */}
                <div style={{
                    padding: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    background: 'var(--color-surface-card)',
                    border: '1.5px solid var(--border-color)',
                    marginBottom: '8px'
                }}>
                    <Icon name="my_location" size={20} color="var(--bd-gold)" />
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-dim)', fontWeight: 700 }}>
                            بحسب صفحاتك المقروءة ({totalRead} صفحة) أنت تقريباً عند:
                        </div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--bd-gold)', marginTop: '2px' }}>
                            سورة {estimatedSurah.name} (صفحة {estimatedSurah.page})
                        </div>
                    </div>
                </div>

                {/* موقع المصحف الفعلي */}
                <div style={{
                    padding: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    background: 'var(--color-surface-card)',
                    border: '1.5px solid var(--border-color)',
                    marginBottom: '10px'
                }}>
                    <Icon name="bookmark" size={20} color="var(--bd-teal)" />
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-dim)', fontWeight: 700 }}>
                            موقعك في تبويب التلاوة:
                        </div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--color-text)', marginTop: '2px' }}>
                            سورة {currentSurahName}
                        </div>
                    </div>
                    <button
                        className="btn"
                        style={{
                            fontSize: '0.75rem',
                            padding: '6px 10px',
                            border: '1.5px solid var(--bd-black)',
                            background: 'var(--bd-teal)',
                            color: '#000',
                            fontWeight: 800,
                            boxShadow: '1px 1px 0 var(--bd-black)'
                        }}
                        onClick={() => markAllUpTo(currentSurahNum)}
                    >
                        تحديد لغاية هنا
                    </button>
                </div>

                <button
                    className="btn w-full"
                    style={{
                        padding: '10px',
                        border: '2px solid var(--bd-black)',
                        background: 'transparent',
                        color: 'var(--color-text)',
                        fontWeight: 800,
                        boxShadow: '2px 2px 0 var(--bd-black)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                    }}
                    onClick={() => setShowGrid(!showGrid)}
                >
                    <Icon name={showGrid ? 'expand_less' : 'expand_more'} size={18} color="var(--bd-teal)" />
                    {showGrid ? 'إخفاء شبكة السور' : 'عرض شبكة السور وتحديد المقروء'}
                </button>
            </div>

            {/* شبكة السور */}
            {showGrid && (
                <div className="anim-slide-up" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))',
                    gap: '6px',
                    marginBottom: '16px',
                    padding: '12px',
                    background: 'var(--color-surface)',
                    border: '2px solid var(--bd-black)',
                    boxShadow: '3px 3px 0 var(--bd-black)'
                }}>
                    {SURAHS_INFO.map((surah) => {
                        const isCompleted = completed.includes(surah.n);
                        const isCurrent = surah.n === currentSurahNum;
                        const isEstimated = surah.n === estimatedSurah.n;
                        return (
                            <div
                                key={surah.n}
                                onClick={() => toggleSurah(surah.n)}
                                style={{
                                    padding: '8px 4px',
                                    cursor: 'pointer',
                                    textAlign: 'center',
                                    border: isCurrent || isEstimated
                                        ? '2px solid var(--bd-gold)'
                                        : (isCompleted ? '2px solid var(--bd-teal)' : '1px solid var(--border-color)'),
                                    background: isCompleted ? 'rgba(15, 181, 174, 0.15)' : 'var(--color-surface-card)',
                                    boxShadow: isCompleted || isCurrent ? '2px 2px 0 var(--bd-black)' : 'none',
                                    position: 'relative'
                                }}
                            >
                                {isCompleted && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '2px',
                                        left: '2px',
                                        width: '14px',
                                        height: '14px',
                                        background: 'var(--bd-teal)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <Icon name="check" size={10} color="#000" />
                                    </div>
                                )}
                                <div style={{ fontWeight: 800, fontSize: '0.7rem', color: 'var(--color-text-dim)', marginBottom: '1px' }}>
                                    {surah.n}
                                </div>
                                <div style={{
                                    fontSize: '0.8rem',
                                    fontWeight: 700,
                                    color: isCompleted ? 'var(--bd-teal)' : (isCurrent ? 'var(--bd-gold)' : 'var(--color-text)')
                                }}>
                                    {surah.name}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import Icon, { Nuqta } from '../components/Icon';
import QuranReader from '../components/quran/QuranReader';
import QuranAudioListener from '../components/quran/QuranAudioListener';
import QuranRadio from '../components/quran/QuranRadio';
import HadithReader from '../components/quran/HadithReader';
import QuranJourney from '../components/quran/QuranJourney';
import MoonProgress from '../components/MoonProgress';
import AmbientSoundMixer from '../components/quran/AmbientSoundMixer';
import EncryptedTadabbur from '../components/EncryptedTadabbur';

export default function QuranPlanner() {
    const { state, dispatch, getQuranDailyTarget, quranProgress, TOTAL_QURAN_PAGES } = useApp();
    const [surahInput, setSurahInput] = useState(state.currentSurah || '');
    const [pageNumInput, setPageNumInput] = useState(state.currentPageNumber || '');
    const [ayahNumInput, setAyahNumInput] = useState(state.currentAyahNumber || '');
    const [showKhatmaDialog, setShowKhatmaDialog] = useState(false);
    const [showLog, setShowLog] = useState(false);

    const [activeTab, setActiveTab] = useState(() => {
        const saved = localStorage.getItem('daawa_quran_tab');
        return saved ? parseInt(saved) : 0;
    });
    const handleTabChange = (idx) => {
        setActiveTab(idx);
        localStorage.setItem('daawa_quran_tab', idx);
    };

    const totalTarget = TOTAL_QURAN_PAGES * state.khatmaCount;
    const remaining = totalTarget - state.totalPagesRead;
    const dailyTarget = getQuranDailyTarget();
    const currentKhatma = Math.floor(state.totalPagesRead / TOTAL_QURAN_PAGES) + 1;

    const handleAddPages = (count) => {
        const newVal = Math.max(0, state.quranPagesRead + count);
        dispatch({ type: 'SET_QURAN_PAGES', value: newVal });
        const newTotal = state.totalPagesRead + count;
        if (newTotal >= TOTAL_QURAN_PAGES * currentKhatma && count > 0) {
            dispatch({ type: 'COMPLETE_KHATMA' });
            setShowKhatmaDialog(true);
        }
    };

    const handleSaveBookmark = (type = 'مرجع') => {
        dispatch({ type: 'SET_CURRENT_SURAH', value: surahInput });
        dispatch({ type: 'SET_CURRENT_PAGE_NUMBER', value: parseInt(pageNumInput) || 0 });
        dispatch({ type: 'SET_CURRENT_AYAH_NUMBER', value: parseInt(ayahNumInput) || 0 });

        dispatch({
            type: 'ADD_QURAN_BOOKMARK',
            surah: surahInput,
            page: parseInt(pageNumInput) || 0,
            ayah: parseInt(ayahNumInput) || 0,
            bookmarkType: type
        });
    };

    const handleUpdateBookmark = (id, field, change) => {
        const bm = state.quranBookmarks.find(b => b.id === id);
        if (bm) {
            dispatch({
                type: 'UPDATE_QURAN_BOOKMARK',
                id,
                updates: { [field]: Math.max(0, bm[field] + change) }
            });
        }
    };

    const handleDeleteBookmark = (id) => {
        if (confirm('هل أنت متأكد من حذف هذه العلامة المرجعية؟')) {
            dispatch({ type: 'DELETE_QURAN_BOOKMARK', id });
        }
    };

    const handleRestartKhatma = () => {
        dispatch({ type: 'SET_KHATMA_COUNT', value: state.khatmaCount + 1 });
        setShowKhatmaDialog(false);
    };

    const progressMessage = quranProgress >= 100
        ? 'تبارك الله! أتممت الختمة'
        : quranProgress >= 75
            ? 'باقي القليل، واصل!'
            : quranProgress >= 50
                ? 'نصف الطريق! أنت رائع'
                : quranProgress >= 25
                    ? 'بداية موفقة، استمر!'
                    : 'ابدأ بقراءة الورد اليومي';

    const readingLog = Object.entries(state.history)
        .filter(([, d]) => d.quranPages > 0)
        .sort((a, b) => b[0].localeCompare(a[0]))
        .slice(0, 15);

    function renderPlannerTab() {
        return (
            <div className="anim-fade-in">
                <p style={{ font: 'var(--text-body-md)', color: 'var(--color-on-surface-variant)', marginBottom: 'var(--space-4)' }}>
                    خطة القراءة المتكيّفة | {TOTAL_QURAN_PAGES} صفحة
                </p>

                {/* Khatma Completion Dialog */}
                {showKhatmaDialog && (
                    <div className="card-glow mb-4 anim-scale-in" style={{ padding: 'var(--space-6)', textAlign: 'center', border: '2px solid var(--bd-success)' }}>
                        <Icon name="celebration" size={56} color="var(--bd-success)" />
                        <h2 style={{ font: 'var(--text-headline-sm)', color: 'var(--bd-success)', margin: 'var(--space-3) 0' }}>
                            تبارك الله! أتممت ختمة القرآن الكريم!
                        </h2>
                        <p style={{ font: 'var(--text-body-md)', color: 'var(--color-on-surface-variant)', marginBottom: 'var(--space-4)' }}>
                            هل تريد أن تختمه مرة أخرى؟
                        </p>
                        <div className="flex-row gap-3" style={{ justifyContent: 'center' }}>
                            <button className="btn btn-filled" onClick={handleRestartKhatma}>
                                <Icon name="replay" size={18} /> نعم، أريد ختمة جديدة
                            </button>
                            <button className="btn btn-outlined" onClick={() => setShowKhatmaDialog(false)}>
                                <Icon name="close" size={18} /> لاحقاً
                            </button>
                        </div>
                    </div>
                )}

                {/* Visual Progress Tracker (Moon) */}
                <div className="card-glow text-center mb-4 anim-slide-up" style={{ padding: 'var(--space-8) var(--space-6)' }}>
                    <MoonProgress percentage={quranProgress} size={180} showLabel={false} />
                    <p style={{ font: 'var(--text-title-lg)', color: 'var(--bd-teal)', marginTop: 'var(--space-4)', marginBottom: 0 }}>
                        {progressMessage}
                    </p>
                </div>

                {/* Today's Reading */}
                <h2 className="section-title"><Icon name="auto_stories" size={20} /> قراءة اليوم</h2>
                <div className="card mb-4">
                    <div style={{ padding: 'var(--space-4)' }}>
                        <div className="flex-between mb-3">
                            <div>
                                <div style={{ font: 'var(--text-title-sm)' }}>صفحات اليوم (الهدف: {dailyTarget})</div>
                                <div style={{ font: 'var(--text-body-sm)', color: 'var(--bd-gold)' }}>+20 نقطة</div>
                            </div>
                            <span style={{ font: 'var(--text-display-sm)', color: 'var(--bd-teal)' }}>{state.quranPagesRead}</span>
                        </div>
                        <div className="flex-row gap-2" style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
                            <button className="btn btn-outlined" onClick={() => handleAddPages(-5)} disabled={state.quranPagesRead < 5}>-5</button>
                            <button className="btn btn-outlined" onClick={() => handleAddPages(-1)} disabled={state.quranPagesRead < 1}>-1</button>
                            <button className="btn btn-filled" onClick={() => handleAddPages(1)}>+1</button>
                            <button className="btn btn-filled" onClick={() => handleAddPages(5)}>+5</button>
                            <button className="btn btn-filled" onClick={() => handleAddPages(20)} style={{ background: 'var(--bd-gold)', color: 'var(--bd-navy)' }}>+20</button>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid-2 mb-4">
                    <div className="stat-card">
                        <span className="stat-value" style={{ color: 'var(--bd-teal)' }}>{dailyTarget}</span>
                        <span className="stat-label">ورد اليوم (صفحة)</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-value" style={{ color: 'var(--bd-gold)' }}>{state.totalPagesRead}</span>
                        <span className="stat-label">إجمالي المقروء</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-value" style={{ color: 'var(--bd-teal-300)' }}>{remaining > 0 ? remaining : 0}</span>
                        <span className="stat-label">الصفحات المتبقية</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-value" style={{ color: 'var(--bd-success)' }}>{currentKhatma}/{state.khatmaCount}</span>
                        <span className="stat-label">الختمة الحالية</span>
                    </div>
                </div>

                {/* Bookmark - Current Position */}
                <h2 className="section-title"><Icon name="bookmark" size={20} /> علامتي في المصحف</h2>
                <div className="card mb-4">
                    <div style={{ padding: 'var(--space-4)' }}>
                        <div className="grid-2 gap-3 mb-3">
                            <div className="input-field">
                                <label>السورة</label>
                                <input type="text" placeholder="مثال: البقرة" value={surahInput} onChange={e => setSurahInput(e.target.value)} />
                            </div>
                            <div className="grid-2 gap-2">
                                <div className="input-field">
                                    <label>صفحة</label>
                                    <input type="number" min="1" max="604" placeholder="120" value={pageNumInput} onChange={e => setPageNumInput(e.target.value)} />
                                </div>
                                <div className="input-field">
                                    <label>آية</label>
                                    <input type="number" min="1" placeholder="25" value={ayahNumInput} onChange={e => setAyahNumInput(e.target.value)} />
                                </div>
                            </div>
                        </div>
                        <div className="flex-row gap-2 w-full mt-3">
                            <button className="btn btn-filled w-full card-glow" onClick={() => handleSaveBookmark('مرجع')} style={{ background: 'rgba(224, 165, 38, 0.25)', border: '1px solid rgba(224, 165, 38, 0.5)', color: 'var(--bd-gold)' }}>
                                <Icon name="bookmark" size={18} /> كمرجع
                            </button>
                            <button className="btn btn-filled w-full card-glow" onClick={() => handleSaveBookmark('مقروءة')} style={{ background: 'rgba(15, 181, 174, 0.25)', border: '1px solid rgba(15, 181, 174, 0.5)', color: 'var(--bd-teal)' }}>
                                <Icon name="done_all" size={18} /> مقروءة (تقدم)
                            </button>
                        </div>

                        <div className="card mt-4" style={{ padding: 'var(--space-3)', textAlign: 'center' }}>
                            {state.currentSurah ? (
                                <>
                                    <div style={{ font: 'var(--text-label-md)', color: 'var(--bd-gold)', marginBottom: 'var(--space-1)' }}>
                                        آخر ما توقفت عنده:
                                    </div>
                                    <div style={{ font: 'var(--text-title-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-2)' }}>
                                        <Icon name="menu_book" size={18} color="var(--bd-teal)" />
                                        سورة {state.currentSurah}
                                        {state.currentPageNumber > 0 && ` - صفحة ${state.currentPageNumber}`}
                                        {state.currentAyahNumber > 0 && ` - آية ${state.currentAyahNumber}`}
                                    </div>
                                </>
                            ) : (
                                <p style={{ font: 'var(--text-body-sm)', color: 'var(--color-on-surface-variant)', margin: 0 }}>
                                    لم تقم بحفظ علامة مرجعية بعد.
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Previous Bookmarks */}
                {(state.quranBookmarks && state.quranBookmarks.length > 0) && (
                    <div className="card mb-4">
                        <div style={{ padding: 'var(--space-4)' }}>
                            <h3 style={{ font: 'var(--text-title-sm)', marginBottom: 'var(--space-3)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                <Icon name="bookmarks" size={18} /> سجل المحفوظات والعلامات المرجعية
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', maxHeight: '250px', overflowY: 'auto' }} className="no-scrollbar">
                                {state.quranBookmarks.map((bookmark) => (
                                    <div key={bookmark.id} style={{
                                        display: 'flex', flexDirection: 'column', gap: 'var(--space-2)',
                                        padding: 'var(--space-2) var(--space-3)', background: 'var(--color-surface-variant)', borderRadius: 'var(--shape-md)'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                                    <Icon name={bookmark.type === 'مقروءة' ? "done_all" : "bookmark"} size={16} color={bookmark.type === 'مقروءة' ? "var(--bd-teal)" : "var(--bd-gold)"} />
                                                    <span style={{ font: 'var(--text-label-md)', color: bookmark.type === 'مقروءة' ? "var(--bd-teal)" : "var(--bd-gold)" }}>
                                                        [{bookmark.type}]
                                                    </span>
                                                </div>
                                                <span style={{ font: 'var(--text-body-md)', fontWeight: 'bold' }}>
                                                    سورة {bookmark.surah}
                                                    {bookmark.page > 0 && ` (صـ ${bookmark.page})`}
                                                    {bookmark.ayah > 0 && ` - آية ${bookmark.ayah}`}
                                                </span>
                                            </div>
                                            <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
                                                {bookmark.type === 'مقروءة' && (
                                                    <>
                                                        <button className="btn-icon" onClick={() => handleUpdateBookmark(bookmark.id, 'ayah', 1)} title="زيادة آية" style={{ width: '28px', height: '28px' }}>
                                                            <Icon name="add" size={16} />
                                                        </button>
                                                        <button className="btn-icon" onClick={() => handleUpdateBookmark(bookmark.id, 'ayah', -1)} title="إنقاص آية" style={{ width: '28px', height: '28px' }}>
                                                            <Icon name="remove" size={16} />
                                                        </button>
                                                    </>
                                                )}
                                                <button className="btn-icon" onClick={() => handleDeleteBookmark(bookmark.id)} style={{ width: '28px', height: '28px', color: 'var(--bd-error)' }} title="حذف">
                                                    <Icon name="delete" size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Target Khatma Count */}
                <div className="card mb-4">
                    <div style={{ padding: 'var(--space-4)' }}>
                        <p style={{ font: 'var(--text-title-sm)', marginBottom: 'var(--space-2)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                            <Icon name="auto_stories" size={20} /> عدد الختمات المستهدفة
                        </p>
                        <div className="counter">
                            <button className="btn-counter" onClick={() => dispatch({ type: 'SET_KHATMA_COUNT', value: Math.max(1, state.khatmaCount - 1) })}>
                                <Icon name="remove" size={18} />
                            </button>
                            <span className="value">{state.khatmaCount}</span>
                            <button className="btn-counter" onClick={() => dispatch({ type: 'SET_KHATMA_COUNT', value: state.khatmaCount + 1 })}>
                                <Icon name="add" size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Daily Reading Schedule */}
                <div className="card mb-4">
                    <div style={{ padding: 'var(--space-4)' }}>
                        <p style={{ font: 'var(--text-title-sm)', marginBottom: 'var(--space-3)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                            <Icon name="calendar_month" size={18} /> جدول القراءة اليومي (المقترح)
                        </p>
                        <p style={{ font: 'var(--text-body-sm)', color: 'var(--color-on-surface-variant)', marginBottom: 'var(--space-2)' }}>
                            <Icon name="info" size={14} /> لختم القرآن في الشهر، اقرأ {Math.ceil(TOTAL_QURAN_PAGES / 30)} صفحة يومياً أو 4 صفحات بعد كل صلاة. يمكنك إضافة أي عدد تريده من الصفحات.
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)' }}>
                            <div className="stat-card" style={{ padding: 'var(--space-2)' }}>
                                <span style={{ font: 'var(--text-label-md)', color: 'var(--bd-teal)' }}>بعد الفجر</span>
                                <span style={{ font: 'var(--text-body-sm)' }}>{Math.ceil(dailyTarget / 5)} صفحات</span>
                            </div>
                            <div className="stat-card" style={{ padding: 'var(--space-2)' }}>
                                <span style={{ font: 'var(--text-label-md)', color: 'var(--bd-gold)' }}>بعد الظهر</span>
                                <span style={{ font: 'var(--text-body-sm)' }}>{Math.ceil(dailyTarget / 5)} صفحات</span>
                            </div>
                            <div className="stat-card" style={{ padding: 'var(--space-2)' }}>
                                <span style={{ font: 'var(--text-label-md)', color: 'var(--bd-teal-300)' }}>بعد العصر</span>
                                <span style={{ font: 'var(--text-body-sm)' }}>{Math.ceil(dailyTarget / 5)} صفحات</span>
                            </div>
                            <div className="stat-card" style={{ padding: 'var(--space-2)' }}>
                                <span style={{ font: 'var(--text-label-md)', color: 'var(--color-on-surface-variant)' }}>بعد المغرب</span>
                                <span style={{ font: 'var(--text-body-sm)' }}>{Math.ceil(dailyTarget / 5)} صفحات</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* رحلة ختم القرآن */}
                <QuranJourney />

                {/* Reading Log */}
                <div className="flex-between mb-3">
                    <h2 className="section-title" style={{ margin: 0 }}><Icon name="history" size={20} /> سجل القراءة</h2>
                    <button className="btn btn-text" onClick={() => setShowLog(!showLog)}>{showLog ? 'إخفاء' : 'عرض'}</button>
                </div>
                {showLog && (
                    <div className="flex-col gap-3 mb-4 anim-slide-up">
                        {readingLog.length > 0 ? readingLog.map(([date, data]) => (
                            <div key={date} className="card" style={{ padding: 'var(--space-2) var(--space-3)' }}>
                                <div className="flex-between">
                                    <span style={{ font: 'var(--text-body-md)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                        <Icon name="auto_stories" size={16} color="var(--bd-teal)" /> {data.quranPages} صفحة
                                    </span>
                                    <span style={{ font: 'var(--text-label-sm)', color: 'var(--color-outline)' }}>{date}</span>
                                </div>
                            </div>
                        )) : (
                            <p className="text-center" style={{ font: 'var(--text-body-sm)', color: 'var(--color-outline)' }}>لا يوجد سجل بعد</p>
                        )}
                    </div>
                )}

                {/* Reset */}
                <button className="btn btn-outlined w-full mb-8" style={{ color: '#fff', background: 'var(--bd-error)', borderColor: 'var(--bd-error)' }} onClick={() => { if (confirm('تحذير: سيتم بدء خطة القرآن من جديد وحذف تقدمك. هل أنت متأكد؟')) dispatch({ type: 'RESET_QURAN' }); }}>
                    <Icon name="restart_alt" size={18} /> إعادة ضبط الخطة
                </button>
            </div>
        );
    }

    return (
        <div className="page anim-fade-in" style={{ height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column' }}>
            {/* Header & Tabs */}
            <div className="mb-4">
                <h1 style={{ font: 'var(--text-headline-md)', marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <Nuqta size={8} />
                    <Icon name="auto_stories" size={28} color="var(--bd-teal)" /> واحة القرآن الكريم
                </h1>

                {/* Wrap Tabs */}
                <div style={{
                    display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', paddingBottom: 'var(--space-2)'
                }}>
                    {[
                        { name: 'الورد والختمة', icon: 'menu_book' },
                        { name: 'تلاوة وتفسير', icon: 'auto_stories' },
                        { name: 'استماع للسور', icon: 'headphones' },
                        { name: 'راديو القرآن', icon: 'radio' },
                        { name: 'الحديث الشريف', icon: 'auto_stories' },
                        { name: 'دفتر التدبر', icon: 'lock' }
                    ].map((tab, idx) => (
                        <button
                            key={idx}
                            className={`glass-tab ${activeTab === idx ? 'active' : ''}`}
                            onClick={() => handleTabChange(idx)}
                        >
                            <Icon name={tab.icon} size={18} /> {tab.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Scrollable Content Area */}
            <div className="no-scrollbar" style={{ flex: 1, overflowY: 'auto' }}>
                {activeTab === 0 && renderPlannerTab()}
                {activeTab === 1 && (
                    <>
                        <AmbientSoundMixer />
                        <QuranReader />
                    </>
                )}
                {activeTab === 2 && <QuranAudioListener />}
                {activeTab === 3 && <QuranRadio />}
                {activeTab === 4 && <HadithReader />}
                {activeTab === 5 && <EncryptedTadabbur />}
            </div>
        </div>
    );
}
import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import Icon from '../Icon';

export default function QuranReader() {
    const { state, dispatch } = useApp();
    const [surahs, setSurahs] = useState([]);
    const [filteredSurahs, setFilteredSurahs] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSurah, setSelectedSurah] = useState(state.currentSurahNumber || 1);
    const [surahData, setSurahData] = useState(null);
    const [tafseerData, setTafseerData] = useState(null);
    const [isLoadingText, setIsLoadingText] = useState(false);
    const [isLoadingTafseer, setIsLoadingTafseer] = useState(false);

    // أوضاع القراءة الليلية وحماية العين
    // 'default' = حسب ثيم التطبيق, 'oled' = أسود تام 100% لقيام الليل وتوفير البطارية, 'sepia' = حماية العين دافئ
    const [readMode, setReadMode] = useState(() => localStorage.getItem('daawa_quran_read_mode') || 'default');
    const [fontSizeRem, setFontSizeRem] = useState(() => parseFloat(localStorage.getItem('daawa_quran_font_size') || '1.8'));

    // خيارات الآية
    const [selectedAyahObj, setSelectedAyahObj] = useState(null);
    const [showAyahMenu, setShowAyahMenu] = useState(false);
    const [showTafseerDialog, setShowTafseerDialog] = useState(false);
    const [tafseerText, setTafseerText] = useState("");
    const [playingAyahId, setPlayingAyahId] = useState(null);

    const containerRef = useRef(null);
    const ayahRefs = useRef({});
    const audioRef = useRef(null);

    // حفظ تفضيلات وضع القراءة وحجم الخط
    const changeReadMode = (mode) => {
        setReadMode(mode);
        localStorage.setItem('daawa_quran_read_mode', mode);
    };

    const adjustFontSize = (delta) => {
        setFontSizeRem(prev => {
            const next = Math.min(2.8, Math.max(1.3, Math.round((prev + delta) * 10) / 10));
            localStorage.setItem('daawa_quran_font_size', next.toString());
            return next;
        });
    };

    // جلب قائمة السور مرة واحدة
    useEffect(() => {
        const fetchSurahsList = async () => {
            try {
                const response = await fetch('https://api.alquran.cloud/v1/meta');
                const data = await response.json();
                if (data.code === 200) {
                    setSurahs(data.data.surahs.references);
                    setFilteredSurahs(data.data.surahs.references);
                }
            } catch (error) {
                console.error("Error fetching surahs list:", error);
            }
        };
        fetchSurahsList();
    }, []);

    // إيقاف الصوت عند مغادرة الصفحة
    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    // إزالة التشكيل وتوحيد الحروف للبحث الفعال
    const normalizeArabic = (text) => {
        return text.replace(/[\u0617-\u061A\u064B-\u0652]/g, '')
            .replace(/[إأآاٱ]/g, 'ا')
            .replace(/ة/g, 'ه')
            .replace(/[ىي]/g, 'ي')
            .replace(/ؤ/g, 'و')
            .replace(/ئ/g, 'ي');
    };

    // فلترة السور عند البحث
    useEffect(() => {
        if (!searchQuery) {
            setFilteredSurahs(surahs);
        } else {
            const normalizedQuery = normalizeArabic(searchQuery).toLowerCase();
            const filtered = surahs.filter(s => {
                const normalizedName = normalizeArabic(s.name);
                const normalizedEnglishName = s.englishName ? s.englishName.toLowerCase() : '';
                return normalizedName.includes(normalizedQuery) ||
                    normalizedEnglishName.includes(normalizedQuery) ||
                    s.number.toString().includes(normalizedQuery);
            });
            setFilteredSurahs(filtered);
        }
    }, [searchQuery, surahs]);

    // جلب بيانات السورة والتفسير
    useEffect(() => {
        const fetchSurahData = async () => {
            setIsLoadingText(true);
            setIsLoadingTafseer(true);
            setSurahData(null);
            setTafseerData(null);
            setSelectedAyahObj(null);
            setShowTafseerDialog(false);
            setTafseerText("");

            try {
                const textRes = await fetch(`https://api.alquran.cloud/v1/surah/${selectedSurah}`);
                const textData = await textRes.json();
                if (textData.code === 200) {
                    setSurahData(textData.data);
                }

                const tafseerRes = await fetch(`https://quranenc.com/api/v1/translation/sura/arabic_moyassar/${selectedSurah}`);
                const tafseerDataRes = await tafseerRes.json();
                if (tafseerDataRes.result) {
                    const tafseerMap = {};
                    tafseerDataRes.result.forEach(item => {
                        tafseerMap[item.aya] = item.translation;
                    });
                    setTafseerData(tafseerMap);
                }

                if (state.currentSurahNumber === selectedSurah && state.currentPageNumber > 0) {
                    setTimeout(() => {
                        const markAyah = state.currentPageNumber;
                        if (ayahRefs.current[markAyah]) {
                            ayahRefs.current[markAyah].scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                    }, 500);
                }
            } catch (error) {
                console.error("Error fetching surah data:", error);
            } finally {
                setIsLoadingText(false);
                setIsLoadingTafseer(false);
            }
        };

        fetchSurahData();
    }, [selectedSurah, state.currentSurahNumber, state.currentPageNumber]);

    const handleAyahClick = (ayahObj) => {
        setSelectedAyahObj(ayahObj);
        setShowAyahMenu(true);
    };

    const handleShowTafseer = () => {
        setShowAyahMenu(false);
        if (tafseerData && selectedAyahObj && tafseerData[selectedAyahObj.numberInSurah]) {
            setTafseerText(tafseerData[selectedAyahObj.numberInSurah]);
        } else {
            setTafseerText("التفسير غير متوفر حالياً لهذه الآية.");
        }
        setShowTafseerDialog(true);
    };

    const handleSaveBookmark = () => {
        setShowAyahMenu(false);
        if (surahData && selectedAyahObj) {
            dispatch({ type: 'SET_CURRENT_SURAH', value: surahData.name });
            dispatch({ type: 'SET_CURRENT_SURAH_NUMBER', value: selectedSurah });
            dispatch({ type: 'SET_CURRENT_PAGE_NUMBER', value: selectedAyahObj.pageNumber || 0 });
            dispatch({ type: 'SET_CURRENT_AYAH_NUMBER', value: selectedAyahObj.numberInSurah });

            dispatch({
                type: 'ADD_QURAN_BOOKMARK',
                surah: surahData.name,
                page: selectedAyahObj.pageNumber || 0,
                ayah: selectedAyahObj.numberInSurah,
                bookmarkType: 'مرجع'
            });

            alert(`تم حفظ العلامة المرجعية بنجاح (سورة ${surahData.name} - آية ${selectedAyahObj.numberInSurah})`);
        }
    };

    const handleSaveProgress = () => {
        setShowAyahMenu(false);
        if (surahData && selectedAyahObj) {
            const newVal = Math.max(0, state.quranPagesRead + 1);
            dispatch({ type: 'SET_QURAN_PAGES', value: newVal });

            dispatch({
                type: 'ADD_QURAN_BOOKMARK',
                surah: surahData.name,
                page: selectedAyahObj.pageNumber || 0,
                ayah: selectedAyahObj.numberInSurah,
                bookmarkType: 'مقروءة'
            });

            alert('تم إضافة (1) صفحة لتقدمك اليومي إتماماً للقراءة وعلامة مقروءة.');
        }
    };

    const closeTafseer = () => {
        setShowTafseerDialog(false);
        setTimeout(() => {
            if (selectedAyahObj && ayahRefs.current[selectedAyahObj.numberInSurah]) {
                ayahRefs.current[selectedAyahObj.numberInSurah].scrollIntoView({ behavior: 'auto', block: 'center' });
            }
        }, 50);
    };

    const handlePlayAyah = () => {
        if (!selectedAyahObj) return;

        if (playingAyahId === selectedAyahObj.number) {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
            setPlayingAyahId(null);
        } else {
            if (audioRef.current) {
                audioRef.current.pause();
            }
            audioRef.current = new Audio(`https://cdn.islamic.network/quran/audio/128/ar.alafasy/${selectedAyahObj.number}.mp3`);
            setPlayingAyahId(selectedAyahObj.number);

            audioRef.current.onended = () => {
                setPlayingAyahId(null);
            };

            audioRef.current.play().catch(e => {
                console.error("Audio playback error:", e);
                setPlayingAyahId(null);
                alert("تعذر تشغيل الصوت، تأكد من اتصالك بالإنترنت.");
            });
        }
    };

    // حساب ألوان وضع القراءة
    const getReadingThemeStyles = () => {
        if (readMode === 'oled') {
            return {
                background: '#000000',
                color: '#EDEDED',
                borderColor: '#1f2937'
            };
        }
        if (readMode === 'sepia') {
            return {
                background: '#1F1A15',
                color: '#F4E5CC',
                borderColor: '#3D3428'
            };
        }
        return {
            background: 'var(--color-surface)',
            color: 'var(--color-text)',
            borderColor: 'var(--border-color)'
        };
    };

    const readingTheme = getReadingThemeStyles();

    return (
        <div className="anim-fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Header: Selector & Controls */}
            <div className="card-glow mb-16" style={{ padding: '16px', position: 'sticky', top: 0, zIndex: 10 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div className="flex-between" style={{ gap: '12px', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{
                                width: '10px',
                                height: '10px',
                                background: 'var(--bd-teal)',
                                transform: 'rotate(45deg)',
                                display: 'inline-block'
                            }}></span>
                            <h2 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: 'var(--color-text)' }}>
                                السورة
                            </h2>
                        </div>

                        <select
                            value={selectedSurah}
                            onChange={(e) => {
                                const num = parseInt(e.target.value);
                                setSelectedSurah(num);
                                dispatch({ type: 'SET_CURRENT_SURAH_NUMBER', value: num });
                            }}
                            className="input-field"
                            style={{
                                padding: '8px 12px',
                                border: '2px solid var(--bd-black)',
                                boxShadow: '2px 2px 0 var(--bd-black)',
                                background: 'var(--color-surface-card)',
                                flex: 1,
                                minWidth: '180px',
                                color: 'var(--color-text)',
                                fontWeight: 700
                            }}
                        >
                            {filteredSurahs.map(s => (
                                <option key={s.number} value={s.number}>
                                    {s.number}- {s.name.replace('سُورَةُ ', '')} ({s.revelationType === 'Meccan' ? 'مكية' : 'مدنية'})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Controls Bar: Reading Modes & Font Size */}
                    <div className="flex-between" style={{
                        gap: '8px',
                        padding: '8px',
                        background: 'rgba(0,0,0,0.15)',
                        border: '1px solid var(--border-color)',
                        flexWrap: 'wrap'
                    }}>
                        {/* Reading Modes (Default / OLED / Sepia) */}
                        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-dim)', marginLeft: '4px' }}>
                                الوضع:
                            </span>
                            <button
                                className="btn"
                                onClick={() => changeReadMode('default')}
                                style={{
                                    padding: '4px 8px',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    border: '2px solid var(--bd-black)',
                                    background: readMode === 'default' ? 'var(--bd-teal)' : 'transparent',
                                    color: readMode === 'default' ? '#000' : 'var(--color-text)',
                                    boxShadow: readMode === 'default' ? '2px 2px 0 var(--bd-black)' : 'none'
                                }}
                            >
                                كلاسيك
                            </button>
                            <button
                                className="btn"
                                onClick={() => changeReadMode('oled')}
                                style={{
                                    padding: '4px 8px',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    border: '2px solid var(--bd-black)',
                                    background: readMode === 'oled' ? '#000000' : 'transparent',
                                    color: readMode === 'oled' ? '#0FB5AE' : 'var(--color-text)',
                                    boxShadow: readMode === 'oled' ? '2px 2px 0 var(--bd-black)' : 'none'
                                }}
                                title="وضع قيام الليل (OLED أسود موفر للطاقة)"
                            >
                                قيام (OLED)
                            </button>
                            <button
                                className="btn"
                                onClick={() => changeReadMode('sepia')}
                                style={{
                                    padding: '4px 8px',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    border: '2px solid var(--bd-black)',
                                    background: readMode === 'sepia' ? '#3D3428' : 'transparent',
                                    color: readMode === 'sepia' ? '#F4E5CC' : 'var(--color-text)',
                                    boxShadow: readMode === 'sepia' ? '2px 2px 0 var(--bd-black)' : 'none'
                                }}
                                title="وضع حماية العين الدافئ"
                            >
                                حماية العين
                            </button>
                        </div>

                        {/* Font Size Adjuster */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-dim)' }}>
                                الخط:
                            </span>
                            <button
                                className="btn-icon"
                                onClick={() => adjustFontSize(-0.15)}
                                style={{
                                    width: '28px',
                                    height: '28px',
                                    border: '2px solid var(--bd-black)',
                                    background: 'var(--color-surface)',
                                    color: 'var(--color-text)',
                                    boxShadow: '1px 1px 0 var(--bd-black)',
                                    fontWeight: 900
                                }}
                                title="تصغير الخط"
                            >
                                -
                            </button>
                            <span style={{ fontSize: '0.8rem', fontWeight: 800, minWidth: '32px', textAlign: 'center' }}>
                                {fontSizeRem.toFixed(1)}
                            </span>
                            <button
                                className="btn-icon"
                                onClick={() => adjustFontSize(0.15)}
                                style={{
                                    width: '28px',
                                    height: '28px',
                                    border: '2px solid var(--bd-black)',
                                    background: 'var(--color-surface)',
                                    color: 'var(--color-text)',
                                    boxShadow: '1px 1px 0 var(--bd-black)',
                                    fontWeight: 900
                                }}
                                title="تكبير الخط"
                            >
                                +
                            </button>
                        </div>
                    </div>

                    {/* Search Field */}
                    <div className="search-box" style={{
                        display: 'flex',
                        alignItems: 'center',
                        background: 'var(--color-surface-card)',
                        border: '2px solid var(--bd-black)',
                        boxShadow: '2px 2px 0 var(--bd-black)',
                        padding: '0 12px'
                    }}>
                        <Icon name="search" size={20} color="var(--bd-teal)" />
                        <input
                            type="text"
                            placeholder="ابحث عن سورة (بالاسم أو الرقم)..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                border: 'none',
                                background: 'transparent',
                                padding: '10px',
                                width: '100%',
                                outline: 'none',
                                color: 'var(--color-text)',
                                fontWeight: 700
                            }}
                        />
                        {searchQuery && (
                            <button className="btn-icon" onClick={() => setSearchQuery('')} style={{ padding: '4px' }}>
                                <Icon name="close" size={16} />
                            </button>
                        )}
                    </div>

                    {/* Search Results Display */}
                    {searchQuery && (
                        <div style={{
                            marginTop: '4px',
                            background: 'var(--color-surface)',
                            border: '2px solid var(--bd-black)',
                            boxShadow: '3px 3px 0 var(--bd-black)',
                            padding: '12px',
                            maxHeight: '200px',
                            overflowY: 'auto'
                        }} className="no-scrollbar">
                            {filteredSurahs.length > 0 ? (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {filteredSurahs.map(s => (
                                        <button
                                            key={s.number}
                                            className="btn"
                                            onClick={() => {
                                                setSelectedSurah(s.number);
                                                setSearchQuery('');
                                            }}
                                            style={{
                                                padding: '6px 12px',
                                                fontSize: '0.85rem',
                                                fontWeight: 700,
                                                border: '2px solid var(--bd-black)',
                                                background: selectedSurah === s.number ? 'var(--bd-teal)' : 'var(--color-surface-card)',
                                                color: selectedSurah === s.number ? '#000' : 'var(--color-text)',
                                                boxShadow: '2px 2px 0 var(--bd-black)'
                                            }}
                                        >
                                            {s.number}- {s.name.replace('سُورَةُ ', '')}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ fontSize: '0.9rem', color: 'var(--bd-coral)', textAlign: 'center', fontWeight: 700 }}>
                                    لم يتم العثور على أي سورة مطابقة لبحثك.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Quran Text Area */}
            {isLoadingText ? (
                <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', opacity: 0.8, minHeight: '300px' }}>
                    <div className="text-center">
                        <Icon name="sync" size={32} className="spin" color="var(--bd-teal)" />
                        <p className="mt-8" style={{ fontWeight: 700 }}>جاري تحميل آيات السورة الكريمة...</p>
                    </div>
                </div>
            ) : showTafseerDialog && selectedAyahObj ? (
                /* Tafseer Dialog (Inline Bedigital View) */
                <div className="anim-slide-up" style={{
                    flex: 1,
                    padding: '24px 16px',
                    background: readingTheme.background,
                    color: readingTheme.color,
                    border: `2px solid ${readingTheme.borderColor}`,
                    boxShadow: '4px 4px 0 var(--bd-black)',
                    marginBottom: '16px'
                }}>
                    <div className="flex-between mb-16" style={{ borderBottom: `2px solid ${readingTheme.borderColor}`, paddingBottom: '12px' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--bd-gold)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Icon name="menu_book" size={20} color="var(--bd-gold)" />
                            تفسير الآية ({selectedAyahObj.numberInSurah}) من سورة {surahData?.name}
                        </h3>
                        <button
                            className="btn"
                            onClick={closeTafseer}
                            style={{
                                padding: '6px 14px',
                                border: '2px solid var(--bd-black)',
                                background: 'var(--bd-teal)',
                                color: '#000',
                                fontWeight: 800,
                                boxShadow: '2px 2px 0 var(--bd-black)'
                            }}
                        >
                            <Icon name="arrow_forward" size={16} /> العودة للمصحف
                        </button>
                    </div>

                    {isLoadingTafseer ? (
                        <div className="flex-center" style={{ padding: '40px', opacity: 0.8 }}>
                            <Icon name="sync" size={32} className="spin" color="var(--bd-teal)" />
                        </div>
                    ) : (
                        <div>
                            <div style={{
                                background: 'rgba(15, 181, 174, 0.08)',
                                border: '2px solid var(--bd-teal)',
                                padding: '16px',
                                marginBottom: '24px',
                                boxShadow: '2px 2px 0 var(--bd-black)'
                            }}>
                                <h4 style={{ fontFamily: 'Amiri, serif', fontSize: '1.4rem', margin: 0, textAlign: 'center', lineHeight: 1.8, color: 'var(--bd-gold)' }}>
                                    «{selectedAyahObj.text}»
                                </h4>
                            </div>
                            <h4 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '8px', color: 'var(--bd-teal)' }}>
                                التفسير الميسر:
                            </h4>
                            <p style={{
                                fontFamily: 'var(--font-arabic)',
                                lineHeight: '2.1',
                                margin: 0,
                                textAlign: 'justify',
                                fontSize: '1.15rem'
                            }}>
                                {tafseerText}
                            </p>
                        </div>
                    )}
                </div>
            ) : surahData ? (
                /* Main Surah Reader Surface */
                <div ref={containerRef} style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '24px 20px',
                    background: readingTheme.background,
                    color: readingTheme.color,
                    border: `2px solid ${readingTheme.borderColor}`,
                    boxShadow: '4px 4px 0 var(--bd-black)',
                    marginBottom: '16px'
                }}>
                    {/* Surah Title Frame */}
                    <div style={{
                        textAlign: 'center',
                        marginBottom: '28px',
                        padding: '16px',
                        border: '2px solid var(--bd-gold)',
                        background: 'rgba(224, 165, 38, 0.05)',
                        boxShadow: '3px 3px 0 var(--bd-black)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '6px' }}>
                            <span style={{ width: '8px', height: '8px', background: 'var(--bd-gold)', transform: 'rotate(45deg)' }}></span>
                            <h2 style={{
                                fontSize: '2.2rem',
                                color: 'var(--bd-gold)',
                                fontFamily: 'Amiri, Traditional Arabic, serif',
                                margin: 0,
                                fontWeight: 800
                            }}>
                                {surahData.name}
                            </h2>
                            <span style={{ width: '8px', height: '8px', background: 'var(--bd-gold)', transform: 'rotate(45deg)' }}></span>
                        </div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--bd-teal)', marginTop: '4px' }}>
                            {surahData.revelationType === "Meccan" ? "سورة مكية" : "سورة مدنية"} • {surahData.numberOfAyahs} آية
                        </div>
                    </div>

                    <div style={{
                        fontFamily: 'Amiri, "Scheherazade New", thuluth, serif',
                        fontSize: `${fontSizeRem}rem`,
                        lineHeight: '2.5',
                        textAlign: 'justify',
                        direction: 'rtl'
                    }}>
                        {/* البسملة إذا لم تكن الفاتحة أو التوبة */}
                        {selectedSurah !== 1 && selectedSurah !== 9 && (
                            <div style={{
                                textAlign: 'center',
                                marginBottom: '24px',
                                fontWeight: 'bold',
                                color: 'var(--bd-gold)',
                                fontSize: `${fontSizeRem * 1.15}rem`
                            }}>
                                بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                            </div>
                        )}

                        {surahData.ayahs.map((ayah) => {
                            const isMarked = state.currentSurahNumber === selectedSurah && state.currentPageNumber === ayah.numberInSurah;
                            const isSelected = selectedAyahObj?.numberInSurah === ayah.numberInSurah;

                            return (
                                <span
                                    key={ayah.numberInSurah}
                                    ref={(el) => (ayahRefs.current[ayah.numberInSurah] = el)}
                                    onClick={() => handleAyahClick(ayah)}
                                    style={{
                                        cursor: 'pointer',
                                        display: 'inline',
                                        padding: '2px 4px',
                                        backgroundColor: isSelected
                                            ? 'rgba(15, 181, 174, 0.25)'
                                            : (isMarked ? 'rgba(224, 165, 38, 0.25)' : 'transparent'),
                                        borderBottom: isSelected ? '2px solid var(--bd-teal)' : (isMarked ? '2px solid var(--bd-gold)' : 'none'),
                                        color: isSelected ? 'var(--bd-teal)' : (isMarked ? 'var(--bd-gold)' : 'inherit'),
                                        transition: 'background-color 0.15s ease'
                                    }}
                                >
                                    {selectedSurah === 1 && ayah.numberInSurah === 1 ? ayah.text : ayah.text.replace('بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ ', '')}

                                    {/* Nuqta Pixel Ayah Badge */}
                                    <span style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        minWidth: '32px',
                                        height: '28px',
                                        margin: '0 6px',
                                        padding: '0 4px',
                                        fontSize: '0.85rem',
                                        fontWeight: 800,
                                        fontFamily: 'var(--font-arabic)',
                                        color: isSelected ? '#000' : 'var(--bd-gold)',
                                        background: isSelected ? 'var(--bd-teal)' : 'rgba(0,0,0,0.3)',
                                        border: '1.5px solid var(--bd-black)',
                                        boxShadow: '1px 1px 0 var(--bd-black)',
                                        verticalAlign: 'middle'
                                    }}>
                                        {ayah.numberInSurah}
                                    </span>
                                </span>
                            );
                        })}
                    </div>
                </div>
            ) : (
                <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <p style={{ fontWeight: 700, color: 'var(--bd-coral)' }}>تعذر تحميل بيانات السورة. تحقق من الاتصال بالإنترنت.</p>
                </div>
            )}

            {/* Ayah Options Menu (Modal Bedigital Design) */}
            {showAyahMenu && selectedAyahObj && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.75)',
                    zIndex: 1000,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    padding: '16px'
                }} onClick={() => setShowAyahMenu(false)}>
                    <div className="anim-slide-up" style={{
                        padding: '24px',
                        background: 'var(--color-surface)',
                        border: '3px solid var(--bd-black)',
                        boxShadow: '6px 6px 0 var(--bd-black)',
                        maxWidth: '560px',
                        margin: '0 auto',
                        width: '100%'
                    }} onClick={(e) => e.stopPropagation()}>

                        <div style={{ textAlign: 'center', marginBottom: '20px', borderBottom: '2px solid var(--border-color)', paddingBottom: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
                                <span style={{ width: '8px', height: '8px', background: 'var(--bd-teal)', transform: 'rotate(45deg)' }}></span>
                                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-text)' }}>
                                    سورة {surahData?.name} - الآية ({selectedAyahObj.numberInSurah})
                                </h3>
                                <span style={{ width: '8px', height: '8px', background: 'var(--bd-teal)', transform: 'rotate(45deg)' }}></span>
                            </div>
                            <p style={{
                                margin: '8px 0 0',
                                fontSize: '1.15rem',
                                fontFamily: 'Amiri, serif',
                                color: 'var(--bd-gold)',
                                lineHeight: '1.8'
                            }} dir="rtl">
                                «{selectedAyahObj.text.length > 70 ? selectedAyahObj.text.substring(0, 70) + '...' : selectedAyahObj.text}»
                            </p>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <button
                                className="btn"
                                onClick={handlePlayAyah}
                                style={{
                                    padding: '14px',
                                    border: '2px solid var(--bd-black)',
                                    background: playingAyahId === selectedAyahObj.number ? 'var(--bd-coral)' : 'var(--bd-teal)',
                                    color: '#000',
                                    fontWeight: 800,
                                    fontSize: '0.95rem',
                                    boxShadow: '3px 3px 0 var(--bd-black)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px'
                                }}
                            >
                                <Icon name={playingAyahId === selectedAyahObj.number ? "stop_circle" : "volume_up"} size={22} color="#000" />
                                {playingAyahId === selectedAyahObj.number ? "إيقاف الاستماع" : "الاستماع للآية (الشيخ مشاري العفاسي)"}
                            </button>

                            <button
                                className="btn"
                                onClick={handleShowTafseer}
                                style={{
                                    padding: '14px',
                                    border: '2px solid var(--bd-black)',
                                    background: 'var(--bd-gold)',
                                    color: '#000',
                                    fontWeight: 800,
                                    fontSize: '0.95rem',
                                    boxShadow: '3px 3px 0 var(--bd-black)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px'
                                }}
                            >
                                <Icon name="menu_book" size={22} color="#000" />
                                قراءة التفسير الميسر
                            </button>

                            <button
                                className="btn"
                                onClick={handleSaveBookmark}
                                style={{
                                    padding: '14px',
                                    border: '2px solid var(--bd-black)',
                                    background: 'var(--color-surface-card)',
                                    color: 'var(--color-text)',
                                    fontWeight: 800,
                                    fontSize: '0.95rem',
                                    boxShadow: '3px 3px 0 var(--bd-black)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px'
                                }}
                            >
                                <Icon name="bookmark" size={22} color="var(--bd-teal)" />
                                حفظ كعلامة مرجعية
                            </button>

                            <button
                                className="btn"
                                onClick={handleSaveProgress}
                                style={{
                                    padding: '14px',
                                    border: '2px solid var(--bd-black)',
                                    background: 'var(--color-surface-card)',
                                    color: 'var(--color-text)',
                                    fontWeight: 800,
                                    fontSize: '0.95rem',
                                    boxShadow: '3px 3px 0 var(--bd-black)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px'
                                }}
                            >
                                <Icon name="done_all" size={22} color="var(--bd-gold)" />
                                أتممت قراءتها (إضافة للورد اليومي)
                            </button>

                            <button
                                className="btn"
                                onClick={() => setShowAyahMenu(false)}
                                style={{
                                    padding: '10px',
                                    marginTop: '6px',
                                    border: '2px solid var(--border-color)',
                                    background: 'transparent',
                                    color: 'var(--color-text-dim)',
                                    fontWeight: 700
                                }}
                            >
                                إلغاء
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

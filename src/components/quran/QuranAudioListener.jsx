import React, { useState, useEffect, useRef } from 'react';
import Icon from '../Icon';

export default function QuranAudioListener() {
    const [surahs, setSurahs] = useState([]);
    const [filteredSurahs, setFilteredSurahs] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    // حالة القراء من Mp3Quran
    const [recitersList, setRecitersList] = useState([]);
    const [filteredReciters, setFilteredReciters] = useState([]);
    const [selectedServer, setSelectedServer] = useState('');
    const [reciterSearchQuery, setReciterSearchQuery] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const [isLoading, setIsLoading] = useState(false);

    // مشغل الصوت النشط
    const [activeAudioId, setActiveAudioId] = useState(() => {
        const saved = localStorage.getItem('daawa_audio_surah');
        return saved ? parseInt(saved) : null;
    });
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(() => {
        return parseFloat(localStorage.getItem('daawa_audio_time') || '0');
    });
    const [duration, setDuration] = useState(0);
    const audioRef = useRef(null);

    // جلب أسماء السور
    useEffect(() => {
        const fetchSurahs = async () => {
            try {
                const res = await fetch('https://api.alquran.cloud/v1/meta');
                const data = await res.json();
                if (data.code === 200) {
                    setSurahs(data.data.surahs.references);
                    setFilteredSurahs(data.data.surahs.references);
                }
            } catch (error) {
                console.error("Error fetching surahs:", error);
            }
        };
        fetchSurahs();

        // جلب قائمة القراء من Mp3Quran
        const fetchReciters = async () => {
            try {
                const res = await fetch('https://www.mp3quran.net/api/v3/reciters?language=ar');
                const data = await res.json();
                if (data.reciters) {
                    const formattedReciters = data.reciters.filter(r => r.moshaf && r.moshaf.length > 0).map(r => ({
                        id: r.id,
                        name: r.name,
                        server: r.moshaf[0].server,
                        safeServer: r.moshaf[0].server.endsWith('/') ? r.moshaf[0].server : r.moshaf[0].server + '/'
                    }));
                    setRecitersList(formattedReciters);
                    setFilteredReciters(formattedReciters);

                    const savedReciter = localStorage.getItem('daawa_reciter');
                    if (savedReciter && formattedReciters.find(r => r.safeServer === savedReciter)) {
                        setSelectedServer(savedReciter);
                    } else {
                        const minshawi = formattedReciters.find(r => r.name.includes("المنشاوي") && r.name.includes("المرتل"));
                        if (minshawi) {
                            setSelectedServer(minshawi.safeServer);
                        } else if (formattedReciters.find(r => r.name.includes("المنشاوي"))) {
                            setSelectedServer(formattedReciters.find(r => r.name.includes("المنشاوي")).safeServer);
                        } else if (formattedReciters.length > 0) {
                            setSelectedServer(formattedReciters[0].safeServer);
                        }
                    }
                }
            } catch (error) {
                console.error("Error fetching Mp3Quran reciters:", error);
            }
        };
        fetchReciters();
    }, []);

    const normalizeArabic = (text) => {
        return text.replace(/[\u0617-\u061A\u064B-\u0652]/g, '')
            .replace(/[إأآاٱ]/g, 'ا')
            .replace(/ة/g, 'ه')
            .replace(/[ىي]/g, 'ي')
            .replace(/ؤ/g, 'و')
            .replace(/ئ/g, 'ي');
    };

    useEffect(() => {
        if (!reciterSearchQuery) {
            setFilteredReciters(recitersList);
        } else {
            const normalizedQuery = normalizeArabic(reciterSearchQuery).toLowerCase();
            const filtered = recitersList.filter(r => {
                const normalizedName = normalizeArabic(r.name);
                return normalizedName.includes(normalizedQuery);
            });
            setFilteredReciters(filtered);
        }
    }, [reciterSearchQuery, recitersList]);

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

    const formatTime = (time) => {
        if (!time || isNaN(time)) return "00:00";
        const min = Math.floor(time / 60);
        const sec = Math.floor(time % 60);
        return `${min}:${sec < 10 ? '0' : ''}${sec}`;
    };

    const handleSeek = (e) => {
        const newTime = parseFloat(e.target.value);
        setCurrentTime(newTime);
        if (audioRef.current) {
            audioRef.current.currentTime = newTime;
        }
    };

    const handlePlayPause = (chapterId, audioUrl) => {
        if (!audioRef.current) return;
        const audioElement = audioRef.current;

        if (activeAudioId === chapterId) {
            if (isPlaying) {
                audioElement.pause();
                setIsPlaying(false);
                localStorage.setItem('daawa_audio_time', audioElement.currentTime);
            } else {
                audioElement.play();
                setIsPlaying(true);
            }
        } else {
            setActiveAudioId(chapterId);
            localStorage.setItem('daawa_audio_surah', chapterId);
            audioElement.src = audioUrl;
            audioElement.play();
            setIsPlaying(true);
        }
    };

    return (
        <div className="anim-fade-in" style={{ paddingBottom: '80px' }}>
            {/* Header: Reciter & Search */}
            <div className="card-glow mb-16" style={{ padding: '16px', position: 'sticky', top: 0, zIndex: 10 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ paddingBottom: '12px', borderBottom: '2px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <span style={{ width: '8px', height: '8px', background: 'var(--bd-teal)', transform: 'rotate(45deg)' }}></span>
                            <h2 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: 'var(--color-text)' }}>
                                اختيار القارئ
                            </h2>
                        </div>

                        <div style={{ position: 'relative' }}>
                            <div
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    background: 'var(--color-surface)',
                                    border: '2px solid var(--bd-black)',
                                    boxShadow: '2px 2px 0 var(--bd-black)',
                                    padding: '10px 14px',
                                    cursor: 'pointer'
                                }}
                            >
                                <span style={{ fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '0.95rem', color: 'var(--color-text)' }}>
                                    {recitersList.find(r => r.safeServer === selectedServer)?.name || 'اختر القارئ...'}
                                </span>
                                <Icon name={isDropdownOpen ? "expand_less" : "expand_more"} size={20} color="var(--bd-teal)" />
                            </div>

                            {isDropdownOpen && (
                                <div style={{
                                    position: 'absolute',
                                    top: '100%',
                                    left: 0,
                                    right: 0,
                                    marginTop: '6px',
                                    background: 'var(--color-surface)',
                                    border: '3px solid var(--bd-black)',
                                    boxShadow: '4px 4px 0 var(--bd-black)',
                                    zIndex: 100,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    maxHeight: '300px'
                                }} className="anim-fade-in">
                                    <div style={{ padding: '8px', borderBottom: '2px solid var(--border-color)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', background: 'var(--color-surface-card)', border: '1px solid var(--border-color)', padding: '0 8px' }}>
                                            <Icon name="search" size={16} color="var(--bd-teal)" />
                                            <input
                                                type="text"
                                                placeholder="ابحث عن قارئ..."
                                                value={reciterSearchQuery}
                                                onChange={(e) => setReciterSearchQuery(e.target.value)}
                                                onClick={(e) => e.stopPropagation()}
                                                style={{
                                                    border: 'none',
                                                    background: 'transparent',
                                                    padding: '8px',
                                                    width: '100%',
                                                    outline: 'none',
                                                    color: 'var(--color-text)',
                                                    fontSize: '0.9rem',
                                                    fontWeight: 700
                                                }}
                                            />
                                            {reciterSearchQuery && (
                                                <button className="btn-icon" onClick={(e) => { e.stopPropagation(); setReciterSearchQuery(''); }} style={{ padding: '2px' }}>
                                                    <Icon name="close" size={14} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <div style={{ flex: 1, overflowY: 'auto', padding: '6px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        {filteredReciters.length > 0 ? filteredReciters.map(r => (
                                            <div
                                                key={r.id}
                                                onClick={() => {
                                                    setSelectedServer(r.safeServer);
                                                    localStorage.setItem('daawa_reciter', r.safeServer);
                                                    if (audioRef.current) {
                                                        audioRef.current.pause();
                                                        setIsPlaying(false);
                                                        setActiveAudioId(null);
                                                    }
                                                    setIsDropdownOpen(false);
                                                }}
                                                style={{
                                                    padding: '10px 14px',
                                                    cursor: 'pointer',
                                                    border: selectedServer === r.safeServer ? '2px solid var(--bd-black)' : '1px solid transparent',
                                                    background: selectedServer === r.safeServer ? 'var(--bd-teal)' : 'transparent',
                                                    color: selectedServer === r.safeServer ? '#000' : 'var(--color-text)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    fontWeight: 700
                                                }}
                                            >
                                                <span style={{ fontSize: '0.95rem' }}>{r.name}</span>
                                                {selectedServer === r.safeServer && (
                                                    <Icon name="check" size={18} color="#000" />
                                                )}
                                            </div>
                                        )) : (
                                            <div style={{ padding: '16px', textAlign: 'center', opacity: 0.7, fontSize: '0.9rem', fontWeight: 700 }}>لا توجد نتائج مطابقة</div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="search-box" style={{
                        display: 'flex',
                        alignItems: 'center',
                        background: 'var(--color-surface)',
                        border: '2px solid var(--bd-black)',
                        boxShadow: '2px 2px 0 var(--bd-black)',
                        padding: '0 12px'
                    }}>
                        <Icon name="search" size={20} color="var(--bd-teal)" />
                        <input
                            type="text"
                            placeholder="ابحث عن سورة..."
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
                </div>
            </div>

            {/* Hidden Audio Element */}
            <audio
                ref={audioRef}
                onEnded={() => setIsPlaying(false)}
                onPause={() => setIsPlaying(false)}
                onPlay={() => setIsPlaying(true)}
                onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
                onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
            ></audio>

            {/* Surahs List */}
            {isLoading || surahs.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', opacity: 0.8 }}>
                    <Icon name="sync" size={32} className="spin" color="var(--bd-teal)" />
                    <p className="mt-8" style={{ fontWeight: 700 }}>جاري استدعاء بيانات التلاوات...</p>
                </div>
            ) : filteredSurahs.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', opacity: 0.7, fontWeight: 700 }}>
                    <p>لم يتم العثور على أي سورة بهذا الاسم.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '10px' }}>
                    {filteredSurahs.map((surah) => {
                        const paddedSurah = String(surah.number).padStart(3, '0');
                        const audioUrl = selectedServer ? `${selectedServer}${paddedSurah}.mp3` : null;
                        const isCurrentActive = activeAudioId === surah.number;

                        return (
                            <div
                                key={surah.number}
                                className="card-glow"
                                style={{
                                    padding: '16px',
                                    border: `2px solid ${isCurrentActive ? 'var(--bd-teal)' : 'var(--bd-black)'}`,
                                    boxShadow: '3px 3px 0 var(--bd-black)',
                                    background: isCurrentActive ? 'rgba(15, 181, 174, 0.12)' : 'var(--color-surface)'
                                }}
                            >
                                <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                            <div style={{
                                                width: '38px',
                                                height: '38px',
                                                border: '2px solid var(--bd-black)',
                                                background: isCurrentActive ? 'var(--bd-teal)' : 'var(--color-surface-card)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: isCurrentActive ? '#000' : 'var(--color-text)',
                                                fontWeight: 800,
                                                boxShadow: '1px 1px 0 var(--bd-black)'
                                            }}>
                                                {surah.number}
                                            </div>
                                            <div>
                                                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: 'var(--color-text)' }}>
                                                    سورة {surah.name.replace('سُورَةُ ', '')}
                                                </h3>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-dim)', fontWeight: 700, marginTop: '2px' }}>
                                                    {surah.revelationType === "Meccan" ? "مكية" : "مدنية"} • {surah.numberOfAyahs} آية
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            className="btn"
                                            style={{
                                                padding: '10px 14px',
                                                border: '2px solid var(--bd-black)',
                                                background: isCurrentActive ? 'var(--bd-gold)' : 'var(--bd-teal)',
                                                color: '#000',
                                                fontWeight: 800,
                                                boxShadow: '2px 2px 0 var(--bd-black)'
                                            }}
                                            onClick={() => handlePlayPause(surah.number, audioUrl)}
                                            disabled={!audioUrl}
                                        >
                                            <Icon name={isCurrentActive && isPlaying ? "pause" : "play_arrow"} size={20} color="#000" />
                                        </button>
                                    </div>

                                    {isCurrentActive && (
                                        <div className="anim-fade-in" style={{ marginTop: '14px', display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--bd-teal)', fontWeight: 800, minWidth: '40px', textAlign: 'left' }} dir="ltr">
                                                {formatTime(currentTime)}
                                            </span>
                                            <input
                                                type="range"
                                                min="0"
                                                max={duration || 100}
                                                value={currentTime}
                                                onChange={handleSeek}
                                                style={{
                                                    flex: 1,
                                                    accentColor: 'var(--bd-teal)',
                                                    cursor: 'pointer'
                                                }}
                                            />
                                            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-dim)', minWidth: '40px', textAlign: 'right', fontWeight: 700 }} dir="ltr">
                                                {formatTime(duration)}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

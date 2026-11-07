import React, { useState, useEffect, useRef } from 'react';
import Icon from '../Icon';

export default function QuranRadio() {
    const [stations, setStations] = useState([]);
    const [filteredStations, setFilteredStations] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [activeStationId, setActiveStationId] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef(null);

    useEffect(() => {
        const fetchRadioStations = async () => {
            try {
                const res = await fetch('https://data-rosy.vercel.app/radio.json');
                const data = await res.json();

                const stationsArray = Array.isArray(data) ? data : data.radios || data.data || [];

                const processedStations = stationsArray.map((station, index) => ({
                    id: station.id || `radio-${index}`,
                    name: station.name || station.title || 'إذاعة غير معروفة',
                    url: station.url || station.radio_url
                })).filter(s => s.url);

                setStations(processedStations);
                setFilteredStations(processedStations);
            } catch (error) {
                console.error("Error fetching radio stations:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRadioStations();
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
        if (!searchQuery) {
            setFilteredStations(stations);
        } else {
            const normalizedQuery = normalizeArabic(searchQuery).toLowerCase();
            const filtered = stations.filter(s =>
                normalizeArabic(s.name).includes(normalizedQuery)
            );
            setFilteredStations(filtered);
        }
    }, [searchQuery, stations]);

    const handlePlayPause = (station) => {
        if (!audioRef.current) return;

        if (activeStationId === station.id) {
            if (isPlaying) {
                audioRef.current.pause();
                setIsPlaying(false);
            } else {
                audioRef.current.play();
                setIsPlaying(true);
            }
        } else {
            setActiveStationId(station.id);
            audioRef.current.src = station.url;
            audioRef.current.play();
            setIsPlaying(true);
        }
    };

    return (
        <div className="anim-fade-in" style={{ paddingBottom: '80px' }}>
            {/* Header Area */}
            <div className="card-glow mb-16" style={{
                padding: '24px',
                textAlign: 'center',
                border: '2px solid var(--bd-black)',
                boxShadow: '4px 4px 0 var(--bd-black)',
                background: 'var(--color-surface)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ width: '8px', height: '8px', background: 'var(--bd-teal)', transform: 'rotate(45deg)' }}></span>
                    <Icon name="radio" size={32} color="var(--bd-teal)" />
                    <span style={{ width: '8px', height: '8px', background: 'var(--bd-teal)', transform: 'rotate(45deg)' }}></span>
                </div>

                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '8px 0 4px', color: 'var(--bd-gold)' }}>
                    إذاعة القرآن الكريم
                </h2>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-dim)', fontWeight: 700, margin: '0 0 20px' }}>
                    بث مباشر متواصل لإذاعات القرآن الكريم عبر العالم الإسلامي
                </p>

                <div className="search-box" style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: 'var(--color-surface-card)',
                    border: '2px solid var(--bd-black)',
                    boxShadow: '2px 2px 0 var(--bd-black)',
                    padding: '0 12px',
                    margin: '0 auto',
                    maxWidth: '440px'
                }}>
                    <Icon name="search" size={20} color="var(--bd-teal)" />
                    <input
                        type="text"
                        placeholder="ابحث عن محطة إذاعية..."
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

            <audio
                ref={audioRef}
                onEnded={() => setIsPlaying(false)}
                onPause={() => setIsPlaying(false)}
                onPlay={() => setIsPlaying(true)}
                onError={() => {
                    setIsPlaying(false);
                    alert('عذراً، هذا البث غير متوفر حالياً.');
                }}
            ></audio>

            {/* Stations Grid */}
            {isLoading ? (
                <div style={{ padding: '40px', textAlign: 'center', opacity: 0.8 }}>
                    <Icon name="sync" size={32} className="spin" color="var(--bd-teal)" />
                    <p className="mt-8" style={{ fontWeight: 700 }}>جاري جلب قائمة المحطات الإذاعية...</p>
                </div>
            ) : filteredStations.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px' }}>
                    {filteredStations.map((station) => {
                        const isCurrentActive = activeStationId === station.id;

                        return (
                            <div
                                key={station.id}
                                className="card-glow text-center"
                                style={{
                                    padding: '20px 12px',
                                    cursor: 'pointer',
                                    border: `2px solid ${isCurrentActive ? 'var(--bd-teal)' : 'var(--bd-black)'}`,
                                    boxShadow: isCurrentActive ? '4px 4px 0 var(--bd-teal)' : '3px 3px 0 var(--bd-black)',
                                    background: isCurrentActive ? 'rgba(15, 181, 174, 0.15)' : 'var(--color-surface)',
                                    transition: 'all 0.2s ease'
                                }}
                                onClick={() => handlePlayPause(station)}
                            >
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    margin: '0 auto 12px',
                                    border: '2px solid var(--bd-black)',
                                    background: isCurrentActive ? 'var(--bd-teal)' : 'var(--color-surface-card)',
                                    color: isCurrentActive ? '#000' : 'var(--bd-teal)',
                                    boxShadow: '2px 2px 0 var(--bd-black)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Icon name={isCurrentActive && isPlaying ? "graphic_eq" : "radio"} size={26} color={isCurrentActive ? "#000" : "var(--bd-teal)"} />
                                </div>

                                <h3 style={{
                                    fontSize: '0.9rem',
                                    fontWeight: 800,
                                    margin: '0 0 12px',
                                    lineHeight: '1.4',
                                    minHeight: '38px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: isCurrentActive ? 'var(--bd-teal)' : 'var(--color-text)'
                                }}>
                                    {station.name}
                                </h3>

                                <button
                                    className="btn w-full"
                                    style={{
                                        padding: '8px',
                                        border: '2px solid var(--bd-black)',
                                        background: isCurrentActive ? (isPlaying ? 'var(--bd-gold)' : 'var(--bd-teal)') : 'transparent',
                                        color: isCurrentActive ? '#000' : 'var(--color-text)',
                                        fontWeight: 800,
                                        fontSize: '0.85rem',
                                        boxShadow: '2px 2px 0 var(--bd-black)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '6px'
                                    }}
                                >
                                    <Icon name={isCurrentActive && isPlaying ? "pause" : "play_arrow"} size={16} color={isCurrentActive ? "#000" : "var(--color-text)"} />
                                    {isCurrentActive && isPlaying ? 'إيقاف' : 'استماع'}
                                </button>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="card-glow text-center" style={{
                    padding: '30px',
                    border: '2px solid var(--bd-coral)',
                    boxShadow: '3px 3px 0 var(--bd-black)'
                }}>
                    <Icon name="error_outline" size={36} color="var(--bd-coral)" />
                    <p style={{ marginTop: '12px', fontWeight: 700, color: 'var(--bd-coral)' }}>لم يتم العثور على إذاعات مطابقة.</p>
                </div>
            )}
        </div>
    );
}

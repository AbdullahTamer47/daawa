import React, { useState, useEffect } from 'react';
import Icon from '../Icon';

const BOOKS = [
    { id: 'ara-bukhari', name: 'صحيح البخاري', maxSection: 97 },
    { id: 'ara-muslim', name: 'صحيح مسلم', maxSection: 56 },
    { id: 'ara-tirmidhi', name: 'سنن الترمذي', maxSection: 49 },
    { id: 'ara-abudawud', name: 'سنن أبي داود', maxSection: 43 },
    { id: 'ara-bukhari1', name: 'الأدب المفرد', maxSection: 1 },
    { id: 'ara-nawawi', name: 'الأربعون النووية', maxSection: 1 }
];

export default function HadithReader() {
    const [selectedBook, setSelectedBook] = useState(BOOKS[0]);
    const [section, setSection] = useState(1);
    const [hadiths, setHadiths] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchHadiths = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const url = `https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/${selectedBook.id}/${section}.min.json`;
            const response = await fetch(url);
            if (!response.ok) throw new Error('فشل جلب الأحاديث');

            const data = await response.json();
            if (data && data.hadiths) {
                setHadiths(data.hadiths);
            } else {
                setHadiths([]);
            }
        } catch (err) {
            console.error(err);
            setError('حدث خطأ أثناء الاتصال بالخادم. يرجى المحاولة لاحقاً.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchHadiths();
    }, [selectedBook, section]);

    const handleRandomHadith = () => {
        const randomSection = Math.floor(Math.random() * selectedBook.maxSection) + 1;
        setSection(randomSection);
    };

    return (
        <div className="anim-fade-in pb-24">
            <div className="card-glow mb-16" style={{ padding: '20px' }}>
                <div className="flex-between mb-16" style={{ borderBottom: '2px solid var(--border-color)', paddingBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ width: '8px', height: '8px', background: 'var(--bd-gold)', transform: 'rotate(45deg)' }}></span>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'var(--color-text)' }}>
                            موسوعة الأحاديث النبوية
                        </h2>
                    </div>
                    <button
                        className="btn"
                        onClick={handleRandomHadith}
                        title="قسم عشوائي"
                        style={{
                            padding: '6px 12px',
                            border: '2px solid var(--bd-black)',
                            background: 'var(--bd-teal)',
                            color: '#000',
                            fontWeight: 800,
                            boxShadow: '2px 2px 0 var(--bd-black)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '0.8rem'
                        }}
                    >
                        <Icon name="shuffle" size={16} color="#000" />
                        باب عشوائي
                    </button>
                </div>

                <div className="flex-col gap-12">
                    <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: 'var(--bd-teal)', marginBottom: '6px' }}>
                            الكتاب الشريف
                        </label>
                        <select
                            value={selectedBook.id}
                            onChange={(e) => {
                                const book = BOOKS.find(b => b.id === e.target.value);
                                setSelectedBook(book);
                                setSection(1);
                            }}
                            style={{
                                width: '100%',
                                padding: '10px 14px',
                                border: '2px solid var(--bd-black)',
                                boxShadow: '2px 2px 0 var(--bd-black)',
                                background: 'var(--color-surface)',
                                color: 'var(--color-text)',
                                fontWeight: 700
                            }}
                        >
                            {BOOKS.map(b => (
                                <option key={b.id} value={b.id}>{b.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: 'var(--bd-teal)', marginBottom: '6px' }}>
                            القسم / الباب
                        </label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <button
                                className="btn"
                                disabled={section <= 1 || isLoading}
                                onClick={() => setSection(s => Math.max(1, s - 1))}
                                style={{
                                    padding: '8px 12px',
                                    border: '2px solid var(--bd-black)',
                                    background: section <= 1 ? 'transparent' : 'var(--color-surface-card)',
                                    color: 'var(--color-text)',
                                    boxShadow: section <= 1 ? 'none' : '2px 2px 0 var(--bd-black)',
                                    opacity: section <= 1 ? 0.4 : 1
                                }}
                            >
                                <Icon name="chevron_right" size={20} />
                            </button>
                            <span style={{
                                flex: 1,
                                textAlign: 'center',
                                fontWeight: 800,
                                fontSize: '0.95rem',
                                padding: '8px',
                                border: '2px solid var(--border-color)',
                                background: 'rgba(0,0,0,0.1)'
                            }}>
                                الجزء {section} من {selectedBook.maxSection}
                            </span>
                            <button
                                className="btn"
                                disabled={section >= selectedBook.maxSection || isLoading}
                                onClick={() => setSection(s => Math.min(selectedBook.maxSection, s + 1))}
                                style={{
                                    padding: '8px 12px',
                                    border: '2px solid var(--bd-black)',
                                    background: section >= selectedBook.maxSection ? 'transparent' : 'var(--color-surface-card)',
                                    color: 'var(--color-text)',
                                    boxShadow: section >= selectedBook.maxSection ? 'none' : '2px 2px 0 var(--bd-black)',
                                    opacity: section >= selectedBook.maxSection ? 0.4 : 1
                                }}
                            >
                                <Icon name="chevron_left" size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="text-center" style={{ padding: '40px', opacity: 0.8 }}>
                    <Icon name="sync" size={32} className="spin" color="var(--bd-teal)" />
                    <p style={{ marginTop: '16px', fontWeight: 700 }}>جاري استرجاع الأحاديث الشريفة...</p>
                </div>
            ) : error ? (
                <div className="card text-center" style={{
                    padding: '24px',
                    border: '2px solid var(--bd-coral)',
                    boxShadow: '3px 3px 0 var(--bd-black)',
                    color: 'var(--bd-coral)'
                }}>
                    <Icon name="error_outline" size={40} color="var(--bd-coral)" />
                    <p style={{ marginTop: '12px', fontWeight: 700 }}>{error}</p>
                    <button
                        className="btn mt-12"
                        onClick={fetchHadiths}
                        style={{
                            padding: '8px 16px',
                            border: '2px solid var(--bd-black)',
                            background: 'var(--bd-coral)',
                            color: '#fff',
                            fontWeight: 800,
                            boxShadow: '2px 2px 0 var(--bd-black)'
                        }}
                    >
                        إعادة المحاولة
                    </button>
                </div>
            ) : hadiths.length === 0 ? (
                <div className="text-center" style={{ padding: '40px', opacity: 0.7, fontWeight: 700 }}>
                    <p>لا توجد أحاديث في هذا الباب.</p>
                </div>
            ) : (
                <div className="flex-col gap-16">
                    {hadiths.map((hadith, index) => (
                        <div key={hadith.hadithnumber || index} className="card-glow" style={{
                            padding: '24px',
                            border: '2px solid var(--bd-black)',
                            boxShadow: '4px 4px 0 var(--bd-black)',
                            background: 'var(--color-surface)'
                        }}>
                            <div className="flex-between mb-16" style={{ borderBottom: '1.5px solid var(--border-color)', paddingBottom: '10px' }}>
                                <span style={{
                                    fontSize: '0.85rem',
                                    fontWeight: 800,
                                    color: 'var(--bd-gold)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}>
                                    <span style={{ width: '6px', height: '6px', background: 'var(--bd-gold)', transform: 'rotate(45deg)' }}></span>
                                    رقم الحديث: {hadith.arabicnumber || hadith.hadithnumber}
                                </span>
                            </div>
                            <p style={{
                                fontFamily: 'Amiri, serif',
                                fontSize: '1.25rem',
                                lineHeight: '2.1',
                                color: 'var(--color-text)',
                                margin: 0,
                                textAlign: 'justify'
                            }}>
                                {hadith.text}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

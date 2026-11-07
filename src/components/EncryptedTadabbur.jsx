import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import Icon, { Nuqta } from './Icon';

export default function EncryptedTadabbur() {
    const { state, dispatch } = useApp();
    const [pin, setPin] = useState(() => localStorage.getItem('daawa_tadabbur_pin') || '');
    const [enteredPin, setEnteredPin] = useState('');
    const [isUnlocked, setIsUnlocked] = useState(() => !localStorage.getItem('daawa_tadabbur_pin'));
    const [newSurah, setNewSurah] = useState('');
    const [newAyah, setNewAyah] = useState('');
    const [newReflection, setNewReflection] = useState('');
    const [settingNewPin, setSettingNewPin] = useState(false);
    const [tempPin, setTempPin] = useState('');

    const notes = state.tadabburNotes || [];

    const handleUnlock = () => {
        if (enteredPin === pin) {
            setIsUnlocked(true);
        } else {
            alert('الكود السري غير صحيح!');
        }
    };

    const handleSavePin = () => {
        if (tempPin.length < 4) {
            alert('الرجاء إدخال كود من 4 أرقام على الأقل');
            return;
        }
        localStorage.setItem('daawa_tadabbur_pin', tempPin);
        setPin(tempPin);
        setSettingNewPin(false);
        setIsUnlocked(true);
        alert('تم تعيين الكود السري لدفتر التدبر بنجاح.');
    };

    const handleAddNote = () => {
        if (!newReflection.trim()) return;

        const note = {
            id: Date.now().toString(),
            surah: newSurah.trim() || 'خاطرة عامة',
            ayah: newAyah.trim() || '',
            reflection: newReflection.trim(),
            date: new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' })
        };

        dispatch({ type: 'ADD_TADABBUR_NOTE', note });
        setNewSurah('');
        setNewAyah('');
        setNewReflection('');
    };

    const handleDeleteNote = (id) => {
        if (window.confirm('هل تريد حذف هذه الخاطرة؟')) {
            dispatch({ type: 'DELETE_TADABBUR_NOTE', id });
        }
    };

    return (
        <div className="card-glow anim-fade-in" style={{
            padding: '20px',
            border: '2px solid var(--bd-black)',
            boxShadow: '4px 4px 0 var(--bd-black)',
            background: 'var(--color-surface)',
            marginBottom: '16px'
        }}>
            {/* Header */}
            <div className="flex-between mb-16" style={{ borderBottom: '2px solid var(--border-color)', paddingBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Nuqta size={8} />
                    <Icon name="lock" size={22} color="var(--bd-gold)" />
                    <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--color-text)' }}>
                        دفتر التدبر المشفر
                    </h2>
                </div>

                {isUnlocked && (
                    <button
                        className="btn"
                        onClick={() => setSettingNewPin(true)}
                        style={{
                            padding: '4px 10px',
                            border: '1.5px solid var(--bd-black)',
                            background: 'var(--color-surface-card)',
                            color: 'var(--color-text)',
                            fontSize: '0.75rem',
                            fontWeight: 700
                        }}
                    >
                        {pin ? 'تغيير الكود السري' : 'قفل برقم سري'}
                    </button>
                )}
            </div>

            {/* Lock Screen if Locked */}
            {!isUnlocked ? (
                <div style={{ textAlign: 'center', padding: '30px 16px' }}>
                    <Icon name="lock" size={40} color="var(--bd-gold)" />
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '12px 0 6px' }}>
                        الدفتر محمي برمز سري
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-dim)', fontWeight: 700, margin: '0 0 16px' }}>
                        أدخل الكود السري للاطلاع على خواطرك ومحاسبة النفس
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', maxWidth: '280px', margin: '0 auto' }}>
                        <input
                            type="password"
                            maxLength={8}
                            placeholder="الكود السري"
                            value={enteredPin}
                            onChange={(e) => setEnteredPin(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
                            style={{
                                flex: 1,
                                padding: '10px',
                                border: '2px solid var(--bd-black)',
                                background: 'var(--color-surface-card)',
                                color: 'var(--color-text)',
                                textAlign: 'center',
                                fontWeight: 800,
                                fontSize: '1.1rem'
                            }}
                        />
                        <button
                            className="btn"
                            onClick={handleUnlock}
                            style={{
                                padding: '10px 16px',
                                border: '2px solid var(--bd-black)',
                                background: 'var(--bd-teal)',
                                color: '#000',
                                fontWeight: 800,
                                boxShadow: '2px 2px 0 var(--bd-black)'
                            }}
                        >
                            فتح
                        </button>
                    </div>
                </div>
            ) : settingNewPin ? (
                /* Set PIN Screen */
                <div style={{ padding: '16px', background: 'var(--color-surface-card)', border: '2px solid var(--bd-black)', marginBottom: '16px' }}>
                    <h4 style={{ margin: '0 0 8px', fontSize: '0.95rem', fontWeight: 800 }}>تعيين كود حماية جديد</h4>
                    <p style={{ margin: '0 0 12px', fontSize: '0.8rem', color: 'var(--color-text-dim)', fontWeight: 700 }}>
                        اختر رمزاً من 4 إلى 8 أرقام لقفل الدفتر محلياً على جهازك
                    </p>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                            type="password"
                            maxLength={8}
                            placeholder="الكود الجديد (مثال: 1234)"
                            value={tempPin}
                            onChange={(e) => setTempPin(e.target.value)}
                            style={{
                                flex: 1,
                                padding: '8px',
                                border: '1.5px solid var(--bd-black)',
                                background: 'var(--color-surface)',
                                color: 'var(--color-text)',
                                fontWeight: 800
                            }}
                        />
                        <button
                            className="btn"
                            onClick={handleSavePin}
                            style={{
                                padding: '8px 14px',
                                border: '1.5px solid var(--bd-black)',
                                background: 'var(--bd-teal)',
                                color: '#000',
                                fontWeight: 800
                            }}
                        >
                            حفظ
                        </button>
                        <button
                            className="btn"
                            onClick={() => setSettingNewPin(false)}
                            style={{
                                padding: '8px 12px',
                                border: '1.5px solid var(--border-color)',
                                background: 'transparent',
                                color: 'var(--color-text-dim)',
                                fontWeight: 700
                            }}
                        >
                            إلغاء
                        </button>
                    </div>
                </div>
            ) : (
                /* Unlocked: Add Note & List Notes */
                <div>
                    {/* Add Reflection Box */}
                    <div style={{
                        padding: '16px',
                        background: 'var(--color-surface-card)',
                        border: '2px solid var(--bd-black)',
                        boxShadow: '2px 2px 0 var(--bd-black)',
                        marginBottom: '16px'
                    }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                            <input
                                type="text"
                                placeholder="السورة (مثال: الكهف)"
                                value={newSurah}
                                onChange={(e) => setNewSurah(e.target.value)}
                                style={{
                                    padding: '8px 10px',
                                    border: '1.5px solid var(--bd-black)',
                                    background: 'var(--color-surface)',
                                    color: 'var(--color-text)',
                                    fontWeight: 700,
                                    fontSize: '0.85rem'
                                }}
                            />
                            <input
                                type="text"
                                placeholder="رقم الآية (اختياري)"
                                value={newAyah}
                                onChange={(e) => setNewAyah(e.target.value)}
                                style={{
                                    padding: '8px 10px',
                                    border: '1.5px solid var(--bd-black)',
                                    background: 'var(--color-surface)',
                                    color: 'var(--color-text)',
                                    fontWeight: 700,
                                    fontSize: '0.85rem'
                                }}
                            />
                        </div>

                        <textarea
                            placeholder="اكتب خواطرك، مشاعرك، وتدبرك للآية أو محاسبة النفس..."
                            rows={3}
                            value={newReflection}
                            onChange={(e) => setNewReflection(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '10px',
                                border: '1.5px solid var(--bd-black)',
                                background: 'var(--color-surface)',
                                color: 'var(--color-text)',
                                fontWeight: 700,
                                fontSize: '0.9rem',
                                resize: 'vertical',
                                marginBottom: '8px',
                                boxSizing: 'border-box'
                            }}
                        />

                        <button
                            className="btn w-full"
                            onClick={handleAddNote}
                            disabled={!newReflection.trim()}
                            style={{
                                padding: '10px',
                                border: '2px solid var(--bd-black)',
                                background: newReflection.trim() ? 'var(--bd-teal)' : 'var(--color-surface)',
                                color: newReflection.trim() ? '#000' : 'var(--color-text-dim)',
                                fontWeight: 800,
                                fontSize: '0.85rem',
                                boxShadow: newReflection.trim() ? '2px 2px 0 var(--bd-black)' : 'none',
                                opacity: newReflection.trim() ? 1 : 0.4
                            }}
                        >
                            + حفظ الخاطرة في الدفتر
                        </button>
                    </div>

                    {/* Notes List */}
                    <div style={{ display: 'grid', gap: '10px' }}>
                        {notes.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '24px', color: 'var(--color-text-dim)', fontWeight: 700, fontSize: '0.85rem' }}>
                                لا توجد خواطر مسجلة بعد. ابدأ بتدوين ما يلامس قلبك من آيات الله.
                            </div>
                        ) : (
                            notes.map(note => (
                                <div key={note.id} style={{
                                    padding: '14px',
                                    border: '1.5px solid var(--border-color)',
                                    background: 'var(--color-surface-card)',
                                    position: 'relative'
                                }}>
                                    <div className="flex-between mb-8">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <span style={{ width: '6px', height: '6px', background: 'var(--bd-gold)', transform: 'rotate(45deg)' }}></span>
                                            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--bd-gold)' }}>
                                                {note.surah} {note.ayah ? `(آية ${note.ayah})` : ''}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-dim)', fontWeight: 700 }}>
                                                {note.date}
                                            </span>
                                            <button
                                                className="btn-icon"
                                                onClick={() => handleDeleteNote(note.id)}
                                                style={{ padding: '2px', color: 'var(--bd-coral)' }}
                                                title="حذف"
                                            >
                                                <Icon name="delete" size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    <p style={{
                                        margin: 0,
                                        fontSize: '0.95rem',
                                        lineHeight: '1.7',
                                        color: 'var(--color-text)',
                                        fontWeight: 700,
                                        whiteSpace: 'pre-wrap'
                                    }}>
                                        {note.reflection}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

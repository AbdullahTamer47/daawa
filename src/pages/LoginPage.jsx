import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import Icon, { Nuqta } from '../components/Icon';
import { DaawaEmblem } from '../components/DaawaLogo';
import { db } from '../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export default function LoginPage() {
    const { dispatch } = useApp();
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [isRestoreMode, setIsRestoreMode] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const trimmed = name.trim();
        if (!trimmed) return;

        setLoading(true);
        setErrorMsg('');

        try {
            if (isRestoreMode) {
                // Restore account with recovery code
                const userRef = doc(db, 'users', trimmed);
                const docSnap = await getDoc(userRef);

                if (docSnap.exists()) {
                    const userData = docSnap.data();
                    dispatch({ type: 'RESTORE_STATE', payload: userData });
                    dispatch({ type: 'SET_USER_NAME', name: userData.name, userId: trimmed, isAdmin: false });
                } else {
                    setErrorMsg('الكود غير صحيح أو الحساب غير موجود!');
                }
            } else {
                // New user: generate 6-digit recovery code
                const newUserId = Math.floor(100000 + Math.random() * 900000).toString();

                dispatch({ type: 'SET_USER_NAME', name: trimmed, userId: newUserId, isAdmin: false });

                await setDoc(doc(db, 'users', newUserId), {
                    userId: newUserId,
                    name: trimmed,
                    totalPoints: 0,
                    updatedAt: new Date().toISOString(),
                }, { merge: true });
            }
        } catch (err) {
            console.warn('وضع العمل دون اتصال مفعّل:', err?.message || err);
            // Allow full offline local access
            const newUserId = Math.floor(100000 + Math.random() * 900000).toString();
            dispatch({ type: 'SET_USER_NAME', name: trimmed, userId: newUserId, isAdmin: false });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="splash-screen" style={{ justifyContent: 'center', gap: 'var(--space-4)', padding: 'var(--space-6) var(--space-4)' }}>
            <div className="anim-float">
                <div
                    style={{
                        width: '96px',
                        height: '96px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'radial-gradient(circle at 35% 35%, #16365C, #0B1F3A)',
                        borderRadius: '0px',
                        border: '2px solid var(--bd-teal, #0FB5AE)',
                        boxShadow: '4px 4px 0 #050E1A',
                    }}
                >
                    <DaawaEmblem size={56} />
                </div>
            </div>

            <div style={{ textAlign: 'center' }}>
                <h1 className="splash-title" style={{ fontSize: '2.2rem', margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    دعوة
                    <Nuqta size={12} />
                </h1>
                <p className="splash-subtitle" style={{ color: 'var(--bd-teal-300)', marginTop: '4px' }}>
                    رفيقك الإيماني اليومي · مفتوح المصدر
                </p>
            </div>

            <div style={{ textAlign: 'center', maxWidth: '340px', width: '100%' }}>
                <h2 style={{ font: 'var(--text-title-md)', color: 'var(--bd-white)', marginBottom: 'var(--space-1)' }}>
                    {isRestoreMode ? 'استعادة حساب سابق' : 'تسجيل حساب جديد'}
                </h2>
                <p style={{ font: 'var(--text-body-sm)', color: 'var(--color-on-surface-variant)' }}>
                    {isRestoreMode ? 'أدخل كودك المكون من 6 أرقام' : 'أدخل اسمك الكريم للبدء'}
                </p>

                <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-2)', marginTop: 'var(--space-3)' }}>
                    <button
                        className={`btn ${!isRestoreMode ? 'btn-filled' : 'btn-outlined'}`}
                        onClick={() => { setIsRestoreMode(false); setErrorMsg(''); setName(''); }}
                        style={{ padding: '6px 16px', borderRadius: '0px', fontSize: '0.85rem' }}
                    >
                        حساب جديد
                    </button>
                    <button
                        className={`btn ${isRestoreMode ? 'btn-filled' : 'btn-outlined'}`}
                        onClick={() => { setIsRestoreMode(true); setErrorMsg(''); setName(''); }}
                        style={{ padding: '6px 16px', borderRadius: '0px', fontSize: '0.85rem' }}
                    >
                        استعادة بكود
                    </button>
                </div>
            </div>

            <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '320px' }}>
                <div className="input-field">
                    <label>
                        <Icon name={isRestoreMode ? "vpn_key" : "person"} size={16} style={{ verticalAlign: 'middle', marginLeft: 'var(--space-1)' }} />
                        {isRestoreMode ? 'كود الاسترجاع' : 'الاسم'}
                    </label>
                    <input
                        type={isRestoreMode ? "number" : "text"}
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder={isRestoreMode ? 'مثال: 123456' : 'مثال: أحمد محمد'}
                        autoFocus
                        style={isRestoreMode ? { letterSpacing: '4px', textAlign: 'center', font: 'var(--text-pixel)', fontSize: '1.2rem', fontWeight: 'bold' } : {}}
                    />
                </div>

                {errorMsg && (
                    <div style={{ color: 'var(--bd-error)', textAlign: 'center', margin: 'var(--space-2) 0', font: 'var(--text-body-sm)' }}>
                        {errorMsg}
                    </div>
                )}

                <button
                    type="submit"
                    className="splash-enter-btn"
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-2)', marginTop: 'var(--space-3)' }}
                    disabled={loading}
                >
                    <Icon name={isRestoreMode ? 'restore' : 'login'} size={20} color="var(--bd-navy)" />
                    <span>{loading ? 'جاري التحقق...' : (isRestoreMode ? 'استعادة الحساب' : 'دخول التطبيق')}</span>
                </button>
            </form>
        </div>
    );
}

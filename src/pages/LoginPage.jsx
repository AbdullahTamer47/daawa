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
    
    // Recovery code modal confirmation state
    const [newAccountCode, setNewAccountCode] = useState(null); // { code, name }
    const [codeCopied, setCodeCopied] = useState(false);

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
                    setErrorMsg('الكود غير صحيح أو الحساب غير مسجل!');
                }
            } else {
                // New user: generate 6-digit recovery code
                const newUserId = Math.floor(100000 + Math.random() * 900000).toString();

                try {
                    await setDoc(doc(db, 'users', newUserId), {
                        userId: newUserId,
                        name: trimmed,
                        totalPoints: 0,
                        updatedAt: new Date().toISOString(),
                    }, { merge: true });
                } catch {
                    // Offline fallback
                }

                // Show the generated code to the user explicitly before entering!
                setNewAccountCode({ code: newUserId, name: trimmed });
            }
        } catch (err) {
            console.warn('وضع العمل دون اتصال مفعّل:', err?.message || err);
            const newUserId = Math.floor(100000 + Math.random() * 900000).toString();
            setNewAccountCode({ code: newUserId, name: trimmed });
        } finally {
            setLoading(false);
        }
    };

    const handleCopyCode = () => {
        if (!newAccountCode?.code) return;
        navigator.clipboard.writeText(newAccountCode.code);
        setCodeCopied(true);
        setTimeout(() => setCodeCopied(false), 2500);
    };

    const handleProceedToApp = () => {
        if (!newAccountCode) return;
        dispatch({
            type: 'SET_USER_NAME',
            name: newAccountCode.name,
            userId: newAccountCode.code,
            isAdmin: false
        });
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

            {/* STEP 2: SHOW NEW ACCOUNT CODE EXPLICITLY */}
            {newAccountCode ? (
                <div
                    className="card-glow anim-slide-up"
                    style={{
                        maxWidth: '380px',
                        width: '100%',
                        textAlign: 'center',
                        padding: 'var(--space-5)',
                        border: '2px solid var(--bd-gold)',
                        background: 'radial-gradient(ellipse at top, #153258 0%, #0A1B30 100%)',
                    }}
                >
                    <div
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '44px',
                            height: '44px',
                            background: 'rgba(224, 165, 38, 0.15)',
                            border: '1.5px solid var(--bd-gold)',
                            marginBottom: 'var(--space-2)',
                        }}
                    >
                        <Icon name="check" size={24} color="var(--bd-gold)" />
                    </div>

                    <h2 style={{ font: 'var(--text-title-md)', fontWeight: 800, color: 'var(--bd-white)', margin: 0 }}>
                        مرحباً بك، {newAccountCode.name}
                    </h2>
                    <p style={{ font: 'var(--text-body-sm)', color: 'var(--bd-teal-200)', margin: '4px 0 var(--space-4)' }}>
                        تم تجهيز حسابك بنجاح! هذا هو كود الدخول الخاص بك:
                    </p>

                    {/* BIG 6-DIGIT CODE DISPLAY */}
                    <div
                        style={{
                            background: '#061324',
                            border: '2px dashed var(--bd-gold)',
                            padding: 'var(--space-4) var(--space-2)',
                            margin: 'var(--space-3) 0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                        }}
                    >
                        {newAccountCode.code.split('').map((digit, i) => (
                            <span
                                key={i}
                                style={{
                                    font: 'var(--text-pixel)',
                                    fontSize: '1.75rem',
                                    fontWeight: 900,
                                    color: 'var(--bd-gold)',
                                    background: 'rgba(224, 165, 38, 0.1)',
                                    border: '1px solid var(--bd-gold)',
                                    width: '36px',
                                    height: '46px',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    textShadow: '0 0 10px rgba(224, 165, 38, 0.5)',
                                }}
                            >
                                {digit}
                            </span>
                        ))}
                    </div>

                    {/* Copy Button */}
                    <button
                        onClick={handleCopyCode}
                        className="btn btn-outlined w-full"
                        style={{
                            border: '1.5px solid var(--bd-teal)',
                            color: codeCopied ? 'var(--bd-gold)' : 'var(--bd-teal)',
                            padding: '8px 16px',
                            marginBottom: 'var(--space-3)',
                            font: 'var(--text-label-md)',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                        }}
                    >
                        <Icon name={codeCopied ? 'done' : 'content_copy'} size={18} color={codeCopied ? 'var(--bd-gold)' : 'var(--bd-teal)'} />
                        <span>{codeCopied ? 'تم نسخ الكود بنجاح!' : 'نسخ كود الدخول (احفظه عندك)'}</span>
                    </button>

                    {/* Important Guidance Box */}
                    <div
                        style={{
                            background: 'rgba(15, 181, 174, 0.1)',
                            border: '1px solid var(--bd-teal)',
                            padding: '8px 12px',
                            textAlign: 'right',
                            font: 'var(--text-body-sm)',
                            fontSize: '0.75rem',
                            color: 'var(--bd-teal-200)',
                            lineHeight: 1.6,
                            marginBottom: 'var(--space-4)',
                        }}
                    >
                        <strong style={{ color: 'var(--bd-gold)', display: 'block', marginBottom: '2px' }}>
                            تنبيه هام جداً:
                        </strong>
                        احفظ هذا الكود المكون من 6 أرقام لتسجيل الدخول به في أي وقت واسترجاع ستريك صلواتك وإنجازاتك من أي جهاز.
                    </div>

                    {/* Proceed Button */}
                    <button
                        onClick={handleProceedToApp}
                        className="splash-enter-btn w-full"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 'var(--space-2)',
                        }}
                    >
                        <span>حفظت الكود ومتابعة للدخول</span>
                        <Icon name="arrow_back" size={20} color="var(--bd-navy)" />
                    </button>
                </div>
            ) : (
                /* STEP 1: LOGIN / RESTORE FORM */
                <div style={{ textAlign: 'center', maxWidth: '340px', width: '100%' }}>
                    <h2 style={{ font: 'var(--text-title-md)', color: 'var(--bd-white)', marginBottom: 'var(--space-1)' }}>
                        {isRestoreMode ? 'استعادة حساب سابق' : 'تسجيل حساب جديد'}
                    </h2>
                    <p style={{ font: 'var(--text-body-sm)', color: 'var(--color-on-surface-variant)' }}>
                        {isRestoreMode ? 'أدخل كودك المكون من 6 أرقام' : 'أدخل اسمك الكريم للبدء والحصول على كودك'}
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

                    <form onSubmit={handleSubmit} style={{ width: '100%', marginTop: 'var(--space-4)' }}>
                        <div className="input-field">
                            <label>
                                <Icon name={isRestoreMode ? "vpn_key" : "person"} size={16} style={{ verticalAlign: 'middle', marginLeft: 'var(--space-1)' }} />
                                {isRestoreMode ? 'كود الاسترجاع (6 أرقام)' : 'الاسم الكريم'}
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
                            <span>{loading ? 'جاري التحقق...' : (isRestoreMode ? 'استعادة الحساب ومتابعة' : 'إنشاء الحساب واستلام الكود')}</span>
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Icon, { Nuqta } from './Icon';
import { DaawaEmblem } from './DaawaLogo';

const navItems = [
    { path: '/', icon: 'home', label: 'الرئيسية' },
    { path: '/quran', icon: 'menu_book', label: 'القرآن الكريم' },
    { path: '/istighfar', icon: 'volunteer_activism', label: 'الأذكار والتسبيح' },
    { path: '/tools', altPath: '/tasks', icon: 'explore', label: 'مواقيت الصلاة والقبلة' },
    { path: '/stats', icon: 'insights', label: 'الإحصائيات والختمات' },
];

export default function DesktopNavbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const { state, dispatch } = useApp();
    const [copiedId, setCopiedId] = React.useState(false);

    const prayerStreak = state.prayerStreak || 0;
    const quranStreak = state.quranStreak || 0;

    return (
        <header className="desktop-navbar">
            <div className="desktop-navbar-inner">
                {/* Brand & Logo Lockup */}
                <div
                    onClick={() => navigate('/')}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-3)',
                        cursor: 'pointer',
                        userSelect: 'none',
                    }}
                >
                    <div
                        style={{
                            width: '36px',
                            height: '36px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'radial-gradient(circle at 35% 35%, #16365C, #0B1F3A)',
                            border: '1.5px solid var(--bd-teal, #0FB5AE)',
                            boxShadow: '2px 2px 0 #050E1A',
                        }}
                    >
                        <DaawaEmblem size={22} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span
                            style={{
                                font: 'var(--font-display-ar)',
                                fontWeight: 800,
                                fontSize: '1.25rem',
                                color: 'var(--bd-white)',
                                letterSpacing: '-0.5px',
                            }}
                        >
                            دعوة
                        </span>
                        <Nuqta size={7} />
                    </div>
                    <span
                        style={{
                            font: 'var(--text-pixel)',
                            fontSize: '0.625rem',
                            color: 'var(--bd-teal)',
                            background: 'rgba(15, 181, 174, 0.12)',
                            border: '1px solid var(--bd-teal)',
                            padding: '2px 6px',
                            borderRadius: '0px',
                            letterSpacing: '0.5px',
                        }}
                    >
                        مفتوح المصدر
                    </span>
                </div>

                {/* Main Navigation Links */}
                <nav style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    {navItems.map((item) => {
                        const isActive =
                            location.pathname === item.path ||
                            (item.altPath && location.pathname === item.altPath);

                        return (
                            <button
                                key={item.path}
                                onClick={() => navigate(item.path)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '8px 14px',
                                    background: isActive
                                        ? 'rgba(15, 181, 174, 0.15)'
                                        : 'transparent',
                                    border: isActive
                                        ? '1.5px solid var(--bd-teal)'
                                        : '1.5px solid transparent',
                                    boxShadow: isActive ? '2px 2px 0 #050E1A' : 'none',
                                    color: isActive
                                        ? 'var(--bd-white)'
                                        : 'var(--color-on-surface-variant, #A5B8D0)',
                                    cursor: 'pointer',
                                    font: 'var(--text-label-md)',
                                    fontWeight: isActive ? 700 : 500,
                                    transition: 'all 0.15s ease',
                                    borderRadius: '0px',
                                }}
                                onMouseEnter={(e) => {
                                    if (!isActive) {
                                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                                        e.currentTarget.style.color = 'var(--bd-white)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!isActive) {
                                        e.currentTarget.style.background = 'transparent';
                                        e.currentTarget.style.color =
                                            'var(--color-on-surface-variant, #A5B8D0)';
                                    }
                                }}
                            >
                                <Icon
                                    name={item.icon}
                                    size={18}
                                    color={isActive ? 'var(--bd-teal)' : 'var(--bd-slate)'}
                                    filled={isActive}
                                />
                                <span>{item.label}</span>
                            </button>
                        );
                    })}
                </nav>

                {/* Right Side Utility Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    {/* Dual Streak Indicator */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--space-2)',
                            background: 'rgba(11, 31, 58, 0.7)',
                            border: '1px solid var(--bd-border-dark)',
                            padding: '4px 10px',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Icon name="mosque" size={14} color="var(--bd-gold)" />
                            <span
                                style={{
                                    font: 'var(--text-pixel)',
                                    fontSize: '0.7rem',
                                    color: 'var(--bd-gold)',
                                    fontWeight: 700,
                                }}
                            >
                                {prayerStreak}ي
                            </span>
                        </div>
                        <span style={{ color: 'var(--bd-border-dark)' }}>|</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Icon name="menu_book" size={14} color="var(--bd-teal)" />
                            <span
                                style={{
                                    font: 'var(--text-pixel)',
                                    fontSize: '0.7rem',
                                    color: 'var(--bd-teal)',
                                    fontWeight: 700,
                                }}
                            >
                                {quranStreak}ي
                            </span>
                        </div>
                    </div>

                    {/* Theme Mode Toggle */}
                    <button
                        onClick={() => dispatch({ type: 'TOGGLE_THEME' })}
                        className="btn-icon"
                        title={state.theme === 'light' ? 'الوضع الداكن' : 'الوضع النهاري'}
                        style={{
                            width: '36px',
                            height: '36px',
                            border: '1px solid var(--bd-border-dark)',
                            background: 'transparent',
                        }}
                    >
                        <Icon
                            name={state.theme === 'light' ? 'dark_mode' : 'light_mode'}
                            size={18}
                            color="var(--bd-teal)"
                        />
                    </button>

                    {/* User Greeting & Recovery Code Pill */}
                    {state.userName && (
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--space-2)',
                                borderRight: '1px solid var(--bd-border-dark)',
                                paddingRight: 'var(--space-3)',
                            }}
                        >
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                <span
                                    style={{
                                        font: 'var(--text-body-sm)',
                                        color: 'var(--color-on-surface)',
                                        fontWeight: 700,
                                        lineHeight: 1.2,
                                    }}
                                >
                                    {state.userName}
                                </span>
                                {state.userId && (
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(state.userId);
                                            setCopiedId(true);
                                            setTimeout(() => setCopiedId(false), 2000);
                                        }}
                                        title="كود الدخول الخاص بك (انقر للنسخ)"
                                        style={{
                                            background: 'rgba(245, 184, 56, 0.12)',
                                            border: '1px solid var(--bd-gold)',
                                            padding: '1px 6px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                            fontSize: '0.65rem',
                                            fontFamily: 'var(--font-pixel)',
                                            color: 'var(--bd-gold)',
                                            marginTop: '3px',
                                        }}
                                    >
                                        <Icon name={copiedId ? 'done' : 'vpn_key'} size={11} color="var(--bd-gold)" />
                                        <span>كودك: {state.userId} {copiedId && '✓'}</span>
                                    </button>
                                )}
                            </div>

                            <button
                                onClick={() => {
                                    if (confirm('هل تريد تسجيل الخروج؟')) {
                                        dispatch({ type: 'LOGOUT' });
                                    }
                                }}
                                className="btn-icon"
                                title="تسجيل الخروج"
                                style={{
                                    width: '32px',
                                    height: '32px',
                                    border: '1px solid rgba(255, 180, 171, 0.3)',
                                    background: 'transparent',
                                }}
                            >
                                <Icon name="logout" size={16} color="var(--color-error)" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}


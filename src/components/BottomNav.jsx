import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Icon from './Icon';

const navItems = [
    { path: '/', icon: 'home', label: 'الرئيسية' },
    { path: '/quran', icon: 'menu_book', label: 'القرآن' },
    { path: '/istighfar', icon: 'volunteer_activism', label: 'الأذكار' },
    { path: '/tools', altPath: '/tasks', icon: 'explore', label: 'القبلة والأدوات' },
    { path: '/stats', icon: 'insights', label: 'الإحصائيات' },
];

export default function BottomNav() {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <nav
            className="bottom-nav"
            style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                height: '76px',
                background: 'rgba(11, 31, 58, 0.95)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderTop: '1px solid var(--color-outline-variant, #1C324E)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-around',
                padding: '6px 8px env(safe-area-inset-bottom, 8px)',
                zIndex: 1000,
                boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.4)',
            }}
        >
            {navItems.map(item => {
                const isActive = location.pathname === item.path || (item.altPath && location.pathname === item.altPath);

                return (
                    <button
                        key={item.path}
                        className={`nav-item ${isActive ? 'active' : ''}`}
                        onClick={() => navigate(item.path)}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px',
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '4px 8px',
                            minWidth: '58px',
                            color: isActive ? 'var(--bd-teal, #0FB5AE)' : 'var(--color-on-surface-variant, #A5B8D0)',
                            transition: 'all 0.2s cubic-bezier(0.2, 0, 0, 1)',
                        }}
                    >
                        {/* bedigital Active Indicator Pill (Pixel notched) */}
                        <div
                            style={{
                                width: '52px',
                                height: '28px',
                                borderRadius: '2px',
                                background: isActive ? 'rgba(15, 181, 174, 0.2)' : 'transparent',
                                border: isActive ? '1px solid var(--bd-teal)' : '1px solid transparent',
                                boxShadow: isActive ? '2px 2px 0 #050E1A' : 'none',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s cubic-bezier(0.2, 0, 0, 1)',
                            }}
                        >
                            <Icon
                                name={item.icon}
                                size={22}
                                filled={isActive}
                                color={isActive ? 'var(--bd-teal, #0FB5AE)' : 'var(--bd-slate, #5C6A7C)'}
                            />
                        </div>
                        <span
                            style={{
                                font: 'var(--text-label-sm)',
                                fontSize: '0.7rem',
                                fontWeight: isActive ? 700 : 500,
                                color: isActive ? 'var(--bd-white, #FFFFFF)' : 'var(--bd-slate, #5C6A7C)',
                                transition: 'color 0.2s ease',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {item.label}
                        </span>
                    </button>
                );
            })}
        </nav>
    );
}

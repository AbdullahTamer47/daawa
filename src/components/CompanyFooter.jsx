import React from 'react';
import { Nuqta, MonitorBa, BeDigitalLogo } from './Icon';

export default function CompanyFooter({ showFullCard = true, style = {} }) {
    return (
        <footer className="company-footer-container" style={{ marginTop: 'var(--space-6)', ...style }}>
            {showFullCard && (
                <div
                    className="card mb-4"
                    style={{
                        background: 'linear-gradient(145deg, #0D223F 0%, #08162A 100%)',
                        border: '2px solid var(--bd-teal-700, #0D717A)',
                        boxShadow: 'var(--bd-shadow, 4px 4px 0px #050E1A)',
                        padding: 'var(--space-5) var(--space-4)',
                        position: 'relative',
                        overflow: 'hidden',
                        borderRadius: '0px',
                    }}
                >
                    {/* Decorative Pixel Dissolve in top-left (PDF Page 6 Pattern 01) */}
                    <div
                        style={{
                            position: 'absolute',
                            top: '12px',
                            left: '12px',
                            display: 'grid',
                            gridTemplateColumns: 'repeat(4, 6px)',
                            gap: '4px',
                            opacity: 0.35,
                            pointerEvents: 'none',
                        }}
                    >
                        <span style={{ width: 6, height: 6, background: '#0FB5AE' }} />
                        <span style={{ width: 6, height: 6, background: '#0FB5AE' }} />
                        <span style={{ width: 6, height: 6, background: '#0FB5AE', opacity: 0.6 }} />
                        <span style={{ width: 6, height: 6, background: '#0FB5AE', opacity: 0.2 }} />
                        <span style={{ width: 6, height: 6, background: '#0FB5AE' }} />
                        <span style={{ width: 6, height: 6, background: '#E0A526' }} />
                        <span style={{ width: 6, height: 6, background: '#0FB5AE', opacity: 0.4 }} />
                        <span style={{ width: 6, height: 6, background: 'transparent' }} />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', position: 'relative', zIndex: 1 }}>
                        {/* Monitor Ba & bedigital Wordmark Lockup */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
                            <MonitorBa size={36} />
                            <div style={{ textAlign: 'right' }}>
                                <BeDigitalLogo height={26} />
                                <div style={{ font: 'var(--text-pixel)', color: 'var(--bd-teal-300)', letterSpacing: '1px', fontSize: '0.65rem', marginTop: '2px' }}>
                                    BRAND IDENTITY · 2026
                                </div>
                            </div>
                        </div>

                        {/* Arabic Tagline & Statement */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', margin: 'var(--space-2) 0' }}>
                            <Nuqta size={8} />
                            <h3 style={{ font: 'var(--text-title-md)', fontWeight: 700, margin: 0, color: 'var(--bd-white)' }}>
                                تم تطوير البرنامج بالكامل بواسطة <span style={{ color: 'var(--bd-teal)' }}>bedigital</span>
                            </h3>
                            <Nuqta size={8} />
                        </div>

                        {/* Brand Badges from Brand Guidelines */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 'var(--space-2)', marginTop: 'var(--space-3)' }}>
                            <span
                                style={{
                                    font: 'var(--text-pixel)',
                                    fontSize: '0.65rem',
                                    background: 'rgba(15, 181, 174, 0.15)',
                                    color: 'var(--bd-teal)',
                                    border: '1.5px solid var(--bd-teal)',
                                    padding: '4px 10px',
                                    borderRadius: '0px',
                                }}
                            >
                                ابدأ بنقطة · START WITH A DOT
                            </span>
                            <span
                                style={{
                                    font: 'var(--text-pixel)',
                                    fontSize: '0.65rem',
                                    background: 'rgba(224, 165, 38, 0.15)',
                                    color: 'var(--bd-gold)',
                                    border: '1.5px solid var(--bd-gold)',
                                    padding: '4px 10px',
                                    borderRadius: '0px',
                                }}
                            >
                                رقمي، بنقطة · DIGITAL, WITH A NUQTA
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Bottom Copyright Strip */}
            <div
                style={{
                    padding: 'var(--space-3) var(--space-4)',
                    textAlign: 'center',
                    borderTop: '1px solid var(--bd-border-dark, #234268)',
                    background: 'rgba(11, 31, 58, 0.85)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 'var(--space-2)',
                    fontSize: '0.75rem',
                    color: 'var(--bd-slate, #5C6A7C)',
                }}
            >
                <Nuqta size={6} />
                <span>جميع الحقوق محفوظة © 2026 <strong>bedigital</strong> · تطبيق دعوة</span>
                <Nuqta size={6} />
            </div>
        </footer>
    );
}

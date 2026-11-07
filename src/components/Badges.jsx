import React from 'react';
import { BADGES } from '../context/AppContext';
import { useApp } from '../context/AppContext';
import Icon, { Nuqta } from './Icon';
import PixelCardExporter from './PixelCardExporter';

export default function Badges() {
    const { state } = useApp();

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 'var(--space-3)' }}>
            {BADGES.map(badge => {
                const unlocked = badge.condition(state.stats || {});
                return (
                    <div
                        key={badge.id}
                        className="card"
                        style={{
                            padding: 'var(--space-3)',
                            textAlign: 'center',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            background: unlocked ? 'rgba(15, 181, 174, 0.1)' : 'var(--color-surface)',
                            border: `1.5px solid ${unlocked ? 'var(--bd-gold)' : 'var(--color-outline)'}`,
                            boxShadow: unlocked ? 'var(--bd-shadow, 3px 3px 0 #050E1A)' : 'none',
                            opacity: unlocked ? 1 : 0.65,
                            transition: 'all 0.2s ease',
                        }}
                    >
                        <div style={{ width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 'var(--space-2)' }}>
                            <Icon name={badge.icon} size={36} color={unlocked ? 'var(--bd-gold)' : 'var(--bd-slate)'} />
                        </div>

                        <div>
                            <div style={{ font: 'var(--text-title-sm)', fontWeight: 700, color: unlocked ? 'var(--bd-white)' : 'var(--bd-slate)' }}>
                                {badge.name}
                            </div>
                            <div style={{ font: 'var(--text-body-sm)', fontSize: '0.72rem', color: 'var(--bd-slate)', margin: '4px 0 var(--space-2)' }}>
                                {badge.desc}
                            </div>
                        </div>

                        {unlocked ? (
                            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.7rem', color: 'var(--bd-teal)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Icon name="check" size={12} color="var(--bd-teal)" /> تم الاستحقاق
                                </span>
                                <PixelCardExporter
                                    title={`وسام إيماني: ${badge.name}`}
                                    bodyText={`بفضل الله وتوفيقه، تم استحقاق «${badge.name}» في تطبيق دعوة — ${badge.desc}`}
                                    sourceText="تطبيق دعوة · رفيقك الإيماني اليومي"
                                    buttonLabel="مشاركة"
                                />
                            </div>
                        ) : (
                            <span style={{ fontSize: '0.7rem', color: 'var(--bd-slate)', opacity: 0.8 }}>
                                قيد الإنجاز
                            </span>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

import React from 'react';
import Icon, { Nuqta } from './Icon';
import { DaawaEmblem } from './DaawaLogo';

export default function SplashScreen({ onClose }) {
    return (
        <div className="splash-screen" style={{ cursor: 'default' }}>
            <div
                className="anim-float"
                style={{
                    width: '100px',
                    height: '100px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'radial-gradient(circle at 35% 35%, #16365C, #0B1F3A)',
                    borderRadius: '0px',
                    border: '2px solid var(--bd-teal, #0FB5AE)',
                    boxShadow: '4px 4px 0 #050E1A',
                }}
            >
                <DaawaEmblem size={64} />
            </div>

            <div style={{ textAlign: 'center' }}>
                <h1 className="splash-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    دعوة
                    <Nuqta size={12} />
                </h1>
                <p className="splash-subtitle" style={{ color: 'var(--bd-teal-300)', marginTop: '4px' }}>
                    رفيقك الإيماني اليومي
                </p>
            </div>

            <div className="splash-tip anim-scale-in" style={{ maxWidth: '340px', marginTop: 'var(--space-2)' }}>
                <p className="tip-text" style={{ font: 'var(--text-body-md)', color: 'var(--bd-white)' }}>
                    "وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا وَيَرْزُقْهُ مِنْ حَيْثُ لَا يَحْتَسِبُ"
                </p>
                <p className="tip-source" style={{ color: 'var(--bd-gold)' }}>
                    — سورة الطلاق: 2-3
                </p>
            </div>

            <button className="splash-enter-btn" onClick={onClose} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>ابدأ يومك في دعوة</span>
                <Icon name="arrow_forward" size={18} color="var(--bd-navy)" />
            </button>
        </div>
    );
}

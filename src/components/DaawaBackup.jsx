import React, { useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import Icon, { Nuqta } from './Icon';

export default function DaawaBackup() {
    const { state, dispatch } = useApp();
    const fileInputRef = useRef(null);
    const [msg, setMsg] = useState('');

    const handleExport = () => {
        const backupData = {
            app: 'daawa',
            version: '2.0',
            exportedAt: new Date().toISOString(),
            state: {
                userName: state.userName,
                userId: state.userId,
                totalPoints: state.totalPoints,
                history: state.history,
                stats: state.stats,
                prayerStreak: state.prayerStreak,
                quranStreak: state.quranStreak,
                streakRepairsLeft: state.streakRepairsLeft,
                quranBookmarks: state.quranBookmarks,
                completedSurahs: state.completedSurahs,
                totalPagesRead: state.totalPagesRead,
                qadaaPrayers: state.qadaaPrayers,
                qadaaFulfilled: state.qadaaFulfilled,
                qadaaFasting: state.qadaaFasting,
                qadaaFastingFulfilled: state.qadaaFastingFulfilled,
                tadabburNotes: state.tadabburNotes,
                theme: state.theme
            }
        };

        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(backupData, null, 2))}`;
        const downloadAnchor = document.createElement('a');
        const filename = `daawa_backup_${state.userName || 'user'}_${new Date().toISOString().slice(0, 10)}.daawa`;

        downloadAnchor.setAttribute('href', jsonString);
        downloadAnchor.setAttribute('download', filename);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();

        setMsg('تم تصدير ملف النسخة الاحتياطية (.daawa) بنجاح!');
        setTimeout(() => setMsg(''), 3000);
    };

    const handleImportFile = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const parsed = JSON.parse(event.target.result);
                if (parsed.app !== 'daawa' || !parsed.state) {
                    alert('الملف غير صالح أو لا يتبع صيغة تطبيق دعوة!');
                    return;
                }

                if (window.confirm(`هل أنت متأكد من استعادة بيانات النسخة الاحتياطية الخاصة بـ (${parsed.state.userName || 'المستخدم'})؟`)) {
                    dispatch({ type: 'IMPORT_DAAWA_BACKUP', payload: parsed.state });
                    setMsg('تم استيراد واستعادة كامل بياناتك وسجلاتك بنجاح!');
                    setTimeout(() => setMsg(''), 3000);
                }
            } catch (err) {
                alert('فشل قراءة الملف. تأكد من سلامة ملف .daawa');
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="card-glow anim-fade-in" style={{
            padding: '20px',
            border: '2px solid var(--bd-black)',
            boxShadow: '4px 4px 0 var(--bd-black)',
            background: 'var(--color-surface)',
            marginBottom: '16px'
        }}>
            <div className="flex-between mb-12" style={{ borderBottom: '2px solid var(--border-color)', paddingBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Nuqta size={8} />
                    <Icon name="cloud_download" size={22} color="var(--bd-teal)" />
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: 'var(--color-text)' }}>
                        النسخ الاحتياطي والاستعادة (.daawa)
                    </h3>
                </div>
            </div>

            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-dim)', fontWeight: 700, margin: '0 0 14px', lineHeight: '1.6' }}>
                احفظ سجلك الإيماني، أورادك، أوسمتك، وخواطر التدبر في ملف آمن خاص بك على جهازك، وانقلها إلى أي جهاز آخر في ثوانٍ.
            </p>

            {msg && (
                <div style={{
                    padding: '10px',
                    background: 'rgba(15, 181, 174, 0.15)',
                    border: '1.5px solid var(--bd-teal)',
                    color: 'var(--bd-teal)',
                    fontSize: '0.85rem',
                    fontWeight: 800,
                    marginBottom: '12px',
                    textAlign: 'center'
                }}>
                    {msg}
                </div>
            )}

            <div style={{ display: 'flex', gap: '10px' }}>
                <button
                    className="btn"
                    onClick={handleExport}
                    style={{
                        flex: 1,
                        padding: '10px',
                        border: '2px solid var(--bd-black)',
                        background: 'var(--bd-teal)',
                        color: '#000',
                        fontWeight: 800,
                        fontSize: '0.85rem',
                        boxShadow: '2px 2px 0 var(--bd-black)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                    }}
                >
                    <Icon name="file_download" size={16} color="#000" />
                    <span>تصدير ملف .daawa</span>
                </button>

                <button
                    className="btn"
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                        flex: 1,
                        padding: '10px',
                        border: '2px solid var(--bd-black)',
                        background: 'var(--color-surface-card)',
                        color: 'var(--color-text)',
                        fontWeight: 800,
                        fontSize: '0.85rem',
                        boxShadow: '2px 2px 0 var(--bd-black)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                    }}
                >
                    <Icon name="file_upload" size={16} color="var(--bd-teal)" />
                    <span>استيراد ملف .daawa</span>
                </button>

                <input
                    type="file"
                    ref={fileInputRef}
                    accept=".daawa,.json"
                    onChange={handleImportFile}
                    style={{ display: 'none' }}
                />
            </div>
        </div>
    );
}

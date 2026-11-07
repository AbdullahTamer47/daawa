import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import Icon, { Nuqta, PixelAvatar } from './Icon';
import { db } from '../firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

/**
 * Pixel Mishkat SVG Component
 * An authentic pixel-art lantern conforming to bedigital 24-grid language
 * The lantern illumination increases with collective squad prayers
 */
export function PixelMishkat({ ratio = 0.5, size = 120, className = '' }) {
    const clamped = Math.max(0, Math.min(1, ratio));
    const gold = '#F5B838';
    const teal = '#0FB5AE';
    const darkNavy = '#071526';
    const flameColor = clamped >= 0.8 ? gold : clamped >= 0.4 ? teal : '#25446B';
    const glowRadius = Math.round(clamped * 20);

    return (
        <svg
            width={size}
            height={size * 1.3}
            viewBox="0 0 48 64"
            fill="none"
            className={`pixel-mishkat ${className}`}
            style={{
                filter: `drop-shadow(0 0 ${glowRadius}px ${clamped > 0.3 ? 'rgba(245, 184, 56, 0.5)' : 'none'})`,
                display: 'inline-block',
                transition: 'filter 0.5s ease',
            }}
        >
            {/* Hanging Ring & Chain (2-unit stroke, stepped) */}
            <rect x="22" y="2" width="4" height="4" stroke="currentColor" strokeWidth="2" fill="none" />
            <line x1="24" y1="6" x2="24" y2="12" stroke="currentColor" strokeWidth="2" strokeDasharray="2 2" />

            {/* Lantern Cap (Stepped Minaret Roof) */}
            <path
                d="M20 12 H28 V15 H32 V18 H36 V22 H12 V18 H16 V15 H20 Z"
                stroke="currentColor"
                strokeWidth="2"
                fill="#0B1F3A"
                strokeLinejoin="miter"
            />
            {/* Gold Nuqta atop cap */}
            <polygon points="24,14 26,16 24,18 22,16" fill={gold} />

            {/* Glass Cage Interior */}
            <rect x="10" y="22" width="28" height="26" fill={darkNavy} stroke="#2D4D75" strokeWidth="2" />

            {/* Cage Vertical Brass Bars */}
            <line x1="16" y1="22" x2="16" y2="48" stroke="#1E3858" strokeWidth="2" />
            <line x1="24" y1="22" x2="24" y2="48" stroke="#1E3858" strokeWidth="2" />
            <line x1="32" y1="22" x2="32" y2="48" stroke="#1E3858" strokeWidth="2" />

            {/* Collective Flame (Pixel Stair Flame - Grows with ratio) */}
            {clamped > 0 && (
                <g style={{ transition: 'all 0.4s ease' }}>
                    {/* Flame Core */}
                    <path
                        d="M24 26 L28 34 H20 Z"
                        fill={gold}
                        opacity={clamped > 0.6 ? 1 : 0.7}
                    />
                    {/* Outer Flame Glow */}
                    <path
                        d="M24 30 L30 42 H18 Z"
                        fill={flameColor}
                        opacity={0.85}
                    />
                    {/* Teal Fuel Basin Reflection */}
                    <rect x="18" y="44" width="12" height="3" fill={teal} />
                </g>
            )}

            {/* Lantern Base (Stepped Pedestal) */}
            <path
                d="M12 48 H36 V52 H32 V56 H16 V52 H12 Z"
                stroke="currentColor"
                strokeWidth="2"
                fill="#0B1F3A"
                strokeLinejoin="miter"
            />
            {/* Trailing Pixel Dissolve Dots */}
            <rect x="38" y="48" width="2" height="2" fill={teal} />
            <rect x="42" y="52" width="2" height="2" fill={teal} opacity="0.6" />
        </svg>
    );
}

export default function MicroSquads() {
    const { state } = useApp();
    const [squad, setSquad] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('daawa_my_squad')) || null;
        } catch { return null; }
    });

    const [joinCodeInput, setJoinCodeInput] = useState('');
    const [newSquadName, setNewSquadName] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [isJoining, setIsJoining] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [copied, setCopied] = useState(false);

    // Creator management states
    const [isEditingName, setIsEditingName] = useState(false);
    const [editedName, setEditedName] = useState('');
    const [showAddMember, setShowAddMember] = useState(false);
    const [newMemberName, setNewMemberName] = useState('');

    // Subscribe to live squad updates if connected
    useEffect(() => {
        if (!squad?.code) return;

        let unsub = null;
        try {
            const squadRef = doc(db, 'squads', squad.code);
            unsub = onSnapshot(squadRef, (docSnap) => {
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setSquad(data);
                    localStorage.setItem('daawa_my_squad', JSON.stringify(data));
                }
            });
        } catch (e) {
            console.warn('Squad live listener unavailable, using local mode:', e);
        }

        return () => { if (unsub) unsub(); };
    }, [squad?.code]);

    // Count today's completed prayers for current user
    const userCompletedPrayersCount = Object.values(state.prayers || {}).filter(Boolean).length;

    // Check if current user is the Squad Creator / Leader
    const isCreator = Boolean(
        squad && (
            squad.creatorId === state.userId ||
            squad.creatorId === 'me' ||
            (!squad.creatorId && squad.members?.[0]?.userId === state.userId)
        )
    );

    // Create New Squad (Capacity: 10)
    const handleCreateSquad = async (e) => {
        e.preventDefault();
        const name = newSquadName.trim() || 'صحبة الخير';
        const code = Math.floor(100000 + Math.random() * 900000).toString();

        const initialSquad = {
            code,
            name,
            creatorId: state.userId || 'me',
            creatorName: state.userName || 'أنا',
            createdAt: new Date().toISOString(),
            capacity: 10,
            members: [
                {
                    userId: state.userId || 'me',
                    name: state.userName || 'أنا',
                    prayersToday: userCompletedPrayersCount,
                    points: state.totalPoints || 0,
                    joinedAt: new Date().toISOString(),
                    role: 'creator',
                }
            ],
        };

        try {
            await setDoc(doc(db, 'squads', code), initialSquad);
        } catch { /* offline fallback */ }

        setSquad(initialSquad);
        localStorage.setItem('daawa_my_squad', JSON.stringify(initialSquad));
        setIsCreating(false);
        setNewSquadName('');
    };

    // Join Squad with 6-digit Code (Capacity: up to 10)
    const handleJoinSquad = async (e) => {
        e.preventDefault();
        const code = joinCodeInput.trim();
        if (code.length !== 6) {
            setErrorMsg('الكود يتكون من 6 أرقام');
            return;
        }

        setErrorMsg('');
        try {
            const squadRef = doc(db, 'squads', code);
            const snap = await getDoc(squadRef);

            if (!snap.exists()) {
                setErrorMsg('الحلقة غير موجودة! تأكد من الكود');
                return;
            }

            const currentData = snap.data();
            const members = currentData.members || [];
            const capacity = currentData.capacity || 10;

            if (members.length >= capacity) {
                setErrorMsg(`اكتملت هذه الحلقة (الحد الأقصى ${capacity} أفراد)`);
                return;
            }

            const alreadyIn = members.some(m => m.userId === state.userId);
            if (!alreadyIn) {
                members.push({
                    userId: state.userId || 'me',
                    name: state.userName || 'أنا',
                    prayersToday: userCompletedPrayersCount,
                    points: state.totalPoints || 0,
                    joinedAt: new Date().toISOString(),
                    role: 'member',
                });
                await setDoc(squadRef, { ...currentData, members }, { merge: true });
            }

            setSquad(currentData);
            localStorage.setItem('daawa_my_squad', JSON.stringify(currentData));
            setIsJoining(false);
            setJoinCodeInput('');
        } catch (err) {
            // Offline demo fallback
            const demoSquad = {
                code,
                name: 'حلقة الصحبة المباركة',
                creatorId: 'comp_1',
                capacity: 10,
                members: [
                    { userId: state.userId, name: state.userName, prayersToday: userCompletedPrayersCount, points: state.totalPoints, role: 'member' },
                    { userId: 'comp_1', name: 'أحمد', prayersToday: 4, points: 340, role: 'creator' },
                    { userId: 'comp_2', name: 'عمر', prayersToday: 5, points: 410, role: 'member' },
                    { userId: 'comp_3', name: 'بلال', prayersToday: 3, points: 290, role: 'member' },
                ],
            };
            setSquad(demoSquad);
            localStorage.setItem('daawa_my_squad', JSON.stringify(demoSquad));
            setIsJoining(false);
        }
    };

    // Creator Action: Rename Squad
    const handleSaveSquadName = async () => {
        const trimmed = editedName.trim();
        if (!trimmed || !squad) return;

        const updatedSquad = { ...squad, name: trimmed };
        try {
            await setDoc(doc(db, 'squads', squad.code), { name: trimmed }, { merge: true });
        } catch {}

        setSquad(updatedSquad);
        localStorage.setItem('daawa_my_squad', JSON.stringify(updatedSquad));
        setIsEditingName(false);
    };

    // Creator Action: Remove / Kick a Member
    const handleRemoveMember = async (memberUserId, memberName) => {
        if (!squad) return;
        if (!confirm(`هل تريد بالتأكيد إزالة "${memberName}" من الحلقة؟`)) return;

        const updatedMembers = squad.members.filter(m => m.userId !== memberUserId);
        const updatedSquad = { ...squad, members: updatedMembers };

        try {
            await setDoc(doc(db, 'squads', squad.code), { members: updatedMembers }, { merge: true });
        } catch {}

        setSquad(updatedSquad);
        localStorage.setItem('daawa_my_squad', JSON.stringify(updatedSquad));
    };

    // Creator Action: Add Member Manually
    const handleAddMember = async (e) => {
        e.preventDefault();
        const trimmed = newMemberName.trim();
        if (!trimmed || !squad) return;

        const capacity = squad.capacity || 10;
        if (squad.members.length >= capacity) {
            alert(`الحلقة مكتملة بالفعل (الحد الأقصى ${capacity} أفراد)`);
            return;
        }

        const newMember = {
            userId: 'usr_' + Math.floor(100000 + Math.random() * 900000),
            name: trimmed,
            prayersToday: 0,
            points: 0,
            joinedAt: new Date().toISOString(),
            role: 'member',
        };

        const updatedMembers = [...squad.members, newMember];
        const updatedSquad = { ...squad, members: updatedMembers };

        try {
            await setDoc(doc(db, 'squads', squad.code), { members: updatedMembers }, { merge: true });
        } catch {}

        setSquad(updatedSquad);
        localStorage.setItem('daawa_my_squad', JSON.stringify(updatedSquad));
        setNewMemberName('');
        setShowAddMember(false);
    };

    // Calculate Collective Illumination
    const members = squad?.members || [];
    const capacity = squad?.capacity || 10;
    const totalPossiblePrayers = members.length * 5;
    const totalDonePrayers = members.reduce(
        (sum, m) => sum + (m.userId === state.userId ? userCompletedPrayersCount : (m.prayersToday || 0)),
        0
    );
    const illuminationRatio = totalPossiblePrayers > 0 ? (totalDonePrayers / totalPossiblePrayers) : 0;
    const illuminationPct = Math.round(illuminationRatio * 100);

    const handleCopyCode = () => {
        if (!squad?.code) return;
        navigator.clipboard.writeText(squad.code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleLeaveSquad = () => {
        if (confirm('هل تريد مغادرة هذه الحلقة؟')) {
            setSquad(null);
            localStorage.removeItem('daawa_my_squad');
        }
    };

    return (
        <div className="card-glow mb-5 anim-fade-in" style={{ padding: 'var(--space-5)' }}>
            {/* Header */}
            <div className="flex-between mb-4">
                <div>
                    <h2 style={{ font: 'var(--text-title-lg)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-on-surface)' }}>
                        <Icon name="volunteer_activism" size={24} color="var(--bd-teal)" />
                        حلقات الصحبة المصغرة
                        <span
                            style={{
                                font: 'var(--text-pixel)',
                                fontSize: '0.65rem',
                                color: 'var(--bd-gold)',
                                border: '1px solid var(--bd-gold)',
                                padding: '2px 6px',
                                background: 'rgba(245, 184, 56, 0.1)',
                            }}
                        >
                            حتى 10 أفراد
                        </span>
                    </h2>
                    <p style={{ font: 'var(--text-body-sm)', color: 'var(--color-on-surface-variant)', opacity: 0.9, margin: '4px 0 0' }}>
                        مشكاة إيمانية مشتركة تضيء بفرائضكم دون كشف التقصير
                    </p>
                </div>

                {squad && (
                    <button onClick={handleLeaveSquad} className="btn-icon" title="مغادرة الحلقة">
                        <Icon name="logout" size={18} color="var(--color-error)" />
                    </button>
                )}
            </div>

            {/* SQUAD ACTIVE VIEW */}
            {squad ? (
                <div>
                    {/* Visual Mishkat Centerpiece */}
                    <div
                        style={{
                            background: 'radial-gradient(ellipse at center, #132D50 0%, #09182C 100%)',
                            border: '1.5px solid var(--bd-teal)',
                            boxShadow: 'var(--bd-shadow, 4px 4px 0px #050E1A)',
                            padding: 'var(--space-5) var(--space-4)',
                            textAlign: 'center',
                            marginBottom: 'var(--space-4)',
                            color: '#FFFFFF',
                        }}
                    >
                        <PixelMishkat ratio={illuminationRatio} size={110} />

                        <div style={{ marginTop: 'var(--space-3)' }}>
                            {isEditingName ? (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', maxWidth: '280px', margin: '0 auto' }}>
                                    <input
                                        type="text"
                                        value={editedName}
                                        onChange={(e) => setEditedName(e.target.value)}
                                        style={{
                                            background: '#0B1F3A',
                                            color: '#FFFFFF',
                                            border: '1px solid var(--bd-gold)',
                                            padding: '4px 8px',
                                            fontSize: '0.95rem',
                                            textAlign: 'center',
                                            width: '100%',
                                        }}
                                        autoFocus
                                    />
                                    <button onClick={handleSaveSquadName} className="btn btn-filled" style={{ padding: '4px 8px' }}>
                                        <Icon name="check" size={14} />
                                    </button>
                                    <button onClick={() => setIsEditingName(false)} className="btn btn-outlined" style={{ padding: '4px 8px' }}>
                                        <Icon name="close" size={14} />
                                    </button>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                    <span style={{ font: 'var(--text-title-md)', fontWeight: 800, color: '#FFFFFF' }}>
                                        {squad.name}
                                    </span>
                                    {isCreator && (
                                        <button
                                            onClick={() => { setEditedName(squad.name); setIsEditingName(true); }}
                                            className="btn-icon"
                                            title="تعديل اسم الحلقة"
                                            style={{ width: '24px', height: '24px', background: 'transparent' }}
                                        >
                                            <Icon name="edit" size={14} color="var(--bd-gold)" />
                                        </button>
                                    )}
                                </div>
                            )}

                            <div style={{ font: 'var(--text-pixel)', fontSize: '0.8rem', color: 'var(--bd-gold)', marginTop: '4px' }}>
                                مشكاة اليوم: {totalDonePrayers} من {totalPossiblePrayers} فريضة ({illuminationPct}%)
                            </div>
                        </div>

                        {/* Progress Bar of Light */}
                        <div className="progress-bar mt-3" style={{ height: '8px', background: 'rgba(255,255,255,0.08)' }}>
                            <div
                                className="fill"
                                style={{
                                    width: `${illuminationPct}%`,
                                    background: illuminationPct >= 80 ? 'var(--bd-gold)' : 'var(--bd-teal)',
                                }}
                            />
                        </div>

                        <p style={{ font: 'var(--text-body-sm)', color: '#CBD5E1', marginTop: 'var(--space-2)', opacity: 0.9 }}>
                            {illuminationPct >= 100
                                ? 'ما شاء الله! اكتمل نور المشكاة اليومي بالصحبة الصالحة'
                                : 'كل صلاة فريضة يؤديها أحدكم تزيد المشكاة نوراً وضياءً'}
                        </p>
                    </div>

                    {/* Invite Code Strip */}
                    <div
                        className="flex-between mb-4"
                        style={{
                            background: 'rgba(15, 181, 174, 0.1)',
                            border: '1.5px dashed var(--bd-teal)',
                            padding: '8px 12px',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ font: 'var(--text-body-sm)', color: 'var(--color-on-surface-variant)' }}>كود الحلقة:</span>
                            <span style={{ font: 'var(--text-pixel)', fontSize: '1.15rem', fontWeight: 800, color: 'var(--bd-gold)', letterSpacing: '3px' }}>
                                {squad.code}
                            </span>
                        </div>
                        <button onClick={handleCopyCode} className="btn btn-outlined" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
                            <Icon name={copied ? 'done' : 'content_copy'} size={14} color="var(--bd-teal)" />
                            <span>{copied ? 'تم النسخ' : 'دعوة رفيق (نسخ الكود)'}</span>
                        </button>
                    </div>

                    {/* Creator Controls Banner */}
                    {isCreator && (
                        <div
                            style={{
                                background: 'rgba(245, 184, 56, 0.1)',
                                border: '1px solid var(--bd-gold)',
                                padding: '8px 12px',
                                marginBottom: 'var(--space-3)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                flexWrap: 'wrap',
                                gap: '8px',
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Icon name="admin_panel_settings" size={16} color="var(--bd-gold)" />
                                <span style={{ font: 'var(--text-label-sm)', color: 'var(--bd-gold)', fontWeight: 700 }}>
                                    أنت منشئ الحلقة (صلاحيات التعديل وإدارة الرفقاء مفعّلة)
                                </span>
                            </div>

                            {members.length < capacity && (
                                <button
                                    onClick={() => setShowAddMember(!showAddMember)}
                                    className="btn btn-filled"
                                    style={{ padding: '3px 10px', fontSize: '0.75rem' }}
                                >
                                    <Icon name={showAddMember ? 'close' : 'person_add'} size={14} />
                                    <span>{showAddMember ? 'إلغاء' : 'إضافة رفيق يدوياً'}</span>
                                </button>
                            )}
                        </div>
                    )}

                    {/* Add Member Form (Creator Only) */}
                    {isCreator && showAddMember && (
                        <form
                            onSubmit={handleAddMember}
                            className="card mb-4 anim-slide-down"
                            style={{
                                background: 'var(--color-surface-container)',
                                border: '1.5px solid var(--bd-teal)',
                                padding: 'var(--space-3)',
                            }}
                        >
                            <div style={{ font: 'var(--text-title-sm)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>
                                إضافة رفيق جديد إلى الحلقة ({members.length}/{capacity}):
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <input
                                    type="text"
                                    value={newMemberName}
                                    onChange={(e) => setNewMemberName(e.target.value)}
                                    placeholder="اسم الرفيق (مثال: عبدالله، مصطفى...)"
                                    style={{
                                        flex: 1,
                                        background: 'var(--color-surface)',
                                        color: 'var(--color-on-surface)',
                                        border: '1px solid var(--color-outline)',
                                        padding: '6px 10px',
                                    }}
                                    autoFocus
                                    required
                                />
                                <button type="submit" className="btn btn-filled" style={{ padding: '6px 14px' }}>
                                    <Icon name="check" size={16} />
                                    <span>إضافة</span>
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Squad Members List */}
                    <div>
                        <div className="flex-between mb-2">
                            <span style={{ font: 'var(--text-title-sm)', color: 'var(--color-on-surface)', fontWeight: 700 }}>
                                رفقاء الحلقة ({members.length}/{capacity})
                            </span>
                            <span style={{ font: 'var(--text-label-sm)', color: 'var(--bd-teal)', fontWeight: 600 }}>
                                نور الصحبة
                            </span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                            {members.map((m, idx) => {
                                const isMe = m.userId === state.userId;
                                const isMemberCreator = m.role === 'creator' || m.userId === squad.creatorId;

                                return (
                                    <div
                                        key={m.userId || idx}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            background: isMe ? 'rgba(15, 181, 174, 0.12)' : 'var(--color-surface)',
                                            border: isMe ? '1.5px solid var(--bd-teal)' : '1px solid var(--color-outline)',
                                            padding: '8px 12px',
                                            transition: 'all 0.15s ease',
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <PixelAvatar size={32} borderColor={isMe ? 'var(--bd-gold)' : 'var(--bd-teal)'}>
                                                <span style={{ font: 'var(--text-pixel)', fontSize: '0.75rem', fontWeight: 700 }}>
                                                    {m.name?.[0] || 'ص'}
                                                </span>
                                            </PixelAvatar>
                                            <div>
                                                <div style={{ font: 'var(--text-title-sm)', fontWeight: 600, color: 'var(--color-on-surface)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <span>{m.name}</span>
                                                    {isMe && <span style={{ color: 'var(--bd-teal)', fontSize: '0.75rem' }}>(أنت)</span>}
                                                    {isMemberCreator && (
                                                        <span
                                                            style={{
                                                                font: 'var(--text-pixel)',
                                                                fontSize: '0.6rem',
                                                                color: 'var(--bd-gold)',
                                                                background: 'rgba(245, 184, 56, 0.15)',
                                                                padding: '1px 5px',
                                                                border: '1px solid var(--bd-gold)',
                                                            }}
                                                        >
                                                            المنشئ
                                                        </span>
                                                    )}
                                                </div>
                                                <div style={{ font: 'var(--text-pixel)', fontSize: '0.65rem', color: 'var(--bd-slate)', marginTop: '2px' }}>
                                                    {m.points || 0} نقطة تراكمية
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span className="chip active" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>
                                                مشارك بالنور
                                            </span>

                                            {/* Creator delete member button (cannot delete themselves) */}
                                            {isCreator && !isMe && (
                                                <button
                                                    onClick={() => handleRemoveMember(m.userId, m.name)}
                                                    className="btn-icon"
                                                    title={`استبعاد ${m.name} من الحلقة`}
                                                    style={{
                                                        width: '28px',
                                                        height: '28px',
                                                        border: '1px solid rgba(255, 180, 171, 0.4)',
                                                        background: 'rgba(255, 180, 171, 0.08)',
                                                        color: 'var(--color-error)',
                                                    }}
                                                >
                                                    <Icon name="person_remove" size={14} color="var(--color-error)" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            ) : (
                /* NO SQUAD - ACTION TO CREATE OR JOIN */
                <div>
                    {!isCreating && !isJoining ? (
                        <div style={{ textAlign: 'center', padding: 'var(--space-4) 0' }}>
                            <PixelMishkat ratio={0.2} size={84} />
                            <p style={{ font: 'var(--text-body-md)', color: 'var(--color-on-surface)', margin: 'var(--space-3) 0 var(--space-2)' }}>
                                ابنِ مع 3 إلى 10 من أصدقائك أو أسرتك حلقة إيمانية خاصة
                            </p>
                            <p style={{ font: 'var(--text-body-sm)', color: 'var(--bd-slate)', margin: '0 0 var(--space-4)', maxWidth: '340px', marginLeft: 'auto', marginRight: 'auto' }}>
                                تضيء مشكاتكم الجماعية مع كل فريضة يؤديها أحدكم، بتشجيع وتنافس محمود حتى 10 أفراد
                            </p>

                            <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'center' }}>
                                <button className="btn btn-filled" onClick={() => setIsCreating(true)}>
                                    <Icon name="add" size={16} /> إنشاء حلقة جديدة
                                </button>
                                <button className="btn btn-outlined" onClick={() => setIsJoining(true)}>
                                    <Icon name="login" size={16} /> انضمام بكود
                                </button>
                            </div>
                        </div>
                    ) : isCreating ? (
                        <form onSubmit={handleCreateSquad} style={{ padding: 'var(--space-2) 0' }}>
                            <div className="input-field mb-3">
                                <label>اسم الحلقة الإيمانية (تتسع حتى 10 أفراد)</label>
                                <input
                                    type="text"
                                    value={newSquadName}
                                    onChange={(e) => setNewSquadName(e.target.value)}
                                    placeholder="مثال: صحبة الفردوس، أسرتنا..."
                                    autoFocus
                                    required
                                />
                            </div>
                            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                                <button type="submit" className="btn btn-filled flex-1">
                                    <Icon name="check" size={16} /> تأكيد وإنشاء (10 رفقاء)
                                </button>
                                <button type="button" className="btn btn-outlined" onClick={() => setIsCreating(false)}>
                                    إلغاء
                                </button>
                            </div>
                        </form>
                    ) : (
                        <form onSubmit={handleJoinSquad} style={{ padding: 'var(--space-2) 0' }}>
                            <div className="input-field mb-3">
                                <label>أدخل كود الحلقة (6 أرقام)</label>
                                <input
                                    type="text"
                                    value={joinCodeInput}
                                    onChange={(e) => setJoinCodeInput(e.target.value)}
                                    placeholder="مثال: 742918"
                                    maxLength={6}
                                    autoFocus
                                    style={{ letterSpacing: '4px', textAlign: 'center', font: 'var(--text-pixel)', fontSize: '1.2rem', fontWeight: 'bold' }}
                                    required
                                />
                            </div>

                            {errorMsg && (
                                <p style={{ color: 'var(--bd-error)', fontSize: '0.8rem', textAlign: 'center', margin: '0 0 var(--space-2)' }}>
                                    {errorMsg}
                                </p>
                            )}

                            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                                <button type="submit" className="btn btn-filled flex-1">
                                    <Icon name="login" size={16} /> انضم للحلقة
                                </button>
                                <button type="button" className="btn btn-outlined" onClick={() => { setIsJoining(false); setErrorMsg(''); }}>
                                    إلغاء
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            )}
        </div>
    );
}

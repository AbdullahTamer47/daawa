import React, { useState, useEffect, useRef } from 'react';
import Icon from '../Icon';

export default function AmbientSoundMixer() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [soundType, setSoundType] = useState('rain'); // 'rain' | 'breeze' | 'stream'
    const [volume, setVolume] = useState(0.3);

    const audioCtxRef = useRef(null);
    const gainNodeRef = useRef(null);
    const sourceNodesRef = useRef([]);

    // Stop sounds on unmount
    useEffect(() => {
        return () => {
            stopAudio();
        };
    }, []);

    // Update volume if playing
    useEffect(() => {
        if (gainNodeRef.current && audioCtxRef.current) {
            gainNodeRef.current.gain.setValueAtTime(volume, audioCtxRef.current.currentTime);
        }
    }, [volume]);

    // Handle sound type switch while playing
    useEffect(() => {
        if (isPlaying) {
            stopAudio();
            startAudio(soundType);
        }
    }, [soundType]);

    const stopAudio = () => {
        sourceNodesRef.current.forEach(node => {
            try { node.stop(); } catch { /* ignore */ }
            try { node.disconnect(); } catch { /* ignore */ }
        });
        sourceNodesRef.current = [];

        if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
            audioCtxRef.current.close().catch(() => {});
            audioCtxRef.current = null;
        }
        setIsPlaying(false);
    };

    const startAudio = (type) => {
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtx) return;
            const ctx = new AudioCtx();
            audioCtxRef.current = ctx;

            const masterGain = ctx.createGain();
            masterGain.gain.setValueAtTime(volume, ctx.currentTime);
            masterGain.connect(ctx.destination);
            gainNodeRef.current = masterGain;

            // Generate synthetic ambient soundscape using noise and filters
            const bufferSize = ctx.sampleRate * 2;
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);

            // Pink / Brown noise synthesis
            let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
            for (let i = 0; i < bufferSize; i++) {
                const white = Math.random() * 2 - 1;
                b0 = 0.99886 * b0 + white * 0.0555179;
                b1 = 0.99332 * b1 + white * 0.0750759;
                b2 = 0.96900 * b2 + white * 0.1538520;
                b3 = 0.86650 * b3 + white * 0.3104856;
                b4 = 0.55000 * b4 + white * 0.5329522;
                b5 = -0.7616 * b5 - white * 0.0168980;
                data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
                b6 = white * 0.115926;
            }

            const noiseSource = ctx.createBufferSource();
            noiseSource.buffer = buffer;
            noiseSource.loop = true;

            const filter = ctx.createBiquadFilter();

            if (type === 'rain') {
                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(1000, ctx.currentTime);
            } else if (type === 'breeze') {
                filter.type = 'bandpass';
                filter.frequency.setValueAtTime(450, ctx.currentTime);
                filter.Q.setValueAtTime(1.5, ctx.currentTime);
            } else {
                // stream / water
                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(700, ctx.currentTime);
            }

            noiseSource.connect(filter);
            filter.connect(masterGain);
            noiseSource.start();

            sourceNodesRef.current = [noiseSource];
            setIsPlaying(true);

        } catch (err) {
            console.error('Audio mixer start error:', err);
        }
    };

    const togglePlay = () => {
        if (isPlaying) {
            stopAudio();
        } else {
            startAudio(soundType);
        }
    };

    return (
        <div style={{
            padding: '12px 16px',
            background: 'var(--color-surface)',
            border: '2px solid var(--bd-black)',
            boxShadow: '3px 3px 0 var(--bd-black)',
            marginBottom: '16px'
        }}>
            <div className="flex-between mb-8" style={{ flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '6px', height: '6px', background: 'var(--bd-teal)', transform: 'rotate(45deg)' }}></span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-text)' }}>
                        المزج الصوتي للخشوع (أصوات طبيعية هادئة)
                    </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {['rain', 'breeze', 'stream'].map(t => (
                        <button
                            key={t}
                            className="btn"
                            onClick={() => setSoundType(t)}
                            style={{
                                padding: '4px 8px',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                border: '1.5px solid var(--bd-black)',
                                background: soundType === t ? 'var(--bd-teal)' : 'var(--color-surface-card)',
                                color: soundType === t ? '#000' : 'var(--color-text)',
                                boxShadow: soundType === t ? '1px 1px 0 var(--bd-black)' : 'none'
                            }}
                        >
                            {t === 'rain' ? 'مطر' : (t === 'breeze' ? 'نسيم' : 'ماء')}
                        </button>
                    ))}
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                    className="btn"
                    onClick={togglePlay}
                    style={{
                        padding: '6px 14px',
                        border: '1.5px solid var(--bd-black)',
                        background: isPlaying ? 'var(--bd-coral)' : 'var(--bd-gold)',
                        color: isPlaying ? '#FFF' : '#000',
                        fontWeight: 800,
                        fontSize: '0.8rem',
                        boxShadow: '2px 2px 0 var(--bd-black)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                    }}
                >
                    <Icon name={isPlaying ? "pause" : "play_arrow"} size={16} color={isPlaying ? "#FFF" : "#000"} />
                    <span>{isPlaying ? 'إيقاف الخلفية' : 'تشغيل الخلفية'}</span>
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1 }}>
                    <Icon name="volume_down" size={16} color="var(--color-text-dim)" />
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={volume}
                        onChange={(e) => setVolume(parseFloat(e.target.value))}
                        style={{
                            flex: 1,
                            accentColor: 'var(--bd-teal)',
                            cursor: 'pointer'
                        }}
                    />
                    <Icon name="volume_up" size={16} color="var(--color-text-dim)" />
                </div>
            </div>
        </div>
    );
}

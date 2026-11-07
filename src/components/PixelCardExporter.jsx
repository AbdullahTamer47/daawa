import React, { useState } from 'react';
import Icon, { Nuqta } from './Icon';

/**
 * Pixel Card Exporter
 * Generates an exportable 1080x1920 (or 540x960) Story Card
 * Uses pure HTML5 Canvas for zero-dependency high-res rendering
 * Strictly adheres to bedigital Brand Guidelines (Page 6 Pattern & Page 7 Icons)
 */

export function generateStoryImage(title, bodyText, sourceText = '', type = 'hadith') {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        canvas.width = 1080;
        canvas.height = 1920;
        const ctx = canvas.getContext('2d');

        // 1. Deep Midnight Navy Background
        ctx.fillStyle = '#0B1F3A';
        ctx.fillRect(0, 0, 1080, 1920);

        // 2. Dark Slate Inner Container with Pixel Border
        ctx.fillStyle = '#0D223F';
        ctx.fillRect(60, 60, 960, 1800);
        ctx.lineWidth = 6;
        ctx.strokeStyle = '#0FB5AE'; // Signal Teal
        ctx.strokeRect(60, 60, 960, 1800);

        // 3. Pixel Corner Accents (bedigital Stair-Step Pattern)
        const drawPixelCorner = (x, y) => {
            ctx.fillStyle = '#0FB5AE';
            ctx.fillRect(x, y, 24, 24);
            ctx.fillRect(x + 24, y, 24, 24);
            ctx.fillRect(x, y + 24, 24, 24);
            ctx.fillStyle = '#E0A526'; // Gold Nuqta in corner
            ctx.fillRect(x + 24, y + 24, 24, 24);
        };
        drawPixelCorner(84, 84);
        drawPixelCorner(948, 84);
        drawPixelCorner(84, 1788);
        drawPixelCorner(948, 1788);

        // 4. Header: App Name & Logo
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 56px "Noto Kufi Arabic", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('تطبيق دعوة', 540, 220);

        // Subtitle Slogan
        ctx.fillStyle = '#7BD6D3';
        ctx.font = '500 28px "Space Grotesk", monospace';
        ctx.fillText('START WITH A DOT · رفيقك الإيماني اليومي', 540, 275);

        // Decorative Divider with Gold Diamond
        ctx.strokeStyle = '#0FB5AE';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(340, 320);
        ctx.lineTo(490, 320);
        ctx.moveTo(590, 320);
        ctx.lineTo(740, 320);
        ctx.stroke();

        // Gold Nuqta in Divider Center
        ctx.save();
        ctx.translate(540, 320);
        ctx.rotate(45 * Math.PI / 180);
        ctx.fillStyle = '#E0A526';
        ctx.fillRect(-12, -12, 24, 24);
        ctx.restore();

        // 5. Card Category Title
        ctx.fillStyle = '#E0A526';
        ctx.font = 'bold 42px "Noto Kufi Arabic", sans-serif';
        ctx.fillText(title, 540, 480);

        // 6. Main Body Text (Word wrapping for elegant Arabic typesetting)
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '500 48px "Noto Kufi Arabic", sans-serif';
        ctx.textAlign = 'center';

        const words = bodyText.split(' ');
        let line = '';
        let y = 640;
        const lineHeight = 84;
        const maxWidth = 800;

        for (let i = 0; i < words.length; i++) {
            const testLine = line + words[i] + ' ';
            const metrics = ctx.measureText(testLine);
            if (metrics.width > maxWidth && i > 0) {
                ctx.fillText(line, 540, y);
                line = words[i] + ' ';
                y += lineHeight;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line, 540, y);

        // 7. Source Attribution
        if (sourceText) {
            ctx.fillStyle = '#7BD6D3';
            ctx.font = '500 32px "Noto Kufi Arabic", sans-serif';
            ctx.fillText(`— ${sourceText}`, 540, y + 110);
        }

        // 8. Footer Brand Lockup (bedigital signature)
        const footerY = 1680;
        ctx.fillStyle = 'rgba(15, 181, 174, 0.15)';
        ctx.fillRect(180, footerY - 50, 720, 90);
        ctx.strokeStyle = '#0FB5AE';
        ctx.lineWidth = 2;
        ctx.strokeRect(180, footerY - 50, 720, 90);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 32px "Space Grotesk", sans-serif';
        ctx.fillText('bedigital · DIGITAL, WITH A NUQTA', 540, footerY + 8);

        resolve(canvas.toDataURL('image/png'));
    });
}

export default function PixelCardExporter({ title, bodyText, sourceText = '', buttonLabel = 'مشاركة كقصة (Story)' }) {
    const [generating, setGenerating] = useState(false);

    const handleExportAndShare = async () => {
        try {
            setGenerating(true);
            const dataUrl = await generateStoryImage(title, bodyText, sourceText);

            // Fetch as blob for native sharing if supported
            const blob = await (await fetch(dataUrl)).blob();
            const file = new File([blob], 'daawa-story.png', { type: 'image/png' });

            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: 'تطبيق دعوة | نفحة إيمانية',
                    text: `${bodyText} — عبر تطبيق دعوة`,
                });
            } else {
                // Direct download fallback
                const a = document.createElement('a');
                a.href = dataUrl;
                a.download = `daawa-${Date.now()}.png`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            }
        } catch (err) {
            console.error('Export error:', err);
        } finally {
            setGenerating(false);
        }
    };

    return (
        <button
            onClick={handleExportAndShare}
            className="btn btn-outlined"
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 12px',
                fontSize: '0.75rem',
                borderRadius: '0px',
                borderColor: 'var(--bd-teal)',
                color: 'var(--bd-teal)',
            }}
            disabled={generating}
        >
            <Icon name="campaign" size={14} color="var(--bd-teal)" />
            <span>{generating ? 'جاري التوليد...' : buttonLabel}</span>
        </button>
    );
}


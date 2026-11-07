import React, { useState, useRef } from 'react';
import Icon, { Nuqta } from './Icon';

/**
 * Semantic Comfort Search (الباحث الشعوري والدلالي)
 * Matches user's emotional and spiritual state with healing Quranic verses,
 * authentic hadiths, and supplications with instant audio playback.
 */

const COMFORT_DATABASE = [
    {
        id: 'chest_tightness',
        keywords: ['ضيق', 'هم', 'حزن', 'صدر', 'مهموم', 'خنقة', 'تعبان', 'ضيق الصدر'],
        title: 'ضيق الصدر وانقباض القلب',
        verse: {
            text: 'وَلَقَدْ نَعْلَمُ أَنَّكَ يَضِيقُ صَدْرُكَ بِمَا يَقُولُونَ ۝ فَسَبِّحْ بِحَمْدِ رَبِّكَ وَكُن مِّنَ السَّاجِدِينَ ۝ وَاعْبُدْ رَبَّكَ حَتَّىٰ يَأْتِيَكَ الْيَقِينُ',
            surah: 'سورة الحجر: 97-99',
            audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/1900.mp3',
        },
        hadith: 'قال ﷺ: «ما أصاب أحداً قط هم ولا حزن فقال: اللهم إني عبدك ابن عبدك ابن أمتك، ناصيتي بيدك، ماض في حكمك، عدل في قضاؤك... إلا أذهب الله همه وحزنه وأبدله مكانه فرجاً».',
        dua: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَالْعَجْزِ وَالْكَسَلِ، وَالْبُخْلِ وَالْجُبْنِ، وَضَلَعِ الدَّيْنِ، وَغَلَبَةِ الرِّجَالِ.',
        advice: 'علاج ضيق الصدر الرباني: التسبيح والسجود، فالسجود يفرغ شحنات الروح إلى الأرض، وذكر الله يوسع المدارك.',
    },
    {
        id: 'future_anxiety',
        keywords: ['خوف', 'قلق', 'مستقبل', 'رزق', 'مرعوب', 'خايف', 'القلق من المستقبل'],
        title: 'القلق من المستقبل والخوف من المجهول',
        verse: {
            text: 'قُل لَّن يُصِيبَنَا إِلَّا مَا كَتَبَ اللَّهُ لَنَا هُوَ مَوْلَانَا ۚ وَعَلَى اللَّهِ فَلْيَتَوَكَّلِ الْمُؤْمِنُونَ',
            surah: 'سورة التوبة: 51',
            audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/1286.mp3',
        },
        hadith: 'قال ﷺ لابن عباس: «واعلم أن الأمة لو اجتمعت على أن ينفعوك بشيء لم ينفعوك إلا بشيء قد كتبه الله لك، ولو اجتمعوا على أن يضروك بشيء لم يضروك إلا بشيء قد كتبه الله عليك، رفعت الأقلام وجفت الصحف».',
        dua: 'حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ، عَلَى اللَّهِ تَوَكَّلْنَا.',
        advice: 'المستقبل غيب بيد من يملك الرحمة كلها، تدبير الله لك خير من تدبيرك لنفسك، فوّض أمرك تسكن روحك.',
    },
    {
        id: 'distraction_focus',
        keywords: ['تشتت', 'تركيز', 'ذهن', 'وسواس', 'نسيان', 'تشتت الذهن'],
        title: 'تشتت الذهن وضعف التركيز والوسوسة',
        verse: {
            text: 'وَإِمَّا يَنزَغَنَّكَ مِنَ الشَّيْطَانِ نَزْغٌ فَاسْتَعِذْ بِاللَّهِ ۖ إِنَّهُ هُوَ السَّمِيعُ الْعَلِيمُ',
            surah: 'سورة فصلت: 36',
            audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/4254.mp3',
        },
        hadith: 'جاء عثمان بن أبي العاص للنبي ﷺ فقال: إن الشيطان قد حال بيني وبين صلاتي وقراءتي يلبسها عليّ. فقال رسول الله ﷺ: «ذاك شيطان يقال له خنزب، فإذا أحسسته فتعوذ بالله منه واتفل على يسارك ثلاثاً».',
        dua: 'رَبِّ أَعُوذُ بِكَ مِنْ هَمَزَاتِ الشَّيَاطِينِ ۝ وَأَعُوذُ بِكَ رَبِّ أَن يَحْضُرُونِ.',
        advice: 'إذا زادت الوساوس، توضأ وضوءاً بارداً وألزم لسانك بالاستغفار، فالوضوء يطفئ اضطراب النفس.',
    },
    {
        id: 'repentance_guilt',
        keywords: ['ذنب', 'توبة', 'معصية', 'ندم', 'مغفرة', 'ذنوب', 'الذنب'],
        title: 'ألم الذنب والشوق للتوبة والمغفرة',
        verse: {
            text: 'قُلْ يَا عِبَادِيَ الَّذِينَ أَسْرَفُوا عَلَىٰ أَنفُسِهِمْ لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ ۚ إِنَّ اللَّهَ يَغْفِرُ الذُّنُوبَ جَمِيعًا ۚ إِنَّهُ هُوَ الْغَفُورُ الرَّحِيمُ',
            surah: 'سورة الزمر: 53',
            audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/4111.mp3',
        },
        hadith: 'قال الله تعالى في الحديث القدسي: «يا ابن آدم إنك ما دعوتني ورجوتني غفرت لك على ما كان فيك ولا أبالي، يا ابن آدم لو بلغت ذنوبك عنان السماء ثم استغفرتني غفرت لك ولا أبالي».',
        dua: 'رَبِّ إِنِّي ظَلَمْتُ نَفْسِي فَاغْفِرْ لِي.',
        advice: 'لا تيأس أبداً، باب التوبة مفتوح حتى تطلع الشمس من مغربها، وبدل الذنب بحسنة فورية تمحها.',
    },
    {
        id: 'sustenance_debt',
        keywords: ['رزق', 'دين', 'مال', 'فقر', 'حاجة', 'ديون', 'طلب الرزق'],
        title: 'طلب الرزق والبركة وسداد الدين',
        verse: {
            text: 'وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا ۝ وَيَرْزُقْهُ مِنْ حَيْثُ لَا يَحْتَسِبُ ۚ وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ',
            surah: 'سورة الطلاق: 2-3',
            audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/5223.mp3',
        },
        hadith: 'علم النبي ﷺ علياً كلمات لو كان عليه مثل جبل صبير ديناً أداه الله عنه: «اللهم اكفني بحلالك عن حرامك، وأغنني بفضلك عمن سواك».',
        dua: 'اللَّهُمَّ رَبَّ السَّمَاوَاتِ وَرَبَّ الْأَرْضِ وَرَبَّ الْعَرْشِ الْعَظِيمِ، اقْضِ عَنَّا الدَّيْنَ وَأَغْنِنَا مِنَ الْفَقْرِ.',
        advice: 'مفاتيح الرزق الربانية: الاستغفار الدائم، صلة الرحم، وتقوى الله في السر والعلن.',
    },
    {
        id: 'illness_pain',
        keywords: ['مرض', 'ألم', 'وجع', 'شفاء', 'مريض', 'تعب', 'المرض'],
        title: 'المرض والألم الجسدي وطلب الشفاء',
        verse: {
            text: 'وَإِذَا مَرِضْتُ فَهُوَ يَشْفِينِ',
            surah: 'سورة الشعراء: 80',
            audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/2992.mp3',
        },
        hadith: 'كان النبي ﷺ إذا اشتكى يقرأ على نفسه بالمعوذات وينفث، فلما اشتد وجعه كنت أقرأ عليه وأمسح بيده رجاء بركتها.',
        dua: 'أَذْهِبِ الْبَاسَ رَبَّ النَّاسِ، اشْفِ وَأَنْتَ الشَّافِي، لا شِفَاءَ إِلَّا شِفَاؤُكَ، شِفَاءً لا يُغَادِرُ سَقَمًا.',
        advice: 'ضع يدك على مكان الألم وقل: بسم الله (ثلاثاً)، وقل (سبع مرات): أعوذ بعزة الله وقدرته من شر ما أجد وأحاذر.',
    },
];

export default function SemanticComfortSearch() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedEntry, setSelectedEntry] = useState(COMFORT_DATABASE[0]);
    const [isPlayingAudio, setIsPlayingAudio] = useState(false);
    const [copiedField, setCopiedField] = useState(null);
    const audioRef = useRef(null);

    // Search filter logic
    const filteredEntries = searchQuery.trim()
        ? COMFORT_DATABASE.filter(entry =>
            entry.title.includes(searchQuery) ||
            entry.keywords.some(k => k.includes(searchQuery.toLowerCase())) ||
            entry.verse.text.includes(searchQuery)
        )
        : COMFORT_DATABASE;

    const handleSelect = (entry) => {
        setSelectedEntry(entry);
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            setIsPlayingAudio(false);
        }
    };

    const toggleAudio = () => {
        if (!selectedEntry?.verse?.audioUrl) return;

        if (isPlayingAudio) {
            audioRef.current?.pause();
            setIsPlayingAudio(false);
        } else {
            if (!audioRef.current) {
                audioRef.current = new Audio(selectedEntry.verse.audioUrl);
                audioRef.current.onended = () => setIsPlayingAudio(false);
            } else {
                audioRef.current.src = selectedEntry.verse.audioUrl;
            }
            audioRef.current.play().then(() => setIsPlayingAudio(true)).catch(() => setIsPlayingAudio(false));
        }
    };

    const handleCopy = (text, fieldName) => {
        navigator.clipboard.writeText(text);
        setCopiedField(fieldName);
        setTimeout(() => setCopiedField(null), 2000);
    };

    return (
        <div className="card-glow mb-5 anim-fade-in" style={{ padding: 'var(--space-5)' }}>
            {/* Header */}
            <div className="mb-4">
                <h2 style={{ font: 'var(--text-title-lg)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--bd-white)' }}>
                    <Icon name="search" size={24} color="var(--bd-teal)" />
                    الباحث الشعوري والدلالي
                </h2>
                <p style={{ font: 'var(--text-body-sm)', color: 'var(--bd-teal-300)', opacity: 0.85, margin: '4px 0 0' }}>
                    صف حالتك أو ما تجده في صدرك لتجد ما يوافقك من الآيات والأحاديث المهدئة
                </p>
            </div>

            {/* Search Input Bar */}
            <div className="input-field mb-3" style={{ position: 'relative' }}>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="بماذا تشعر الآن؟ (مثال: ضيق الصدر، قلق من المستقبل، ديون، ذنب...)"
                    style={{ paddingRight: '40px' }}
                />
                <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', opacity: 0.7 }}>
                    <Icon name="search" size={18} color="var(--bd-teal)" />
                </span>
            </div>

            {/* Quick Feeling Chips (Horizontal scroll) */}
            <div className="no-scrollbar mb-4" style={{ display: 'flex', gap: 'var(--space-2)', overflowX: 'auto', paddingBottom: '4px' }}>
                {COMFORT_DATABASE.map(entry => {
                    const isSelected = selectedEntry?.id === entry.id;
                    return (
                        <button
                            key={entry.id}
                            onClick={() => handleSelect(entry)}
                            style={{
                                flexShrink: 0,
                                padding: '6px 12px',
                                background: isSelected ? 'var(--bd-teal)' : 'var(--color-surface)',
                                color: isSelected ? 'var(--bd-navy)' : 'var(--color-on-surface-variant)',
                                border: isSelected ? '1px solid var(--bd-teal)' : '1px solid var(--color-outline)',
                                fontSize: '0.78rem',
                                fontWeight: isSelected ? 700 : 500,
                                cursor: 'pointer',
                            }}
                        >
                            {entry.title.split(' ')[0]} {entry.title.split(' ')[1] || ''}
                        </button>
                    );
                })}
            </div>

            {/* Selected Healing Content Card */}
            {selectedEntry && (
                <div className="anim-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                    {/* 1. Quranic Healing Ayah */}
                    <div
                        style={{
                            background: 'radial-gradient(circle at top right, #16365C 0%, #0B1F3A 100%)',
                            border: '1.5px solid var(--bd-teal)',
                            boxShadow: 'var(--bd-shadow, 4px 4px 0 #050E1A)',
                            padding: 'var(--space-4)',
                        }}
                    >
                        <div className="flex-between mb-2">
                            <span style={{ font: 'var(--text-title-sm)', color: 'var(--bd-teal)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Icon name="menu_book" size={18} />
                                الآية الشافية | {selectedEntry.verse.surah}
                            </span>
                            <div style={{ display: 'flex', gap: '6px' }}>
                                <button
                                    onClick={toggleAudio}
                                    className="btn btn-icon"
                                    title={isPlayingAudio ? 'إيقاف التلاوة' : 'استماع للتلاوة'}
                                    style={{ background: isPlayingAudio ? 'var(--bd-teal)' : 'rgba(15, 181, 174, 0.15)', border: '1px solid var(--bd-teal)' }}
                                >
                                    <Icon name={isPlayingAudio ? 'pause' : 'volume_up'} size={16} color={isPlayingAudio ? 'var(--bd-navy)' : 'var(--bd-teal)'} />
                                </button>
                                <button
                                    onClick={() => handleCopy(selectedEntry.verse.text, 'verse')}
                                    className="btn btn-icon"
                                    title="نسخ الآية"
                                >
                                    <Icon name={copiedField === 'verse' ? 'done' : 'content_copy'} size={16} color={copiedField === 'verse' ? 'var(--bd-teal)' : 'currentColor'} />
                                </button>
                            </div>
                        </div>

                        <p style={{ font: 'var(--text-headline-sm)', lineHeight: 1.8, margin: 0, color: 'var(--bd-white)', fontFamily: "'Noto Kufi Arabic', serif" }}>
                            «{selectedEntry.verse.text}»
                        </p>
                    </div>

                    {/* 2. Prophetic Healing Hadith */}
                    <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-outline)', padding: 'var(--space-4)' }}>
                        <div className="flex-between mb-2">
                            <span style={{ font: 'var(--text-title-sm)', color: 'var(--bd-gold)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Icon name="auto_stories" size={18} />
                                التوجيه النبوي والسكينة
                            </span>
                            <button
                                onClick={() => handleCopy(selectedEntry.hadith, 'hadith')}
                                className="btn btn-icon"
                                title="نسخ الحديث"
                            >
                                <Icon name={copiedField === 'hadith' ? 'done' : 'content_copy'} size={16} color={copiedField === 'hadith' ? 'var(--bd-gold)' : 'currentColor'} />
                            </button>
                        </div>
                        <p style={{ font: 'var(--text-body-md)', lineHeight: 1.7, margin: 0, color: 'var(--bd-white)' }}>
                            {selectedEntry.hadith}
                        </p>
                    </div>

                    {/* 3. Healing Dua */}
                    <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-outline)', padding: 'var(--space-4)' }}>
                        <div className="flex-between mb-2">
                            <span style={{ font: 'var(--text-title-sm)', color: 'var(--bd-teal-300)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Icon name="back_hand" size={18} />
                                الدعاء المأثور لرفع الكرب
                            </span>
                            <button
                                onClick={() => handleCopy(selectedEntry.dua, 'dua')}
                                className="btn btn-icon"
                                title="نسخ الدعاء"
                            >
                                <Icon name={copiedField === 'dua' ? 'done' : 'content_copy'} size={16} color={copiedField === 'dua' ? 'var(--bd-teal)' : 'currentColor'} />
                            </button>
                        </div>
                        <p style={{ font: 'var(--text-body-md)', fontWeight: 600, lineHeight: 1.7, margin: 0, color: 'var(--bd-white)' }}>
                            "{selectedEntry.dua}"
                        </p>
                    </div>

                    {/* 4. Practical Spiritual Advice */}
                    <div style={{ background: 'rgba(224, 165, 38, 0.1)', border: '1px solid var(--bd-gold)', padding: '10px 14px' }}>
                        <div style={{ font: 'var(--text-label-md)', fontWeight: 700, color: 'var(--bd-gold)', marginBottom: '4px' }}>
                            بصيرة عملية:
                        </div>
                        <div style={{ font: 'var(--text-body-sm)', color: 'var(--bd-white)', lineHeight: 1.6 }}>
                            {selectedEntry.advice}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}


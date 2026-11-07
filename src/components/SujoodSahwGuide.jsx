import React, { useState } from 'react';
import Icon, { Nuqta } from './Icon';

const SAHW_DATABASE = [
    {
        id: 'increase_action',
        category: 'زيادة',
        title: 'زيادة ركوع أو سجود أو قيام سهواً',
        summary: 'إذا زدت في صلاتك ركوعاً أو سجوداً أو قعوداً ناسياً ثم تنبهت',
        timing: 'بعد السلام',
        ruling: 'تسجد سجدتين بعد أن تسلم من الصلاة ثم تسلم مرة أخرى.',
        hadith: '«إذا زاد الرجل أو نقص فليسجد سجدتين» (صحيح مسلم). صلاتك صحيحة ولا إعادة عليك.',
        steps: [
            'أتم صلاتك كالمعتاد حتى تتشهد التشهد الأخير.',
            'سلّم عن يمينك وعن شمالك.',
            'اسجد سجدتي السهو وكبّر لهما وقل: سبحان ربي الأعلى.',
            'سلّم مرة ثانية عن يمينك وشمالك.'
        ]
    },
    {
        id: 'increase_salam',
        category: 'زيادة',
        title: 'السلام قبل إتمام ركعات الصلاة',
        summary: 'إذا سلمت من ركعتين أو ثلاث ناسياً في صلاة رباعية ثم تذكرت قريباً',
        timing: 'بعد السلام',
        ruling: 'تقوم وتكبر وتأتي بما بقي عليك من الصلاة، ثم تسلم، ثم تسجد سجدتين وتسلم.',
        hadith: 'فعل النبي ﷺ ذلك في حديث ذي اليدين حين سلم من ركعتين ثم أتم وسجد بعد السلام (متفق عليه).',
        steps: [
            'قم فوراً دون أن تتكلم كثيراً واقضِ ما فاتك من ركعات.',
            'اجلس للتشهد الأخير وسلم عن صلاتك.',
            'اسجد سجدتي السهو بعد السلام ثم سلم.'
        ]
    },
    {
        id: 'decrease_tashahhud',
        category: 'نقص',
        title: 'نسيان التشهد الأول والقيام للركعة الثالثة',
        summary: 'إذا قمت إلى الركعة الثالثة ونسيت الجلوس للتشهد الأول',
        timing: 'قبل السلام',
        ruling: 'إذا استتممت قائماً فلا ترجع، واصل صلاتك واسجد سجدتي السهو قبل السلام.',
        hadith: '«قام رسول الله ﷺ في الركعتين الأوليين ولم يجلس، فسجد سجدتين قبل أن يسلم» (صحيح البخاري).',
        steps: [
            'إذا تذكرت وأنت لم تقم بعد فاجلس وتشهد.',
            'إذا استتممت قائماً فلا ترجع وواصل الركعة الثالثة.',
            'عند الانتهاء من التشهد الأخير وقبل أن تسلم، اسجد سجدتين.',
            'ثم سلّم بعدهما.'
        ]
    },
    {
        id: 'decrease_wajib',
        category: 'نقص',
        title: 'نسيان تسبيح الركوع أو السجود أو التكبير',
        summary: 'نسيان «سبحان ربي العظيم» أو تكبيرات الانتقال سهواً',
        timing: 'قبل السلام',
        ruling: 'الصلاة صحيحة وتجبر بسجدتي السهو قبل السلام.',
        hadith: 'كل نقص في واجبات الصلاة يجبره سجود السهو قبل السلام ترغيماً للشيطان.',
        steps: [
            'واصل صلاتك بصورة طبيعية ولا تعيد التسبيح المنسي بعد الانتقال.',
            'في نهاية التشهد الأخير وقبل أن تسلم، اسجد سجدتين.',
            'سلّم بعد رفعهما.'
        ]
    },
    {
        id: 'doubt_certainty',
        category: 'شك',
        title: 'الشك في عدد الركعات دون ترجيح (البناء على اليقين)',
        summary: 'شككت هل صليت 3 ركعات أم 4 ولم يترجح عندك شيء؟',
        timing: 'قبل السلام',
        ruling: 'ابنِ على الأقل (اليقين هو 3) وأتِ بركعة رابعة، ثم اسجد سجدتين قبل السلام.',
        hadith: '«إذا شك أحدكم في صلاته فلم يدرِ كم صلى ثلاثاً أم أربعاً، فليطرح الشك وليبنِ على ما استيقن، ثم يسجد سجدتين قبل أن يسلم» (صحيح مسلم).',
        steps: [
            'اعتبر أنك صليت 3 ركعات (الأقل المؤكد).',
            'قم وأتِ بالركعة الرابعة المتبقية واقرأ الفاتحة.',
            'اجلس للتشهد الأخير.',
            'اسجد سجدتي السهو قبل أن تسلم، ثم سلّم.'
        ]
    },
    {
        id: 'doubt_preponderance',
        category: 'شك',
        title: 'الشك مع غلبة الظن وترجيح أحد الأمرين',
        summary: 'شككت هل هي 3 أم 4 وترجح في ظنك أنها 4 مثلاً',
        timing: 'بعد السلام',
        ruling: 'ابنِ على ما غلب على ظنك وأتم صلاتك عليه، ثم سلّم واسجد بعد السلام.',
        hadith: '«فليتحرَّ الصواب فليتمَّ عليه، ثم ليسلِّم، ثم يسجد سجدتين» (متفق عليه).',
        steps: [
            'اعمل بالعدد الذي غلب على ظنك واطمأن إليه قلبك.',
            'أتم صلاتك حتى تسلم كالمعتاد.',
            'اسجد سجدتي السهو بعد السلام ثم سلّم ثانية.'
        ]
    }
];

export default function SujoodSahwGuide() {
    const [selectedCategory, setSelectedCategory] = useState('الكل');
    const [activeSahw, setActiveSahw] = useState(SAHW_DATABASE[0]);

    const categories = ['الكل', 'زيادة', 'نقص', 'شك'];

    const filtered = selectedCategory === 'الكل'
        ? SAHW_DATABASE
        : SAHW_DATABASE.filter(s => s.category === selectedCategory);

    return (
        <div className="card-glow anim-fade-in" style={{
            padding: '20px',
            border: '2px solid var(--bd-black)',
            boxShadow: '4px 4px 0 var(--bd-black)',
            background: 'var(--color-surface)',
            marginBottom: '16px'
        }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '20px', borderBottom: '2px solid var(--border-color)', paddingBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '6px' }}>
                    <Nuqta size={8} />
                    <Icon name="help" size={24} color="var(--bd-gold)" />
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--color-text)' }}>
                        مُنقذ سجود السهو
                    </h2>
                    <Nuqta size={8} />
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-dim)', fontWeight: 700, margin: 0 }}>
                    شجرة قرارات تفاعلية لحل شكوك الصلاة بدقة السنة النبوية المطهرة
                </p>
            </div>

            {/* Rule Rule Badge */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                padding: '10px',
                background: 'rgba(15, 181, 174, 0.08)',
                border: '1.5px solid var(--bd-teal)',
                boxShadow: '2px 2px 0 var(--bd-black)',
                marginBottom: '16px',
                fontSize: '0.8rem',
                fontWeight: 800
            }}>
                <span style={{ color: 'var(--bd-teal)' }}>قاعدة ذهبية ميسرة:</span>
                <span>النقص = قبل السلام | الزيادة = بعد السلام | الشك = حسب اليقين والترجيح</span>
            </div>

            {/* Categories Selector */}
            <div style={{ display: 'flex', gap: '6px', marginBottom: '14px' }}>
                {categories.map(cat => (
                    <button
                        key={cat}
                        className="btn"
                        onClick={() => setSelectedCategory(cat)}
                        style={{
                            flex: 1,
                            padding: '8px',
                            border: '2px solid var(--bd-black)',
                            background: selectedCategory === cat ? 'var(--bd-teal)' : 'var(--color-surface-card)',
                            color: selectedCategory === cat ? '#000' : 'var(--color-text)',
                            fontWeight: 800,
                            fontSize: '0.85rem',
                            boxShadow: selectedCategory === cat ? '2px 2px 0 var(--bd-black)' : 'none'
                        }}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Scenarios Grid */}
            <div style={{ display: 'grid', gap: '8px', marginBottom: '20px' }}>
                {filtered.map(item => {
                    const isSelected = activeSahw.id === item.id;
                    return (
                        <div
                            key={item.id}
                            onClick={() => setActiveSahw(item)}
                            style={{
                                padding: '12px 14px',
                                border: `2px solid ${isSelected ? 'var(--bd-gold)' : 'var(--border-color)'}`,
                                background: isSelected ? 'rgba(224, 165, 38, 0.1)' : 'var(--color-surface-card)',
                                boxShadow: isSelected ? '2px 2px 0 var(--bd-black)' : 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                transition: 'all 0.15s ease'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{
                                    width: '6px',
                                    height: '6px',
                                    background: item.timing === 'قبل السلام' ? 'var(--bd-teal)' : 'var(--bd-gold)',
                                    transform: 'rotate(45deg)'
                                }}></span>
                                <div>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--color-text)' }}>
                                        {item.title}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-dim)', fontWeight: 700, marginTop: '2px' }}>
                                        {item.summary}
                                    </div>
                                </div>
                            </div>

                            <span style={{
                                fontSize: '0.75rem',
                                fontWeight: 800,
                                padding: '3px 8px',
                                border: '1px solid var(--bd-black)',
                                background: item.timing === 'قبل السلام' ? 'var(--bd-teal)' : 'var(--bd-gold)',
                                color: '#000',
                                whiteSpace: 'nowrap'
                            }}>
                                {item.timing}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Active Verdict Card */}
            {activeSahw && (
                <div className="anim-slide-up" style={{
                    padding: '20px',
                    border: '2px solid var(--bd-black)',
                    boxShadow: '4px 4px 0 var(--bd-black)',
                    background: 'var(--color-surface-card)'
                }}>
                    <div className="flex-between mb-12" style={{ borderBottom: '1.5px solid var(--border-color)', paddingBottom: '10px' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--bd-gold)' }}>
                            الحكم الفوري لحالتك:
                        </span>
                        <span style={{
                            fontSize: '0.9rem',
                            fontWeight: 900,
                            padding: '4px 12px',
                            border: '2px solid var(--bd-black)',
                            background: activeSahw.timing === 'قبل السلام' ? 'var(--bd-teal)' : 'var(--bd-gold)',
                            color: '#000',
                            boxShadow: '2px 2px 0 var(--bd-black)'
                        }}>
                            السجود {activeSahw.timing}
                        </span>
                    </div>

                    <p style={{ fontSize: '1rem', fontWeight: 800, lineHeight: '1.8', color: 'var(--color-text)', margin: '0 0 14px' }}>
                        {activeSahw.ruling}
                    </p>

                    <div style={{
                        padding: '12px',
                        background: 'rgba(0,0,0,0.15)',
                        border: '1px solid var(--border-color)',
                        marginBottom: '16px',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        color: 'var(--color-text-dim)',
                        lineHeight: '1.6'
                    }}>
                        الدليل النبوي: {activeSahw.hadith}
                    </div>

                    <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--bd-teal)', marginBottom: '8px' }}>
                        خطوات تصحيح الصلاة عملياً:
                    </div>
                    <ol style={{ margin: 0, paddingRight: '20px', fontSize: '0.85rem', lineHeight: '1.8', color: 'var(--color-text)' }}>
                        {activeSahw.steps.map((step, idx) => (
                            <li key={idx} style={{ marginBottom: '4px', fontWeight: 700 }}>
                                {step}
                            </li>
                        ))}
                    </ol>
                </div>
            )}
        </div>
    );
}

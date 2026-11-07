/**
 * Smart Hijri Calendar & Sunnah Fasting Predictor
 * Computes exact Hijri date, Ayam Al-Beed, and Monday/Thursday Sunnah fasts
 * 100% Offline & Native
 */

const HIJRI_MONTHS = [
    'المحرم', 'صفر', 'ربيع الأول', 'ربيع الآخر',
    'جمادى الأولى', 'جمادى الآخرة', 'رجب', 'شعبان',
    'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'
];

export function getHijriDate(date = new Date()) {
    try {
        const parts = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
            day: 'numeric',
            month: 'numeric',
            year: 'numeric',
        }).formatToParts(date);

        const hDay = parseInt(parts.find(p => p.type === 'day')?.value || '1', 10);
        const hMonthIndex = parseInt(parts.find(p => p.type === 'month')?.value || '1', 10) - 1;
        const hYear = parseInt(parts.find(p => p.type === 'year')?.value || '1447', 10);

        const monthName = HIJRI_MONTHS[hMonthIndex] || 'هجري';

        return {
            day: hDay,
            monthIndex: hMonthIndex,
            monthName,
            year: hYear,
            formattedArabic: `${hDay} ${monthName} ${hYear} هـ`,
        };
    } catch {
        return {
            day: 1,
            monthIndex: 0,
            monthName: 'المحرم',
            year: 1447,
            formattedArabic: '1 المحرم 1447 هـ',
        };
    }
}

export function getSunnahFastingNotice(date = new Date()) {
    const dayOfWeek = date.getDay(); // 0 = Sun, 1 = Mon, 2 = Tue, 3 = Wed, 4 = Thu, 5 = Fri, 6 = Sat
    const hijri = getHijriDate(date);

    // Tomorrow's hijri day
    const tomorrow = new Date(date);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowHijri = getHijriDate(tomorrow);

    // 1. Monday check
    if (dayOfWeek === 0) { // Sunday
        return {
            isSunnahTonight: true,
            isSunnahToday: false,
            badge: 'سُنة غداً',
            title: 'غداً الإثنين: سُنة صيام',
            message: 'تُعرض الأعمال يوم الإثنين والخميس.. بيّت النية واستعد للسحور',
            type: 'monday',
        };
    }
    if (dayOfWeek === 1) { // Monday
        return {
            isSunnahTonight: false,
            isSunnahToday: true,
            badge: 'صيام اليوم',
            title: 'اليوم الإثنين: صيام سُنة نبوية',
            message: 'تقبل الله طاعتك وصيامك، وللصائم دعوة مستجابة',
            type: 'monday',
        };
    }

    // 2. Thursday check
    if (dayOfWeek === 3) { // Wednesday
        return {
            isSunnahTonight: true,
            isSunnahToday: false,
            badge: 'سُنة غداً',
            title: 'غداً الخميس: سُنة صيام',
            message: '«فأحب أن يُعرض عملي وأنا صائم».. بيّت النية لصيام الغد',
            type: 'thursday',
        };
    }
    if (dayOfWeek === 4) { // Thursday
        return {
            isSunnahTonight: false,
            isSunnahToday: true,
            badge: 'صيام اليوم',
            title: 'اليوم الخميس: صيام سُنة نبوية',
            message: 'تقبل الله طاعتك وصيامك ورفع درجاتك',
            type: 'thursday',
        };
    }

    // 3. Ayam Al-Beed check (13, 14, 15)
    if (tomorrowHijri.day === 13) {
        return {
            isSunnahTonight: true,
            isSunnahToday: false,
            badge: 'الأيام البيض',
            title: `غداً أول الأيام البيض (${tomorrowHijri.monthName})`,
            message: 'صيام 3 أيام من كل شهر كصيام الدهر كله',
            type: 'beed',
        };
    }
    if ([13, 14, 15].includes(hijri.day)) {
        return {
            isSunnahTonight: false,
            isSunnahToday: true,
            badge: 'الأيام البيض',
            title: `اليوم ${hijri.day} من الأيام البيض المسنونة`,
            message: 'تقبل الله صيامك وبرك في هذه الأيام المباركة',
            type: 'beed',
        };
    }

    // Default: General voluntary fasting reminder
    return {
        isSunnahTonight: false,
        isSunnahToday: false,
        badge: 'صيام تطوع',
        title: 'صيام النوافل والتطوع',
        message: '«من صام يوماً في سبيل الله باعد الله وجهه عن النار سبعين خريفاً»',
        type: 'general',
    };
}


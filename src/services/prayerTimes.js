import { Coordinates, CalculationMethod, PrayerTimes, Qibla } from 'adhan';

/**
 * 100% Offline Local Prayer Times & Qibla Engine
 * Powered by adhan-js astronomical calculations
 * Zero network dependencies
 */

export const CALCULATION_METHODS = {
    Egyptian: { id: 'Egyptian', name: 'الهيئة المصرية العامة للمساحة', method: CalculationMethod.Egyptian },
    UmmAlQura: { id: 'UmmAlQura', name: 'جامعة أم القرى (مكة المكرمة)', method: CalculationMethod.UmmAlQura },
    MuslimWorldLeague: { id: 'MuslimWorldLeague', name: 'رابطة العالم الإسلامي', method: CalculationMethod.MuslimWorldLeague },
    Karachi: { id: 'Karachi', name: 'جامعة العلوم الإسلامية بكراتشي', method: CalculationMethod.Karachi },
    NorthAmerica: { id: 'NorthAmerica', name: 'الجمعية الإسلامية لأمريكا الشمالية (ISNA)', method: CalculationMethod.NorthAmerica },
};

function formatTime(date, offsetMinutes = 0) {
    if (!date) return '00:00';
    const d = new Date(date.getTime() + offsetMinutes * 60000);
    const h = String(d.getHours()).padStart(2, '0');
    const m = String(d.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
}

export function calculateLocalPrayerTimes(
    lat = 30.0444,
    lng = 31.2357,
    date = new Date(),
    methodName = 'Egyptian',
    offsets = {}
) {
    try {
        const coordinates = new Coordinates(lat, lng);
        const methodFn = CALCULATION_METHODS[methodName]?.method || CalculationMethod.Egyptian;
        const params = methodFn();

        const pt = new PrayerTimes(coordinates, date, params);
        const qiblaAngle = Math.round(Qibla(coordinates));

        // Tomorrow's Fajr for overnight countdown
        const tomorrow = new Date(date);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowPt = new PrayerTimes(coordinates, tomorrow, params);

        return {
            timings: {
                Fajr: formatTime(pt.fajr, offsets.Fajr || 0),
                Sunrise: formatTime(pt.sunrise, offsets.Sunrise || 0),
                Dhuhr: formatTime(pt.dhuhr, offsets.Dhuhr || 0),
                Asr: formatTime(pt.asr, offsets.Asr || 0),
                Maghrib: formatTime(pt.maghrib, offsets.Maghrib || 0),
                Isha: formatTime(pt.isha, offsets.Isha || 0),
            },
            rawDates: {
                Fajr: new Date(pt.fajr.getTime() + (offsets.Fajr || 0) * 60000),
                Sunrise: new Date(pt.sunrise.getTime() + (offsets.Sunrise || 0) * 60000),
                Dhuhr: new Date(pt.dhuhr.getTime() + (offsets.Dhuhr || 0) * 60000),
                Asr: new Date(pt.asr.getTime() + (offsets.Asr || 0) * 60000),
                Maghrib: new Date(pt.maghrib.getTime() + (offsets.Maghrib || 0) * 60000),
                Isha: new Date(pt.isha.getTime() + (offsets.Isha || 0) * 60000),
                TomorrowFajr: new Date(tomorrowPt.fajr.getTime() + (offsets.Fajr || 0) * 60000),
            },
            qiblaAngle,
            methodName,
        };
    } catch (err) {
        console.error('Local prayer calculation error:', err);
        return null;
    }
}

export function computeNextPrayerInfo(rawDates) {
    if (!rawDates) return { name: 'الفجر', key: 'Fajr', countdown: '--:--:--' };

    const now = new Date();
    const prayerOrder = [
        { key: 'Fajr', name: 'الفجر', date: rawDates.Fajr },
        { key: 'Sunrise', name: 'الشروق', date: rawDates.Sunrise },
        { key: 'Dhuhr', name: 'الظهر', date: rawDates.Dhuhr },
        { key: 'Asr', name: 'العصر', date: rawDates.Asr },
        { key: 'Maghrib', name: 'المغرب', date: rawDates.Maghrib },
        { key: 'Isha', name: 'العشاء', date: rawDates.Isha },
    ];

    let next = prayerOrder.find(p => p.date > now);
    let diffMs = 0;

    if (next) {
        diffMs = next.date.getTime() - now.getTime();
    } else {
        next = { key: 'Fajr', name: 'الفجر', date: rawDates.TomorrowFajr };
        diffMs = rawDates.TomorrowFajr.getTime() - now.getTime();
    }

    const totalSeconds = Math.max(0, Math.floor(diffMs / 1000));
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    return {
        key: next.key,
        name: next.name,
        countdown: `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`,
    };
}


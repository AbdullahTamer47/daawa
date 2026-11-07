import React, { createContext, useContext, useReducer, useEffect, useCallback, useState, useRef } from 'react';
import { getTodayKey, lsGet, lsSet } from '../services/storage';
import { db } from '../firebase';
import { collection, doc, getDocs, setDoc, getDoc } from 'firebase/firestore';

const AppContext = createContext();

export const POINT_VALUES = {
    fajr: 20, dhuhr: 15, asr: 15, maghrib: 15, isha: 15,
    sunnahFajr: 10, sunnahDhuhrBefore: 10, sunnahDhuhrAfter: 10,
    sunnahMaghrib: 10, sunnahIsha: 10, shafaWitr: 15,
    taraweehPerPair: 5, // 5 points per 2 rakaat
    qiyam: 30,
    adhkarMorning: 10, adhkarEvening: 10, adhkarSleep: 10,
    quranWird: 20,
    lesson: 0,
};

export const LEVELS = [
    { name: 'مبتدئ', icon: 'eco', min: 0, max: 99 },
    { name: 'مجتهد', icon: 'star', min: 100, max: 299 },
    { name: 'متميّز', icon: 'stars', min: 300, max: 599 },
    { name: 'متفوّق', icon: 'auto_awesome', min: 600, max: 999 },
    { name: 'بارع', icon: 'military_tech', min: 1000, max: 1499 },
    { name: 'خبير', icon: 'workspace_premium', min: 1500, max: 2199 },
    { name: 'قائد', icon: 'crown', min: 2200, max: 2999 },
    { name: 'أسطورة', icon: 'nightlight', min: 3000, max: Infinity },
];

export const BADGES = [
    { id: 'fajr_warrior', name: 'وسام الفجر', icon: 'wb_twilight', desc: 'صلاة الفجر 7 أيام متتالية', condition: (s) => (s.fajrStreak || 0) >= 7 },
    { id: 'fajr_40', name: 'أربعون فجراً', icon: 'wb_twilight', desc: 'صلاة الفجر 40 يوماً في وقتها', condition: (s) => (s.fajrStreak || 0) >= 40 || (s.totalPrayers || 0) >= 40 },
    { id: 'beed_faster', name: 'صائم البيض', icon: 'nights_stay', desc: 'صيام الأيام البيض المسنونة', condition: (s) => (s.fastingDays || 0) >= 3 },
    { id: 'quran_companion', name: 'رفيق القرآن', icon: 'menu_book', desc: 'إتمام ختمة كاملة (604 صفحات)', condition: (s) => (s.quranKhatm || 0) >= 1 || (s.totalPages || 0) >= 604 },
    { id: 'tasbeeh_century', name: 'مئوية التسبيح', icon: 'touch_app', desc: 'المواظبة على الأذكار والتسبيح', condition: (s) => (s.adhkarStreak || 0) >= 10 || (s.totalPrayers || 0) >= 100 },
    { id: 'night_prayer', name: 'قائم الليل', icon: 'dark_mode', desc: 'قيام الليل والتهجد 10 مرات', condition: (s) => (s.qiyamDays || 0) >= 10 },
    { id: 'sunnah_guardian', name: 'حارس السنن', icon: 'volunteer_activism', desc: 'المحافظة على السنن الرواتب', condition: (s) => (s.sunnahDays || 0) >= 10 },
    { id: 'perfect_week', name: 'الأسبوع التام', icon: 'star', desc: '7 أيام تامة بدون انقطاع (100%)', condition: (s) => (s.perfectDays || 0) >= 7 },
    { id: 'consistency_100', name: 'مشكاة العام', icon: 'diamond', desc: '30 يوماً تامة على مدار العام', condition: (s) => (s.perfectDays || 0) >= 30 },
];

// Da'wa journey started on February 19, 2026
const DAWA_START_DATE = new Date('2026-02-19');
DAWA_START_DATE.setHours(0, 0, 0, 0);

const calcDaawaDay = (now) => {
    const start = new Date(DAWA_START_DATE);
    const diffTime = now - start;
    const daysPassed = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(1, daysPassed + 1);
};

const getDaawaDay = () => calcDaawaDay(new Date());

const isPastNoon = (now = new Date()) => {
    return now.getHours() >= 12;
};

export function getInitialState() {
    const saved = lsGet('daawa_state');
    const today = getTodayKey();
    const currentMonthKey = today.slice(0, 7);

    const defaults = {
        userId: '',
        userName: '',
        userPassword: '',
        isLoggedIn: false,
        users: [],
        todayKey: today,
        prayers: { fajr: false, dhuhr: false, asr: false, maghrib: false, isha: false },
        sunnah: { sunnahFajr: false, sunnahDhuhrBefore: false, sunnahDhuhrAfter: false, sunnahMaghrib: false, sunnahIsha: false, shafaWitr: false },
        taraweeh: false, taraweehRakaat: 0, taraweehSurahs: '',
        qiyam: false, qiyamRakaat: 0, qiyamSurahs: '',
        journal: {},
        adhkarMorning: false, adhkarEvening: false, adhkarSleep: false,
        quranPagesRead: 0,
        khatmaCount: 1, totalPagesRead: 0, lastPageReached: 0, quranStartDate: today,
        currentSurah: '', currentSurahNumber: 1, currentPageNumber: 0, currentAyahNumber: 0, quranBookmarks: [],
        completedSurahs: [],
        lessons: [],
        challenges: [],
        tips: [],
        announcement: { enabled: true, text: 'مرحباً بك في تطبيق دعوة الإيماني بهوية شركة bedigital الرقمية', date: today },
        prayerOffsets: { Fajr: 0, Sunrise: 0, Dhuhr: 0, Asr: 0, Maghrib: 0, Isha: 0 },
        customDailyContent: {},
        fastingToday: false,
        dailyCharity: false,
        dailyDua: false,
        travelerMode: false,
        exemptionMode: false,
        theme: lsGet('daawa_theme', 'dark'),
        totalPoints: 0,
        history: {},
        isAdmin: false,
        adminRole: 'user', // 'user' | 'editor' | 'admin' | 'superadmin'
        hasSeenSplash: false, lastSplashDate: null,
        // Dual Streaks & Monthly Repair Shield
        prayerStreak: 0,
        quranStreak: 0,
        streakRepairsLeft: 3,
        streakRepairsMonth: currentMonthKey,
        brokenStreak: null,
        // Qadaa Planner (قضاء الفوائت)
        qadaaPrayers: { fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 },
        qadaaFulfilled: { fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 },
        qadaaFasting: 0,
        qadaaFastingFulfilled: 0,
        // Encrypted Tadabbur Notes
        tadabburNotes: [],
        stats: {
            fajrStreak: 0, dhuhrStreak: 0, asrStreak: 0, maghribStreak: 0, ishaStreak: 0,
            allPrayersStreak: 0, adhkarStreak: 0, consecutiveDays: 0, sunnahDays: 0,
            taraweehDays: 0, quranKhatm: 0, perfectDays: 0,
            totalPrayers: 0, totalPages: 0, qiyamDays: 0, fastingDays: 0,
        },
        notifications: [],
    };

    if (saved) {
        const merged = { ...defaults, ...saved };
        if (!merged.challenges) merged.challenges = [];
        if (!merged.tips) merged.tips = [];
        if (!merged.prayerOffsets) merged.prayerOffsets = defaults.prayerOffsets;
        if (!merged.announcement) merged.announcement = defaults.announcement;

        // Fix old users who registered before login system
        if (merged.userName && merged.userName.trim() !== '' && !merged.isLoggedIn) {
            merged.isLoggedIn = true;
        }

        // Backwards compat: if user has name but no ID, use name as ID
        if (merged.userName && !merged.userId) {
            merged.userId = merged.userName;
        }

        if (!merged.sunnah) merged.sunnah = defaults.sunnah;
        if (merged.stats.dhuhrStreak === undefined) {
            merged.stats = { ...defaults.stats, ...merged.stats };
        }
        if (merged.todayKey !== today) {
            const prevDay = merged.todayKey;

            // Reset monthly repair tokens if month changed
            if (merged.streakRepairsMonth !== currentMonthKey) {
                merged.streakRepairsLeft = 3;
                merged.streakRepairsMonth = currentMonthKey;
            }

            if (prevDay) {
                const dayPoints = calculateDayPoints(merged);
                const dayPercentage = calculateDayPercentage(merged);
                merged.history = {
                    ...merged.history,
                    [prevDay]: {
                        points: dayPoints, percentage: dayPercentage,
                        prayers: { ...merged.prayers },
                        sunnah: merged.sunnah ? { ...merged.sunnah } : {},
                        taraweeh: merged.taraweeh, taraweehRakaat: merged.taraweehRakaat, taraweehSurahs: merged.taraweehSurahs,
                        qiyam: merged.qiyam, qiyamRakaat: merged.qiyamRakaat, qiyamSurahs: merged.qiyamSurahs,
                        adhkarMorning: merged.adhkarMorning, adhkarEvening: merged.adhkarEvening, adhkarSleep: merged.adhkarSleep,
                        quranPages: merged.quranPagesRead,
                    }
                };

                const prayers = merged.prayers;
                const allPrayed = Object.values(prayers).every(v => v);

                // Check Traveler or Exemption mode streak freeze protection
                const isShieldActive = merged.travelerMode || merged.exemptionMode;

                if (isShieldActive) {
                    // Streaks are protected safely by the shield
                    merged.prayerStreak = (merged.prayerStreak || 0) + 1;
                    if (merged.quranPagesRead > 0) {
                        merged.quranStreak = (merged.quranStreak || 0) + 1;
                    }
                } else {
                    // Normal evaluation
                    if (allPrayed) {
                        merged.prayerStreak = (merged.prayerStreak || 0) + 1;
                    } else {
                        if ((merged.prayerStreak || 0) > 0) {
                            merged.brokenStreak = {
                                ...(merged.brokenStreak || {}),
                                prayer: merged.prayerStreak,
                                date: prevDay
                            };
                        }
                        merged.prayerStreak = 0;
                    }

                    if (merged.quranPagesRead > 0) {
                        merged.quranStreak = (merged.quranStreak || 0) + 1;
                    } else {
                        if ((merged.quranStreak || 0) > 0) {
                            merged.brokenStreak = {
                                ...(merged.brokenStreak || {}),
                                quran: merged.quranStreak,
                                date: prevDay
                            };
                        }
                        merged.quranStreak = 0;
                    }
                }

                // Individual prayer streaks
                if (prayers.fajr) merged.stats.fajrStreak += 1; else merged.stats.fajrStreak = 0;
                if (prayers.dhuhr) merged.stats.dhuhrStreak += 1; else merged.stats.dhuhrStreak = 0;
                if (prayers.asr) merged.stats.asrStreak += 1; else merged.stats.asrStreak = 0;
                if (prayers.maghrib) merged.stats.maghribStreak += 1; else merged.stats.maghribStreak = 0;
                if (prayers.isha) merged.stats.ishaStreak += 1; else merged.stats.ishaStreak = 0;

                // All prayers streak
                if (allPrayed) merged.stats.allPrayersStreak += 1; else merged.stats.allPrayersStreak = 0;

                // Adhkar streak
                if (merged.adhkarMorning && merged.adhkarEvening && merged.adhkarSleep) merged.stats.adhkarStreak = (merged.stats.adhkarStreak || 0) + 1;
                else merged.stats.adhkarStreak = 0;

                // Sunnah days
                if (merged.sunnah && Object.values(merged.sunnah).every(v => v)) merged.stats.sunnahDays = (merged.stats.sunnahDays || 0) + 1;

                // Consecutive days
                if (dayPercentage > 0) merged.stats.consecutiveDays = (merged.stats.consecutiveDays || 0) + 1;
                else merged.stats.consecutiveDays = 0;

                if (merged.taraweeh) merged.stats.taraweehDays += 1;
                if (merged.qiyam) merged.stats.qiyamDays += 1;
                if (dayPercentage >= 100) merged.stats.perfectDays += 1;
                merged.stats.totalPrayers += Object.values(prayers).filter(v => v).length;
                merged.stats.totalPages += merged.quranPagesRead;
            }
            merged.todayKey = today;
            merged.prayers = { fajr: false, dhuhr: false, asr: false, maghrib: false, isha: false };
            merged.sunnah = { sunnahFajr: false, sunnahDhuhrBefore: false, sunnahDhuhrAfter: false, sunnahMaghrib: false, sunnahIsha: false, shafaWitr: false };
            merged.taraweeh = false; merged.taraweehRakaat = 0; merged.taraweehSurahs = '';
            merged.qiyam = false; merged.qiyamRakaat = 0; merged.qiyamSurahs = '';
            merged.adhkarMorning = false; merged.adhkarEvening = false; merged.adhkarSleep = false;
            merged.quranPagesRead = 0;
        }

        return merged;
    }
    return defaults;
}

function calculateDayPoints(state) {
    let pts = 0;
    Object.entries(state.prayers).forEach(([key, val]) => { if (val) pts += POINT_VALUES[key] || 15; });
    if (state.sunnah) Object.entries(state.sunnah).forEach(([key, val]) => { if (val) pts += POINT_VALUES[key] || 10; });
    if (state.taraweeh) pts += Math.floor(state.taraweehRakaat / 2) * POINT_VALUES.taraweehPerPair;
    if (state.qiyam) pts += POINT_VALUES.qiyam;
    if (state.adhkarMorning) pts += POINT_VALUES.adhkarMorning;
    if (state.adhkarEvening) pts += POINT_VALUES.adhkarEvening;
    if (state.adhkarSleep) pts += POINT_VALUES.adhkarSleep;
    if (state.quranPagesRead > 0) pts += POINT_VALUES.quranWird;
    return pts;
}

function calculateDayPercentage(state) {
    let total = 0, earned = 0;
    total += 5; earned += Object.values(state.prayers).filter(v => v).length;
    total += 1; if (state.taraweeh) earned += 1;
    total += 1; if (state.qiyam) earned += 1;
    total += 3; if (state.adhkarMorning) earned += 1; if (state.adhkarEvening) earned += 1; if (state.adhkarSleep) earned += 1;
    total += 1; if (state.quranPagesRead > 0) earned += 1;
    return total > 0 ? Math.round((earned / total) * 100) : 0;
}

function appReducer(state, action) {
    switch (action.type) {
        case 'TOGGLE_PRAYER': return { ...state, prayers: { ...state.prayers, [action.prayer]: !state.prayers[action.prayer] } };
        case 'TOGGLE_SUNNAH': return { ...state, sunnah: { ...state.sunnah, [action.prayer]: !state.sunnah[action.prayer] } };
        case 'TOGGLE_TARAWEEH': return { ...state, taraweeh: !state.taraweeh, taraweehRakaat: !state.taraweeh ? state.taraweehRakaat : 0, taraweehSurahs: !state.taraweeh ? state.taraweehSurahs : '' };
        case 'SET_TARAWEEH_RAKAAT': return { ...state, taraweehRakaat: action.value };
        case 'SET_TARAWEEH_SURAHS': return { ...state, taraweehSurahs: action.value };
        case 'TOGGLE_QIYAM': return { ...state, qiyam: !state.qiyam, qiyamRakaat: !state.qiyam ? state.qiyamRakaat : 0, qiyamSurahs: !state.qiyam ? state.qiyamSurahs : '' };
        case 'SET_QIYAM_RAKAAT': return { ...state, qiyamRakaat: action.value };
        case 'SET_QIYAM_SURAHS': return { ...state, qiyamSurahs: action.value };
        case 'UPDATE_JOURNAL': return {
            ...state,
            journal: {
                ...state.journal,
                [action.date]: { ...(state.journal[action.date] || {}), ...action.updates }
            }
        };
        case 'TOGGLE_ADHKAR_MORNING': return { ...state, adhkarMorning: !state.adhkarMorning };
        case 'TOGGLE_ADHKAR_EVENING': return { ...state, adhkarEvening: !state.adhkarEvening };
        case 'TOGGLE_ADHKAR_SLEEP': return { ...state, adhkarSleep: !state.adhkarSleep };
        case 'SET_QURAN_PAGES': {
            const newVal = Math.max(0, action.value);
            const diff = newVal - state.quranPagesRead;
            return {
                ...state,
                quranPagesRead: newVal,
                totalPagesRead: Math.max(0, state.totalPagesRead + diff),
                lastPageReached: Math.max(0, state.lastPageReached + diff)
            };
        }
        case 'SET_KHATMA_COUNT': return { ...state, khatmaCount: action.value };
        case 'SET_LAST_PAGE': return { ...state, lastPageReached: action.value };
        case 'SET_CURRENT_SURAH': return { ...state, currentSurah: action.value };
        case 'SET_CURRENT_PAGE_NUMBER': return { ...state, currentPageNumber: action.value };
        case 'SET_CURRENT_AYAH_NUMBER': return { ...state, currentAyahNumber: action.value };
        case 'ADD_QURAN_BOOKMARK': return {
            ...state,
            quranBookmarks: [{
                id: Date.now().toString(),
                type: action.bookmarkType || 'مرجع',
                surah: action.surah,
                page: action.page,
                ayah: action.ayah,
                date: getTodayKey()
            }, ...(state.quranBookmarks || [])].slice(0, 20)
        };
        case 'DELETE_QURAN_BOOKMARK': return {
            ...state,
            quranBookmarks: (state.quranBookmarks || []).filter(b => b.id !== action.id)
        };
        case 'UPDATE_QURAN_BOOKMARK': return {
            ...state,
            quranBookmarks: (state.quranBookmarks || []).map(b => b.id === action.id ? { ...b, ...action.updates } : b)
        };
        case 'SET_CURRENT_SURAH_NUMBER': return { ...state, currentSurahNumber: action.value };
        case 'TOGGLE_SURAH_COMPLETE': {
            const surahNum = action.surahNumber;
            const already = (state.completedSurahs || []).includes(surahNum);
            const newCompleted = already
                ? state.completedSurahs.filter(n => n !== surahNum)
                : [...(state.completedSurahs || []), surahNum];
            const pagesDiff = already ? -1 : 1;
            return {
                ...state,
                completedSurahs: newCompleted,
                quranPagesRead: Math.max(0, state.quranPagesRead + pagesDiff),
                totalPagesRead: Math.max(0, state.totalPagesRead + pagesDiff),
            };
        }
        case 'RESET_QURAN': return { ...state, totalPagesRead: 0, lastPageReached: 0, currentSurah: '', currentSurahNumber: 1, currentPageNumber: 0, currentAyahNumber: 0, quranStartDate: getTodayKey(), completedSurahs: [] };
        case 'COMPLETE_KHATMA': return {
            ...state,
            stats: { ...state.stats, quranKhatm: state.stats.quranKhatm + 1 },
            lastPageReached: 0, currentSurah: '', currentPageNumber: 0
        };
        case 'ADD_POINTS': return { ...state, totalPoints: Math.max(0, state.totalPoints + action.points) };
        case 'SET_POINTS': return { ...state, totalPoints: action.points };
        case 'ADD_LESSON': return { ...state, lessons: [...state.lessons, action.lesson] };
        case 'UPDATE_LESSON': return { ...state, lessons: state.lessons.map(l => l.id === action.id ? { ...l, ...action.updates } : l) };
        case 'DELETE_LESSON': {
            return {
                ...state,
                lessons: state.lessons.filter(l => l.id !== action.id)
            };
        }
        case 'COMPLETE_LESSON': {
            const lesson = state.lessons.find(l => l.id === action.id);
            if (lesson?.completed) {
                return {
                    ...state,
                    lessons: state.lessons.map(l => l.id === action.id ? { ...l, completed: false } : l)
                };
            } else {
                return {
                    ...state,
                    lessons: state.lessons.map(l => l.id === action.id ? { ...l, completed: true } : l)
                };
            }
        }
        case 'TOGGLE_FASTING': {
            const nextVal = !state.fastingToday;
            return {
                ...state,
                fastingToday: nextVal,
                stats: {
                    ...state.stats,
                    fastingDays: nextVal ? (state.stats.fastingDays || 0) + 1 : Math.max(0, (state.stats.fastingDays || 0) - 1)
                }
            };
        }
        case 'TOGGLE_CHARITY': return { ...state, dailyCharity: !state.dailyCharity };
        case 'TOGGLE_DUA': return { ...state, dailyDua: !state.dailyDua };
        case 'TOGGLE_TRAVELER_MODE': return { ...state, travelerMode: !state.travelerMode };
        case 'TOGGLE_EXEMPTION_MODE': return { ...state, exemptionMode: !state.exemptionMode };
        case 'TOGGLE_THEME': {
            const nextTheme = state.theme === 'light' ? 'dark' : 'light';
            lsSet('daawa_theme', nextTheme);
            document.body.setAttribute('data-theme', nextTheme);
            return { ...state, theme: nextTheme };
        }
        case 'SET_THEME': {
            lsSet('daawa_theme', action.theme);
            document.body.setAttribute('data-theme', action.theme);
            return { ...state, theme: action.theme };
        }
        case 'REPAIR_STREAK': {
            if ((state.streakRepairsLeft || 0) <= 0) return state;
            const target = action.streakType || 'prayer'; // 'prayer' | 'quran' | 'both'
            const restorePrayer = target === 'prayer' || target === 'both';
            const restoreQuran = target === 'quran' || target === 'both';

            const newPrayerStreak = restorePrayer
                ? Math.max(1, (state.brokenStreak?.prayer || state.prayerStreak || 0) + 1)
                : (state.prayerStreak || 0);

            const newQuranStreak = restoreQuran
                ? Math.max(1, (state.brokenStreak?.quran || state.quranStreak || 0) + 1)
                : (state.quranStreak || 0);

            return {
                ...state,
                prayerStreak: newPrayerStreak,
                quranStreak: newQuranStreak,
                streakRepairsLeft: Math.max(0, (state.streakRepairsLeft || 3) - 1),
                brokenStreak: null
            };
        }
        case 'SET_QADAA_PRAYERS': {
            return {
                ...state,
                qadaaPrayers: { ...state.qadaaPrayers, ...action.payload }
            };
        }
        case 'FULFILL_QADAA_PRAYER': {
            const prayerKey = action.prayer;
            const currentDebt = state.qadaaPrayers?.[prayerKey] || 0;
            const currentFulfilled = state.qadaaFulfilled?.[prayerKey] || 0;
            return {
                ...state,
                qadaaPrayers: {
                    ...state.qadaaPrayers,
                    [prayerKey]: Math.max(0, currentDebt - 1)
                },
                qadaaFulfilled: {
                    ...state.qadaaFulfilled,
                    [prayerKey]: currentFulfilled + 1
                },
                totalPoints: state.totalPoints + 15
            };
        }
        case 'SET_QADAA_FASTING': {
            return {
                ...state,
                qadaaFasting: Math.max(0, action.days)
            };
        }
        case 'FULFILL_QADAA_FASTING': {
            return {
                ...state,
                qadaaFasting: Math.max(0, (state.qadaaFasting || 0) - 1),
                qadaaFastingFulfilled: (state.qadaaFastingFulfilled || 0) + 1,
                totalPoints: state.totalPoints + 30
            };
        }
        case 'ADD_TADABBUR_NOTE': {
            return {
                ...state,
                tadabburNotes: [action.note, ...(state.tadabburNotes || [])]
            };
        }
        case 'DELETE_TADABBUR_NOTE': {
            return {
                ...state,
                tadabburNotes: (state.tadabburNotes || []).filter(n => n.id !== action.id)
            };
        }
        case 'IMPORT_DAAWA_BACKUP': {
            return {
                ...state,
                ...action.payload,
                todayKey: getTodayKey()
            };
        }
        case 'SET_ANNOUNCEMENT': return { ...state, announcement: { ...(state.announcement || {}), ...action.payload } };
        case 'SET_PRAYER_OFFSETS': return { ...state, prayerOffsets: { ...(state.prayerOffsets || {}), ...action.payload } };
        case 'UPDATE_DAILY_CONTENT': return {
            ...state,
            customDailyContent: { ...(state.customDailyContent || {}), [action.day]: action.content }
        };
        case 'ADD_CHALLENGE': return { ...state, challenges: [...(state.challenges || []), action.challenge] };
        case 'UPDATE_CHALLENGE': return { ...state, challenges: (state.challenges || []).map(c => c.id === action.id ? { ...c, ...action.updates } : c) };
        case 'DELETE_CHALLENGE': return { ...state, challenges: (state.challenges || []).filter(c => c.id !== action.id) };
        case 'ADD_TIP': return { ...state, tips: [...(state.tips || []), action.tip] };
        case 'UPDATE_TIP': return { ...state, tips: (state.tips || []).map(t => t.id === action.id ? { ...t, ...action.updates } : t) };
        case 'DELETE_TIP': return { ...state, tips: (state.tips || []).filter(t => t.id !== action.id) };
        case 'SET_ADMIN': return { ...state, isAdmin: action.value, adminRole: action.value ? 'admin' : 'user' };
        case 'SPLASH_SEEN': return { ...state, hasSeenSplash: true, lastSplashDate: getTodayKey() };
        case 'ADD_NOTIFICATION': return { ...state, notifications: [action.notification, ...state.notifications].slice(0, 50) };
        case 'CLEAR_NOTIFICATIONS': return { ...state, notifications: [] };
        case 'RESET_USER_POINTS': return { ...state, totalPoints: 0 };
        case 'SET_STATE': return { ...state, ...action.payload };
        case 'RESTORE_STATE': {
            return {
                ...state,
                ...action.payload,
                lessons: state.lessons,
                users: state.users
            };
        }
        case 'SET_USER_NAME': {
            const adminUser = (import.meta.env.VITE_ADMIN_USERNAME || 'admin').toLowerCase();
            const isAdmin = action.isAdmin || (action.name && action.name.toLowerCase() === adminUser);
            return {
                ...state,
                userId: action.userId || action.name,
                userName: action.name,
                isLoggedIn: true,
                isAdmin: isAdmin || false,
                adminRole: isAdmin ? (state.adminRole || 'admin') : 'user',
                todayKey: getTodayKey()
            };
        }
        case 'LOGOUT': {
            return { ...getInitialState() };
        }
        default: return state;
    }
}

export function AppProvider({ children }) {
    const [state, dispatch] = useReducer(appReducer, null, getInitialState);
    const stateRef = useRef(state);
    stateRef.current = state;
    const [prevPoints, setPrevPoints] = useState(0);
    const [serverTime, setServerTime] = useState(null);

    // Load users list from Firestore (for admin leaderboard)
    useEffect(() => {
        let cancelled = false;
        async function loadUsers() {
            try {
                const snap = await getDocs(collection(db, 'users'));
                if (cancelled) return;
                const users = snap.docs.map(d => {
                    const data = d.data();
                    const st = data.state || {};
                    const totalPoints = data.totalPoints ?? st.totalPoints ?? 0;
                    return {
                        name: d.id,
                        totalPoints,
                        state: st
                    };
                });
                if (!cancelled) dispatch({ type: 'SET_STATE', payload: { users } });
            } catch { /* ignore */ }
        }
        loadUsers();
        return () => { cancelled = true; };
    }, []);

    // Check legacy migration
    useEffect(() => {
        let cancelled = false;
        async function checkLegacyMigration() {
            const s = stateRef.current;
            if (s?.isLoggedIn && !s?.isAdmin && s?.userName && s?.userId === s?.userName) {
                try {
                    const docSnap = await getDoc(doc(db, 'users', String(s.userName)));
                    if (!cancelled && docSnap.exists() && docSnap.data().migratedTo) {
                        dispatch({ type: 'SET_STATE', payload: { userId: docSnap.data().migratedTo } });
                    }
                } catch (e) { console.warn('Migration check failed', e); }
            }
        }
        const t = setTimeout(checkLegacyMigration, 1000);
        return () => { cancelled = true; clearTimeout(t); };
    }, [state.isLoggedIn]);

    // Auto-login from localStorage
    useEffect(() => {
        if (state.isLoggedIn) return;
        const saved = lsGet('daawa_state');
        if (saved && saved.userName && saved.userName.trim() !== '') {
            const adminUser = (import.meta.env.VITE_ADMIN_USERNAME || 'admin').toLowerCase();
            const isAdmin = saved.isAdmin || (saved.userName && saved.userName.toLowerCase() === adminUser);
            dispatch({
                type: 'SET_USER_NAME',
                userId: saved.userId,
                name: saved.userName,
                isAdmin: isAdmin || false
            });
        }
    }, [state.isLoggedIn]);

    // Sync theme to document body
    useEffect(() => {
        const theme = state.theme || 'dark';
        document.body.setAttribute('data-theme', theme);
    }, [state.theme]);

    // Save state to localStorage on every change
    useEffect(() => {
        lsSet('daawa_state', state);
    }, [state]);

    // Sync user to Firestore
    const syncUserToFirestore = useCallback(() => {
        const s = stateRef.current;
        if (!s?.isLoggedIn || s.isAdmin || !s?.userName?.trim() || !s?.userId) return;

        const payload = { ...s };
        delete payload.users;
        delete payload.isAdmin;
        delete payload.isLoggedIn;
        delete payload.userName;

        payload.name = String(s.userName).trim();
        payload.totalPoints = Number(s.totalPoints) || 0;
        payload.updatedAt = new Date().toISOString();

        setDoc(doc(db, 'users', String(s.userId)), payload, { merge: true })
            .catch((err) => console.warn('Firestore sync failed:', err?.message || err));
    }, []);

    useEffect(() => {
        const s = stateRef.current;
        if (s?.isLoggedIn && !s?.isAdmin && s?.userName?.trim()) {
            syncUserToFirestore();
            const interval = setInterval(syncUserToFirestore, 60000);
            return () => clearInterval(interval);
        }
    }, [syncUserToFirestore]);

    useEffect(() => {
        if (!state.isLoggedIn || state.isAdmin || !state.userName?.trim()) return;
        const t = setTimeout(syncUserToFirestore, 400);
        return () => clearTimeout(t);
    }, [state.isLoggedIn, state.isAdmin, state.userName, syncUserToFirestore]);

    useEffect(() => {
        if (!state.isLoggedIn || state.isAdmin || !state.userName?.trim()) return;
        const t = setTimeout(syncUserToFirestore, 500);
        return () => clearTimeout(t);
    }, [state.isLoggedIn, state.isAdmin, state.userName, state.totalPoints, syncUserToFirestore]);

    // Server time sync
    useEffect(() => {
        let cancelled = false;
        async function fetchTime() {
            try {
                const res = await fetch('https://worldtimeapi.org/api/timezone/Africa/Cairo');
                if (!res.ok) return;
                const data = await res.json();
                if (!cancelled && data.datetime) {
                    setServerTime(new Date(data.datetime));
                }
            } catch { /* ignore */ }
        }
        fetchTime();
        const id = setInterval(fetchTime, 5 * 60 * 1000);
        return () => { cancelled = true; clearInterval(id); };
    }, []);

    const todayPoints = calculateDayPoints(state);
    const todayPercentage = calculateDayPercentage(state);
    const currentLevel = LEVELS.find(l => state.totalPoints + todayPoints >= l.min && state.totalPoints + todayPoints <= l.max) || LEVELS[0];

    const TOTAL_QURAN_PAGES = 604;
    const getQuranDailyTarget = useCallback(() => {
        const totalPages = TOTAL_QURAN_PAGES * state.khatmaCount;
        const remaining = totalPages - state.totalPagesRead;
        const daawaEnd = new Date('2026-03-31');
        const now = serverTime || new Date();
        const daysLeft = Math.max(1, Math.ceil((daawaEnd - now) / 86400000));
        return Math.ceil(remaining / daysLeft);
    }, [state.khatmaCount, state.totalPagesRead, serverTime]);

    const quranProgress = Math.min((state.totalPagesRead / (TOTAL_QURAN_PAGES * state.khatmaCount)) * 100, 100);

    const nowForDay = serverTime || new Date();
    const daawaDay = calcDaawaDay(nowForDay);
    const isPastNoonValue = isPastNoon(nowForDay);

    const unlockedBadges = BADGES.filter(b => b.condition(state.stats));

    return (
        <AppContext.Provider value={{ state, dispatch, todayPoints, todayPercentage, currentLevel, needsSplash: !state.hasSeenSplash || state.lastSplashDate !== getTodayKey(), unlockedBadges, getQuranDailyTarget, quranProgress, TOTAL_QURAN_PAGES, daawaDay, isPastNoon: isPastNoonValue }}>
            {children}
        </AppContext.Provider>
    );
}

export function useApp() {
    const context = useContext(AppContext);
    if (!context) throw new Error('useApp must be used within AppProvider');
    return context;
}
import { Student, ServiceSession, PointsRuleConfig, CompetitionLog, RewardTier } from '../types';
import { calculateStudentStats } from './calculations';

export type ParentReportTemplateType = 
  | 'monthly_report'
  | 'honor_excellence'
  | 'pastoral_checkin'
  | 'service_reminder'
  | 'custom';

export interface ParentReportData {
  student: Student;
  churchName: string;
  serviceName: string;
  templateType: ParentReportTemplateType;
  selectedMonth?: string; // YYYY-MM
  monthNameArabic?: string;
  customMessageText?: string;
  targetPhone?: string;
  stats?: ReturnType<typeof calculateStudentStats>;
  monthlyStats?: {
    sessionsHeld: number;
    presentCount: number;
    attendanceRate: number;
    monthlyPoints: number;
    liturgyCount: number;
    verseCount: number;
    prayerCount: number;
  };
}

import { formatWhatsAppPhone } from './phone';

/**
 * Normalizes phone numbers to standard international format for WhatsApp (e.g. 201xxxxxxxxx for Egypt)
 */
export function normalizePhoneForWhatsApp(phone?: string): string {
  return formatWhatsAppPhone(phone);
}

/**
 * Generates ready-to-send, beautifully worded Arabic WhatsApp messages for parents
 */
export function generateParentWhatsAppMessage(data: ParentReportData): string {
  const { 
    student, 
    churchName, 
    serviceName, 
    templateType, 
    monthNameArabic, 
    stats, 
    monthlyStats,
    customMessageText 
  } = data;

  const churchHeader = `${serviceName} • ${churchName}`;
  const studentTitle = student.gender === 'بنات' ? `ابنتنا الغالية ${student.name}` : `ابننا الغالي ${student.name}`;
  const pronounHeShe = student.gender === 'بنات' ? 'هي' : 'هو';
  const pronounHimHer = student.gender === 'بنات' ? 'بها' : 'به';

  if (templateType === 'custom' && customMessageText) {
    return customMessageText;
  }

  // 1. Comprehensive Monthly / Periodic Report
  if (templateType === 'monthly_report') {
    const present = monthlyStats ? monthlyStats.presentCount : (stats?.totalPresent || 0);
    const total = monthlyStats ? monthlyStats.sessionsHeld : (stats?.totalSessions || 0);
    const rate = monthlyStats ? monthlyStats.attendanceRate : (stats?.attendanceRate || 0);
    const points = monthlyStats ? monthlyStats.monthlyPoints : (stats?.totalPoints || 0);
    const periodLabel = monthNameArabic ? `خلال شهر ${monthNameArabic}` : 'خلال الفترة الأخيرة';

    return `سلام ونعمة لحضرتك يا فندم ✝️🌸
من أسرة ${churchHeader}.

يسعدنا ويشرفنا مشاركة حضرتك تقرير التزام ونشاط ${studentTitle} ${periodLabel}:

📊 نسبة الحضور: *${rate}%* (${present} من أصل ${total} لقاءات)
🏆 إجمالي النقاط المحققة: *${points} نقطة*
🔥 سلسلة المواظبة الحالية: *${stats?.currentStreak || 0} لقاءات متتالية دون غياب*
${monthlyStats && monthlyStats.liturgyCount > 0 ? `✝️ التزام حضور القداس: *${monthlyStats.liturgyCount} مرات*\n` : ''}${monthlyStats && monthlyStats.verseCount > 0 ? `📖 حفظ الآية الأسبوعية: *${monthlyStats.verseCount} مرات*\n` : ''}
نشكر من كل قلوبنا تعب محبتكم وتشجيعكم المستمر في البيت، وربنا يبارك حياتكم وتفرحوا ${pronounHimHer} دايماً في دراسته وحياته الروحية! ❤️✨

خدام وخادمات أسرة إعدادي 🙏`;
  }

  // 2. Honor & Excellence Celebration
  if (templateType === 'honor_excellence') {
    const points = stats?.totalPoints || 0;
    const streak = stats?.currentStreak || 0;

    return `سلام ونعمة ومبروك من القلب لحضرتك يا فندم! 🥳🎉
من أسرة ${churchHeader}.

فرحانين جداً نبلغكم بتميز وتألق ${studentTitle} في خدمة المرحلة الإعدادية! 🌟

حقّق نتائج مشرفة تستحق كل التقدير:
🥇 من أبطال الصدارة في لوحة الشرف برصيد: *${points} نقطة*!
🔥 مواظبة نموذجية وحضور متتالي لـ *${streak} لقاءات متتالية* دون أي انقطاع.

بنشكر تعب محبتكم وتربيتكم المباركة اللي بتثمر في الكنيسة، ومستنين نكرمه ونفرح معاه في اللقاء القادم إن شاء الله! 🎁✨

دمتم في رعاية المسيح ومحبته دائماً 🙏❤️`;
  }

  // 3. Gentle Pastoral Check-in (غياب أو افتقاد)
  if (templateType === 'pastoral_checkin') {
    return `سلام ونعمة ومحبة لحضرتك يا فندم ✝️🤍
من أسرة خُدام ${churchHeader}.

حابين نطمن على حضرتك وعلى الأسرة الكريمة، ونطمن على حبيبنا ${studentTitle}.
وحشنا جداً وحسينا بمكانه فاضي في الكنيسة وسط إخوته وخدامه اللقاء الماضي! 🌸

يا رب يكون كل الخير والبركة عندكم، ومستنينه بكل حب وشوق يفرح معانا في اللقاء القادم يوم الجمعة.
لو في أي ظرف أو محتاجين نصلي من أجله نحن في خدمتكم دائماً 🙏✨

محبتنا وصلواتنا لكم جميعاً ❤️`;
  }

  // 4. Upcoming Service Reminder
  if (templateType === 'service_reminder') {
    return `سلام ونعمة يا فندم 🌸
تذكير محبة من أسرة ${churchHeader}:

ننتظر حبيبنا ${studentTitle} بكل فرح في لقاء الخدمة الأسبوعي القادم:
🗓️ الميعاد: يوم الجمعة القادم
⛪ المكان: كنيسة السيدة العذراء مريم

مجهزين للأولاد فقرات روحية جميلة، مسابقات ممتعة، وتوزيع هدايا وبونص مميز! 🎁✨
تشجيع حضرتك الدائم له بيفرق جداً في انتظامه وفرحته.. مستنينه بكل محبة! ✝️❤️`;
  }

  return '';
}

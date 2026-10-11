export type GradeLevel = 'أولى إعدادي' | 'ثانية إعدادي' | 'ثالثة إعدادي';
export type Gender = 'بنين' | 'بنات';

export interface ClaimedReward {
  id: string;
  tierId: string;
  tierTitle: string;
  giftName: string;
  date: string; // YYYY-MM-DD
  servantNote?: string;
  milestoneStreak: number;
}

export interface Student {
  id: string;
  name: string;
  grade: GradeLevel;
  gender: Gender;
  family: string; // e.g. "أسرة مارجرجس"
  birthDate?: string; // YYYY-MM-DD
  photoUrl?: string; // Base64 data URL or external image URL
  phone?: string;
  parentPhone?: string;
  notes?: string;
  rewardsClaimed: ClaimedReward[];
}

export interface AttendanceBonus {
  prayer: boolean;        // الالتزام بالصلاة
  liturgy: boolean;       // حضور القداس
  verse: boolean;         // حفظ الآية
  participation: boolean; // المشاركة الفعالة
  customPoints: number;   // مسابقة أو نشاط إضافي
  customReason?: string;
}

export type AttendanceStatus = 'present' | 'absent' | 'excused'; // حاضر | غائب | معتذر

export interface StudentAttendanceRecord {
  status: AttendanceStatus;
  bonus: AttendanceBonus;
  notes?: string;
}

export interface ServiceSession {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  verseOfTheWeek?: string;
  speakerServant?: string; // e.g. "مينا" | "ماجد" | "صبري" | "خادم آخر"
  guestSpeakerName?: string; // in case speakerServant === "خادم آخر"
  notes?: string;
  records: Record<string, StudentAttendanceRecord>; // keyed by studentId
}

export interface RewardTier {
  id: string;
  requiredStreak: number; // 4, 8, 10 etc
  title: string;          // "هدية تشجيعية أولى"
  defaultGiftName: string;// "ميدالية وكشكول كنسي مميز"
  description: string;
  badgeColor: string;     // color scheme
  icon: string;           // icon identifier
  bonusPointsReward: number; // additional points when reached
  enabled: boolean;
}

export interface PointsRuleConfig {
  attendanceBase: number;    // نقاط الحضور الأساسية
  prayer: number;            // نقاط التزام الصلاة
  liturgy: number;           // نقاط حضور القداس
  verse: number;             // نقاط حفظ الآية
  participation: number;     // نقاط المشاركة والتفاعل
  excusedPenalty: number;    // 0 = no penalty
  streakPreserveOnExcuse: boolean; // هل العذر يحفظ التتابع؟
}

export interface CompetitionLog {
  id: string;
  title: string;
  date: string;
  points: number;
  description: string;
  awardedStudentIds: string[];
}

export interface ServantAccount {
  id: string;
  name: string;        // "مينا" | "ماجد" | "صبري"
  username: string;    // "mina" | "maged" | "sabry"
  password: string;    // default "1234"
  title: string;       // e.g. "خادم مسؤول"
}

export type CurrentUser =
  | { type: 'servant'; servant: ServantAccount }
  | { type: 'student'; student: Student }
  | null;

export interface AppState {
  students: Student[];
  sessions: ServiceSession[];
  rewardTiers: RewardTier[];
  pointsRules: PointsRuleConfig;
  competitionLogs: CompetitionLog[];
  servants: ServantAccount[];
  churchName: string;
  serviceName: string;
}

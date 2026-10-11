import { AppState, RewardTier, PointsRuleConfig, Student, ServiceSession, ServantAccount } from '../types';

export const initialRewardTiers: RewardTier[] = [
  {
    id: 'tier-4',
    requiredStreak: 4,
    title: 'هدية صغيرة (التزام 4 مرات)',
    defaultGiftName: 'هدية صغيرة تشجيعية',
    description: 'مكافأة تشجيعية للالتزام بحضور 4 مرات متتالية.',
    badgeColor: 'emerald',
    icon: 'Sparkles',
    bonusPointsReward: 25,
    enabled: true,
  },
  {
    id: 'tier-8',
    requiredStreak: 8,
    title: 'هدية أكبر (التزام 8 مرات)',
    defaultGiftName: 'هدية متوسطة ومميزة',
    description: 'مكافأة تقديرية للالتزام والمواظبة على حضور 8 مرات متتالية.',
    badgeColor: 'blue',
    icon: 'Award',
    bonusPointsReward: 50,
    enabled: true,
  },
  {
    id: 'tier-10',
    requiredStreak: 10,
    title: 'هدية كبيرة (التزام 10 مرات)',
    defaultGiftName: 'هدية كبرى للتميز',
    description: 'الجائزة الكبرى لفرسان الالتزام الذهبي بحضور 10 مرات متتالية.',
    badgeColor: 'amber',
    icon: 'Crown',
    bonusPointsReward: 100,
    enabled: true,
  },
];

export const initialPointsRules: PointsRuleConfig = {
  attendanceBase: 10,
  prayer: 5,        // الالتزام في الصلاة
  liturgy: 10,      // حضور القداس
  verse: 10,        // حفظ الآية
  participation: 5, // المشاركة الفعالة
  excusedPenalty: 0,
  streakPreserveOnExcuse: true,
};

// No demo data - clean empty roster ready for real data entry
export const initialStudents: Student[] = [];

// No demo sessions
export const initialSessions: ServiceSession[] = [];

// No demo competitions
export const initialCompetitionLogs = [];

export const initialServants: ServantAccount[] = [
  {
    id: 'servant-1',
    name: 'مينا',
    username: 'mina',
    password: 'sedoud123',
    title: 'خادم مسؤول (أدمن)',
  },
  {
    id: 'servant-2',
    name: 'ماجد',
    username: 'maged',
    password: 'sedoud123',
    title: 'خادم مسؤول (أدمن)',
  },
  {
    id: 'servant-3',
    name: 'صبري',
    username: 'sabry',
    password: 'sedoud123',
    title: 'خادم مسؤول (أدمن)',
  },
];

export const initialAppState: AppState = {
  churchName: 'خدمة المرحلة الإعدادية في الكنيسة',
  serviceName: 'منصة تسجيل الحضور والمكافآت',
  students: initialStudents,
  sessions: initialSessions,
  rewardTiers: initialRewardTiers,
  pointsRules: initialPointsRules,
  competitionLogs: initialCompetitionLogs,
  servants: initialServants,
};

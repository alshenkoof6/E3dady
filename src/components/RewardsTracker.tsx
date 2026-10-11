import React, { useState, useMemo } from 'react';
import { 
  Student, 
  ServiceSession, 
  PointsRuleConfig, 
  RewardTier, 
  CompetitionLog, 
  ClaimedReward 
} from '../types';
import { calculateStudentStats } from '../utils/calculations';
import { 
  Gift, 
  Sparkles, 
  Award, 
  Crown, 
  CheckCircle, 
  Clock, 
  Flame, 
  Search, 
  History, 
  ChevronRight, 
  Calendar, 
  AlertCircle,
  TrendingUp,
  UserCheck
} from 'lucide-react';

interface RewardsTrackerProps {
  students: Student[];
  sessions: ServiceSession[];
  pointsRules: PointsRuleConfig;
  rewardTiers: RewardTier[];
  competitionLogs: CompetitionLog[];
  isServant?: boolean;
  onOpenLogin?: () => void;
  onDeliverReward: (student: Student, tier: RewardTier) => void;
  onRevokeReward?: (studentId: string, rewardClaimId: string) => void;
}

export const RewardsTracker: React.FC<RewardsTrackerProps> = ({
  students,
  sessions,
  pointsRules,
  rewardTiers,
  competitionLogs,
  isServant = false,
  onOpenLogin,
  onDeliverReward,
  onRevokeReward,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'pending' | 'progress' | 'history'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTierFilter, setSelectedTierFilter] = useState<string>('all');

  // Calculate all stats
  const studentsStats = useMemo(() => {
    return students.map((student) => {
      const stats = calculateStudentStats(student, sessions, pointsRules, competitionLogs, rewardTiers);
      return stats;
    });
  }, [students, sessions, pointsRules, competitionLogs, rewardTiers]);

  // Unclaimed / Pending Rewards:
  // Students who have currentStreak >= tier.requiredStreak and have NOT claimed it yet
  const pendingDeliveries = useMemo(() => {
    const list: {
      student: Student;
      tier: RewardTier;
      currentStreak: number;
    }[] = [];

    studentsStats.forEach((s) => {
      s.eligibleTiers.forEach((et) => {
        if (et.canClaimNow) {
          list.push({
            student: s.student,
            tier: et.tier,
            currentStreak: s.currentStreak,
          });
        }
      });
    });

    return list;
  }, [studentsStats]);

  // History of all claimed rewards
  const claimedHistory = useMemo(() => {
    const list: {
      student: Student;
      claim: ClaimedReward;
    }[] = [];

    students.forEach((student) => {
      student.rewardsClaimed.forEach((claim) => {
        list.push({
          student,
          claim,
        });
      });
    });

    // Sort descending by date
    return list.sort((a, b) => new Date(b.claim.date).getTime() - new Date(a.claim.date).getTime());
  }, [students]);

  // Streak progress to next tier for each student
  const progressList = useMemo(() => {
    return studentsStats.map((s) => {
      // Find the next tier the student hasn't claimed yet and hasn't reached yet
      const nextTier = rewardTiers
        .filter((t) => t.enabled)
        .sort((a, b) => a.requiredStreak - b.requiredStreak)
        .find((t) => s.currentStreak < t.requiredStreak);

      const progressPercent = nextTier
        ? Math.min(100, Math.round((s.currentStreak / nextTier.requiredStreak) * 100))
        : 100;

      const remainingSessions = nextTier ? Math.max(0, nextTier.requiredStreak - s.currentStreak) : 0;

      return {
        ...s,
        nextTier,
        progressPercent,
        remainingSessions,
      };
    }).sort((a, b) => {
      // Prioritize closest to next reward
      if (a.remainingSessions === 0 && b.remainingSessions !== 0) return -1;
      if (b.remainingSessions === 0 && a.remainingSessions !== 0) return 1;
      return a.remainingSessions - b.remainingSessions;
    });
  }, [studentsStats, rewardTiers]);

  // Filtered pending list
  const filteredPending = useMemo(() => {
    return pendingDeliveries.filter((item) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!item.student.name.toLowerCase().includes(q) && !item.student.family.toLowerCase().includes(q)) {
          return false;
        }
      }
      if (selectedTierFilter !== 'all' && item.tier.id !== selectedTierFilter) {
        return false;
      }
      return true;
    });
  }, [pendingDeliveries, searchQuery, selectedTierFilter]);

  return (
    <div className="space-y-6">
      {/* Overview Tiers Banner Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {rewardTiers
          .filter((t) => t.enabled)
          .sort((a, b) => a.requiredStreak - b.requiredStreak)
          .map((tier, idx) => {
            const isFirst = idx === 0;
            const isSecond = idx === 1;
            const isThird = idx >= 2;

            return (
              <div
                key={tier.id}
                className={`rounded-3xl p-5 border relative overflow-hidden transition shadow-sm ${
                  isThird
                    ? 'bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-white border-amber-300'
                    : isSecond
                    ? 'bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-white border-blue-300'
                    : 'bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-white border-emerald-300'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`text-xs font-black px-3 py-1 rounded-full ${
                      isThird
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : isSecond
                        ? 'bg-blue-100 text-blue-900 border border-blue-300'
                        : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    }`}
                  >
                    🔥 تتابع {tier.requiredStreak} مرات
                  </span>

                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                      isThird
                        ? 'bg-amber-500 text-stone-950 shadow-md'
                        : isSecond
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-emerald-600 text-white shadow-md'
                    }`}
                  >
                    {isThird ? <Crown className="w-5 h-5" /> : isSecond ? <Award className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
                  </div>
                </div>

                <h3 className="text-lg font-black text-slate-900 mb-1">{tier.title}</h3>
                <p className="text-xs text-slate-600 font-semibold mb-3">{tier.defaultGiftName}</p>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs font-bold text-slate-500">
                  <span>بونص إضافي: +{tier.bonusPointsReward} نقطة</span>
                  <span className="text-slate-700">
                    {pendingDeliveries.filter((p) => p.tier.id === tier.id).length} بانتظار التسليم
                  </span>
                </div>
              </div>
            );
          })}
      </div>

      {/* Sub-Tabs Navigation */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-2 flex flex-wrap items-center justify-between gap-3">
        <div className="flex space-x-1 space-x-reverse">
          <button
            onClick={() => setActiveSubTab('pending')}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition ${
              activeSubTab === 'pending'
                ? 'bg-amber-500 text-stone-950 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Gift className="w-4 h-4" />
            <span>هدايا مستحقة للتسليم</span>
            {pendingDeliveries.length > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full ring-2 ring-white">
                {pendingDeliveries.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('progress')}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition ${
              activeSubTab === 'progress'
                ? 'bg-amber-500 text-stone-950 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>متابعة تقدم التتابع</span>
          </button>

          <button
            onClick={() => setActiveSubTab('history')}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition ${
              activeSubTab === 'history'
                ? 'bg-amber-500 text-stone-950 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <History className="w-4 h-4" />
            <span>سجل الهدايا المسلمة</span>
            <span className="text-[11px] text-slate-400">({claimedHistory.length})</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64 px-2">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="بحث بالاسم أو الأسرة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-8 pl-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* SUB-TAB 1: PENDING DELIVERIES */}
      {activeSubTab === 'pending' && (
        <div className="space-y-4">
          {filteredPending.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-900">كل الهدايا المستحقة تم تسليمها!</h3>
              <p className="text-xs text-slate-500 mt-1">
                لا يوجد حالياً مخدومين مستحقين لهدايا لم يتم تسليمها. بمجرد تسجيل حضور متتالي لأي مخدوم سيظهر هنا فوراً.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPending.map(({ student, tier, currentStreak }) => (
                <div
                  key={`${student.id}-${tier.id}`}
                  className="bg-white rounded-3xl border-2 border-amber-300 shadow-md p-5 flex flex-col justify-between gap-4 relative overflow-hidden"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-900 border border-amber-200 flex items-center justify-center font-black text-sm shrink-0">
                        {student.name.split(' ').slice(0, 2).map((n) => n[0]).join('')}
                      </div>
                      <div>
                        <h4 className="text-base font-black text-slate-900">{student.name}</h4>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                          <span>{student.grade}</span>
                          <span>•</span>
                          <span>{student.family}</span>
                        </div>
                      </div>
                    </div>

                    <span className="flex items-center gap-1 text-xs font-black bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-1 rounded-full">
                      <Flame className="w-3.5 h-3.5 text-amber-600 fill-amber-600" />
                      <span>{currentStreak} أسابيع</span>
                    </span>
                  </div>

                  <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-black text-amber-900">
                      <Gift className="w-4 h-4 text-amber-600" />
                      <span>{tier.title}</span>
                    </div>
                    <p className="text-xs text-slate-600 font-medium">
                      المقترح: {tier.defaultGiftName}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-slate-400 font-semibold">
                      +{tier.bonusPointsReward} نقطة بونص عند التسليم
                    </span>

                    {isServant ? (
                      <button
                        onClick={() => onDeliverReward(student, tier)}
                        className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black text-xs rounded-xl shadow-md transition active:scale-95 flex items-center gap-1.5"
                      >
                        <Gift className="w-4 h-4" />
                        <span>تسليم الهدية الآن 🎁</span>
                      </button>
                    ) : (
                      <span className="text-xs font-bold text-amber-800 bg-amber-100/80 px-3 py-1.5 rounded-xl border border-amber-200">
                        بانتظار تسليم الخادم المسؤول 🎁
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: PROGRESS TOWARDS NEXT REWARD */}
      {activeSubTab === 'progress' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 space-y-3">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-black text-slate-900">متابعة تتابع الحضور والهدف القادم</h3>
              <p className="text-xs text-slate-500">
                تعرف على عدد المرات المتبقية لكل مخدوم للحصول على هديته التالية للتشجيع والافتقاد.
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            {progressList.map(({ student, currentStreak, nextTier, progressPercent, remainingSessions }) => (
              <div
                key={student.id}
                className="p-3.5 rounded-2xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                    {student.name.split(' ').slice(0, 2).map((n) => n[0]).join('')}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{student.name}</h4>
                    <p className="text-[11px] text-slate-500">{student.grade} • {student.family}</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="flex-1 max-w-xs space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-700">
                      🔥 تتابع: {currentStreak} {nextTier ? `/ ${nextTier.requiredStreak}` : ''}
                    </span>
                    <span className="text-amber-700">{progressPercent}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        progressPercent >= 100
                          ? 'bg-emerald-500'
                          : progressPercent >= 75
                          ? 'bg-amber-500'
                          : 'bg-blue-500'
                      }`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Status indicator */}
                <div className="text-left shrink-0">
                  {remainingSessions === 0 ? (
                    <span className="text-xs font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-xl inline-block">
                      مستحق للهدية! 🎁
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-slate-600 bg-white border border-slate-200 px-2.5 py-1 rounded-xl inline-block">
                      باقي {remainingSessions} {remainingSessions === 1 ? 'أسبوع' : 'أسابيع'}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: CLAIMED HISTORY */}
      {activeSubTab === 'history' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5">
          <div className="mb-4">
            <h3 className="text-sm font-black text-slate-900">أرشيف الهدايا المسلمة</h3>
            <p className="text-xs text-slate-500">سجل كامل بجميع الهدايا التي استلمها الأولاد والبنات وتواريخها وملاحظات الخدام.</p>
          </div>

          {claimedHistory.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs font-medium">
              لم يتم تسليم أي هدايا حتى الآن.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {claimedHistory.map(({ student, claim }) => (
                <div key={claim.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shrink-0">
                      <Gift className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-slate-900">{student.name}</span>
                        <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-bold">
                          {claim.tierTitle}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">
                        الهدية: <span className="font-bold text-slate-800">{claim.giftName}</span>
                        {claim.servantNote && ` (${claim.servantNote})`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-start sm:self-auto text-xs text-slate-400">
                    <span className="flex items-center gap-1 font-semibold">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{claim.date}</span>
                    </span>

                    {isServant && onRevokeReward && (
                      <button
                        onClick={() => onRevokeReward(student.id, claim.id)}
                        className="text-rose-600 hover:text-rose-800 text-[11px] font-bold underline transition"
                      >
                        تراجع
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

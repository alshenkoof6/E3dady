import React, { useMemo } from 'react';
import { 
  Student, 
  ServiceSession, 
  PointsRuleConfig, 
  RewardTier, 
  CompetitionLog 
} from '../types';
import { calculateStudentStats } from '../utils/calculations';
import { getStudentMonthlyTop3Info } from '../utils/monthlyCalculations';
import { 
  Flame, 
  Award, 
  Gift, 
  Star, 
  Church, 
  BookOpen, 
  HeartHandshake, 
  Sparkles, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  LogOut, 
  User, 
  Zap,
  TrendingUp,
  ShieldAlert,
  Cake,
  AlertTriangle,
  Lock,
  Crown
} from 'lucide-react';
import { isBirthdayToday, calculateAge, formatBirthDateArabic } from '../utils/birthday';

interface StudentPortalViewProps {
  student: Student;
  allStudents?: Student[];
  sessions: ServiceSession[];
  pointsRules: PointsRuleConfig;
  rewardTiers: RewardTier[];
  competitionLogs: CompetitionLog[];
  churchName: string;
  serviceName: string;
  onLogout: () => void;
  onOpenLoginModal: () => void;
  onOpenAchievementCard?: () => void;
}

export const StudentPortalView: React.FC<StudentPortalViewProps> = ({
  student,
  allStudents = [],
  sessions,
  pointsRules,
  rewardTiers,
  competitionLogs,
  churchName,
  serviceName,
  onLogout,
  onOpenLoginModal,
  onOpenAchievementCard,
}) => {
  const stats = calculateStudentStats(student, sessions, pointsRules, competitionLogs, rewardTiers);

  // Top 3 Monthly Standing Calculation
  const top3Status = useMemo(() => {
    const list = allStudents.length > 0 ? allStudents : [student];
    return getStudentMonthlyTop3Info(
      student.id,
      list,
      sessions,
      pointsRules,
      competitionLogs
    );
  }, [student.id, allStudents, sessions, pointsRules, competitionLogs]);

  // Sorted sessions descending
  const sortedSessions = [...sessions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Student specific competition and penalty logs
  const studentActivities = competitionLogs
    .filter((c) => c.awardedStudentIds.includes(student.id))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Next milestone calculation
  const nextTier = rewardTiers
    .filter((t) => t.enabled)
    .sort((a, b) => a.requiredStreak - b.requiredStreak)
    .find((t) => stats.currentStreak < t.requiredStreak);

  const progressPercent = nextTier
    ? Math.min(100, Math.round((stats.currentStreak / nextTier.requiredStreak) * 100))
    : 100;

  const remainingSessions = nextTier ? Math.max(0, nextTier.requiredStreak - stats.currentStreak) : 0;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Student Welcome Header Card */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-blue-700/50">
        <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500"></div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            {student.photoUrl ? (
              <img
                src={student.photoUrl}
                alt={student.name}
                className="w-16 h-16 rounded-3xl object-cover border-2 border-amber-400 shadow-lg shadow-amber-400/20 shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-3xl bg-amber-400 text-stone-950 flex items-center justify-center font-black text-2xl shadow-lg shadow-amber-400/20 shrink-0">
                {student.name.split(' ').slice(0, 2).map((n) => n[0]).join('')}
              </div>
            )}

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-amber-400/20 text-amber-300 border border-amber-400/40 px-2.5 py-0.5 rounded-full font-bold">
                  بوابة مخدومي إعدادي
                </span>
                <span className="text-xs text-blue-200">
                  {student.grade}
                </span>
                {student.birthDate && (
                  <span className="text-xs text-blue-300/90 hidden sm:inline">
                    • {formatBirthDateArabic(student.birthDate)}
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
                أهلاً بك يا بطل، {student.name}
              </h1>
              <p className="text-xs sm:text-sm text-blue-200/90 mt-0.5 font-medium">
                {student.family} • {serviceName}
              </p>
            </div>
          </div>

          {/* Logout / Switch User */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={onOpenLoginModal}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-white/10 hover:bg-white/20 text-blue-100 rounded-xl transition border border-white/15"
            >
              <span>تبديل الحساب</span>
            </button>
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-rose-500/80 hover:bg-rose-500 text-white rounded-xl transition shadow-sm"
              title="تسجيل الخروج"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>خروج</span>
            </button>
          </div>
        </div>

        {/* Birthday Celebration Banner for the student if today is their birthday! */}
        {isBirthdayToday(student.birthDate) && (
          <div className="mt-5 p-4 rounded-2xl bg-gradient-to-r from-amber-500/30 via-rose-500/30 to-amber-500/30 border border-amber-300/60 flex items-center gap-3.5 animate-pulse">
            <div className="w-12 h-12 rounded-xl bg-amber-400 text-stone-950 flex items-center justify-center shrink-0 shadow-md">
              <Cake className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-base font-black text-amber-200">
                🎉 كل سنة وأنت طيب يا {student.name}!
              </h2>
              <p className="text-xs text-blue-100 mt-0.5 font-medium">
                خدام وأسرة خدمة إعدادي يهنئونك بعيد ميلادك! سنة جديدة مباركة ومملوءة بركة وفرح ونجاح مع بابا يسوع ✝️🎂
              </p>
            </div>
          </div>
        )}

        {/* Read-Only Notice Bar */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-blue-200">
          <span>وضع العرض الشخصي: يمكنك متابعة حضورك ورصيد نقاطك المحدث من قِبل الخدام.</span>
          <span className="text-amber-300 font-bold">ملتزم بالخدمة ✨</span>
        </div>
      </div>

      {/* Social Achievement Card Banner - Exclusive for Monthly Top 3 */}
      {top3Status.isTop3 ? (
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 rounded-3xl p-5 text-stone-950 shadow-lg shadow-amber-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-2 border-amber-300 animate-in fade-in duration-300">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-stone-950 text-amber-400 flex items-center justify-center font-black text-2xl shrink-0 shadow-md ring-2 ring-amber-300/60">
              {top3Status.rank === 1 ? '🥇' : top3Status.rank === 2 ? '🥈' : '🥉'}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs bg-stone-950 text-amber-300 px-2.5 py-0.5 rounded-full font-black flex items-center gap-1">
                  <Crown className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                  <span>
                    المركز {top3Status.rank === 1 ? 'الأول 🥇' : top3Status.rank === 2 ? 'الثاني 🥈' : 'الثالث 🥉'} • شهر {top3Status.monthNameArabic}
                  </span>
                </span>
                <span className="text-xs bg-amber-200/90 text-amber-950 font-bold px-2 py-0.5 rounded-full">
                  وسام معتمد 🏆
                </span>
              </div>
              <h3 className="font-black text-white text-base sm:text-lg mt-1">
                مبروك! أنت من أبطال المراكز الثلاثة الأولى لشهر {top3Status.monthNameArabic}!
              </h3>
              <p className="text-xs text-amber-100 font-medium mt-0.5">
                تأهلت للحصول على كارت الإنجاز التكريمي الرسمي باسمك ورصيدك ({top3Status.monthlyPoints} نقطة) لمشاركته على السوشيال ميديا وواتساب.
              </p>
            </div>
          </div>

          {onOpenAchievementCard && (
            <button
              onClick={onOpenAchievementCard}
              className="px-5 py-3 bg-stone-950 hover:bg-stone-900 text-amber-300 font-black text-xs sm:text-sm rounded-2xl transition shadow-xl flex items-center justify-center gap-2 shrink-0 active:scale-95 cursor-pointer border border-amber-400/50 hover:border-amber-300"
            >
              <Award className="w-4 h-4 text-amber-400" />
              <span>استخراج كارت الإنجاز 📲</span>
            </button>
          )}
        </div>
      ) : (
        <div className="bg-slate-900 border border-amber-500/30 rounded-3xl p-5 text-white shadow-md relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 text-amber-400 flex items-center justify-center font-black text-xl shrink-0 shadow-inner mt-0.5 sm:mt-0">
                <Lock className="w-5 h-5 text-amber-400/80" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                    <Award className="w-3 h-3 text-amber-400" />
                    <span>متاح حصرياً للمراكز الـ 3 الأولى بنهاية كل شهر</span>
                  </span>
                </div>
                <h3 className="font-black text-slate-100 text-sm sm:text-base mt-1">
                  كارت الإنجاز والوسام التكريمي مفتوح لأبطال التوب 3 بنهاية كل شهر
                </h3>
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                  أنت حالياً في <b className="text-amber-400">المركز {top3Status.latestMonthRank > 0 ? top3Status.latestMonthRank : '—'}</b> لشهر {top3Status.latestMonthName} برصيد <b className="text-amber-300">{top3Status.latestMonthPoints} نقطة</b>.
                  {top3Status.pointsToTop3 > 0 ? (
                    <span className="text-amber-200 block sm:inline font-semibold">
                      {' '}يفصلك فقط {top3Status.pointsToTop3} نقطة عن دخول التوب 3!
                    </span>
                  ) : null}
                  {' '}واصل حضور القداس وحفظ الآيات لتكون بين الأوائل بنهاية الشهر وتفتح بطاقتك!
                </p>
              </div>
            </div>

            <div className="px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-2xl text-center shrink-0 self-start sm:self-auto">
              <span className="text-[10px] text-slate-400 block font-semibold">حالة كارت الإنجاز</span>
              <span className="text-xs font-black text-amber-400/90 flex items-center justify-center gap-1 mt-0.5">
                <Lock className="w-3.5 h-3.5" />
                <span>مغلق للمركز {top3Status.latestMonthRank > 0 ? top3Status.latestMonthRank : 'الحالي'}</span>
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">يُفتح تلقائياً للمراكز 1 و 2 و 3</span>
            </div>
          </div>
        </div>
      )}

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Total Points */}
        <div className="bg-gradient-to-br from-amber-50 via-white to-amber-50/50 border-2 border-amber-300 rounded-3xl p-5 text-center shadow-sm">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto mb-2">
            <Award className="w-5 h-5 text-amber-600" />
          </div>
          <span className="text-xs font-bold text-amber-800 block">
            {stats.isCycleActive ? 'رصيد الدورة الحالية' : 'رصيد نقاطك الكلي'}
          </span>
          <span className="text-3xl font-black text-amber-950 mt-1 block">{stats.totalPoints}</span>
          <span className="text-[10px] text-amber-700 font-semibold block">
            {stats.isCycleActive ? `نقطة تميز (الكلي: ${stats.allTimePoints})` : 'نقطة تميز'}
          </span>
        </div>

        {/* Current Streak */}
        <div className="bg-gradient-to-br from-orange-50 via-white to-orange-50/50 border border-orange-200 rounded-3xl p-5 text-center shadow-sm">
          <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto mb-2">
            <Flame className="w-5 h-5 fill-orange-500 text-orange-500" />
          </div>
          <span className="text-xs font-bold text-orange-800 block">تتابع الحضور الحالي</span>
          <span className="text-3xl font-black text-orange-950 mt-1 block flex items-center justify-center gap-1">
            {stats.currentStreak}
          </span>
          <span className="text-[10px] text-orange-700 font-semibold">
            {stats.currentStreak === 1 ? 'أسبوع متتالي' : 'أسابيع متتالية'}
          </span>
        </div>

        {/* Best Streak */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 text-center shadow-sm">
          <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center mx-auto mb-2">
            <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
          </div>
          <span className="text-xs font-bold text-slate-500 block">أفضل تتابع حققته</span>
          <span className="text-3xl font-black text-slate-800 mt-1 block">{stats.bestStreak}</span>
          <span className="text-[10px] text-slate-400 font-semibold">مرات متتالية</span>
        </div>

        {/* Attendance Rate */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 text-center shadow-sm">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-2">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-emerald-800 block">نسبة الحضور</span>
          <span className="text-3xl font-black text-emerald-700 mt-1 block">{stats.attendanceRate}%</span>
          <span className="text-[10px] text-slate-400 font-semibold">
            ({stats.totalPresent} من {stats.totalSessions} لقاء)
          </span>
        </div>
      </div>

      {/* Next Gift Progress Card */}
      <div className="bg-white rounded-3xl border-2 border-amber-300/80 shadow-md p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-stone-950 flex items-center justify-center shadow-md">
              <Gift className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                {nextTier ? `هدفك القادم: ${nextTier.title}` : 'أنت في القمة! أحسنت الالتزام'}
              </h3>
              <p className="text-xs text-slate-600 font-medium">
                {nextTier ? nextTier.description : 'حققت جميع مستويات الالتزام الحالية بامتياز.'}
              </p>
            </div>
          </div>

          {remainingSessions === 0 ? (
            <span className="text-xs font-black bg-emerald-100 text-emerald-900 border border-emerald-300 px-3 py-1.5 rounded-xl self-start sm:self-auto animate-bounce">
              🎉 مبروك! مستحق للهدية بالاجتماع القادم
            </span>
          ) : (
            <span className="text-xs font-bold bg-amber-50 text-amber-900 border border-amber-300 px-3 py-1.5 rounded-xl self-start sm:self-auto">
              باقي {remainingSessions} {remainingSessions === 1 ? 'أسبوع' : 'أسابيع'} حضور متتالي
            </span>
          )}
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5 pt-2">
          <div className="flex items-center justify-between text-xs font-black text-slate-700">
            <span>التقدم الحالي: {stats.currentStreak} من {nextTier?.requiredStreak || stats.currentStreak}</span>
            <span className="text-amber-800">{progressPercent}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden p-0.5 border border-slate-200">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
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

        {/* Claimed gifts history if any */}
        {student.rewardsClaimed.length > 0 && (
          <div className="pt-3 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-600 block mb-2">الهدايا التي استلمتها سابقاً:</span>
            <div className="flex flex-wrap gap-2">
              {student.rewardsClaimed.map((c) => (
                <span
                  key={c.id}
                  className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold px-3 py-1 rounded-xl flex items-center gap-1.5"
                >
                  <Gift className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{c.tierTitle}: {c.giftName} ({c.date})</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Points Distribution Breakdown */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 space-y-4">
        <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <span>من أين جمعت نقاطك؟ (توزيع النقاط)</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl text-center">
            <span className="text-xs text-slate-500 font-bold block">الحضور الأساسي</span>
            <span className="text-xl font-black text-slate-900 mt-1 block">
              {stats.pointsBreakdown.attendance} نقطة
            </span>
          </div>

          <div className="bg-purple-50 border border-purple-200 p-3.5 rounded-2xl text-center">
            <span className="text-xs text-purple-800 font-bold block">القداس والتناول</span>
            <span className="text-xl font-black text-purple-900 mt-1 block">
              {stats.pointsBreakdown.liturgy} نقطة
            </span>
          </div>

          <div className="bg-blue-50 border border-blue-200 p-3.5 rounded-2xl text-center">
            <span className="text-xs text-blue-800 font-bold block">حفظ الآيات</span>
            <span className="text-xl font-black text-blue-900 mt-1 block">
              {stats.pointsBreakdown.verse} نقطة
            </span>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-2xl text-center">
            <span className="text-xs text-emerald-800 font-bold block">الالتزام بالصلاة</span>
            <span className="text-xl font-black text-emerald-900 mt-1 block">
              {stats.pointsBreakdown.prayer} نقطة
            </span>
          </div>

          <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl text-center">
            <span className="text-xs text-amber-800 font-bold block">المشاركة بالدرس</span>
            <span className="text-xl font-black text-amber-900 mt-1 block">
              {stats.pointsBreakdown.participation} نقطة
            </span>
          </div>

          <div className="bg-rose-50 border border-rose-200 p-3.5 rounded-2xl text-center">
            <span className="text-xs text-rose-800 font-bold block">المسابقات والكويزات</span>
            <span className="text-xl font-black text-rose-900 mt-1 block">
              {stats.pointsBreakdown.competitions} نقطة
            </span>
          </div>

          {stats.pointsBreakdown.penalties > 0 && (
            <div className="bg-rose-100/70 border border-rose-300 p-3.5 rounded-2xl text-center">
              <span className="text-xs text-rose-900 font-bold block flex items-center justify-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                <span>الخصومات السلوكية</span>
              </span>
              <span className="text-xl font-black text-rose-900 mt-1 block">
                -{stats.pointsBreakdown.penalties} نقطة
              </span>
            </div>
          )}

          <div className={`bg-amber-100 border border-amber-300 p-3.5 rounded-2xl text-center ${stats.pointsBreakdown.penalties > 0 ? '' : 'col-span-2'}`}>
            <span className="text-xs text-amber-900 font-bold block">بونص جوائز التتابع الإضافية</span>
            <span className="text-xl font-black text-amber-950 mt-1 block">
              +{stats.pointsBreakdown.tierRewards} نقطة
            </span>
          </div>
        </div>
      </div>

      {/* Attendance History Timeline */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 space-y-4">
        <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-amber-600" />
          <span>سجل حضورك في اللقاءات السابقة</span>
        </h3>

        <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
          {sortedSessions.map((session) => {
            const record = session.records[student.id];
            if (!record) return null;

            const isPresent = record.status === 'present';
            const isAbsent = record.status === 'absent';
            const isExcused = record.status === 'excused';

            return (
              <div
                key={session.id}
                className="p-4 bg-white hover:bg-slate-50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm text-slate-900">{session.date}</span>
                    <span className="text-xs text-slate-600">- {session.title}</span>
                  </div>

                  {session.speakerServant && (
                    <p className="text-xs text-slate-400 mt-0.5">
                      خادم الدرس: <span className="font-bold text-slate-600">{session.speakerServant}</span>
                    </p>
                  )}

                  {isPresent && (
                    <div className="flex flex-wrap items-center gap-1.5 mt-2 text-xs">
                      {record.bonus.liturgy && (
                        <span className="bg-purple-100 text-purple-800 px-2.5 py-0.5 rounded-lg font-bold">
                          ⛪ حضور القداس
                        </span>
                      )}
                      {record.bonus.verse && (
                        <span className="bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-lg font-bold">
                          📖 حفظ الآية
                        </span>
                      )}
                      {record.bonus.prayer && (
                        <span className="bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-lg font-bold">
                          🙏 صلاة
                        </span>
                      )}
                      {record.bonus.participation && (
                        <span className="bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-lg font-bold">
                          💡 تفاعل بالدرس
                        </span>
                      )}
                      {record.bonus.customPoints > 0 && (
                        <span className="bg-rose-100 text-rose-800 px-2.5 py-0.5 rounded-lg font-bold">
                          🎯 مسابقة (+{record.bonus.customPoints})
                        </span>
                      )}
                      {record.bonus?.penaltyPoints && record.bonus.penaltyPoints > 0 && (
                        <span className="bg-rose-100 text-rose-800 px-2.5 py-0.5 rounded-lg font-bold flex items-center gap-1 border border-rose-200">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                          <span>تنبيه سلوكي (-{record.bonus.penaltyPoints}): {record.bonus.penaltyReason || 'سلوك سلبي'}</span>
                        </span>
                      )}
                    </div>
                  )}

                  {!isPresent && record.bonus?.penaltyPoints && record.bonus.penaltyPoints > 0 && (
                    <div className="mt-2 text-xs">
                      <span className="bg-rose-100 text-rose-800 px-2.5 py-0.5 rounded-lg font-bold flex items-center gap-1 border border-rose-200 inline-flex">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                        <span>تنبيه سلوكي (-{record.bonus.penaltyPoints}): {record.bonus.penaltyReason || 'سلوك سلبي'}</span>
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  {isPresent && (
                    <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-xs font-black px-3 py-1.5 rounded-xl">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>حاضر</span>
                    </span>
                  )}
                  {isAbsent && (
                    <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-800 text-xs font-black px-3 py-1.5 rounded-xl">
                      <XCircle className="w-4 h-4" />
                      <span>غائب</span>
                    </span>
                  )}
                  {isExcused && (
                    <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-xs font-black px-3 py-1.5 rounded-xl">
                      <Clock className="w-4 h-4" />
                      <span>معتذر بعذر</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Activities and Behavioral Penalties Log */}
      {studentActivities.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 space-y-4">
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span>سجل الأنشطة والمسابقات والتنبيهات ({studentActivities.length})</span>
          </h3>

          <div className="space-y-2">
            {studentActivities.map((act) => {
              const isNeg = act.points < 0 || act.type === 'penalty';
              return (
                <div
                  key={act.id}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs sm:text-sm transition ${
                    isNeg
                      ? 'bg-rose-50/70 border-rose-200 text-rose-950'
                      : 'bg-white border-slate-200 text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {isNeg ? (
                      <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                    ) : (
                      <Award className="w-5 h-5 text-amber-500 shrink-0" />
                    )}
                    <div>
                      <span className="font-bold">{act.title}</span>
                      {act.description && (
                        <p className="text-slate-500 text-xs mt-0.5">{act.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-slate-400 font-semibold">{act.date}</span>
                    <span
                      className={`font-black px-3 py-1 rounded-xl text-xs sm:text-sm ${
                        isNeg
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      }`}
                    >
                      {isNeg ? `${act.points} نقطة` : `+${act.points} نقطة`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

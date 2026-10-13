import React, { useState, useMemo } from 'react';
import { 
  Student, 
  ServiceSession, 
  PointsRuleConfig, 
  RewardTier, 
  CompetitionLog, 
  GradeLevel, 
  Gender 
} from '../types';
import { calculateStudentStats, StudentCalculatedStats } from '../utils/calculations';
import { 
  Trophy, 
  Flame, 
  Crown, 
  Award, 
  Medal, 
  Star, 
  Search, 
  Filter, 
  Sparkles, 
  Gift 
} from 'lucide-react';

interface LeaderboardViewProps {
  students: Student[];
  sessions: ServiceSession[];
  pointsRules: PointsRuleConfig;
  rewardTiers: RewardTier[];
  competitionLogs: CompetitionLog[];
  onSelectStudent: (student: Student) => void;
  onOpenAchievementCard?: (student: Student, title?: 'بطل الشهر' | 'بطل التتابع الذهبي' | 'افضل قارئ للانجيل وحافظ الآيات') => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  students,
  sessions,
  pointsRules,
  rewardTiers,
  competitionLogs,
  onSelectStudent,
  onOpenAchievementCard,
}) => {
  const [selectedGrade, setSelectedGrade] = useState<GradeLevel | 'الكل'>('الكل');
  const [selectedGender, setSelectedGender] = useState<Gender | 'الكل'>('الكل');
  const [sortBy, setSortBy] = useState<'points' | 'allTime' | 'streak' | 'rate'>('points');
  const [searchQuery, setSearchQuery] = useState('');

  // Calculate stats for all students
  const allStats = useMemo(() => {
    return students.map((student) =>
      calculateStudentStats(student, sessions, pointsRules, competitionLogs, rewardTiers)
    );
  }, [students, sessions, pointsRules, competitionLogs, rewardTiers]);

  // Filtered and sorted
  const sortedList = useMemo(() => {
    return allStats
      .filter((item) => {
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          if (!item.student.name.toLowerCase().includes(q) && !item.student.family.toLowerCase().includes(q)) {
            return false;
          }
        }
        if (selectedGrade !== 'الكل' && item.student.grade !== selectedGrade) return false;
        if (selectedGender !== 'الكل' && item.student.gender !== selectedGender) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'points') {
          return b.totalPoints - a.totalPoints || b.currentStreak - a.currentStreak;
        } else if (sortBy === 'allTime') {
          return b.allTimePoints - a.allTimePoints || b.totalPoints - a.totalPoints;
        } else if (sortBy === 'streak') {
          return b.currentStreak - a.currentStreak || b.totalPoints - a.totalPoints;
        } else {
          return b.attendanceRate - a.attendanceRate || b.totalPoints - a.totalPoints;
        }
      });
  }, [allStats, searchQuery, selectedGrade, selectedGender, sortBy]);

  const top3 = sortedList.slice(0, 3);
  const remainingList = sortedList.slice(3);

  return (
    <div className="space-y-6">
      {/* Active Points Cycle Banner */}
      {pointsRules.pointsCycleStartDate && (
        <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border border-amber-200/90 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs animate-in fade-in">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-500 text-stone-950 flex items-center justify-center font-black text-xl shrink-0 shadow-xs">
              🏆
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-amber-500 text-stone-950 text-[11px] font-black px-2 py-0.5 rounded-lg">
                  دورة مسابقة نشطة
                </span>
                <span className="font-black text-amber-950 text-sm">
                  {pointsRules.pointsCycleTitle || 'دورة جديدة'}
                </span>
              </div>
              <p className="text-amber-900 text-xs mt-1 font-medium leading-relaxed">
                تم تصفير عداد النقاط وبدء احتساب نقاط التنافس والجوائز من تاريخ <b>{pointsRules.pointsCycleStartDate}</b> لمنح فرصة عادلة للجميع. (سجلات الحضور التاريخية محفوظة بالكامل).
              </p>
            </div>
          </div>
          <span className="self-start sm:self-auto px-3.5 py-1.5 bg-amber-200/90 text-amber-950 font-black rounded-xl text-xs shrink-0 border border-amber-300">
            تاريخ البدء: {pointsRules.pointsCycleStartDate}
          </span>
        </div>
      )}

      {/* Header & Filters */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-amber-500" />
              <span>لوحة الشرف - فرسان خدمة إعدادي</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              ترتيب الأبطال وفق النقاط، تتابع الحضور الأسبوعي، والمشاركات الكنسية.
            </p>
          </div>

          {/* Sort By Toggle */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200 self-start md:self-auto">
            <span className="text-xs font-bold text-slate-500 px-2">الترتيب حسب:</span>
            <button
              onClick={() => setSortBy('points')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                sortBy === 'points' ? 'bg-amber-500 text-stone-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {pointsRules.pointsCycleStartDate ? 'نقاط الدورة الحالية 🏆' : 'النقاط الكلية'}
            </button>
            {pointsRules.pointsCycleStartDate && (
              <button
                onClick={() => setSortBy('allTime')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                  sortBy === 'allTime' ? 'bg-amber-500 text-stone-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                النقاط التراكمية (تاريخياً)
              </button>
            )}
            <button
              onClick={() => setSortBy('streak')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                sortBy === 'streak' ? 'bg-amber-500 text-stone-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              تتابع الحضور 🔥
            </button>
            <button
              onClick={() => setSortBy('rate')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                sortBy === 'rate' ? 'bg-amber-500 text-stone-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              نسبة الحضور %
            </button>
          </div>
        </div>

        {/* Filters and search row */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100 text-xs">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ابحث عن مخدوم بالاسم..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-9 pl-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div className="flex rounded-xl bg-slate-100 p-0.5 border border-slate-200">
            {(['الكل', 'أولى إعدادي', 'ثانية إعدادي', 'ثالثة إعدادي'] as const).map((g) => (
              <button
                key={g}
                onClick={() => setSelectedGrade(g)}
                className={`px-2.5 py-1 rounded-lg font-bold transition ${
                  selectedGrade === g ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                {g}
              </button>
            ))}
          </div>

          <div className="flex rounded-xl bg-slate-100 p-0.5 border border-slate-200">
            {(['الكل', 'بنين', 'بنات'] as const).map((gen) => (
              <button
                key={gen}
                onClick={() => setSelectedGender(gen)}
                className={`px-2.5 py-1 rounded-lg font-bold transition ${
                  selectedGender === gen ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                {gen}
              </button>
            ))}
          </div>
        </div>
      </div>

      {students.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-amber-300 p-12 text-center max-w-lg mx-auto">
          <Trophy className="w-14 h-14 text-amber-500 mx-auto mb-3" />
          <h3 className="text-base font-black text-slate-800">لوحة الشرف جاهزة لفرسان الخدمة</h3>
          <p className="text-xs text-slate-500 mt-1">
            سيظهر هنا ترتيب وتتويج الأولاد والبنات وفق النقاط والتتابع فور تسجيل حضور اللقاءات وإضافة المخدومين.
          </p>
        </div>
      ) : (
        <>
          {/* TOP 3 PODIUM */}
          {top3.length > 0 && !searchQuery && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          {/* Rank 2 (Silver) */}
          {top3[1] && (
            <div
              onClick={() => onSelectStudent(top3[1].student)}
              className="order-2 md:order-1 bg-gradient-to-b from-slate-100 via-white to-slate-50 border-2 border-slate-300 rounded-3xl p-5 text-center shadow-md relative cursor-pointer hover:shadow-lg transition group"
            >
              {top3[1].student.photoUrl ? (
                <div className="relative w-14 h-14 mx-auto mb-2">
                  <img
                    src={top3[1].student.photoUrl}
                    alt={top3[1].student.name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-slate-300 shadow-md"
                  />
                  <span className="absolute -bottom-1 -right-1 text-sm bg-slate-200 rounded-full w-5 h-5 flex items-center justify-center shadow-xs">
                    🥈
                  </span>
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-black mx-auto mb-2 text-sm">
                  🥈
                </div>
              )}
              <span className="text-[11px] font-bold text-slate-500 uppercase">المركز الثاني</span>
              <h3 className="text-base font-black text-slate-900 mt-1 group-hover:text-amber-700 transition">
                {top3[1].student.name}
              </h3>
              <p className="text-xs text-slate-500 mb-3">{top3[1].student.grade}</p>

              <div className="bg-white rounded-2xl p-3 border border-slate-200/80 flex items-center justify-around">
                <div>
                  <span className="text-xs text-slate-400 block font-semibold">
                    {sortBy === 'allTime' ? 'النقاط التاريخية' : (pointsRules.pointsCycleStartDate ? 'نقاط الدورة' : 'النقاط')}
                  </span>
                  <span className="text-xl font-black text-slate-800">
                    {sortBy === 'allTime' ? top3[1].allTimePoints : top3[1].totalPoints}
                  </span>
                </div>
                <div className="h-6 w-px bg-slate-200"></div>
                <div>
                  <span className="text-xs text-slate-400 block font-semibold">تتابع</span>
                  <span className="text-xl font-black text-amber-600 flex items-center justify-center gap-0.5">
                    <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
                    {top3[1].currentStreak}
                  </span>
                </div>
              </div>

              {onOpenAchievementCard && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const suggested = top3[1].currentStreak >= 4 ? 'بطل التتابع الذهبي' : 'بطل الشهر';
                    onOpenAchievementCard(top3[1].student, suggested);
                  }}
                  className="mt-3 w-full py-2 bg-slate-100 hover:bg-amber-100 text-slate-800 hover:text-amber-950 font-bold text-xs rounded-xl border border-slate-200 transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Award className="w-3.5 h-3.5 text-amber-600" />
                  <span>استخراج كارت الإنجاز 📲</span>
                </button>
              )}
            </div>
          )}

          {/* Rank 1 (Gold / Crown) */}
          {top3[0] && (
            <div
              onClick={() => onSelectStudent(top3[0].student)}
              className="order-1 md:order-2 bg-gradient-to-b from-amber-100 via-amber-50/50 to-white border-2 border-amber-400 rounded-3xl p-6 text-center shadow-xl relative cursor-pointer hover:shadow-2xl transition md:-translate-y-3 group"
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-stone-950 font-black text-xs px-3 py-0.5 rounded-full shadow-md flex items-center gap-1">
                <Crown className="w-3.5 h-3.5 fill-stone-950" />
                <span>فارس الخدمة الأول</span>
              </div>
              {top3[0].student.photoUrl ? (
                <div className="relative w-16 h-16 mx-auto mb-2 mt-2">
                  <img
                    src={top3[0].student.photoUrl}
                    alt={top3[0].student.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-amber-400 shadow-lg ring-2 ring-amber-300"
                  />
                  <span className="absolute -bottom-1 -right-1 text-base bg-amber-200 rounded-full w-6 h-6 flex items-center justify-center shadow-sm">
                    🥇
                  </span>
                </div>
              ) : (
                <div className="w-12 h-12 rounded-full bg-amber-200 text-amber-900 flex items-center justify-center font-black mx-auto mb-2 text-base mt-2 shadow-inner">
                  🥇
                </div>
              )}
              <span className="text-[11px] font-bold text-amber-800 uppercase">المركز الأول</span>
              <h3 className="text-lg font-black text-slate-950 mt-1 group-hover:text-amber-700 transition">
                {top3[0].student.name}
              </h3>
              <p className="text-xs text-slate-600 mb-4">{top3[0].student.grade} • {top3[0].student.family}</p>

              <div className="bg-white/90 backdrop-blur-xs rounded-2xl p-3 border border-amber-200 shadow-xs flex items-center justify-around">
                <div>
                  <span className="text-xs text-slate-500 block font-semibold">
                    {sortBy === 'allTime' ? 'النقاط التاريخية' : (pointsRules.pointsCycleStartDate ? 'نقاط الدورة' : 'إجمالي النقاط')}
                  </span>
                  <span className="text-2xl font-black text-amber-700">
                    {sortBy === 'allTime' ? top3[0].allTimePoints : top3[0].totalPoints}
                  </span>
                </div>
                <div className="h-7 w-px bg-amber-200"></div>
                <div>
                  <span className="text-xs text-slate-500 block font-semibold">تتابع متتالي</span>
                  <span className="text-2xl font-black text-amber-600 flex items-center justify-center gap-0.5">
                    <Flame className="w-5 h-5 fill-amber-500 text-amber-500" />
                    {top3[0].currentStreak}
                  </span>
                </div>
              </div>

              {onOpenAchievementCard && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenAchievementCard(top3[0].student, 'بطل الشهر');
                  }}
                  className="mt-3.5 w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Award className="w-4 h-4" />
                  <span>استخراج وسام بطل الشهر 📲</span>
                </button>
              )}
            </div>
          )}

          {/* Rank 3 (Bronze) */}
          {top3[2] && (
            <div
              onClick={() => onSelectStudent(top3[2].student)}
              className="order-3 bg-gradient-to-b from-orange-100/60 via-white to-stone-50 border-2 border-orange-300 rounded-3xl p-5 text-center shadow-md relative cursor-pointer hover:shadow-lg transition group"
            >
              {top3[2].student.photoUrl ? (
                <div className="relative w-14 h-14 mx-auto mb-2">
                  <img
                    src={top3[2].student.photoUrl}
                    alt={top3[2].student.name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-orange-300 shadow-md"
                  />
                  <span className="absolute -bottom-1 -right-1 text-sm bg-orange-200 rounded-full w-5 h-5 flex items-center justify-center shadow-xs">
                    🥉
                  </span>
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-orange-200 text-orange-800 flex items-center justify-center font-black mx-auto mb-2 text-sm">
                  🥉
                </div>
              )}
              <span className="text-[11px] font-bold text-stone-500 uppercase">المركز الثالث</span>
              <h3 className="text-base font-black text-slate-900 mt-1 group-hover:text-amber-700 transition">
                {top3[2].student.name}
              </h3>
              <p className="text-xs text-slate-500 mb-3">{top3[2].student.grade}</p>

              <div className="bg-white rounded-2xl p-3 border border-stone-200/80 flex items-center justify-around">
                <div>
                  <span className="text-xs text-slate-400 block font-semibold">
                    {sortBy === 'allTime' ? 'النقاط التاريخية' : (pointsRules.pointsCycleStartDate ? 'نقاط الدورة' : 'النقاط')}
                  </span>
                  <span className="text-xl font-black text-slate-800">
                    {sortBy === 'allTime' ? top3[2].allTimePoints : top3[2].totalPoints}
                  </span>
                </div>
                <div className="h-6 w-px bg-stone-200"></div>
                <div>
                  <span className="text-xs text-slate-400 block font-semibold">تتابع</span>
                  <span className="text-xl font-black text-amber-600 flex items-center justify-center gap-0.5">
                    <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
                    {top3[2].currentStreak}
                  </span>
                </div>
              </div>

              {onOpenAchievementCard && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const suggested = top3[2].currentStreak >= 4 ? 'بطل التتابع الذهبي' : 'بطل الشهر';
                    onOpenAchievementCard(top3[2].student, suggested);
                  }}
                  className="mt-3 w-full py-2 bg-stone-100 hover:bg-amber-100 text-stone-800 hover:text-amber-950 font-bold text-xs rounded-xl border border-stone-200 transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Award className="w-3.5 h-3.5 text-amber-600" />
                  <span>استخراج كارت الإنجاز 📲</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* FULL LEADERBOARD TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-800">قائمة الترتيب العام</h3>
          <span className="text-xs text-slate-500">انقر على أي مخدوم لعرض ملفه وسجل درجاته بالكامل</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4"># الترتيب</th>
                <th className="py-3 px-4">المخدوم</th>
                <th className="py-3 px-4">المرحلة والأسرة</th>
                <th className="py-3 px-4 text-center">تتابع الحضور</th>
                <th className="py-3 px-4 text-center">أفضل تتابع</th>
                <th className="py-3 px-4 text-center">نسبة الحضور</th>
                <th className="py-3 px-4 text-center">الهدايا الممنوحة</th>
                <th className="py-3 px-4 text-left font-black text-amber-900">
                  {sortBy === 'allTime' ? 'النقاط التاريخية' : (pointsRules.pointsCycleStartDate ? 'نقاط الدورة' : 'إجمالي النقاط')}
                </th>
                <th className="py-3 px-4 text-center" title="متاح للمراكز الثلاثة الأولى">كارت التوب 3 🏆</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedList.map((item, index) => {
                const rank = index + 1;
                return (
                  <tr
                    key={item.student.id}
                    onClick={() => onSelectStudent(item.student)}
                    className="hover:bg-amber-50/40 cursor-pointer transition"
                  >
                    <td className="py-3 px-4 font-black">
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs ${
                          rank === 1
                            ? 'bg-amber-500 text-stone-950 font-black'
                            : rank === 2
                            ? 'bg-slate-300 text-slate-800'
                            : rank === 3
                            ? 'bg-orange-300 text-orange-950'
                            : 'text-slate-500'
                        }`}
                      >
                        {rank}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        {item.student.photoUrl ? (
                          <img
                            src={item.student.photoUrl}
                            alt={item.student.name}
                            className="w-8 h-8 rounded-xl object-cover border border-amber-300 shrink-0"
                          />
                        ) : (
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                              item.student.gender === 'بنين'
                                ? 'bg-blue-100 text-blue-900'
                                : 'bg-rose-100 text-rose-900'
                            }`}
                          >
                            {item.student.name.split(' ').slice(0, 2).map((n) => n[0]).join('')}
                          </div>
                        )}
                        <span className="font-black text-slate-900 text-sm">{item.student.name}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-slate-600">
                      <div>
                        <span className="font-bold">{item.student.grade}</span>
                        <span className="text-[11px] text-slate-400 block">{item.student.family}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                        <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        <span>{item.currentStreak}</span>
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center font-bold text-slate-600">
                      {item.bestStreak}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className="font-bold text-slate-700">{item.attendanceRate}%</span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      {item.student.rewardsClaimed.length > 0 ? (
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                          <Gift className="w-3 h-3 text-emerald-600" />
                          <span>{item.student.rewardsClaimed.length} هدايا</span>
                        </span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-left font-black text-sm text-amber-900">
                      <span className="bg-amber-100 px-2.5 py-1 rounded-xl border border-amber-300">
                        {sortBy === 'allTime' ? item.allTimePoints : item.totalPoints} نقطة
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                      {onOpenAchievementCard && index < 3 ? (
                        <button
                          onClick={() => {
                            const suggested = index === 0 
                              ? 'بطل الشهر' 
                              : item.currentStreak >= 4 
                              ? 'بطل التتابع الذهبي' 
                              : 'بطل الشهر';
                            onOpenAchievementCard(item.student, suggested);
                          }}
                          className="px-2.5 py-1 bg-amber-100 hover:bg-amber-400 text-amber-950 font-black text-xs rounded-xl border border-amber-300 transition inline-flex items-center gap-1 cursor-pointer shadow-xs active:scale-95"
                          title="استخراج وسام وبطاقة الإنجاز (للمراكز الثلاثة الأولى)"
                        >
                          <span>{index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}</span>
                          <span>كارت 📲</span>
                        </button>
                      ) : (
                        <span className="text-slate-300 text-xs font-semibold select-none" title="كارت الإنجاز متاح للمراكز الثلاثة الأولى فقط">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
        </>
      )}
    </div>
  );
};

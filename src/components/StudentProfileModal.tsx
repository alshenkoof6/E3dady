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
  X, 
  Flame, 
  Gift, 
  Calendar, 
  Phone, 
  MessageCircle, 
  Award, 
  Church, 
  BookOpen, 
  HeartHandshake, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Star,
  Cake,
  AlertTriangle,
  PlusCircle
} from 'lucide-react';
import { isBirthdayToday, calculateAge, formatBirthDateArabic } from '../utils/birthday';

interface StudentProfileModalProps {
  student: Student;
  allStudents?: Student[];
  sessions: ServiceSession[];
  pointsRules: PointsRuleConfig;
  rewardTiers: RewardTier[];
  competitionLogs: CompetitionLog[];
  isServant?: boolean;
  onClose: () => void;
  onEditStudent: (student: Student) => void;
  onOpenAddBonusOrPenalty?: (student: Student, mode: 'bonus' | 'penalty') => void;
  onOpenAchievementCard?: (student: Student) => void;
}

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({
  student,
  allStudents = [],
  sessions,
  pointsRules,
  rewardTiers,
  competitionLogs,
  isServant = false,
  onClose,
  onEditStudent,
  onOpenAddBonusOrPenalty,
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

  // Sorted sessions list
  const sortedSessions = [...sessions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Student specific competition / penalty logs
  const studentActivities = competitionLogs
    .filter((c) => c.awardedStudentIds.includes(student.id))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 relative max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute left-5 top-5 p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div className="flex items-center gap-4">
            {student.photoUrl ? (
              <img
                src={student.photoUrl}
                alt={student.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-400 shadow-md shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-amber-400 text-stone-950 flex items-center justify-center font-black text-2xl shadow-md shrink-0">
                {student.name.split(' ').slice(0, 2).map((n) => n[0]).join('')}
              </div>
            )}

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black text-slate-900">{student.name}</h3>
                {isBirthdayToday(student.birthDate) && (
                  <span className="text-xs bg-rose-100 text-rose-700 font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 animate-pulse border border-rose-300">
                    <Cake className="w-3.5 h-3.5" />
                    عيد ميلاده اليوم! 🎂
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {student.grade} • {student.family}
                {student.birthDate && ` • ${formatBirthDateArabic(student.birthDate)}`}
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {student.phone && (
              <>
                <a
                  href={`tel:${student.phone}`}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>اتصال</span>
                </a>
                <a
                  href={`https://wa.me/2${student.phone.replace(/^0/, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl transition flex items-center gap-1.5 border border-emerald-200"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>واتساب</span>
                </a>
              </>
            )}

            {onOpenAchievementCard && top3Status.isTop3 && (
              <button
                onClick={() => {
                  onClose();
                  onOpenAchievementCard(student);
                }}
                className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 text-xs font-black rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
                title={`استخراج كارت الإنجاز والوسام - المركز ${top3Status.rank} لشهر ${top3Status.monthNameArabic}`}
              >
                <span>{top3Status.rank === 1 ? '🥇' : top3Status.rank === 2 ? '🥈' : '🥉'}</span>
                <span>كارت التوب 3 📲</span>
              </button>
            )}

            {isServant && onOpenAddBonusOrPenalty && (
              <>
                <button
                  onClick={() => {
                    onClose();
                    onOpenAddBonusOrPenalty(student, 'bonus');
                  }}
                  className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-950 text-xs font-bold rounded-xl transition border border-amber-300 flex items-center gap-1"
                  title="إضافة بونص أو مكافأة للمخدوم"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                  <span>+ بونص</span>
                </button>

                <button
                  onClick={() => {
                    onClose();
                    onOpenAddBonusOrPenalty(student, 'penalty');
                  }}
                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-bold rounded-xl transition border border-rose-300 flex items-center gap-1"
                  title="خصم نقاط بسبب سلوك سلبي"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  <span>- خصم نقاط</span>
                </button>
              </>
            )}

            {isServant && (
              <button
                onClick={() => {
                  onClose();
                  onEditStudent(student);
                }}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition border border-slate-300"
              >
                تعديل البيانات
              </button>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-5">
          <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-3 text-center">
            <span className="text-[11px] font-bold text-amber-800 block">إجمالي النقاط</span>
            <span className="text-2xl font-black text-amber-900 mt-0.5 block">{stats.totalPoints}</span>
          </div>

          <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-3 text-center">
            <span className="text-[11px] font-bold text-blue-800 block">التتابع الحالي</span>
            <div className="flex items-center justify-center gap-1 mt-0.5">
              <Flame className="w-5 h-5 text-amber-500 fill-amber-500" />
              <span className="text-2xl font-black text-blue-900">{stats.currentStreak}</span>
            </div>
          </div>

          <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-3 text-center">
            <span className="text-[11px] font-bold text-emerald-800 block">نسبة الحضور</span>
            <span className="text-2xl font-black text-emerald-900 mt-0.5 block">{stats.attendanceRate}%</span>
          </div>

          <div className="bg-purple-50/70 border border-purple-200 rounded-2xl p-3 text-center">
            <span className="text-[11px] font-bold text-purple-800 block">أفضل تتابع</span>
            <span className="text-2xl font-black text-purple-900 mt-0.5 block">{stats.bestStreak} مرات</span>
          </div>
        </div>

        {/* Points Breakdown Details */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-5">
          <h4 className="text-xs font-black text-slate-800 mb-3 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-600" />
            <span>تفاصيل وتوزيع رصيد النقاط:</span>
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="bg-white p-2.5 rounded-xl border border-slate-200/80">
              <span className="text-slate-400 block text-[10px] font-bold">حضور الاجتماعات</span>
              <span className="font-black text-slate-800">{stats.pointsBreakdown.attendance} نقطة</span>
            </div>
            <div className="bg-white p-2.5 rounded-xl border border-slate-200/80">
              <span className="text-purple-600 block text-[10px] font-bold">القداس الإلهي</span>
              <span className="font-black text-purple-900">{stats.pointsBreakdown.liturgy} نقطة</span>
            </div>
            <div className="bg-white p-2.5 rounded-xl border border-slate-200/80">
              <span className="text-blue-600 block text-[10px] font-bold">حفظ الآيات</span>
              <span className="font-black text-blue-900">{stats.pointsBreakdown.verse} نقطة</span>
            </div>
            <div className="bg-white p-2.5 rounded-xl border border-slate-200/80">
              <span className="text-emerald-600 block text-[10px] font-bold">الالتزام بالصلاة</span>
              <span className="font-black text-emerald-900">{stats.pointsBreakdown.prayer} نقطة</span>
            </div>
            <div className="bg-white p-2.5 rounded-xl border border-slate-200/80">
              <span className="text-amber-600 block text-[10px] font-bold">التفاعل والمشاركة</span>
              <span className="font-black text-amber-900">{stats.pointsBreakdown.participation} نقطة</span>
            </div>
            <div className="bg-white p-2.5 rounded-xl border border-slate-200/80">
              <span className="text-amber-700 block text-[10px] font-bold">المسابقات والكويزات</span>
              <span className="font-black text-amber-900">{stats.pointsBreakdown.competitions} نقطة</span>
            </div>
            <div className="bg-white p-2.5 rounded-xl border border-slate-200/80">
              <span className="text-amber-700 block text-[10px] font-bold">بونص جوائز التتابع</span>
              <span className="font-black text-amber-900">{stats.pointsBreakdown.tierRewards} نقطة</span>
            </div>

            {/* Penalties Deduction Card */}
            {stats.pointsBreakdown.penalties > 0 && (
              <div className="bg-rose-50 p-2.5 rounded-xl border border-rose-300">
                <span className="text-rose-600 block text-[10px] font-black flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  <span>الخصومات السلوكية</span>
                </span>
                <span className="font-black text-rose-800">-{stats.pointsBreakdown.penalties} نقطة</span>
              </div>
            )}
          </div>
        </div>

        {/* Behavioral Penalties and Activities Log */}
        {studentActivities.length > 0 && (
          <div className="mb-5 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <h4 className="text-xs font-black text-slate-900 mb-2.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>سجل الأنشطة والمسابقات والخصومات السلوكية ({studentActivities.length}):</span>
              </span>
            </h4>

            <div className="space-y-1.5">
              {studentActivities.map((act) => {
                const isNeg = act.points < 0 || act.type === 'penalty';
                return (
                  <div
                    key={act.id}
                    className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition ${
                      isNeg
                        ? 'bg-rose-50/70 border-rose-200 text-rose-950'
                        : 'bg-white border-slate-200 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {isNeg ? (
                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                      ) : (
                        <Award className="w-4 h-4 text-amber-500 shrink-0" />
                      )}
                      <div>
                        <span className="font-bold">{act.title}</span>
                        {act.description && (
                          <span className="text-slate-500 mr-1.5 text-[11px]">({act.description})</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] text-slate-400 font-semibold">{act.date}</span>
                      <span
                        className={`font-black px-2 py-0.5 rounded-lg text-xs ${
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

        {/* Claimed Rewards Section */}
        {student.rewardsClaimed.length > 0 && (
          <div className="mb-5 p-4 rounded-2xl bg-amber-50/50 border border-amber-200/80">
            <h4 className="text-xs font-black text-amber-950 mb-2 flex items-center gap-1.5">
              <Gift className="w-4 h-4 text-amber-600" />
              <span>الهدايا المسلمة ({student.rewardsClaimed.length}):</span>
            </h4>
            <div className="space-y-1.5">
              {student.rewardsClaimed.map((claim) => (
                <div key={claim.id} className="bg-white p-2.5 rounded-xl border border-amber-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-black text-slate-800">{claim.tierTitle}</span>
                    <span className="text-slate-500 mr-2">({claim.giftName})</span>
                  </div>
                  <span className="text-slate-400 font-semibold">{claim.date}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Attendance Log Timeline */}
        <div className="space-y-3">
          <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-amber-600" />
            <span>سجل حضور اللقاءات السابقة:</span>
          </h4>

          <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
            {sortedSessions.map((session) => {
              const record = session.records[student.id];
              if (!record) return null;

              const isPresent = record.status === 'present';
              const isAbsent = record.status === 'absent';
              const isExcused = record.status === 'excused';

              return (
                <div key={session.id} className="p-3 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50 transition">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-xs text-slate-900">{session.date}</span>
                      <span className="text-xs text-slate-500">- {session.title}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 mt-1.5 text-[11px]">
                      {isPresent && (
                        <>
                          {record.bonus.liturgy && (
                            <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded-md font-bold">
                              القداس (+{pointsRules.liturgy})
                            </span>
                          )}
                          {record.bonus.verse && (
                            <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md font-bold">
                              الآية (+{pointsRules.verse})
                            </span>
                          )}
                          {record.bonus.prayer && (
                            <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md font-bold">
                              الصلاة (+{pointsRules.prayer})
                            </span>
                          )}
                          {record.bonus.participation && (
                            <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md font-bold">
                              تفاعل (+{pointsRules.participation})
                            </span>
                          )}
                          {record.bonus.customPoints > 0 && (
                            <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md font-bold">
                              بونص (+{record.bonus.customPoints})
                            </span>
                          )}
                        </>
                      )}

                      {/* Penalty in this session */}
                      {record.bonus?.penaltyPoints && record.bonus.penaltyPoints > 0 ? (
                        <span className="bg-rose-100 text-rose-800 px-2 py-0.5 rounded-md font-bold flex items-center gap-1 border border-rose-200">
                          <AlertTriangle className="w-3 h-3 text-rose-600" />
                          <span>خصم (-{record.bonus.penaltyPoints}): {record.bonus.penaltyReason || 'سلوك سلبي'}</span>
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div>
                    {isPresent && (
                      <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-xs font-black px-2.5 py-1 rounded-xl">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>حاضر</span>
                      </span>
                    )}
                    {isAbsent && (
                      <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-800 text-xs font-black px-2.5 py-1 rounded-xl">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>غائب</span>
                      </span>
                    )}
                    {isExcused && (
                      <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-xs font-black px-2.5 py-1 rounded-xl">
                        <Clock className="w-3.5 h-3.5" />
                        <span>معتذر</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

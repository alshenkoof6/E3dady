import React, { useState, useMemo } from 'react';
import { 
  Student, 
  ServiceSession, 
  PointsRuleConfig, 
  RewardTier, 
  CompetitionLog, 
  AttendanceStatus, 
  GradeLevel, 
  Gender,
  ServantAccount,
  StudentAttendanceRecord
} from '../types';
import { calculateStudentStats } from '../utils/calculations';
import { 
  Calendar, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Flame, 
  Sparkles, 
  BookOpen, 
  Church, 
  HeartHandshake, 
  Award, 
  CheckCheck, 
  Gift, 
  Plus, 
  ChevronRight, 
  UserCheck,
  FileSpreadsheet,
  Cake,
  Lock,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { isBirthdayToday } from '../utils/birthday';

interface AttendanceViewProps {
  students: Student[];
  sessions: ServiceSession[];
  servants: ServantAccount[];
  currentSessionId: string;
  pointsRules: PointsRuleConfig;
  rewardTiers: RewardTier[];
  competitionLogs: CompetitionLog[];
  isServant?: boolean;
  onOpenLogin?: () => void;
  onSelectSession: (sessionId: string) => void;
  onUpdateSessionData: (sessionId: string, updates: Partial<ServiceSession>) => void;
  onUpdateStudentAttendance: (
    sessionId: string,
    studentId: string,
    status: AttendanceStatus,
    bonusUpdates?: {
      prayer?: boolean;
      liturgy?: boolean;
      verse?: boolean;
      participation?: boolean;
      customPoints?: number;
      customReason?: string;
      penaltyPoints?: number;
      penaltyReason?: string;
    },
    notes?: string
  ) => void;
  onBulkUpdateAttendance: (sessionId: string, status: AttendanceStatus) => void;
  onCreateNewSession: (date: string, title: string, verse: string, speakerServant: string, guestSpeakerName?: string) => void;
  onDeliverReward: (student: Student, tier: RewardTier) => void;
  onOpenAddStudent?: () => void;
  onOpenImportExport?: () => void;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({
  students,
  sessions,
  servants,
  currentSessionId,
  pointsRules,
  rewardTiers,
  competitionLogs,
  isServant = false,
  onOpenLogin,
  onSelectSession,
  onUpdateSessionData,
  onUpdateStudentAttendance,
  onBulkUpdateAttendance,
  onCreateNewSession,
  onDeliverReward,
  onOpenAddStudent,
  onOpenImportExport,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<GradeLevel | 'الكل'>('الكل');
  const [selectedGender, setSelectedGender] = useState<Gender | 'الكل'>('الكل');
  const [selectedFamily, setSelectedFamily] = useState<string>('الكل');
  const [statusFilter, setStatusFilter] = useState<'all' | 'present' | 'absent' | 'excused'>('all');
  
  // New session modal / form states
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [newSessionDate, setNewSessionDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [newSessionTitle, setNewSessionTitle] = useState('اجتماع الجمعة');
  const [newSessionVerse, setNewSessionVerse] = useState('');
  const [newSessionSpeaker, setNewSessionSpeaker] = useState('مينا');
  const [newGuestSpeakerName, setNewGuestSpeakerName] = useState('');

  // Penalty Modal States
  const [penaltyTarget, setPenaltyTarget] = useState<{ student: Student; record: StudentAttendanceRecord } | null>(null);
  const [penaltyPointsInput, setPenaltyPointsInput] = useState<number>(5);
  const [penaltyReasonInput, setPenaltyReasonInput] = useState<string>('استخدام الموبايل أثناء الصلاة أو الدرس');

  // Find active session
  const activeSession = useMemo(() => {
    return sessions.find((s) => s.id === currentSessionId) || sessions[sessions.length - 1] || null;
  }, [sessions, currentSessionId]);

  // Extract families list
  const availableFamilies = useMemo(() => {
    const fams = new Set<string>();
    students.forEach((s) => {
      if (s.family) fams.add(s.family);
    });
    return Array.from(fams);
  }, [students]);

  // Calculate current session statistics & individual student stats
  const studentsWithStats = useMemo(() => {
    return students.map((student) => {
      const stats = calculateStudentStats(student, sessions, pointsRules, competitionLogs, rewardTiers);
      const record = activeSession?.records[student.id] || {
        status: 'absent' as AttendanceStatus,
        bonus: {
          prayer: false,
          liturgy: false,
          verse: false,
          participation: false,
          customPoints: 0,
        },
      };
      return {
        ...stats,
        record,
      };
    });
  }, [students, sessions, pointsRules, competitionLogs, rewardTiers, activeSession]);

  // Session summary counters
  const summary = useMemo(() => {
    if (!activeSession) return { total: 0, present: 0, absent: 0, excused: 0, rate: 0, newMilestones: [] };
    
    let present = 0;
    let absent = 0;
    let excused = 0;

    const newMilestones: { student: Student; tier: RewardTier }[] = [];

    studentsWithStats.forEach((s) => {
      const rec = activeSession.records[s.student.id];
      if (rec?.status === 'present') {
        present++;
        // Check if student now achieved any new milestone
        s.eligibleTiers.forEach((et) => {
          if (et.canClaimNow) {
            newMilestones.push({ student: s.student, tier: et.tier });
          }
        });
      } else if (rec?.status === 'excused') {
        excused++;
      } else {
        absent++;
      }
    });

    const total = students.length;
    const rate = total > 0 ? Math.round((present / total) * 100) : 0;

    return { total, present, absent, excused, rate, newMilestones };
  }, [activeSession, studentsWithStats, students.length]);

  // Filtered students list
  const filteredStudents = useMemo(() => {
    return studentsWithStats.filter(({ student, record }) => {
      // Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = student.name.toLowerCase().includes(query);
        const matchesFamily = student.family.toLowerCase().includes(query);
        const matchesPhone = student.phone?.includes(query);
        if (!matchesName && !matchesFamily && !matchesPhone) return false;
      }
      // Grade
      if (selectedGrade !== 'الكل' && student.grade !== selectedGrade) return false;
      // Gender
      if (selectedGender !== 'الكل' && student.gender !== selectedGender) return false;
      // Family
      if (selectedFamily !== 'الكل' && student.family !== selectedFamily) return false;
      // Status
      if (statusFilter !== 'all' && record.status !== statusFilter) return false;

      return true;
    });
  }, [studentsWithStats, searchQuery, selectedGrade, selectedGender, selectedFamily, statusFilter]);

  const handleCreateSessionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSessionDate) return;
    const speaker = newSessionSpeaker === 'خادم آخر' && newGuestSpeakerName.trim()
      ? `خادم ضيف: ${newGuestSpeakerName.trim()}`
      : newSessionSpeaker;
    onCreateNewSession(
      newSessionDate,
      newSessionTitle.trim() || 'اجتماع خدمة إعدادي',
      newSessionVerse.trim(),
      speaker,
      newSessionSpeaker === 'خادم آخر' ? newGuestSpeakerName.trim() : undefined
    );
    setIsCreatingSession(false);
    setNewSessionTitle('اجتماع الجمعة');
    setNewSessionVerse('');
    setNewSessionSpeaker('مينا');
    setNewGuestSpeakerName('');
  };

  const handleProtectedAttendanceChange = (
    studentId: string,
    status: AttendanceStatus,
    bonusUpdates?: {
      prayer?: boolean;
      liturgy?: boolean;
      verse?: boolean;
      participation?: boolean;
      customPoints?: number;
      customReason?: string;
      penaltyPoints?: number;
      penaltyReason?: string;
    },
    notes?: string
  ) => {
    if (!isServant) {
      onOpenLogin?.();
      return;
    }
    if (activeSession) {
      onUpdateStudentAttendance(activeSession.id, studentId, status, bonusUpdates, notes);
    }
  };

  const handleProtectedBulkUpdate = (status: AttendanceStatus) => {
    if (!isServant) {
      onOpenLogin?.();
      return;
    }
    if (activeSession) {
      onBulkUpdateAttendance(activeSession.id, status);
    }
  };

  return (
    <div className="space-y-6">
      {/* Visitor Read-Only Banner */}
      {!isServant && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-amber-950 shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-500 text-stone-950 flex items-center justify-center shrink-0 shadow-sm">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-black text-sm text-slate-900">أنت تتصفح سجل الحضور كزائر (للمشاهدة فقط)</h4>
                <span className="text-[10px] bg-amber-200/80 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full font-bold">
                  للقراءة فقط
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                يمكنك الاطلاع على نسب الحضور وسجل اللقاءات. لتسجيل الحضور، إضافة لقاء جديد، أو رصد الدرجات يرجى تسجيل دخول الخادم المسؤول.
              </p>
            </div>
          </div>
          {onOpenLogin && (
            <button
              onClick={onOpenLogin}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs rounded-xl shadow-md transition active:scale-95 flex items-center gap-1.5 shrink-0"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>تسجيل دخول الخادم للتعديل</span>
            </button>
          )}
        </div>
      )}

      {!activeSession ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 shadow-sm max-w-xl mx-auto my-6 p-8">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-700 flex items-center justify-center mx-auto mb-4 border border-amber-300">
            <Calendar className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-black text-slate-900">لا توجد لقاءات خدمة مسجلة بعد</h3>
          <p className="text-slate-600 text-xs sm:text-sm mt-2 mb-6 leading-relaxed max-w-md mx-auto">
            {isServant
              ? 'تم تشغيل المنصة نظيفة بدون أي بيانات تجريبية. ابدأ الآن بإنشاء أول لقاء خدمة لتسجيل حضور الأولاد واختيار الخادم الذي سيشرح الدرس (أ/ مينا، أ/ ماجد، أ/ صبري أو خادم ضيف).'
              : 'بانتظار إنشاء أول لقاء خدمة من قِبل الخدام المسؤولين.'}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {isServant ? (
              <>
                <button
                  onClick={() => setIsCreatingSession(true)}
                  className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black rounded-2xl transition shadow-lg shadow-amber-500/25 flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-5 h-5" />
                  <span>إنشاء أول لقاء خدمة</span>
                </button>

                {onOpenAddStudent && (
                  <button
                    onClick={onOpenAddStudent}
                    className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-2xl transition border border-slate-200 flex items-center gap-2 text-xs cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-amber-600" />
                    <span>إضافة مخدوم</span>
                  </button>
                )}

                {onOpenImportExport && (
                  <button
                    onClick={onOpenImportExport}
                    className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-2xl transition border border-slate-200 flex items-center gap-2 text-xs cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    <span>استيراد كشف Excel</span>
                  </button>
                )}
              </>
            ) : onOpenLogin ? (
              <button
                onClick={onOpenLogin}
                className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black rounded-2xl transition shadow-lg shadow-amber-500/25 flex items-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-5 h-5" />
                <span>تسجيل دخول الخادم لإنشاء لقاء</span>
              </button>
            ) : null}
          </div>
        </div>
      ) : (
        <>
          {/* Session Header Card & Switcher */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-5 sm:p-7 relative overflow-hidden">
        <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-red-600 via-amber-500 to-amber-600"></div>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          {/* Active Session Info */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 bg-red-50 text-red-800 border border-red-200/70 text-xs px-3 py-1 rounded-full font-bold">
                <Calendar className="w-3.5 h-3.5" />
                <span>{activeSession.date}</span>
              </span>
              <span className="text-xs bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1 rounded-full font-semibold">
                لقاء الخدمة النشط
              </span>
              {/* Speaker Servant badge */}
              <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-900 bg-amber-100/80 border border-amber-300 px-2.5 py-0.5 rounded-full">
                <UserCheck className="w-3.5 h-3.5 text-amber-700" />
                <span>خادم الدرس: {activeSession.speakerServant || 'أ/ مينا'}</span>
                {activeSession.guestSpeakerName && <span>({activeSession.guestSpeakerName})</span>}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="text"
                value={activeSession.title}
                disabled={!isServant}
                onChange={(e) => isServant && onUpdateSessionData(activeSession.id, { title: e.target.value })}
                className="text-xl sm:text-2xl font-black text-slate-900 border-b border-dashed border-slate-300 hover:border-amber-500 focus:border-amber-600 focus:outline-none bg-transparent transition py-0.5 disabled:border-transparent disabled:cursor-default"
                placeholder="عنوان اللقاء والدرس"
                title={isServant ? "انقر لتعديل عنوان الاجتماع" : undefined}
              />
            </div>

            {/* Verse of the week */}
            <div className="flex items-center gap-2 max-w-2xl">
              <BookOpen className="w-4 h-4 text-amber-600 shrink-0" />
              <input
                type="text"
                value={activeSession.verseOfTheWeek || ''}
                disabled={!isServant}
                onChange={(e) => isServant && onUpdateSessionData(activeSession.id, { verseOfTheWeek: e.target.value })}
                placeholder="آية الأسبوع (مثال: «اَلْمُسَايِرُ الْحُكَمَاءَ يَصِيرُ حَكِيمًا»)"
                className="text-xs sm:text-sm text-slate-600 hover:text-slate-900 border-b border-transparent hover:border-slate-300 focus:border-amber-500 focus:outline-none w-full bg-transparent transition disabled:cursor-default"
              />
            </div>
          </div>

          {/* Session Switcher and New Session Button */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center bg-slate-100 rounded-2xl p-1 border border-slate-200">
              <label htmlFor="session-select" className="text-xs font-bold text-slate-500 px-2">الاجتماع:</label>
              <select
                id="session-select"
                value={activeSession.id}
                onChange={(e) => onSelectSession(e.target.value)}
                className="bg-transparent text-xs sm:text-sm font-bold text-slate-800 py-1 px-2 focus:outline-none cursor-pointer"
              >
                {sessions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.date} - {s.title}
                  </option>
                ))}
              </select>
            </div>

            {isServant && (
              <button
                onClick={() => setIsCreatingSession(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-red-900 hover:bg-red-800 text-white rounded-2xl text-xs sm:text-sm font-bold transition shadow-sm active:scale-95"
              >
                <Plus className="w-4 h-4 text-amber-400" />
                <span>لقاء جديد</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Attendance Stats Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-5 border-t border-slate-100">
          <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-3 sm:p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-emerald-800">حاضرون</p>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl font-black text-emerald-700">{summary.present}</span>
                <span className="text-xs text-emerald-600 font-semibold">({summary.rate}%)</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-rose-50/70 border border-rose-100 rounded-2xl p-3 sm:p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-rose-800">غائبون</p>
              <span className="text-2xl font-black text-rose-700 mt-1 block">{summary.absent}</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600">
              <XCircle className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-amber-50/70 border border-amber-100 rounded-2xl p-3 sm:p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-amber-800">معتذرون</p>
              <span className="text-2xl font-black text-amber-700 mt-1 block">{summary.excused}</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 sm:p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-700">إجمالي المخدومين</p>
              <span className="text-2xl font-black text-slate-900 mt-1 block">{summary.total}</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center text-slate-700 font-bold text-xs">
              الكل
            </div>
          </div>
        </div>

        {/* Milestone Celebration Banner if students reached reward tiers today */}
        {summary.newMilestones.length > 0 && (
          <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-red-500/10 to-amber-500/15 border border-amber-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center shrink-0 shadow-md">
                <Gift className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-black text-slate-900">
                  🎉 احتفال فرسان الخدمة! ({summary.newMilestones.length} مخدوم وصل لجوائز التتابع اليوم)
                </p>
                <p className="text-xs text-slate-600">
                  {summary.newMilestones.slice(0, 3).map((m) => `${m.student.name} (${m.tier.title})`).join(' ، ')}
                  {summary.newMilestones.length > 3 ? ` و ${summary.newMilestones.length - 3} آخرين` : ''}
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-amber-800 bg-amber-100 px-3 py-1 rounded-xl self-start sm:self-auto">
              تصفح التبويب الخاص بالجوائز لتسليمها 🎁
            </span>
          </div>
        )}
      </div>

      {/* Control Bar: Filters, Search & Bulk Actions */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-4 sm:p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ابحث بالاسم، الأسرة، أو رقم الهاتف..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-10 pl-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
            />
          </div>

          {/* Bulk actions (Servants only) */}
          {isServant && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleProtectedBulkUpdate('present')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition shadow-sm active:scale-95"
                title="تحضير جميع المخدومين في هذا اليوم"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>تحضير الكل</span>
              </button>
              <button
                onClick={() => handleProtectedBulkUpdate('absent')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition active:scale-95"
                title="تحديد الكل كغائب"
              >
                <span>تصفير الحضور</span>
              </button>
            </div>
          )}
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1 text-slate-500 font-bold ml-1">
            <Filter className="w-3.5 h-3.5" />
            <span>تصفية:</span>
          </div>

          {/* Grade filter */}
          <div className="flex rounded-xl bg-slate-100 p-0.5 border border-slate-200">
            {(['الكل', 'أولى إعدادي', 'ثانية إعدادي', 'ثالثة إعدادي'] as const).map((g) => (
              <button
                key={g}
                onClick={() => setSelectedGrade(g)}
                className={`px-2.5 py-1 rounded-lg font-bold transition ${
                  selectedGrade === g ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {g}
              </button>
            ))}
          </div>

          {/* Gender filter */}
          <div className="flex rounded-xl bg-slate-100 p-0.5 border border-slate-200">
            {(['الكل', 'بنين', 'بنات'] as const).map((gen) => (
              <button
                key={gen}
                onClick={() => setSelectedGender(gen)}
                className={`px-2.5 py-1 rounded-lg font-bold transition ${
                  selectedGender === gen ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {gen}
              </button>
            ))}
          </div>

          {/* Status filter */}
          <div className="flex rounded-xl bg-slate-100 p-0.5 border border-slate-200">
            {[
              { id: 'all', label: 'الكل' },
              { id: 'present', label: 'حاضر فقط' },
              { id: 'absent', label: 'غائب فقط' },
              { id: 'excused', label: 'معتذر فقط' },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setStatusFilter(st.id as any)}
                className={`px-2.5 py-1 rounded-lg font-bold transition ${
                  statusFilter === st.id ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          {/* Family dropdown */}
          {availableFamilies.length > 0 && (
            <select
              value={selectedFamily}
              onChange={(e) => setSelectedFamily(e.target.value)}
              className="bg-slate-100 text-slate-700 font-bold px-2.5 py-1 rounded-xl border border-slate-200 focus:outline-none"
            >
              <option value="الكل">جميع الأسر</option>
              {availableFamilies.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          )}

          <span className="text-slate-400 font-semibold mr-auto">
            (عرض {filteredStudents.length} من {students.length})
          </span>
        </div>
      </div>

      {/* Students Attendance List */}
      <div className="space-y-3">
        {students.length === 0 ? (
          <div className="bg-white rounded-3xl border border-dashed border-amber-300 p-12 text-center max-w-lg mx-auto">
            <UserCheck className="w-12 h-12 text-amber-500 mx-auto mb-3" />
            <h4 className="text-base font-black text-slate-800">لا يوجد مخدومين مسجلين بعد</h4>
            <p className="text-xs text-slate-500 mt-1">
              أهلاً بكم يا خدام إعدادي (أ/ مينا، أ/ ماجد، أ/ صبري)! اضغط على زر [إضافة مخدوم] أو [الداتا Excel] بالأعلى لإدخال كشف المخدومين والبدء في تسجيل الحضور.
            </p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
            <p className="text-slate-500 font-medium text-sm">لا يوجد مخدومين يطابقون خيارات البحث أو التصفية.</p>
          </div>
        ) : (
          filteredStudents.map(({ student, currentStreak, bestStreak, record, eligibleTiers }) => {
            const isPresent = record.status === 'present';
            const isExcused = record.status === 'excused';
            const isAbsent = record.status === 'absent';

            // Check if any milestone reward can be claimed right now
            const pendingReward = eligibleTiers.find((t) => t.canClaimNow);

            return (
              <div
                key={student.id}
                className={`bg-white rounded-2xl border transition duration-150 p-4 sm:p-5 shadow-xs ${
                  isPresent
                    ? 'border-emerald-200 bg-gradient-to-l from-emerald-50/20 via-white to-white'
                    : isExcused
                    ? 'border-amber-200 bg-amber-50/20'
                    : 'border-slate-200 hover:border-slate-300'
                } ${pendingReward ? 'ring-2 ring-amber-400' : ''}`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* Student Basic Information & Streak */}
                  <div className="flex items-start sm:items-center gap-3.5">
                    {/* Photo or Initials Avatar */}
                    {student.photoUrl ? (
                      <img
                        src={student.photoUrl}
                        alt={student.name}
                        className="w-12 h-12 rounded-2xl object-cover border-2 border-amber-400 shadow-sm shrink-0"
                      />
                    ) : (
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 shadow-inner ${
                          student.gender === 'بنين'
                            ? 'bg-blue-100 text-blue-900 border border-blue-200'
                            : 'bg-rose-100 text-rose-900 border border-rose-200'
                        }`}
                      >
                        {student.name.split(' ').slice(0, 2).map((n) => n[0]).join('')}
                      </div>
                    )}

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-base sm:text-lg font-black text-slate-900">
                          {student.name}
                        </h4>

                        {isBirthdayToday(student.birthDate) && (
                          <span className="text-[11px] font-black bg-rose-100 text-rose-700 border border-rose-300 px-2 py-0.5 rounded-lg flex items-center gap-1 animate-pulse">
                            <Cake className="w-3 h-3 text-rose-600" />
                            عيد ميلاده اليوم! 🎂
                          </span>
                        )}

                        {/* Grade and Family badges */}
                        <span className="text-[11px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-lg border border-slate-200">
                          {student.grade}
                        </span>
                        <span className="text-[11px] font-medium text-slate-500 bg-slate-50 px-2 py-0.5 rounded-lg">
                          {student.family}
                        </span>

                        {record.bonus?.penaltyPoints && record.bonus.penaltyPoints > 0 ? (
                          <span className="text-[11px] font-black bg-rose-100 text-rose-800 border border-rose-300 px-2 py-0.5 rounded-lg flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-rose-600" />
                            <span>خصم مسجل: -{record.bonus.penaltyPoints} ({record.bonus.penaltyReason || 'سلوك سلبي'})</span>
                          </span>
                        ) : null}
                      </div>

                      {/* Current Streak with Fire Flame Badge */}
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span
                          className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-md ${
                            currentStreak >= 10
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : currentStreak >= 8
                              ? 'bg-blue-100 text-blue-900 border border-blue-300'
                              : currentStreak >= 4
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                              : currentStreak > 0
                              ? 'bg-slate-100 text-slate-700'
                              : 'bg-slate-50 text-slate-400'
                          }`}
                        >
                          <Flame className={`w-3.5 h-3.5 ${currentStreak > 0 ? 'text-amber-500 fill-amber-500' : 'text-slate-400'}`} />
                          <span>تتابع الحضور: {currentStreak} {currentStreak === 1 ? 'مرة' : currentStreak === 2 ? 'مرتين' : 'مرات'} متتالية</span>
                        </span>

                        {bestStreak > currentStreak && (
                          <span className="text-[11px] text-slate-400">
                            (أفضل تتابع: {bestStreak})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Attendance Status Selection Buttons */}
                  <div className="flex items-center gap-1.5 self-start sm:self-auto bg-slate-100 p-1 rounded-2xl border border-slate-200">
                    <button
                      onClick={() => handleProtectedAttendanceChange(student.id, 'present')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                        isPresent
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : !isServant
                          ? 'text-slate-400 opacity-60 cursor-pointer'
                          : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50'
                      }`}
                      title={!isServant ? 'تسجيل دخول الخادم مطلوب لتعديل الحضور' : undefined}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>حاضر</span>
                    </button>

                    <button
                      onClick={() => handleProtectedAttendanceChange(student.id, 'absent')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                        isAbsent
                          ? 'bg-rose-600 text-white shadow-sm'
                          : !isServant
                          ? 'text-slate-400 opacity-60 cursor-pointer'
                          : 'text-slate-600 hover:text-rose-700 hover:bg-rose-50'
                      }`}
                      title={!isServant ? 'تسجيل دخول الخادم مطلوب لتعديل الحضور' : undefined}
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>غائب</span>
                    </button>

                    <button
                      onClick={() => handleProtectedAttendanceChange(student.id, 'excused')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                        isExcused
                          ? 'bg-amber-600 text-white shadow-sm'
                          : !isServant
                          ? 'text-slate-400 opacity-60 cursor-pointer'
                          : 'text-slate-600 hover:text-amber-700 hover:bg-amber-50'
                      }`}
                      title={!isServant ? 'تسجيل دخول الخادم مطلوب لتعديل الحضور' : undefined}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>معتذر</span>
                    </button>
                  </div>
                </div>

                {/* Milestone Claim Callout if eligible right now */}
                {pendingReward && (
                  <div className="mt-3 p-2.5 rounded-xl bg-amber-50 border border-amber-300/80 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                      <p className="text-xs font-bold text-amber-950">
                        مستحق لـ «{pendingReward.tier.title}» لتسجيله {currentStreak} مرات حضور متتالية!
                      </p>
                    </div>
                    {isServant ? (
                      <button
                        onClick={() => onDeliverReward(student, pendingReward.tier)}
                        className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-black rounded-lg transition shadow-xs shrink-0 flex items-center gap-1"
                      >
                        <Gift className="w-3.5 h-3.5" />
                        <span>تسليم الهدية 🎁</span>
                      </button>
                    ) : (
                      <span className="text-[11px] font-bold text-amber-800 bg-amber-100/80 px-2.5 py-1 rounded-lg">
                        بانتظار تسليم الخادم 🎁
                      </span>
                    )}
                  </div>
                )}

                {/* Bonus Points Section (Visible when student is marked Present) */}
                {isPresent && (
                  <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] font-bold text-slate-500 ml-1">بونص اليوم:</span>

                      {/* Liturgy checkbox button */}
                      <button
                        onClick={() =>
                          handleProtectedAttendanceChange(student.id, 'present', {
                            liturgy: !record.bonus.liturgy,
                          })
                        }
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold transition border ${
                          record.bonus.liturgy
                            ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                            : !isServant
                            ? 'bg-slate-50 text-slate-400 border-slate-200 opacity-60 cursor-pointer'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-purple-300 hover:bg-purple-50'
                        }`}
                        title={!isServant ? 'تسجيل دخول الخادم مطلوب للتعديل' : 'حضور القداس الإلهي'}
                      >
                        <Church className="w-3 h-3" />
                        <span>القداس (+{pointsRules.liturgy})</span>
                      </button>

                      {/* Verse checkbox button */}
                      <button
                        onClick={() =>
                          handleProtectedAttendanceChange(student.id, 'present', {
                            verse: !record.bonus.verse,
                          })
                        }
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold transition border ${
                          record.bonus.verse
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : !isServant
                            ? 'bg-slate-50 text-slate-400 border-slate-200 opacity-60 cursor-pointer'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-blue-300 hover:bg-blue-50'
                        }`}
                        title={!isServant ? 'تسجيل دخول الخادم مطلوب للتعديل' : 'حفظ الآية الأسبوعية'}
                      >
                        <BookOpen className="w-3 h-3" />
                        <span>حفظ الآية (+{pointsRules.verse})</span>
                      </button>

                      {/* Prayer checkbox button */}
                      <button
                        onClick={() =>
                          handleProtectedAttendanceChange(student.id, 'present', {
                            prayer: !record.bonus.prayer,
                          })
                        }
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold transition border ${
                          record.bonus.prayer
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : !isServant
                            ? 'bg-slate-50 text-slate-400 border-slate-200 opacity-60 cursor-pointer'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50'
                        }`}
                        title={!isServant ? 'تسجيل دخول الخادم مطلوب للتعديل' : 'الالتزام بوقفة الصلاة'}
                      >
                        <HeartHandshake className="w-3 h-3" />
                        <span>الصلاة (+{pointsRules.prayer})</span>
                      </button>

                      {/* Participation button */}
                      <button
                        onClick={() =>
                          handleProtectedAttendanceChange(student.id, 'present', {
                            participation: !record.bonus.participation,
                          })
                        }
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold transition border ${
                          record.bonus.participation
                            ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                            : !isServant
                            ? 'bg-slate-50 text-slate-400 border-slate-200 opacity-60 cursor-pointer'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-amber-300 hover:bg-amber-50'
                        }`}
                        title={!isServant ? 'تسجيل دخول الخادم مطلوب للتعديل' : 'المشاركة الفعالة والتفاعل بالدرس'}
                      >
                        <Award className="w-3 h-3" />
                        <span>تفاعل (+{pointsRules.participation})</span>
                      </button>

                      {/* Quick Custom Session Points */}
                      <button
                        onClick={() => {
                          const current = record.bonus.customPoints || 0;
                          const nextVal = current === 0 ? 5 : current === 5 ? 10 : current === 10 ? 15 : 0;
                          handleProtectedAttendanceChange(student.id, 'present', {
                            customPoints: nextVal,
                            customReason: nextVal > 0 ? 'بونص سؤال أو فقرة' : '',
                          });
                        }}
                        className={`flex items-center gap-1 px-2 py-1 rounded-xl text-xs font-bold transition border ${
                          record.bonus.customPoints > 0
                            ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                            : !isServant
                            ? 'bg-slate-50 text-slate-400 border-slate-200 opacity-60 cursor-pointer'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-amber-300'
                        }`}
                        title={!isServant ? 'تسجيل دخول الخادم مطلوب للتعديل' : 'انقر لزيادة أو تصفير بونص إضافي سريع (+5 / +10 / +15)'}
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>
                          {record.bonus.customPoints > 0 ? `+${record.bonus.customPoints} بونص` : '+ بونص'}
                        </span>
                      </button>

                      {/* Behavioral Penalty Button */}
                      {record.bonus?.penaltyPoints && record.bonus.penaltyPoints > 0 ? (
                        <button
                          onClick={() => {
                            if (!isServant) {
                              onOpenLogin?.();
                              return;
                            }
                            setPenaltyPointsInput(record.bonus.penaltyPoints || 5);
                            setPenaltyReasonInput(record.bonus.penaltyReason || 'استخدام الموبايل أثناء الصلاة أو الدرس');
                            setPenaltyTarget({ student, record });
                          }}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-black bg-rose-600 hover:bg-rose-700 text-white border border-rose-700 shadow-xs transition"
                          title="خصم مطبق على هذا المخدوم، انقر للتعديل أو الإلغاء"
                        >
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-200" />
                          <span>خصم: -{record.bonus.penaltyPoints}</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            if (!isServant) {
                              onOpenLogin?.();
                              return;
                            }
                            setPenaltyPointsInput(5);
                            setPenaltyReasonInput('استخدام الموبايل أثناء الصلاة أو الدرس');
                            setPenaltyTarget({ student, record });
                          }}
                          className={`flex items-center gap-1 px-2 py-1 rounded-xl text-xs font-bold transition border ${
                            !isServant
                              ? 'bg-slate-50 text-slate-400 border-slate-200 opacity-60 cursor-pointer'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-rose-300 hover:text-rose-700 hover:bg-rose-50'
                          }`}
                          title={!isServant ? 'تسجيل دخول الخادم مطلوب للتعديل' : 'خصم نقاط بسبب سلوك سلبي (تشويش، استخدام موبايل...)'}
                        >
                          <AlertTriangle className="w-3 h-3 text-rose-500" />
                          <span>خصم نقاط ⚠️</span>
                        </button>
                      )}
                    </div>

                    {/* Total Points for this session */}
                    <div className="text-xs text-slate-600 font-bold bg-slate-100 px-2.5 py-1 rounded-xl flex items-center gap-1.5">
                      <span>نقاط اليوم:</span>
                      <span className="font-black text-amber-950">
                        {Math.max(
                          0,
                          pointsRules.attendanceBase +
                          (record.bonus.liturgy ? pointsRules.liturgy : 0) +
                          (record.bonus.verse ? pointsRules.verse : 0) +
                          (record.bonus.prayer ? pointsRules.prayer : 0) +
                          (record.bonus.participation ? pointsRules.participation : 0) +
                          (record.bonus.customPoints || 0) -
                          (record.bonus?.penaltyPoints || 0)
                        )}
                      </span>
                      {record.bonus?.penaltyPoints && record.bonus.penaltyPoints > 0 ? (
                        <span className="text-[10px] text-rose-600 font-bold bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded-md">
                          (خصم -{record.bonus.penaltyPoints})
                        </span>
                      ) : null}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
        </>
      )}

      {/* Modal for Creating New Service Session */}
      {isCreatingSession && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-lg font-black text-slate-900 mb-1 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-600" />
              <span>إنشاء لقاء خدمة جديد</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              أدخل تاريخ اللقاء وعنوان الدرس لتسجيل الحضور وتوزيع النقاط.
            </p>

            <form onSubmit={handleCreateSessionSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">تاريخ اللقاء</label>
                <input
                  type="date"
                  required
                  value={newSessionDate}
                  onChange={(e) => setNewSessionDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">عنوان الاجتماع / الموضوع</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: اجتماع الجمعة - فضيلة الرجاء"
                  value={newSessionTitle}
                  onChange={(e) => setNewSessionTitle(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">آية الأسبوع (اختياري)</label>
                <input
                  type="text"
                  placeholder="مثال: «اَلرَّبُّ نُورِي وَخَلاَصِي، مِمَّنْ أَخَافُ؟» (مز 27: 1)"
                  value={newSessionVerse}
                  onChange={(e) => setNewSessionVerse(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              {/* Speaker Servant Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  الخادم الذي سيشرح الدرس *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
                  {['مينا', 'ماجد', 'صبري'].map((srv) => (
                    <button
                      type="button"
                      key={srv}
                      onClick={() => setNewSessionSpeaker(srv)}
                      className={`py-2 px-2 text-center rounded-xl border text-xs font-black transition ${
                        newSessionSpeaker === srv
                          ? 'bg-amber-500 text-stone-950 border-amber-500 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      أ/ {srv}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setNewSessionSpeaker('خادم آخر')}
                    className={`py-2 px-2 text-center rounded-xl border text-xs font-black transition ${
                      newSessionSpeaker === 'خادم آخر'
                        ? 'bg-amber-500 text-stone-950 border-amber-500 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    خادم آخر (ضيف)
                  </button>
                </div>

                {newSessionSpeaker === 'خادم آخر' && (
                  <div className="animate-in fade-in duration-150">
                    <input
                      type="text"
                      required
                      placeholder="اكتب اسم الخادم الضيف (مثال: أبونا أنطونيوس، أستاذ رامي)..."
                      value={newGuestSpeakerName}
                      onChange={(e) => setNewGuestSpeakerName(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-amber-50/50 border border-amber-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingSession(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl transition shadow-md"
                >
                  حفظ وبدء التسجيل
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal for Setting/Removing Behavioral Penalty on a Student */}
      {penaltyTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-black">
                  <AlertTriangle className="w-5 h-5 text-rose-600" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    خصم نقاط / تنبيه سلوكي
                  </h3>
                  <p className="text-xs text-slate-500">
                    المخدوم: <span className="font-bold text-slate-800">{penaltyTarget.student.name}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPenaltyTarget(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Reason Suggestions */}
            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  أسباب وتنبيهات شائعة (انقر للاختيار):
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { label: '📵 استخدام الموبايل بالصلاة أو الدرس', points: 10 },
                    { label: '🗣️ تشويش وكلام أثناء الكلمة', points: 5 },
                    { label: '🚪 مغادرة القاعة بدون إذن', points: 10 },
                    { label: '⏰ تأخير متكرر عن الميعاد', points: 5 },
                    { label: '🚯 عدم المحافظة على النظافة والنظام', points: 5 },
                    { label: '📖 عدم إحضار الأجبية أو الإنجيل', points: 5 },
                  ].map((tpl, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setPenaltyReasonInput(tpl.label);
                        setPenaltyPointsInput(tpl.points);
                      }}
                      className="text-start text-[11px] font-bold p-2 bg-rose-50/70 hover:bg-rose-100 text-rose-900 border border-rose-200/80 rounded-xl transition"
                    >
                      {tpl.label} (-{tpl.points})
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  سبب الخصم المكتوب:
                </label>
                <input
                  type="text"
                  value={penaltyReasonInput}
                  onChange={(e) => setPenaltyReasonInput(e.target.value)}
                  placeholder="اكتب سبب الخصم أو التنبيه..."
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  النقاط المخصومة:
                </label>
                <div className="flex items-center gap-2">
                  {[5, 10, 15, 20].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPenaltyPointsInput(p)}
                      className={`flex-1 py-1.5 text-xs font-black rounded-xl border transition ${
                        penaltyPointsInput === p
                          ? 'bg-rose-600 text-white border-rose-600'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      -{p}
                    </button>
                  ))}
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={penaltyPointsInput}
                    onChange={(e) => setPenaltyPointsInput(Math.abs(parseInt(e.target.value) || 0))}
                    className="w-20 px-2 py-1.5 text-xs font-black text-rose-700 bg-white border border-slate-300 rounded-xl text-center focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              {penaltyTarget.record.bonus?.penaltyPoints && penaltyTarget.record.bonus.penaltyPoints > 0 ? (
                <button
                  type="button"
                  onClick={() => {
                    handleProtectedAttendanceChange(penaltyTarget.student.id, penaltyTarget.record.status, {
                      penaltyPoints: 0,
                      penaltyReason: '',
                    });
                    setPenaltyTarget(null);
                  }}
                  className="px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition border border-rose-200"
                >
                  إلغاء الخصم وحذفه 🔄
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPenaltyTarget(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  إغلاق
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleProtectedAttendanceChange(penaltyTarget.student.id, penaltyTarget.record.status, {
                      penaltyPoints: Number(penaltyPointsInput) || 5,
                      penaltyReason: penaltyReasonInput.trim() || 'سلوك سلبي',
                    });
                    setPenaltyTarget(null);
                  }}
                  className="px-5 py-2 text-xs font-black bg-rose-600 hover:bg-rose-500 text-white rounded-xl transition shadow-md flex items-center gap-1.5"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>تطبيق الخصم (-{penaltyPointsInput})</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

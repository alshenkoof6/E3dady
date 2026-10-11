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
import { calculateStudentStats } from '../utils/calculations';
import { 
  Users, 
  Search, 
  Plus, 
  Phone, 
  MessageCircle, 
  Flame, 
  Award, 
  Trash2, 
  Edit3, 
  FileSpreadsheet, 
  Filter, 
  Sparkles, 
  UserCheck,
  Cake,
  Calendar
} from 'lucide-react';
import { isBirthdayToday, calculateAge, formatBirthDateArabic } from '../utils/birthday';

interface StudentsViewProps {
  students: Student[];
  sessions: ServiceSession[];
  pointsRules: PointsRuleConfig;
  rewardTiers: RewardTier[];
  competitionLogs: CompetitionLog[];
  onSelectStudent: (student: Student) => void;
  onOpenAddStudent: () => void;
  onOpenImportExport: () => void;
  onDeleteStudent: (studentId: string) => void;
  onEditStudent: (student: Student) => void;
}

export const StudentsView: React.FC<StudentsViewProps> = ({
  students,
  sessions,
  pointsRules,
  rewardTiers,
  competitionLogs,
  onSelectStudent,
  onOpenAddStudent,
  onOpenImportExport,
  onDeleteStudent,
  onEditStudent,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<GradeLevel | 'الكل'>('الكل');
  const [selectedGender, setSelectedGender] = useState<Gender | 'الكل'>('الكل');
  const [selectedFamily, setSelectedFamily] = useState<string>('الكل');
  const [onlyBirthdayToday, setOnlyBirthdayToday] = useState(false);

  // Available families
  const families = useMemo(() => {
    const set = new Set<string>();
    students.forEach((s) => s.family && set.add(s.family));
    return Array.from(set);
  }, [students]);

  // Count of students having a birthday today
  const todayBirthdaysCount = useMemo(() => {
    return students.filter((s) => isBirthdayToday(s.birthDate)).length;
  }, [students]);

  // Calculate stats for each student
  const studentsWithStats = useMemo(() => {
    return students.map((student) => {
      const stats = calculateStudentStats(student, sessions, pointsRules, competitionLogs, rewardTiers);
      return stats;
    });
  }, [students, sessions, pointsRules, competitionLogs, rewardTiers]);

  // Filter list
  const filtered = useMemo(() => {
    return studentsWithStats.filter(({ student }) => {
      if (onlyBirthdayToday && !isBirthdayToday(student.birthDate)) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = student.name.toLowerCase().includes(q);
        const matchesFamily = student.family.toLowerCase().includes(q);
        const matchesPhone = student.phone?.includes(q) || student.parentPhone?.includes(q);
        if (!matchesName && !matchesFamily && !matchesPhone) return false;
      }
      if (selectedGrade !== 'الكل' && student.grade !== selectedGrade) return false;
      if (selectedGender !== 'الكل' && student.gender !== selectedGender) return false;
      if (selectedFamily !== 'الكل' && student.family !== selectedFamily) return false;

      return true;
    });
  }, [studentsWithStats, searchQuery, selectedGrade, selectedGender, selectedFamily, onlyBirthdayToday]);

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-amber-600" />
            <span>سجل مخدومي إعدادي ({students.length} مخدوم)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            إدارة بيانات الأولاد والبنات، أرقام الهواتف، والتواصل والافتقاد.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onOpenImportExport}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl transition border border-slate-200 active:scale-95"
            title="استيراد وتصدير داتا الأولاد بالكامل"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>استيراد وتصدير داتا</span>
          </button>

          <button
            onClick={onOpenAddStudent}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl transition shadow-md active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة مخدوم جديد</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-4 space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ابحث بالاسم، الأسرة، أو رقم التليفون..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-10 pl-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs pt-1 border-t border-slate-100">
          <div className="flex items-center gap-1 text-slate-500 font-bold ml-1">
            <Filter className="w-3.5 h-3.5" />
            <span>تصفية:</span>
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

          {families.length > 0 && (
            <select
              value={selectedFamily}
              onChange={(e) => setSelectedFamily(e.target.value)}
              className="bg-slate-100 text-slate-700 font-bold px-2.5 py-1 rounded-xl border border-slate-200 focus:outline-none"
            >
              <option value="الكل">كل الأسر</option>
              {families.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          )}

          {/* Birthday Filter Button */}
          <button
            onClick={() => setOnlyBirthdayToday(!onlyBirthdayToday)}
            className={`px-3 py-1 rounded-xl font-bold transition flex items-center gap-1.5 text-xs ${
              onlyBirthdayToday
                ? 'bg-rose-500 text-white shadow-xs'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
            }`}
            title="عرض المخدومين الذين يوافق عيد ميلادهم اليوم فقط"
          >
            <Cake className="w-3.5 h-3.5" />
            <span>أعياد ميلاد اليوم</span>
            {todayBirthdaysCount > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                onlyBirthdayToday ? 'bg-white text-rose-600' : 'bg-rose-600 text-white'
              }`}>
                {todayBirthdaysCount}
              </span>
            )}
          </button>

          <span className="text-slate-400 font-medium mr-auto">
            (العدد: {filtered.length})
          </span>
        </div>
      </div>

      {/* Students Grid */}
      {students.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-amber-300 p-12 text-center max-w-lg mx-auto space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-600 flex items-center justify-center mx-auto">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900">سجل المخدومين جاهز وفارغ</h3>
            <p className="text-xs text-slate-500 mt-1">
              لم تقم بإدخال داتا الأولاد بعد. يمكنك إضافتهم فرداً فرداً أو لصق واستيراد الكشف كاملاً دفعة واحدة.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <button
              onClick={onOpenAddStudent}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs rounded-xl shadow-md transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة مخدوم</span>
            </button>
            <button
              onClick={onOpenImportExport}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition border border-slate-200 flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>استيراد كشف (Excel / لصق)</span>
            </button>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
          <p className="text-slate-500 text-xs font-semibold">
            {onlyBirthdayToday
              ? 'لا يوجد مخدومين يوافق عيد ميلادهم اليوم.'
              : 'لا يوجد مخدومين يطابقون نتائج البحث.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(({ student, currentStreak, totalPoints, attendanceRate }) => {
            const isBdayToday = isBirthdayToday(student.birthDate);
            return (
            <div
              key={student.id}
              className={`bg-white rounded-3xl border shadow-xs hover:shadow-md transition p-4 flex flex-col justify-between gap-3 group ${
                isBdayToday ? 'border-rose-300 ring-2 ring-rose-200/50 bg-rose-50/20' : 'border-slate-200 hover:border-amber-300'
              }`}
            >
              <div>
              <div className="flex items-start justify-between gap-2">
                <div
                  onClick={() => onSelectStudent(student)}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  {student.photoUrl ? (
                    <img
                      src={student.photoUrl}
                      alt={student.name}
                      className="w-12 h-12 rounded-2xl object-cover border-2 border-amber-400 shadow-sm shrink-0"
                    />
                  ) : (
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xs shrink-0 shadow-inner ${
                        student.gender === 'بنين'
                          ? 'bg-blue-100 text-blue-900 border border-blue-200'
                          : 'bg-rose-100 text-rose-900 border border-rose-200'
                      }`}
                    >
                      {student.name.split(' ').slice(0, 2).map((n) => n[0]).join('')}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="text-sm font-black text-slate-900 group-hover:text-amber-800 transition">
                        {student.name}
                      </h3>
                      {isBdayToday && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-700 border border-rose-200 flex items-center gap-1 animate-pulse">
                          <Cake className="w-3 h-3 text-rose-600" />
                          عيد ميلاده اليوم! 🎂
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium">
                      {student.grade} • {student.family}
                    </p>
                    {student.birthDate && (
                      <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3 text-amber-600" />
                        <span>{formatBirthDateArabic(student.birthDate)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onEditStudent(student)}
                    className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                    title="تعديل البيانات"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`هل أنت متأكد من حذف ${student.name} من الخدمة؟`)) {
                        onDeleteStudent(student.id);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    title="حذف المخدوم"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-100 text-center text-xs">
                <div className="bg-amber-50/60 rounded-xl p-1.5">
                  <span className="text-[10px] text-amber-800 block font-bold">النقاط</span>
                  <span className="text-xs font-black text-amber-900">{totalPoints}</span>
                </div>
                <div className="bg-slate-50 rounded-xl p-1.5">
                  <span className="text-[10px] text-slate-500 block font-bold">تتابع 🔥</span>
                  <span className="text-xs font-black text-slate-800">{currentStreak}</span>
                </div>
                <div className="bg-slate-50 rounded-xl p-1.5">
                  <span className="text-[10px] text-slate-500 block font-bold">نسبة الحضور</span>
                  <span className="text-xs font-black text-slate-800">{attendanceRate}%</span>
                </div>
              </div>
            </div>

            {/* Contact & Profile Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
              <div className="flex items-center gap-2">
                {student.phone ? (
                  <>
                    <a
                      href={`tel:${student.phone}`}
                      className="p-1.5 bg-slate-100 hover:bg-emerald-100 text-slate-600 hover:text-emerald-700 rounded-lg transition"
                      title={`اتصال: ${student.phone}`}
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </a>
                    <a
                      href={`https://wa.me/2${student.phone.replace(/^0/, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 bg-slate-100 hover:bg-emerald-100 text-slate-600 hover:text-emerald-700 rounded-lg transition"
                      title="واتساب المخدوم"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                    </a>
                  </>
                ) : (
                  <span className="text-[10px] text-slate-400">لا يوجد رقم مسجل</span>
                )}
              </div>

              <button
                onClick={() => onSelectStudent(student)}
                className="text-amber-800 hover:text-amber-900 font-bold text-xs hover:underline"
              >
                عرض الملف والسجل ←
              </button>
            </div>
          </div>
          );
        })}
      </div>
      )}
    </div>
  );
};

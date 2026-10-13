import React, { useState, useMemo } from 'react';
import { 
  Student, 
  ServiceSession, 
  PointsRuleConfig, 
  RewardTier, 
  CompetitionLog, 
  GradeLevel 
} from '../types';
import { 
  calculateMonthlyPerformance, 
  extractAvailableMonths, 
  getArabicMonthYear,
  getTop3StudentIdsForMonth,
  StudentMonthlyRecord
} from '../utils/monthlyCalculations';
import { 
  Calendar, 
  TrendingUp, 
  Award, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Printer, 
  Download, 
  Search, 
  Filter, 
  Users, 
  Church, 
  BookOpen, 
  HeartHandshake, 
  AlertCircle, 
  Phone, 
  MessageCircle, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles,
  BarChart3,
  UserCheck
} from 'lucide-react';

interface MonthlyReportsViewProps {
  students: Student[];
  sessions: ServiceSession[];
  pointsRules: PointsRuleConfig;
  rewardTiers: RewardTier[];
  competitionLogs: CompetitionLog[];
  churchName: string;
  serviceName: string;
  onSelectStudent: (student: Student) => void;
  onOpenAchievementCard?: (student: Student, title?: 'بطل الشهر' | 'بطل التتابع الذهبي' | 'افضل قارئ للانجيل وحافظ الآيات') => void;
}

export const MonthlyReportsView: React.FC<MonthlyReportsViewProps> = ({
  students,
  sessions,
  pointsRules,
  rewardTiers,
  competitionLogs,
  churchName,
  serviceName,
  onSelectStudent,
  onOpenAchievementCard,
}) => {
  // Extract all available months from sessions
  const availableMonths = useMemo(() => extractAvailableMonths(sessions), [sessions]);
  
  // Selected month state (defaults to the latest month)
  const [selectedMonth, setSelectedMonth] = useState<string>(() => availableMonths[0] || '2026-10');
  
  // Filters for student table
  const [searchQuery, setSearchQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState<GradeLevel | 'الكل'>('الكل');
  const [performanceFilter, setPerformanceFilter] = useState<'all' | 'perfect' | 'regular' | 'needs_follow_up'>('all');

  // Calculate monthly metrics
  const monthlyData = useMemo(() => {
    return calculateMonthlyPerformance(
      selectedMonth,
      students,
      sessions,
      pointsRules,
      competitionLogs
    );
  }, [selectedMonth, students, sessions, pointsRules, competitionLogs]);

  // Top 3 in this selected month
  const { top3Ids: top3IdsInMonth, top3Map } = useMemo(() => {
    return getTop3StudentIdsForMonth(
      selectedMonth,
      students,
      sessions,
      pointsRules,
      competitionLogs
    );
  }, [selectedMonth, students, sessions, pointsRules, competitionLogs]);

  // Filter student rows in table
  const filteredStudents = useMemo(() => {
    return monthlyData.studentsRecords.filter((record) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = record.student.name.toLowerCase().includes(q);
        const matchesFamily = record.student.family.toLowerCase().includes(q);
        if (!matchesName && !matchesFamily) return false;
      }
      // Grade
      if (gradeFilter !== 'الكل' && record.student.grade !== gradeFilter) return false;
      // Performance Filter
      if (performanceFilter === 'perfect' && record.attendanceRate < 100) return false;
      if (performanceFilter === 'regular' && (record.attendanceRate < 60 || record.attendanceRate === 100)) return false;
      if (performanceFilter === 'needs_follow_up' && record.attendanceRate >= 50) return false;

      return true;
    }).sort((a, b) => b.monthlyPoints - a.monthlyPoints || b.attendanceRate - a.attendanceRate);
  }, [monthlyData.studentsRecords, searchQuery, gradeFilter, performanceFilter]);

  // Export CSV of monthly report
  const handleExportCSV = () => {
    const monthName = getArabicMonthYear(selectedMonth);
    const headers = [
      'الاسم',
      'المرحلة',
      'الأسرة',
      'حضور الشهر (مرات)',
      'إجمالي لقاءات الشهر',
      'نسبة الحضور %',
      'حضور القداس',
      'حفظ الآية',
      'الصلاة',
      'المشاركة',
      'نقاط الحضور',
      'نقاط القداس',
      'نقاط الآية',
      'نقاط الصلاة',
      'نقاط التفاعل',
      'نقاط المسابقات',
      'إجمالي نقاط الشهر',
    ];

    const rows = monthlyData.studentsRecords.map((r) => [
      r.student.name,
      r.student.grade,
      r.student.family,
      r.presentCount,
      r.sessionsHeld,
      `${r.attendanceRate}%`,
      r.liturgyCount,
      r.verseCount,
      r.prayerCount,
      r.participationCount,
      r.pointsBreakdown.attendance,
      r.pointsBreakdown.liturgy,
      r.pointsBreakdown.verse,
      r.pointsBreakdown.prayer,
      r.pointsBreakdown.participation,
      r.pointsBreakdown.competitions,
      r.monthlyPoints,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `تقرير_${monthName.replace(/\s+/g, '_')}_خدمة_إعدادي.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Trigger browser print
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Month Selector */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-5 sm:p-6 print:border-none print:shadow-none">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-2xl bg-amber-500/15 text-amber-600 border border-amber-300">
                <BarChart3 className="w-5 h-5" />
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-['Alexandria',sans-serif]">
                التقرير الشهري وتقييم أداء الخدمة
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              متابعة شاملة لنسب الحضور، الأنشطة الروحية، وإجمالي النقاط المكتسبة لكل مخدوم خلال الشهر.
            </p>
          </div>

          {/* Month Selector & Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center bg-slate-100 rounded-2xl p-1.5 border border-slate-200">
              <Calendar className="w-4 h-4 text-amber-700 ml-2" />
              <label htmlFor="month-select" className="text-xs font-bold text-slate-600 ml-1">الشهر:</label>
              <select
                id="month-select"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-transparent text-xs sm:text-sm font-black text-slate-900 py-1 px-2 focus:outline-none cursor-pointer"
              >
                {availableMonths.map((ym) => (
                  <option key={ym} value={ym}>
                    {getArabicMonthYear(ym)}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition shadow-sm active:scale-95 print:hidden"
              title="تصدير بيانات الشهر لبرنامج Excel"
            >
              <Download className="w-3.5 h-3.5" />
              <span>تصدير Excel</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition shadow-sm active:scale-95 print:hidden"
              title="طباعة التقرير الشهري أو حفظ كـ PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>طباعة التقرير</span>
            </button>
          </div>
        </div>

        {/* Sessions list in this month */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs text-slate-600">
          <span className="font-bold text-slate-700">لقاءات {monthlyData.monthNameArabic} ({monthlyData.sessionsCount} لقاءات):</span>
          {monthlyData.sessionsInMonth.length === 0 ? (
            <span className="text-slate-400">لا توجد لقاءات مسجلة في هذا الشهر.</span>
          ) : (
            monthlyData.sessionsInMonth.map((s, idx) => (
              <span
                key={s.id}
                className="bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-xl text-slate-700 font-semibold flex items-center gap-1"
              >
                <span className="w-4 h-4 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center text-[10px] font-black">
                  {idx + 1}
                </span>
                <span>{s.date}</span>
                <span className="text-slate-400">({s.title})</span>
              </span>
            ))
          )}
        </div>
      </div>

      {/* KPI METRICS CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Metric 1: Monthly Attendance Rate */}
        <div className="bg-gradient-to-br from-emerald-50 via-white to-emerald-50/40 rounded-3xl p-5 border border-emerald-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-emerald-800">متوسط نسبة الحضور</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-700">{monthlyData.averageAttendanceRate}%</span>
            <span className="text-xs text-slate-500 font-semibold">
              ({monthlyData.averageAttendanceRate >= 75 ? 'ممتاز' : monthlyData.averageAttendanceRate >= 60 ? 'جيد' : 'يحتاج متابعة'})
            </span>
          </div>
          <div className="mt-3 w-full bg-emerald-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-emerald-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${monthlyData.averageAttendanceRate}%` }}
            />
          </div>
        </div>

        {/* Metric 2: Total Monthly Points */}
        <div className="bg-gradient-to-br from-amber-50 via-white to-amber-50/40 rounded-3xl p-5 border border-amber-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-amber-800">مجموع نقاط الشهر</span>
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-900">{monthlyData.totalPointsAwarded}</span>
            <span className="text-xs text-amber-700 font-semibold">نقطة مكتسبة</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            معدل {monthlyData.averagePointsPerStudent} نقطة لكل مخدوم
          </p>
        </div>

        {/* Metric 3: Liturgy & Prayer Engagement */}
        <div className="bg-gradient-to-br from-purple-50 via-white to-purple-50/40 rounded-3xl p-5 border border-purple-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-purple-900">حضور القداس الإلهي</span>
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <Church className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-purple-900">{monthlyData.liturgyRate}%</span>
            <span className="text-xs text-purple-700 font-semibold">من الحاضرين</span>
          </div>
          <div className="mt-3 w-full bg-purple-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-purple-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${monthlyData.liturgyRate}%` }}
            />
          </div>
        </div>

        {/* Metric 4: Bible Verse Memorization */}
        <div className="bg-gradient-to-br from-blue-50 via-white to-blue-50/40 rounded-3xl p-5 border border-blue-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-blue-900">حفظ الآية وتسميعها</span>
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-blue-900">{monthlyData.verseRate}%</span>
            <span className="text-xs text-blue-700 font-semibold">من الحاضرين</span>
          </div>
          <div className="mt-3 w-full bg-blue-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-blue-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${monthlyData.verseRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* GRADE-BY-GRADE PERFORMANCE COMPARISON */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-5 sm:p-6">
        <h3 className="text-base font-black text-slate-900 mb-1 flex items-center gap-2">
          <Users className="w-5 h-5 text-amber-600" />
          <span>مقارنة أداء المراحل الدراسية في شهر {monthlyData.monthNameArabic}</span>
        </h3>
        <p className="text-xs text-slate-500 mb-5">
          تقييم نسبة الحضور والتفاعل والنقاط لكل فرقة دراسية لتحديد الفصول الأكثر التزاماً وتوجيه خدمة الافتقاد.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {monthlyData.gradeMetrics.map((gm, idx) => {
            const isFirst = idx === 0;
            const isSecond = idx === 1;
            const colorClass = isFirst
              ? 'border-blue-200 bg-blue-50/20'
              : isSecond
              ? 'border-emerald-200 bg-emerald-50/20'
              : 'border-purple-200 bg-purple-50/20';

            const barColor = isFirst ? 'bg-blue-600' : isSecond ? 'bg-emerald-600' : 'bg-purple-600';

            return (
              <div key={gm.grade} className={`rounded-2xl border p-4.5 space-y-3 ${colorClass}`}>
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black text-slate-900">{gm.grade}</h4>
                  <span className="text-xs font-bold text-slate-500 bg-white px-2 py-0.5 rounded-lg border border-slate-200">
                    {gm.studentCount} مخدوم
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-600">نسبة حضور الشهر:</span>
                    <span className="text-slate-900 font-black">{gm.attendanceRate}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${barColor}`}
                      style={{ width: `${gm.attendanceRate}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                  <div className="bg-white/80 p-2 rounded-xl border border-slate-100 text-center">
                    <span className="text-[10px] text-slate-400 block font-bold">إجمالي النقاط</span>
                    <span className="font-black text-slate-800">{gm.totalPoints}</span>
                  </div>
                  <div className="bg-white/80 p-2 rounded-xl border border-slate-100 text-center">
                    <span className="text-[10px] text-slate-400 block font-bold">معدل الطالب</span>
                    <span className="font-black text-slate-800">{gm.averagePointsPerStudent}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* TOP PERFORMERS & NEEDS ATTENTION TWO-COLUMN SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers of the Month */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>أبطال الشهر الأكثر التزاماً ونقاطاً</span>
              </h3>
              <p className="text-xs text-slate-500">أعلى المخدومين في مجموع نقاط شهر {monthlyData.monthNameArabic}.</p>
            </div>
            <span className="text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-1 rounded-full">
              فرسان الشهر
            </span>
          </div>

          <div className="space-y-2.5">
            {monthlyData.topPerformers.map((item, index) => (
              <div
                key={item.student.id}
                onClick={() => onSelectStudent(item.student)}
                className="p-3 rounded-2xl bg-slate-50 hover:bg-amber-50/50 border border-slate-100 hover:border-amber-200 transition cursor-pointer flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-amber-500 text-stone-950 font-black text-xs flex items-center justify-center shrink-0">
                    {index + 1}
                  </span>
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-slate-900">{item.student.name}</h4>
                    <p className="text-[11px] text-slate-500">{item.student.grade} • {item.student.family}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg hidden sm:inline">
                    حضور {item.presentCount}/{item.sessionsHeld} ({item.attendanceRate}%)
                  </span>
                  <span className="text-xs font-black text-amber-900 bg-amber-100 px-2.5 py-1 rounded-xl">
                    {item.monthlyPoints} نقطة
                  </span>
                  {onOpenAchievementCard && index < 3 && top3IdsInMonth.has(item.student.id) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenAchievementCard(item.student, 'بطل الشهر');
                      }}
                      className="px-2.5 py-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black text-xs rounded-xl shadow-xs transition flex items-center gap-1 cursor-pointer shrink-0"
                      title="استخراج وسام بطل الشهر للمشاركة (ضمن التوب 3)"
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span>كارت 📲</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Needs Follow-Up & Visitation */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-1.5 text-rose-900">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span>مخدومون يحتاجون افتقاداً عاجلاً</span>
              </h3>
              <p className="text-xs text-slate-500">مخدومون نسبة حضورهم أقل من 50% خلال شهر {monthlyData.monthNameArabic}.</p>
            </div>
            <span className="text-xs font-bold bg-rose-100 text-rose-900 border border-rose-300 px-2.5 py-1 rounded-full">
              {monthlyData.needsFollowUp.length} مخدوم
            </span>
          </div>

          {monthlyData.needsFollowUp.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-500">
              رائع! جميع المخدومين حافظوا على نسبة حضور جيدة في هذا الشهر.
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
              {monthlyData.needsFollowUp.map((item) => (
                <div
                  key={item.student.id}
                  className="p-3 rounded-2xl bg-rose-50/40 border border-rose-200/70 flex items-center justify-between gap-3"
                >
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-slate-900">{item.student.name}</h4>
                    <p className="text-[11px] text-slate-500">
                      {item.student.grade} • غاب {item.absentCount} من {item.sessionsHeld} لقاءات
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.student.phone && (
                      <>
                        <a
                          href={`tel:${item.student.phone}`}
                          className="p-1.5 bg-white text-slate-700 hover:text-emerald-700 border border-slate-200 rounded-lg transition"
                          title={`اتصال: ${item.student.phone}`}
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                        <a
                          href={`https://wa.me/2${item.student.phone.replace(/^0/, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 bg-emerald-500 text-white rounded-lg transition hover:bg-emerald-600"
                          title="واتساب للافتقاد"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </a>
                      </>
                    )}
                    <button
                      onClick={() => onSelectStudent(item.student)}
                      className="px-2.5 py-1 text-xs font-bold bg-white text-slate-800 border border-slate-200 rounded-lg hover:bg-slate-50"
                    >
                      الملف
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* FULL MONTHLY STUDENTS SUMMARY ROSTER TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {/* Table Controls */}
        <div className="p-4 sm:p-5 border-b border-slate-100 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="text-base font-black text-slate-900">
                كشف المخدومين المفصل لشهر {monthlyData.monthNameArabic}
              </h3>
              <p className="text-xs text-slate-500">
                سجل حضور كل اجتماع، الالتزام بالقداس وحفظ الآية، وإجمالي النقاط لكل مخدوم.
              </p>
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="بحث بالاسم أو الأسرة..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-8 pl-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Filter Chips */}
          <div className="flex flex-wrap items-center gap-2 text-xs pt-1 border-t border-slate-100">
            <div className="flex items-center gap-1 text-slate-500 font-bold ml-1">
              <Filter className="w-3.5 h-3.5" />
              <span>تصفية:</span>
            </div>

            {/* Grade filter */}
            <div className="flex rounded-xl bg-slate-100 p-0.5 border border-slate-200">
              {(['الكل', 'أولى إعدادي', 'ثانية إعدادي', 'ثالثة إعدادي'] as const).map((g) => (
                <button
                  key={g}
                  onClick={() => setGradeFilter(g)}
                  className={`px-2.5 py-1 rounded-lg font-bold transition ${
                    gradeFilter === g ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>

            {/* Performance health filter */}
            <div className="flex rounded-xl bg-slate-100 p-0.5 border border-slate-200">
              {[
                { id: 'all', label: 'الكل' },
                { id: 'perfect', label: 'التزام كامل 100%' },
                { id: 'regular', label: 'حضور منتظم' },
                { id: 'needs_follow_up', label: 'يحتاج افتقاد (<50%)' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setPerformanceFilter(f.id as any)}
                  className={`px-2.5 py-1 rounded-lg font-bold transition ${
                    performanceFilter === f.id ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <span className="text-slate-400 font-semibold mr-auto">
              (العدد: {filteredStudents.length} من {students.length})
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">المخدوم</th>
                <th className="py-3 px-4">المرحلة والأسرة</th>
                {/* Meeting Dates Headers */}
                {monthlyData.sessionsInMonth.map((s) => (
                  <th key={s.id} className="py-3 px-2 text-center whitespace-nowrap">
                    <span className="block text-[11px] text-slate-800">{s.date.substring(5)}</span>
                    <span className="block text-[9px] text-slate-400 font-normal truncate max-w-[70px]">
                      {s.title}
                    </span>
                  </th>
                ))}
                <th className="py-3 px-3 text-center">حضور الشهر</th>
                <th className="py-3 px-3 text-center">نسبة الحضور</th>
                <th className="py-3 px-2 text-center text-purple-800">القداس</th>
                <th className="py-3 px-2 text-center text-blue-800">الآية</th>
                <th className="py-3 px-2 text-center text-emerald-800">الصلاة</th>
                <th className="py-3 px-2 text-center text-amber-800">تفاعل</th>
                <th className="py-3 px-4 text-left font-black text-amber-900">نقاط الشهر</th>
                <th className="py-3 px-3 text-center" title="متاح حصرياً للمراكز الثلاثة الأولى لشهر التقرير">كارت التوب 3 🏆</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={monthlyData.sessionsInMonth.length + 10} className="py-8 text-center text-slate-400 font-medium">
                    لا يوجد مخدومين يطابقون خيارات البحث.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((record, index) => (
                  <tr
                    key={record.student.id}
                    onClick={() => onSelectStudent(record.student)}
                    className="hover:bg-amber-50/40 cursor-pointer transition"
                  >
                    <td className="py-3 px-4 font-bold text-slate-400">
                      {index + 1}
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-[11px] ${
                            record.student.gender === 'بنين' ? 'bg-blue-100 text-blue-900' : 'bg-rose-100 text-rose-900'
                          }`}
                        >
                          {record.student.name.split(' ').slice(0, 2).map((n) => n[0]).join('')}
                        </div>
                        <span className="font-bold text-slate-900">{record.student.name}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-slate-500">
                      <span className="font-semibold">{record.student.grade}</span>
                      <span className="text-[10px] block text-slate-400">{record.student.family}</span>
                    </td>

                    {/* Attendance per meeting in the month */}
                    {record.meetingDetails.map((meet) => (
                      <td key={meet.sessionId} className="py-3 px-2 text-center">
                        {meet.status === 'present' ? (
                          <span
                            className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700"
                            title={`حاضر - ${meet.date}`}
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </span>
                        ) : meet.status === 'excused' ? (
                          <span
                            className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-amber-100 text-amber-700"
                            title={`معتذر - ${meet.date}`}
                          >
                            <Clock className="w-4 h-4" />
                          </span>
                        ) : (
                          <span
                            className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-rose-100 text-rose-700"
                            title={`غائب - ${meet.date}`}
                          >
                            <XCircle className="w-4 h-4" />
                          </span>
                        )}
                      </td>
                    ))}

                    <td className="py-3 px-3 text-center font-bold text-slate-800">
                      {record.presentCount} من {record.sessionsHeld}
                    </td>

                    <td className="py-3 px-3 text-center">
                      <span
                        className={`font-black px-2 py-0.5 rounded-md text-[11px] ${
                          record.attendanceRate === 100
                            ? 'bg-emerald-100 text-emerald-800'
                            : record.attendanceRate >= 60
                            ? 'bg-slate-100 text-slate-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {record.attendanceRate}%
                      </span>
                    </td>

                    <td className="py-3 px-2 text-center text-purple-900 font-bold">
                      {record.liturgyCount}
                    </td>

                    <td className="py-3 px-2 text-center text-blue-900 font-bold">
                      {record.verseCount}
                    </td>

                    <td className="py-3 px-2 text-center text-emerald-900 font-bold">
                      {record.prayerCount}
                    </td>

                    <td className="py-3 px-2 text-center text-amber-900 font-bold">
                      {record.participationCount}
                    </td>

                    <td className="py-3 px-4 text-left font-black text-amber-950">
                      <span className="bg-amber-100/90 border border-amber-300 px-2 py-1 rounded-xl text-xs">
                        {record.monthlyPoints} نقطة
                      </span>
                    </td>

                    <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                      {onOpenAchievementCard && top3Map.has(record.student.id) ? (
                        (() => {
                          const topMatch = top3Map.get(record.student.id)!;
                          const medal = topMatch.rank === 1 ? '🥇' : topMatch.rank === 2 ? '🥈' : '🥉';
                          return (
                            <button
                              onClick={() => {
                                const suggested = topMatch.rank === 1 ? 'بطل الشهر' : 'بطل الشهر';
                                onOpenAchievementCard(record.student, suggested);
                              }}
                              className="px-2.5 py-1 bg-amber-100 hover:bg-amber-400 text-amber-950 font-black text-xs rounded-xl border border-amber-300 transition inline-flex items-center gap-1 cursor-pointer shadow-xs active:scale-95"
                              title={`استخراج كارت الإنجاز - المركز ${topMatch.rank} لشهر ${monthlyData.monthNameArabic}`}
                            >
                              <span>{medal}</span>
                              <span>كارت 📲</span>
                            </button>
                          );
                        })()
                      ) : (
                        <span className="text-slate-300 text-xs font-semibold select-none" title="كارت الإنجاز متاح للمراكز الثلاثة الأولى فقط">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

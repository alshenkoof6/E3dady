import React, { useState, useMemo } from 'react';
import { Student, CompetitionLog, GradeLevel } from '../types';
import { Zap, X, AlertTriangle, Users, Check, Sparkles, PhoneOff, MessageSquareWarning, Clock, DoorOpen, Trash2 } from 'lucide-react';
import { triggerGiftCelebration } from '../utils/confetti';

interface AddCompetitionModalProps {
  students: Student[];
  onClose: () => void;
  onAddCompetition: (competition: CompetitionLog) => void;
  initialMode?: 'bonus' | 'penalty';
  initialStudentId?: string;
}

export const AddCompetitionModal: React.FC<AddCompetitionModalProps> = ({
  students,
  onClose,
  onAddCompetition,
  initialMode = 'bonus',
  initialStudentId,
}) => {
  const [mode, setMode] = useState<'bonus' | 'penalty'>(initialMode);
  const [title, setTitle] = useState(initialMode === 'penalty' ? 'استخدام الموبايل أثناء الصلاة' : '');
  const [points, setPoints] = useState<number>(initialMode === 'penalty' ? 10 : 15);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [targetType, setTargetType] = useState<'selected' | 'grade' | 'all'>('selected');
  const [targetGrade, setTargetGrade] = useState<GradeLevel>('أولى إعدادي');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>(
    initialStudentId ? [initialStudentId] : []
  );
  const [searchStudent, setSearchStudent] = useState('');

  // Pre-fill suggested quick points
  const bonusPresets = [5, 10, 15, 20, 30, 50];
  const penaltyPresets = [5, 10, 15, 20, 25];

  // Common behavioral reasons for deductions
  const penaltyReasonTemplates = [
    { title: 'استخدام الموبايل أثناء الصلاة أو الدرس', points: 10, icon: '📵' },
    { title: 'التشويش والكلام أثناء كلمة الخادم', points: 5, icon: '🗣️' },
    { title: 'مغادرة قاعة الاجتماع بدون استئذان', points: 10, icon: '🚪' },
    { title: 'التأخر المتكرر عن ميعاد الاجتماع', points: 5, icon: '⏰' },
    { title: 'عدم المحافظة على نظافة ونظام الكنيسة', points: 5, icon: '🚯' },
    { title: 'عدم إحضار الأجبية أو الكتاب المقدس', points: 5, icon: '📖' },
  ];

  // Common bonus templates
  const bonusReasonTemplates = [
    { title: 'مسابقة سفر يونان النبي والكتاب المقدس', points: 15 },
    { title: 'كويز درس الأسبوع والتجاوب المميز', points: 10 },
    { title: 'حفظ جزء إضافي من التسبحة أو المزمور', points: 20 },
    { title: 'المساعدة في ترتيب قاعة الخدمة وخدمة الإخوة', points: 15 },
  ];

  const isPenalty = mode === 'penalty';

  // Calculate awarded student ids based on mode
  const finalAwardedIds = useMemo(() => {
    if (targetType === 'all') {
      return students.map((s) => s.id);
    }
    if (targetType === 'grade') {
      return students.filter((s) => s.grade === targetGrade).map((s) => s.id);
    }
    return selectedStudentIds;
  }, [targetType, targetGrade, selectedStudentIds, students]);

  const toggleStudent = (id: string) => {
    if (selectedStudentIds.includes(id)) {
      setSelectedStudentIds(selectedStudentIds.filter((sid) => sid !== id));
    } else {
      setSelectedStudentIds([...selectedStudentIds, id]);
    }
  };

  const selectAllFiltered = (filteredIds: string[]) => {
    const combined = Array.from(new Set([...selectedStudentIds, ...filteredIds]));
    setSelectedStudentIds(combined);
  };

  const deselectAllFiltered = (filteredIds: string[]) => {
    setSelectedStudentIds(selectedStudentIds.filter((id) => !filteredIds.includes(id)));
  };

  const filteredStudents = useMemo(() => {
    if (!searchStudent.trim()) return students;
    const q = searchStudent.toLowerCase();
    return students.filter(
      (s) => s.name.toLowerCase().includes(q) || s.family.toLowerCase().includes(q)
    );
  }, [students, searchStudent]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || points <= 0 || finalAwardedIds.length === 0) {
      alert('يرجى كتابة السبب أو العنوان، وتحديد النقاط، واختيار مخدوم واحد على الأقل.');
      return;
    }

    const calculatedPoints = isPenalty ? -Math.abs(Number(points)) : Math.abs(Number(points));

    const competition: CompetitionLog = {
      id: `comp-${Date.now()}`,
      title: title.trim(),
      date,
      points: calculatedPoints,
      description: description.trim(),
      awardedStudentIds: finalAwardedIds,
      type: isPenalty ? 'penalty' : 'bonus',
    };

    if (!isPenalty) {
      triggerGiftCelebration();
    }

    onAddCompetition(competition);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 relative max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute left-5 top-5 p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Mode Switcher: Bonus vs Penalty */}
        <div className="flex rounded-2xl bg-slate-100 p-1 mb-5 border border-slate-200">
          <button
            type="button"
            onClick={() => {
              setMode('bonus');
              if (isPenalty) {
                setTitle('');
                setPoints(15);
              }
            }}
            className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-black transition flex items-center justify-center gap-2 ${
              !isPenalty
                ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-900" />
            <span>🌟 إضافة بونص / مكافأة (+)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('penalty');
              if (!isPenalty) {
                setTitle('استخدام الموبايل أثناء الصلاة أو الدرس');
                setPoints(10);
              }
            }}
            className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-black transition flex items-center justify-center gap-2 ${
              isPenalty
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-rose-200" />
            <span>⚠️ خصم نقاط / جزاء سلوكي (-)</span>
          </button>
        </div>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div
            className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 ${
              isPenalty
                ? 'bg-rose-500/15 text-rose-600 border-rose-300'
                : 'bg-amber-500/20 text-amber-600 border-amber-300'
            }`}
          >
            {isPenalty ? <AlertTriangle className="w-6 h-6" /> : <Zap className="w-6 h-6" />}
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900">
              {isPenalty ? 'تسجيل خصم نقاط / تنبيه سلوكي' : 'إضافة نقاط مسابقة أو نشاط'}
            </h3>
            <p className="text-xs text-slate-500">
              {isPenalty
                ? 'خصم نقاط تربوي لمواجهة السلوكيات السلبية (تشويش، استخدام هاتف، عدم التزام) مع توضيح السبب.'
                : 'توزيع نقاط بونص فورية لمسابقات الكتاب المقدس، كويز الدرس، أو النشاط المتميز.'}
            </p>
          </div>
        </div>

        {/* Quick Reason Templates */}
        <div className="mb-4">
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            {isPenalty ? 'أسباب وتنبيهات شائعة (انقر للاختيار التلقائي):' : 'نماذج مسابقات مقترحة:'}
          </label>
          <div className="flex flex-wrap gap-1.5">
            {isPenalty
              ? penaltyReasonTemplates.map((t, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setTitle(t.title);
                      setPoints(t.points);
                    }}
                    className="text-[11px] font-bold px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-xl transition flex items-center gap-1 active:scale-95"
                  >
                    <span>{t.icon}</span>
                    <span>{t.title}</span>
                    <span className="text-rose-600 font-black">(-{t.points})</span>
                  </button>
                ))
              : bonusReasonTemplates.map((t, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setTitle(t.title);
                      setPoints(t.points);
                    }}
                    className="text-[11px] font-bold px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl transition flex items-center gap-1 active:scale-95"
                  >
                    <span>🎯</span>
                    <span>{t.title}</span>
                    <span className="text-amber-700 font-black">(+{t.points})</span>
                  </button>
                ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {isPenalty ? 'سبب الخصم / التنبيه السلوكي' : 'عنوان المسابقة أو النشاط'}
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                isPenalty
                  ? 'مثال: استخدام الموبايل أثناء الكلمة، تشويش بالصلاة، تأخير...'
                  : 'مثال: مسابقة سفر يونان النبي، كويز درس الرجاء، لعبة الاجتماع...'
              }
              className={`w-full px-3.5 py-2 text-sm bg-white border rounded-xl focus:outline-none transition ${
                isPenalty
                  ? 'border-slate-300 focus:ring-2 focus:ring-rose-500 focus:border-rose-500'
                  : 'border-slate-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500'
              }`}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">التاريخ</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isPenalty ? 'النقاط المخصومة (- نقطة)' : 'النقاط الممنوحة (+ نقطة)'}
              </label>
              <input
                type="number"
                min="1"
                required
                value={points}
                onChange={(e) => setPoints(Math.abs(parseInt(e.target.value) || 0))}
                className={`w-full px-3 py-2 text-sm font-black bg-white border rounded-xl focus:outline-none ${
                  isPenalty
                    ? 'border-rose-300 text-rose-700 focus:ring-2 focus:ring-rose-500'
                    : 'border-slate-300 text-slate-900 focus:ring-2 focus:ring-amber-500'
                }`}
              />
            </div>
          </div>

          {/* Points presets */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-slate-400 font-bold ml-1">تحديد سريع:</span>
            {(isPenalty ? penaltyPresets : bonusPresets).map((p) => (
              <button
                type="button"
                key={p}
                onClick={() => setPoints(p)}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition ${
                  points === p
                    ? isPenalty
                      ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                      : 'bg-amber-500 text-stone-950 border-amber-500 shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {isPenalty ? `-${p}` : `+${p}`}
              </button>
            ))}
          </div>

          {/* Scope selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              {isPenalty ? 'من يطبق عليه هذا الخصم؟' : 'من يحصل على هذه النقاط؟'}
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTargetType('selected')}
                className={`p-2 rounded-xl text-xs font-bold border transition text-center ${
                  targetType === 'selected'
                    ? isPenalty
                      ? 'bg-rose-500/15 border-rose-500 text-rose-950'
                      : 'bg-amber-500/15 border-amber-500 text-amber-950'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                تحديد مخدومين بالاسم
              </button>

              <button
                type="button"
                onClick={() => setTargetType('grade')}
                className={`p-2 rounded-xl text-xs font-bold border transition text-center ${
                  targetType === 'grade'
                    ? isPenalty
                      ? 'bg-rose-500/15 border-rose-500 text-rose-950'
                      : 'bg-amber-500/15 border-amber-500 text-amber-950'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                مرحلة دراسية كاملة
              </button>

              <button
                type="button"
                onClick={() => setTargetType('all')}
                className={`p-2 rounded-xl text-xs font-bold border transition text-center ${
                  targetType === 'all'
                    ? isPenalty
                      ? 'bg-rose-500/15 border-rose-500 text-rose-950'
                      : 'bg-amber-500/15 border-amber-500 text-amber-950'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                كل مخدومي الخدمة
              </button>
            </div>
          </div>

          {/* Grade Selector if targetType is grade */}
          {targetType === 'grade' && (
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">اختر المرحلة:</label>
              <div className="flex gap-2">
                {(['أولى إعدادي', 'ثانية إعدادي', 'ثالثة إعدادي'] as const).map((g) => (
                  <button
                    type="button"
                    key={g}
                    onClick={() => setTargetGrade(g)}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-xl border transition ${
                      targetGrade === g
                        ? isPenalty
                          ? 'bg-rose-600 text-white border-rose-600'
                          : 'bg-amber-500 text-stone-950 border-amber-500'
                        : 'bg-white text-slate-700 border-slate-200'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Student Multi-Select List if targetType is selected */}
          {targetType === 'selected' && (
            <div className="space-y-2 p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between gap-2">
                <input
                  type="text"
                  placeholder={isPenalty ? 'ابحث بالاسم لاختيار المخدوم المعاقب...' : 'ابحث بالاسم لاختيار الفائزين...'}
                  value={searchStudent}
                  onChange={(e) => setSearchStudent(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none"
                />

                <button
                  type="button"
                  onClick={() => selectAllFiltered(filteredStudents.map((s) => s.id))}
                  className="text-[11px] font-bold text-amber-800 hover:underline shrink-0"
                >
                  تحديد الكل
                </button>
                <button
                  type="button"
                  onClick={() => deselectAllFiltered(filteredStudents.map((s) => s.id))}
                  className="text-[11px] font-bold text-slate-500 hover:underline shrink-0"
                >
                  إلغاء
                </button>
              </div>

              <div className="max-h-48 overflow-y-auto space-y-1 divide-y divide-slate-100 pr-1">
                {filteredStudents.map((student) => {
                  const isChecked = selectedStudentIds.includes(student.id);
                  return (
                    <label
                      key={student.id}
                      className={`flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer transition ${
                        isChecked
                          ? isPenalty
                            ? 'bg-rose-100/90 font-bold text-rose-950'
                            : 'bg-amber-100/80 font-bold'
                          : 'hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleStudent(student.id)}
                          className={`rounded ${
                            isPenalty ? 'text-rose-600 focus:ring-rose-500' : 'text-amber-600 focus:ring-amber-500'
                          }`}
                        />
                        <span>{student.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-500">{student.grade} • {student.family}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              ملاحظات أو تفاصيل إضافية (اختياري)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={isPenalty ? 'مثال: تم التنبيه شفهياً مرتين قبل الخصم' : 'مثال: أسئلة دورية على الإصحاح الأول'}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none"
            />
          </div>

          {/* Summary Box */}
          <div
            className={`p-3 rounded-2xl flex items-center justify-between text-xs font-bold border ${
              isPenalty
                ? 'bg-rose-50 border-rose-200 text-rose-950'
                : 'bg-amber-50 border-amber-200 text-amber-950'
            }`}
          >
            <span>
              {isPenalty
                ? `سيتم خصم -${points} نقطة من رصيد:`
                : `سيتم منح +${points} نقطة لـ:`}
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-lg ${
                isPenalty ? 'bg-rose-200/80 text-rose-900' : 'bg-amber-200/80'
              }`}
            >
              {finalAwardedIds.length} مخدوم
            </span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={finalAwardedIds.length === 0}
              className={`px-5 py-2 font-black text-xs rounded-xl transition shadow-md flex items-center gap-1.5 disabled:opacity-50 ${
                isPenalty
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/20'
                  : 'bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-amber-500/20'
              }`}
            >
              {isPenalty ? (
                <>
                  <AlertTriangle className="w-4 h-4" />
                  <span>تطبيق الخصم (-{points} نقطة)</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>إضافة النقاط الآن (+{points})</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

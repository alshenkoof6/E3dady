import React, { useState, useMemo } from 'react';
import { Student, CompetitionLog, GradeLevel } from '../types';
import { Zap, X, Trophy, Users, Check, Sparkles } from 'lucide-react';
import { triggerGiftCelebration } from '../utils/confetti';

interface AddCompetitionModalProps {
  students: Student[];
  onClose: () => void;
  onAddCompetition: (competition: CompetitionLog) => void;
}

export const AddCompetitionModal: React.FC<AddCompetitionModalProps> = ({
  students,
  onClose,
  onAddCompetition,
}) => {
  const [title, setTitle] = useState('');
  const [points, setPoints] = useState<number>(15);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [targetType, setTargetType] = useState<'selected' | 'grade' | 'all'>('selected');
  const [targetGrade, setTargetGrade] = useState<GradeLevel>('أولى إعدادي');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [searchStudent, setSearchStudent] = useState('');

  // Pre-fill suggested quick points
  const pointPresets = [5, 10, 15, 20, 30, 50];

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
      alert('يرجى كتابة عنوان المسابقة، وتحديد النقاط، واختيار مخدوم واحد على الأقل.');
      return;
    }

    const competition: CompetitionLog = {
      id: `comp-${Date.now()}`,
      title: title.trim(),
      date,
      points: Number(points),
      description: description.trim(),
      awardedStudentIds: finalAwardedIds,
    };

    triggerGiftCelebration();
    onAddCompetition(competition);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute left-5 top-5 p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-600 border border-amber-300 flex items-center justify-center">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900">إضافة نقاط مسابقة أو نشاط</h3>
            <p className="text-xs text-slate-500">
              توزيع نقاط بونص فورية لمسابقات الكتاب المقدس، كويز الدرس، أو النشاط الرياضي.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              عنوان المسابقة أو النشاط
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: مسابقة سفر يونان النبي، كويز درس الرجاء، لعبة الاجتماع..."
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                تاريخ المسابقة
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                النقاط الممنوحة (+ نقطة)
              </label>
              <input
                type="number"
                min="1"
                required
                value={points}
                onChange={(e) => setPoints(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 text-sm font-black bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Points presets */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-slate-400 font-bold ml-1">اختيار سريع:</span>
            {pointPresets.map((p) => (
              <button
                type="button"
                key={p}
                onClick={() => setPoints(p)}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition ${
                  points === p
                    ? 'bg-amber-500 text-stone-950 border-amber-500 shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                +{p}
              </button>
            ))}
          </div>

          {/* Scope selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              من يحصل على هذه النقاط؟
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTargetType('selected')}
                className={`p-2 rounded-xl text-xs font-bold border transition text-center ${
                  targetType === 'selected'
                    ? 'bg-amber-500/15 border-amber-500 text-amber-950'
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
                    ? 'bg-amber-500/15 border-amber-500 text-amber-950'
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
                    ? 'bg-amber-500/15 border-amber-500 text-amber-950'
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
                        ? 'bg-amber-500 text-stone-950 border-amber-500'
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
                  placeholder="ابحث بالاسم لاختيار الفائزين..."
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
                        isChecked ? 'bg-amber-100/80 font-bold' : 'hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleStudent(student.id)}
                          className="rounded text-amber-600 focus:ring-amber-500"
                        />
                        <span>{student.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-500">{student.grade}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              وصف أو ملاحظات المسابقة (اختياري)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="مثال: أسئلة دورية على الإصحاح الأول"
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          {/* Summary */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between text-xs font-bold text-amber-950">
            <span>سيتم منح +{points} نقطة لـ:</span>
            <span className="bg-amber-200/80 px-2.5 py-0.5 rounded-lg">
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
              className="px-5 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-stone-950 font-black text-xs rounded-xl transition shadow-md flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>إضافة النقاط الآن</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

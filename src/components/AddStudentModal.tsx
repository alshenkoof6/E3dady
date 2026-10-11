import React, { useState, useEffect, useRef } from 'react';
import { Student, GradeLevel, Gender } from '../types';
import { calculateAge, isBirthdayToday } from '../utils/birthday';
import { 
  UserPlus, 
  X, 
  Save, 
  Upload, 
  Image as ImageIcon, 
  Trash2, 
  Calendar, 
  Cake, 
  Sparkles,
  Link as LinkIcon
} from 'lucide-react';

interface AddStudentModalProps {
  initialStudent?: Student | null;
  onClose: () => void;
  onSaveStudent: (student: Student) => void;
  existingFamilies: string[];
}

export const AddStudentModal: React.FC<AddStudentModalProps> = ({
  initialStudent,
  onClose,
  onSaveStudent,
  existingFamilies,
}) => {
  const [name, setName] = useState('');
  const [grade, setGrade] = useState<GradeLevel>('أولى إعدادي');
  const [gender, setGender] = useState<Gender>('بنين');
  const [family, setFamily] = useState('أسرة الشهيد مارجرجس');
  const [customFamily, setCustomFamily] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [phone, setPhone] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialStudent) {
      setName(initialStudent.name);
      setGrade(initialStudent.grade);
      setGender(initialStudent.gender);
      setFamily(initialStudent.family);
      setBirthDate(initialStudent.birthDate || '');
      setPhotoUrl(initialStudent.photoUrl || '');
      setPhone(initialStudent.phone || '');
      setParentPhone(initialStudent.parentPhone || '');
      setNotes(initialStudent.notes || '');
    } else {
      setName('');
      setGrade('أولى إعدادي');
      setGender('بنين');
      setFamily(existingFamilies[0] || 'أسرة الشهيد مارجرجس');
      setBirthDate('');
      setPhotoUrl('');
      setPhone('');
      setParentPhone('');
      setNotes('');
    }
  }, [initialStudent, existingFamilies]);

  // Handle local image upload via FileReader
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('يرجى اختيار ملف صورة صالح.');
      return;
    }

    // Limit to ~3MB
    if (file.size > 3 * 1024 * 1024) {
      alert('حجم الصورة كبير، يرجى اختيار صورة أقل من 3 ميجابايت.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setPhotoUrl(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const calculatedAge = calculateAge(birthDate);
  const isTodayBday = isBirthdayToday(birthDate);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('يرجى إدخال اسم المخدوم.');
      return;
    }

    const targetFamily = family === 'أخرى' && customFamily.trim() ? customFamily.trim() : family;

    const studentToSave: Student = {
      id: initialStudent?.id || `std-${Date.now()}`,
      name: name.trim(),
      grade,
      gender,
      family: targetFamily,
      ...(birthDate.trim() ? { birthDate: birthDate.trim() } : {}),
      ...(photoUrl.trim() ? { photoUrl: photoUrl.trim() } : {}),
      ...(phone.trim() ? { phone: phone.trim() } : {}),
      ...(parentPhone.trim() ? { parentPhone: parentPhone.trim() } : {}),
      ...(notes.trim() ? { notes: notes.trim() } : {}),
      rewardsClaimed: initialStudent?.rewardsClaimed || [],
    };

    onSaveStudent(studentToSave);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute left-5 top-5 p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-700 border border-amber-300 flex items-center justify-center">
            <UserPlus className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900">
              {initialStudent ? 'تعديل بيانات مخدوم' : 'إضافة مخدوم جديد للخدمة'}
            </h3>
            <p className="text-xs text-slate-500">
              سجل بيانات المخدوم، صورته، وتاريخ ميلاده لتفعيل إشعارات أعياد الميلاد.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 1. Student Photo & Avatar Section */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
            <label className="block text-xs font-bold text-slate-700 mb-2">
              صورة المخدوم (اختياري)
            </label>
            <div className="flex items-center gap-4">
              {/* Preview */}
              <div className="relative group shrink-0">
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt="صورة المخدوم"
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-400 shadow-md"
                  />
                ) : (
                  <div
                    className={`w-16 h-16 rounded-2xl border-2 border-dashed flex items-center justify-center font-black text-xl shadow-inner ${
                      gender === 'بنين'
                        ? 'border-blue-300 bg-blue-50 text-blue-700'
                        : 'border-rose-300 bg-rose-50 text-rose-700'
                    }`}
                  >
                    {name ? name.split(' ').slice(0, 2).map((n) => n[0]).join('') : <ImageIcon className="w-6 h-6 text-slate-400" />}
                  </div>
                )}
              </div>

              {/* Upload & Url Controls */}
              <div className="flex-1 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold rounded-xl transition shadow-xs flex items-center gap-1.5 active:scale-95"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>رفع صورة من الجهاز</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowUrlInput(!showUrlInput)}
                    className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition border border-slate-300 flex items-center gap-1"
                  >
                    <LinkIcon className="w-3 h-3 text-slate-500" />
                    <span>رابط صورة</span>
                  </button>

                  {photoUrl && (
                    <button
                      type="button"
                      onClick={() => setPhotoUrl('')}
                      className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-xl transition border border-rose-200"
                      title="إزالة الصورة"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {showUrlInput && (
                  <input
                    type="url"
                    placeholder="https://example.com/photo.jpg"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                )}
                <p className="text-[11px] text-slate-400">
                  يمكنك رفع صورة مباشرة من الموبايل أو الكمبيوتر لتظهر في كشف الحضور ولوحة الشرف.
                </p>
              </div>
            </div>
          </div>

          {/* 2. Full Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              الاسم بالكامل *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: ديفيد هاني مجدي"
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          {/* 3. Birth Date & Live Age/Birthday Indicator */}
          <div className="p-3 rounded-2xl bg-amber-50/50 border border-amber-200/80">
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-amber-600" />
                <span>تاريخ الميلاد (لحساب العمر وإشعارات العيد ميلاد)</span>
              </label>
              {isTodayBday && (
                <span className="text-[11px] font-black text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                  <Cake className="w-3 h-3 text-rose-600" />
                  عيد ميلاده اليوم! 🎉
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="flex-1 px-3 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
              {calculatedAge !== null && (
                <div className="px-3 py-2 bg-white rounded-xl border border-amber-300 text-xs font-black text-amber-900 shrink-0">
                  العمر: {calculatedAge} سنة
                </div>
              )}
            </div>
            <p className="text-[11px] text-amber-800/80 mt-1">
              سيظهر إشعار تهنئة خاص وتذكير للخدام في صفحة الخدمة في يوم عيد ميلاده تلقائياً! 🎂
            </p>
          </div>

          {/* 4. Grade & Gender */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">المرحلة الدراسية</label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value as GradeLevel)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                <option value="أولى إعدادي">أولى إعدادي</option>
                <option value="ثانية إعدادي">ثانية إعدادي</option>
                <option value="ثالثة إعدادي">ثالثة إعدادي</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">النوع</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setGender('بنين')}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl border transition ${
                    gender === 'بنين'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-slate-600 border-slate-300'
                  }`}
                >
                  بنين
                </button>
                <button
                  type="button"
                  onClick={() => setGender('بنات')}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl border transition ${
                    gender === 'بنات'
                      ? 'bg-rose-600 text-white border-rose-600'
                      : 'bg-white text-slate-600 border-slate-300'
                  }`}
                >
                  بنات
                </button>
              </div>
            </div>
          </div>

          {/* 5. Family */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">الأسرة / المجموعة</label>
            <div className="space-y-2">
              <select
                value={family}
                onChange={(e) => setFamily(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                {existingFamilies.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
                <option value="أخرى">+ كتابة اسم أسرة جديدة...</option>
              </select>

              {family === 'أخرى' && (
                <input
                  type="text"
                  placeholder="اكتب اسم الأسرة الجديدة هنا..."
                  value={customFamily}
                  onChange={(e) => setCustomFamily(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              )}
            </div>
          </div>

          {/* 6. Phone Numbers */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                رقم هاتف المخدوم
              </label>
              <input
                type="tel"
                placeholder="012XXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                رقم ولي الأمر (للافتقاد والتهاني)
              </label>
              <input
                type="tel"
                placeholder="010XXXXXXXX"
                value={parentPhone}
                onChange={(e) => setParentPhone(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* 7. Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              ملاحظات الخدمة (مواهب، كورال، شماس...)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="مثال: شماس، يحب الرسم والأنشطة، يعزف أورج..."
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs sm:text-sm rounded-xl transition shadow-md flex items-center gap-1.5 active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>{initialStudent ? 'حفظ التعديلات' : 'إضافة المخدوم'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

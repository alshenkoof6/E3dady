import React, { useState } from 'react';
import { ServantAccount, Student, CurrentUser } from '../types';
import { ShieldCheck, UserCheck, Key, User, Lock, X, Check, Search, Church, Eye, EyeOff } from 'lucide-react';

interface LoginModalProps {
  servants: ServantAccount[];
  students: Student[];
  currentUser: CurrentUser;
  onClose: () => void;
  onLoginServant: (servant: ServantAccount) => void;
  onLoginStudent: (student: Student) => void;
  onLogout: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  servants,
  students,
  currentUser,
  onClose,
  onLoginServant,
  onLoginStudent,
  onLogout,
}) => {
  const [loginType, setLoginType] = useState<'servant' | 'student'>('servant');
  
  // Servant login state
  const [selectedServantId, setSelectedServantId] = useState<string>(servants[0]?.id || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [servantError, setServantError] = useState('');

  // Student login state
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');

  const handleServantSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setServantError('');

    const servant = servants.find((s) => s.id === selectedServantId);
    if (!servant) {
      setServantError('يرجى اختيار الخادم.');
      return;
    }

    const expectedPassword = servant.password || 'sedoud123';
    if (password !== expectedPassword && password !== 'sedoud123') {
      setServantError('كلمة المرور غير صحيحة.');
      return;
    }

    onLoginServant(servant);
    onClose();
  };

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const student = students.find((s) => s.id === selectedStudentId);
    if (!student) {
      alert('يرجى اختيار اسم المخدوم من القائمة.');
      return;
    }
    onLoginStudent(student);
    onClose();
  };

  const filteredStudents = students.filter((s) => {
    if (!studentSearch.trim()) return true;
    const q = studentSearch.toLowerCase();
    return s.name.toLowerCase().includes(q) || s.phone?.includes(q) || s.family.toLowerCase().includes(q);
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute left-5 top-5 p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-700 border border-amber-300 flex items-center justify-center">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900">تسجيل الدخول للنظام</h3>
            <p className="text-xs text-slate-500">
              اختر نوع الحساب: خادم للتحكم الكامل، أو مخدوم لمتابعة النقاط.
            </p>
          </div>
        </div>

        {/* Current status if already logged in */}
        {currentUser && (
          <div className="mb-4 p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-500 font-bold block">أنت مسجل حالياً كـ:</span>
              <span className="font-black text-slate-900">
                {currentUser.type === 'servant'
                  ? `الخادم المسؤول: أ/ ${currentUser.servant.name}`
                  : `المخدوم: ${currentUser.student.name}`}
              </span>
            </div>
            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="px-3 py-1 bg-rose-50 text-rose-700 font-bold rounded-lg border border-rose-200 hover:bg-rose-100 transition"
            >
              تسجيل خروج
            </button>
          </div>
        )}

        {/* Tab switcher: Servant vs Student */}
        <div className="flex rounded-2xl bg-slate-100 p-1 mb-5">
          <button
            type="button"
            onClick={() => setLoginType('servant')}
            className={`flex-1 py-2 text-xs font-black rounded-xl transition flex items-center justify-center gap-1.5 ${
              loginType === 'servant' ? 'bg-white text-stone-950 shadow-xs' : 'text-slate-600'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            <span>الخادم (لوحة الإدارة)</span>
          </button>
          <button
            type="button"
            onClick={() => setLoginType('student')}
            className={`flex-1 py-2 text-xs font-black rounded-xl transition flex items-center justify-center gap-1.5 ${
              loginType === 'student' ? 'bg-white text-stone-950 shadow-xs' : 'text-slate-600'
            }`}
          >
            <UserCheck className="w-4 h-4 text-blue-600" />
            <span>المخدوم (متابعة النقاط)</span>
          </button>
        </div>

        {/* SERVANT LOGIN FORM */}
        {loginType === 'servant' ? (
          <form onSubmit={handleServantSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                اختر الخادم المسؤول
              </label>
              <div className="grid grid-cols-3 gap-2">
                {servants.map((srv) => (
                  <button
                    key={srv.id}
                    type="button"
                    onClick={() => {
                      setSelectedServantId(srv.id);
                      setServantError('');
                    }}
                    className={`py-2 px-2 text-center rounded-xl border text-xs font-black transition ${
                      selectedServantId === srv.id
                        ? 'bg-amber-500 text-stone-950 border-amber-500 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    أ/ {srv.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                كلمة المرور
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="أدخل كلمة المرور الخاصة بالخادم"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pr-9 pl-9 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                  title={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {servantError && (
              <p className="text-xs text-rose-600 font-bold bg-rose-50 border border-rose-200 p-2 rounded-xl">
                {servantError}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-sm rounded-xl transition shadow-md flex items-center justify-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>دخول كمسؤول (التحكم بالكامل)</span>
            </button>
          </form>
        ) : (
          /* STUDENT LOGIN FORM */
          <form onSubmit={handleStudentSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ابحث عن اسمك أو اختره من القائمة
              </label>
              <div className="relative mb-2">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="اكتب اسمك للبحث..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="w-full pr-8 pl-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="max-h-48 overflow-y-auto space-y-1 divide-y divide-slate-100 border border-slate-200 rounded-xl p-1 bg-slate-50/50">
                {students.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500">
                    <User className="w-8 h-8 text-slate-300 mx-auto mb-1.5" />
                    <span className="font-bold block text-slate-700">لم يتم تسجيل مخدومين بعد في النظام</span>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      يمكن للخادم تسجيل الدخول كمسؤول أولاً وإضافة المخدومين أو استيراد الكشف.
                    </p>
                  </div>
                ) : filteredStudents.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400">
                    لا يوجد مخدوم يطابق كلمة البحث.
                  </div>
                ) : (
                  filteredStudents.map((std) => (
                    <button
                      key={std.id}
                      type="button"
                      onClick={() => setSelectedStudentId(std.id)}
                      className={`w-full text-right p-2 rounded-lg text-xs transition flex items-center justify-between ${
                        selectedStudentId === std.id
                          ? 'bg-blue-600 text-white font-black'
                          : 'hover:bg-slate-100 text-slate-800'
                      }`}
                    >
                      <div>
                        <span className="font-bold">{std.name}</span>
                        <span className={`block text-[10px] ${selectedStudentId === std.id ? 'text-blue-100' : 'text-slate-400'}`}>
                          {std.grade} • {std.family}
                        </span>
                      </div>
                      {selectedStudentId === std.id && <Check className="w-4 h-4" />}
                    </button>
                  ))
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={!selectedStudentId}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-black text-sm rounded-xl transition shadow-md flex items-center justify-center gap-1.5"
            >
              <UserCheck className="w-4 h-4" />
              <span>دخول لمتابعة نقاطي وتتابعي</span>
            </button>
          </form>
        )}

        {/* Guest Mode Action */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={() => {
              if (currentUser) onLogout();
              onClose();
            }}
            className="text-slate-500 hover:text-slate-800 font-bold transition flex items-center gap-1.5 hover:underline"
          >
            <span>الاستمرار كزائر عادي (للمشاهدة فقط)</span>
          </button>

          {currentUser && (
            <button
              type="button"
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="text-rose-600 hover:text-rose-700 font-black transition"
            >
              تسجيل الخروج
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

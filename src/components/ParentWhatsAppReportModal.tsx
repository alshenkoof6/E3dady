import React, { useState, useEffect, useMemo } from 'react';
import { Student, ServiceSession, PointsRuleConfig, CompetitionLog, RewardTier } from '../types';
import { 
  X, 
  MessageCircle, 
  Send, 
  Copy, 
  Check, 
  Phone, 
  User, 
  Sparkles, 
  Heart, 
  Calendar, 
  Award, 
  FileText, 
  Edit3,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { 
  ParentReportTemplateType, 
  generateParentWhatsAppMessage, 
  normalizePhoneForWhatsApp 
} from '../utils/parentReport';
import { calculateStudentStats } from '../utils/calculations';

interface ParentWhatsAppReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
  sessions: ServiceSession[];
  pointsRules: PointsRuleConfig;
  rewardTiers: RewardTier[];
  competitionLogs: CompetitionLog[];
  churchName: string;
  serviceName: string;
  initialTemplate?: ParentReportTemplateType;
  selectedMonth?: string;
  monthNameArabic?: string;
  monthlyStats?: {
    sessionsHeld: number;
    presentCount: number;
    attendanceRate: number;
    monthlyPoints: number;
    liturgyCount: number;
    verseCount: number;
    prayerCount: number;
  };
  onUpdateStudentPhone?: (studentId: string, parentPhone: string) => void;
}

export const ParentWhatsAppReportModal: React.FC<ParentWhatsAppReportModalProps> = ({
  isOpen,
  onClose,
  student,
  sessions,
  pointsRules,
  rewardTiers,
  competitionLogs,
  churchName,
  serviceName,
  initialTemplate = 'monthly_report',
  selectedMonth,
  monthNameArabic,
  monthlyStats,
  onUpdateStudentPhone,
}) => {
  const [templateType, setTemplateType] = useState<ParentReportTemplateType>(initialTemplate);
  const [selectedPhoneType, setSelectedPhoneType] = useState<'parent' | 'student' | 'custom'>(
    student.parentPhone ? 'parent' : student.phone ? 'student' : 'custom'
  );
  const [customPhone, setCustomPhone] = useState(student.parentPhone || student.phone || '');
  const [savePhoneToProfile, setSavePhoneToProfile] = useState(false);
  const [isEditingMessage, setIsEditingMessage] = useState(false);
  const [customText, setCustomText] = useState('');
  const [copied, setCopied] = useState(false);

  // Compute calculated stats
  const stats = useMemo(() => {
    return calculateStudentStats(student, sessions, pointsRules, competitionLogs, rewardTiers);
  }, [student, sessions, pointsRules, competitionLogs, rewardTiers]);

  // Determine active target phone
  const activePhoneNumber = useMemo(() => {
    if (selectedPhoneType === 'parent') return student.parentPhone || customPhone;
    if (selectedPhoneType === 'student') return student.phone || customPhone;
    return customPhone;
  }, [selectedPhoneType, student.parentPhone, student.phone, customPhone]);

  // Generate the formatted message text
  const generatedMessage = useMemo(() => {
    return generateParentWhatsAppMessage({
      student,
      churchName,
      serviceName,
      templateType,
      selectedMonth,
      monthNameArabic,
      customMessageText: customText,
      stats,
      monthlyStats,
    });
  }, [student, churchName, serviceName, templateType, selectedMonth, monthNameArabic, customText, stats, monthlyStats]);

  // Sync initial generated message into custom text when template changes
  useEffect(() => {
    setCustomText(
      generateParentWhatsAppMessage({
        student,
        churchName,
        serviceName,
        templateType,
        selectedMonth,
        monthNameArabic,
        stats,
        monthlyStats,
      })
    );
  }, [templateType, student, churchName, serviceName, selectedMonth, monthNameArabic, stats, monthlyStats]);

  if (!isOpen) return null;

  const normalizedPhone = normalizePhoneForWhatsApp(activePhoneNumber);
  const isPhoneValid = normalizedPhone.length >= 10;

  const handleOpenWhatsApp = () => {
    if (savePhoneToProfile && onUpdateStudentPhone && customPhone.trim()) {
      onUpdateStudentPhone(student.id, customPhone.trim());
    }

    const encodedMessage = encodeURIComponent(generatedMessage);
    const targetUrl = isPhoneValid
      ? `https://wa.me/${normalizedPhone}?text=${encodedMessage}`
      : `https://wa.me/?text=${encodedMessage}`;

    window.open(targetUrl, '_blank');
  };

  const handleCopy = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(generatedMessage);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div 
      dir="rtl"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
    >
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shadow-inner">
              <MessageCircle className="w-6 h-6 stroke-[2.3]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black tracking-tight text-white font-['Alexandria',sans-serif]">
                  تقرير ومراسلة ولي الأمر عبر واتساب
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-400/30">
                  تواصل مباشر 📱
                </span>
              </div>
              <p className="text-xs text-emerald-200/90 font-medium mt-0.5">
                مشاركة إنجازات وتفاصيل التزام {student.name} مع أسرته لتشجيعه وبناء علاقة قوية مع البيت
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          
          {/* Student Profile Quick Strip */}
          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              {student.photoUrl ? (
                <img
                  src={student.photoUrl}
                  alt={student.name}
                  className="w-11 h-11 rounded-xl object-cover border border-amber-300 shadow-xs"
                />
              ) : (
                <div className="w-11 h-11 rounded-xl bg-amber-400 text-stone-950 font-black flex items-center justify-center text-sm shadow-xs">
                  {student.name.split(' ').slice(0, 2).map((n) => n[0]).join('')}
                </div>
              )}
              <div>
                <h4 className="text-sm font-black text-slate-900">{student.name}</h4>
                <p className="text-xs text-slate-500 font-medium">
                  {student.grade} • {student.family}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="px-2.5 py-1 bg-white rounded-xl border border-slate-200 font-bold text-slate-700">
                نقاط: <b className="text-amber-800">{stats.totalPoints}</b>
              </span>
              <span className="px-2.5 py-1 bg-white rounded-xl border border-slate-200 font-bold text-slate-700">
                حضور: <b className="text-emerald-700">{stats.attendanceRate}%</b>
              </span>
            </div>
          </div>

          {/* 1. Select Template */}
          <div className="space-y-2">
            <label className="block text-xs font-black text-slate-800">
              اختر صيغة الرسالة المناسبة:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => {
                  setTemplateType('monthly_report');
                  setIsEditingMessage(false);
                }}
                className={`p-3 rounded-2xl text-right transition border flex flex-col justify-between gap-1.5 ${
                  templateType === 'monthly_report'
                    ? 'bg-emerald-50/80 border-emerald-500 text-emerald-950 shadow-xs ring-2 ring-emerald-500/20'
                    : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-black block">تقرير دوري شامل</span>
                  <span className="text-[10px] text-slate-500">نسب الحضور والنقاط والقداس</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTemplateType('honor_excellence');
                  setIsEditingMessage(false);
                }}
                className={`p-3 rounded-2xl text-right transition border flex flex-col justify-between gap-1.5 ${
                  templateType === 'honor_excellence'
                    ? 'bg-amber-50/80 border-amber-500 text-amber-950 shadow-xs ring-2 ring-amber-500/20'
                    : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="w-7 h-7 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-black block">تهنئة وتميز 🌟</span>
                  <span className="text-[10px] text-slate-500">لأبطال الصدارة والمواظبة</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTemplateType('pastoral_checkin');
                  setIsEditingMessage(false);
                }}
                className={`p-3 rounded-2xl text-right transition border flex flex-col justify-between gap-1.5 ${
                  templateType === 'pastoral_checkin'
                    ? 'bg-blue-50/80 border-blue-500 text-blue-950 shadow-xs ring-2 ring-blue-500/20'
                    : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="w-7 h-7 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Heart className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-black block">سؤال وافتقاد 🕊️</span>
                  <span className="text-[10px] text-slate-500">للاطمئنان على الغائبين</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTemplateType('service_reminder');
                  setIsEditingMessage(false);
                }}
                className={`p-3 rounded-2xl text-right transition border flex flex-col justify-between gap-1.5 ${
                  templateType === 'service_reminder'
                    ? 'bg-purple-50/80 border-purple-500 text-purple-950 shadow-xs ring-2 ring-purple-500/20'
                    : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="w-7 h-7 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-black block">تذكير بالخدمة ⏰</span>
                  <span className="text-[10px] text-slate-500">دعوة للقاء الجمعة القادم</span>
                </div>
              </button>
            </div>
          </div>

          {/* 2. Recipient Phone Selector */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>رقم المستلم على واتساب:</span>
              </label>

              <div className="flex rounded-xl bg-slate-200/70 p-0.5 text-xs font-bold">
                {student.parentPhone && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPhoneType('parent');
                      setCustomPhone(student.parentPhone || '');
                    }}
                    className={`px-2.5 py-1 rounded-lg transition ${
                      selectedPhoneType === 'parent' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    ولي الأمر ({student.parentPhone})
                  </button>
                )}
                {student.phone && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPhoneType('student');
                      setCustomPhone(student.phone || '');
                    }}
                    className={`px-2.5 py-1 rounded-lg transition ${
                      selectedPhoneType === 'student' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    المخدوم ({student.phone})
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedPhoneType('custom')}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    selectedPhoneType === 'custom' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  رقم آخر / تعديل
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <input
                type="tel"
                placeholder="أدخل رقم واتساب ولي الأمر (مثلاً: 01234567890)"
                value={customPhone}
                onChange={(e) => {
                  setCustomPhone(e.target.value);
                  setSelectedPhoneType('custom');
                }}
                className="flex-1 px-3.5 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-left"
                dir="ltr"
              />

              {onUpdateStudentPhone && (!student.parentPhone || student.parentPhone !== customPhone) && customPhone.trim() && (
                <label className="flex items-center gap-1.5 text-xs text-slate-700 font-medium cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={savePhoneToProfile}
                    onChange={(e) => setSavePhoneToProfile(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500 h-3.5 w-3.5"
                  />
                  <span>حفظ هذا الرقم كـ رقم ولي الأمر للمخدوم</span>
                </label>
              )}
            </div>

            {!isPhoneValid && customPhone.trim() && (
              <p className="text-[11px] text-amber-700 font-medium">
                تنبيه: الرقم المدخل يبدو قصيراً أو غير مكتمل، ولكن يمكنك نسخه أو إرساله أيضاً.
              </p>
            )}
          </div>

          {/* 3. WhatsApp Live Preview Bubble */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-800 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>معاينة الرسالة كما ستصل لولي الأمر في واتساب:</span>
              </span>

              <button
                type="button"
                onClick={() => setIsEditingMessage(!isEditingMessage)}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 hover:underline"
              >
                <Edit3 className="w-3 h-3" />
                <span>{isEditingMessage ? 'إغلاق التعديل' : 'تعديل نص الرسالة'}</span>
              </button>
            </div>

            {isEditingMessage ? (
              <div className="space-y-2">
                <textarea
                  rows={8}
                  value={customText}
                  onChange={(e) => {
                    setCustomText(e.target.value);
                    setTemplateType('custom');
                  }}
                  className="w-full p-3.5 text-xs sm:text-sm bg-white border border-emerald-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed font-sans"
                  placeholder="اكتب أو عدل نص الرسالة هنا..."
                />
                <p className="text-[11px] text-slate-500">
                  يمكنك تخصيص الكلمات أو إضافة أي تفاصيل إضافية خاصة بالمخدوم.
                </p>
              </div>
            ) : (
              <div className="p-4 sm:p-5 rounded-2xl bg-[#efeae2] border border-slate-300 relative shadow-inner">
                {/* Simulated WhatsApp Bubble */}
                <div className="bg-[#d9fdd3] text-slate-900 p-3.5 sm:p-4 rounded-2xl rounded-tr-none shadow-sm max-w-lg ml-auto border border-emerald-200/50">
                  <p className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">
                    {generatedMessage}
                  </p>
                  <div className="text-left mt-1">
                    <span className="text-[10px] text-emerald-800/80 font-mono">
                      الآن ✓✓
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl transition shadow-xs cursor-pointer active:scale-95"
              title="نسخ نص التقرير للحافظة لاستخدامه في أي تطبيق آخر"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700">تم النسخ بنجاح!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-500" />
                  <span>نسخ النص</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200/60 rounded-xl transition"
            >
              إلغاء
            </button>
          </div>

          <button
            type="button"
            onClick={handleOpenWhatsApp}
            className="flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-black bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition shadow-lg shadow-emerald-600/30 cursor-pointer active:scale-95"
          >
            <MessageCircle className="w-4 h-4 fill-current" />
            <span>فتح في واتساب الآن 📱</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Student } from '../types';
import { calculateAge } from '../utils/birthday';
import { 
  Cake, 
  Sparkles, 
  Phone, 
  MessageCircle, 
  X, 
  ChevronDown, 
  ChevronUp, 
  Heart,
  PartyPopper
} from 'lucide-react';
import { getWhatsAppUrl, formatTelPhone } from '../utils/phone';

interface BirthdayNotificationBannerProps {
  birthdayStudents: Student[];
  onSelectStudent?: (student: Student) => void;
}

export const BirthdayNotificationBanner: React.FC<BirthdayNotificationBannerProps> = ({
  birthdayStudents,
  onSelectStudent,
}) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  if (birthdayStudents.length === 0 || isDismissed) {
    return null;
  }

  return (
    <aside 
      aria-label="إشعار أعياد ميلاد المخدومين اليوم"
      className="mb-6 rounded-3xl bg-gradient-to-r from-amber-500 via-rose-500 to-amber-600 text-stone-950 p-1 shadow-xl border-2 border-amber-300 relative animate-in fade-in slide-in-from-top-4 duration-300"
    >
      <div className="bg-white/95 backdrop-blur-md rounded-[22px] p-4 sm:p-5">
        {/* Banner Header */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/30 animate-bounce duration-1000">
              <Cake className="w-6 h-6 stroke-[2.3]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-rose-100 text-rose-800 border border-rose-300">
                  <PartyPopper className="w-3 h-3 text-rose-600" />
                  أعياد ميلاد اليوم!
                </span>
                <span className="text-xs font-black text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                  {birthdayStudents.length} مخدوم
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 mt-0.5">
                {birthdayStudents.length === 1
                  ? `اليوم عيد ميلاد ${birthdayStudents[0].name} 🎉`
                  : `اليوم نحتفل بأعياد ميلاد ${birthdayStudents.length} من أولادنا وبناتنا 🎂`}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition text-xs font-bold flex items-center gap-1"
              title={isExpanded ? 'تصغير الإشعار' : 'توسيع الإشعار'}
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  <span className="hidden sm:inline">تصغير</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  <span className="hidden sm:inline">عرض التفاصيل</span>
                </>
              )}
            </button>
            <button
              onClick={() => setIsDismissed(true)}
              className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
              title="إخفاء الإشعار"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Expanded Student Cards List */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {birthdayStudents.map((std) => {
              const age = calculateAge(std.birthDate);
              const rawGreeting = `كل سنة وأنت طيب وبخير يا ${std.name}! 🎉🎂\nخدام وأسرة خدمة إعدادي بيباركو لك في عيد ميلادك، وبيتمنولك سنة سعيدة ومباركة كلها نجاح مع بابا يسوع ✝️✨\nمستنينك تفرح معانا في اللقاء القادم! ❤️`;
              const parentGreeting = `سلام ونعمة يا فندم 🌸\nخدام وأسرة خدمة إعدادي بيهنوا حضرتك والأسرة الكريمة بمناسبة عيد ميلاد حبيبنا ${std.name}! 🎉🎂\nكل سنة وهو طيب ومبارك وفي حضن الكنيسة دايماً، وتفرحوا بيه في كل سنين حياته يا رب! ✨❤️`;

              const whatsappUrl = std.phone ? getWhatsAppUrl(std.phone, rawGreeting) : getWhatsAppUrl(std.parentPhone, parentGreeting);

              return (
                <div
                  key={std.id}
                  className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-50/70 via-white to-rose-50/50 border border-amber-200/80 shadow-xs hover:shadow-md transition flex flex-col justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    {/* Student Photo or Avatar */}
                    {std.photoUrl ? (
                      <img
                        src={std.photoUrl}
                        alt={std.name}
                        className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-400 shadow-sm shrink-0"
                      />
                    ) : (
                      <div
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 shadow-inner ${
                          std.gender === 'بنين'
                            ? 'bg-blue-100 text-blue-900 border border-blue-300'
                            : 'bg-rose-100 text-rose-900 border border-rose-300'
                        }`}
                      >
                        {std.name.split(' ').slice(0, 2).map((n) => n[0]).join('')}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onSelectStudent?.(std)}
                          className="font-black text-sm text-slate-900 hover:text-amber-800 transition truncate text-right cursor-pointer"
                        >
                          {std.name}
                        </button>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                        <span className="font-bold text-slate-700 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                          {std.grade}
                        </span>
                        <span>•</span>
                        <span className="truncate">{std.family}</span>
                      </div>
                      {age !== null && (
                        <p className="text-[11px] font-black text-amber-700 mt-1 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-amber-500" />
                          <span>أتم {age} سنة اليوم، سنة حلوة مع يسوع! 🎂</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons for Servant */}
                  <div className="flex items-center gap-2 pt-2 border-t border-amber-100/80">
                    {std.phone ? (
                      <>
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
                          title="إرسال تهنئة عبر واتساب"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>تهنئة واتساب</span>
                        </a>

                        <a
                          href={`tel:${formatTelPhone(std.phone)}`}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
                          title={`اتصال: ${std.phone}`}
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                      </>
                    ) : std.parentPhone ? (
                      <>
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
                          title="إرسال تهنئة لوالد المخدوم"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>تهنئة ولي الأمر</span>
                        </a>
                        <a
                          href={`tel:${formatTelPhone(std.parentPhone)}`}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
                          title={`اتصال بولي الأمر: ${std.parentPhone}`}
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                      </>
                    ) : (
                      <span className="text-[11px] text-slate-400 py-1 font-medium">
                        لا يوجد رقم هاتف مسجل للتهنئة
                      </span>
                    )}

                    {onSelectStudent && (
                      <button
                        onClick={() => onSelectStudent(std)}
                        className="p-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-xl transition text-xs font-bold"
                        title="عرض الملف وسجل النقاط"
                      >
                        الملف
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
};

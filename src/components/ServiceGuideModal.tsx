import React, { useState } from 'react';
import { 
  BookOpen, 
  X, 
  Sparkles, 
  ShieldCheck, 
  Users, 
  Trophy, 
  Gift, 
  Flame, 
  CheckCircle2, 
  AlertTriangle, 
  Copy, 
  Check, 
  Smartphone, 
  Share2, 
  MessageCircle,
  HelpCircle,
  Star,
  Church
} from 'lucide-react';
import { RewardTier, PointsRuleConfig } from '../types';

interface ServiceGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  churchName?: string;
  serviceName?: string;
  patronPriests?: string;
  rewardTiers?: RewardTier[];
  pointsRules?: PointsRuleConfig;
  initialTab?: 'students' | 'servants';
}

export const ServiceGuideModal: React.FC<ServiceGuideModalProps> = ({
  isOpen,
  onClose,
  churchName = 'كنيسة السيدة العذراء مريم بسدود',
  serviceName = 'خدمة إعدادي',
  patronPriests = 'تحت رعاية: أبونا مكسيموس يوسف • أبونا دوماديوس صليب',
  rewardTiers = [],
  pointsRules,
  initialTab = 'students',
}) => {
  const [activeTab, setActiveTab] = useState<'students' | 'servants'>(initialTab);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  if (!isOpen) return null;

  // Prepared WhatsApp text for students
  const studentWhatsAppMessage = `✝️ *${churchName}*
🌟 *دليل ونظام النقاط والجوائز لفرسان ${serviceName}*
${patronPriests}

أهلاً بيكم يا أبطال إعدادي في منصتنا الذكية! 🎯
هدفنا مش بس الحضور، هدفنا نكبر مع بعض روحياً ونشجع بعض على الالتزام!

━━━━━━━━━━━━━━━━━━━━
✨ *أولاً: إزاي بتجمع نقاط في كل لقاء؟* (حتى 40 نقطة أساسية + بونص)
━━━━━━━━━━━━━━━━━━━━
1️⃣ *حضور لقاء الخدمة*: +${pointsRules?.attendanceBase ?? 10} نقاط أساسية.
2️⃣ *حضور القداس الإلهي*: +${pointsRules?.liturgy ?? 10} نقاط (تشجيع حضور سر التناول).
3️⃣ *حفظ آية الأسبوع*: +${pointsRules?.verse ?? 10} نقاط بتسميعها لخادمك.
4️⃣ *الالتزام بالصلاة والأجبية*: +${pointsRules?.prayer ?? 5} نقاط.
5️⃣ *المشاركة والتفاعل في الدرس*: +${pointsRules?.participation ?? 5} نقاط.
🎁 *بونص مسابقات وأنشطة إضافية*: من 5 إلى 50 نقطة فورية للمتميزين في الألعاب والأسئلة!

━━━━━━━━━━━━━━━━━━━━
⚠️ *ثانياً: إيه اللي بيخصم منك نقاط؟*
━━━━━━━━━━━━━━━━━━━━
❌ *الغياب بدون عذر مسبق*: 0 نقطة + تصفير عداد الالتزام المتتالي (الستريك).
⚠️ *الغياب بعذر مسبق للخادم*: لا يتم كسر الستريك بتاعك تقديراً لأمانتك.
❌ *عدم الالتزام أو السلوك غير اللائق*: خصم نقاط مع توثيق السبب في ملفك.

━━━━━━━━━━━━━━━━━━━━
🎁 *ثالثاً: نظام هدايا التتابع الذهبي (الستريك 🔥)*
━━━━━━━━━━━━━━━━━━━━
لو واظبت بدون أي انقطاع بتكسب هدايا حقيقية فورية:
🥉 *التزام 4 مرات متتالية*: هدية صغيرة تشجيعية 🎁 + 25 نقطة بونص!
🥈 *التزام 8 مرات متتالية*: هدية متوسطة ومميزة 🏆 + 50 نقطة بونص!
🥇 *التزام 10 مرات متتالية*: الجائزة الكبرى للتميز الذهبي 👑 + 100 نقطة بونص!

━━━━━━━━━━━━━━━━━━━━
📱 *رابعاً: إزاي تدخل تشوف درجاتك وترتيبك؟*
━━━━━━━━━━━━━━━━━━━━
1. افتح رابط المنصة من موبايلك.
2. اضغط على «دخول كطالب»، واكتب اسمك أو اختاره من القائمة (بدون كلمة سر).
3. هتشوف فوراً: نقاطك، هداياك الجاهزة للاستلام، ترتيبك على لوحة الشرف، وبطاقتك التشجيعية الشهرية!
4. تقدر تثبت المنصة كتطبيق على شاشة موبايلك بالضغط على زر «تثبيت التطبيق 📲»!

صلوا من أجل الخدمة، ومستنيينكم في أقرب لقاء بنشاط وهمة! ✝️`;

  // Prepared WhatsApp text for servants
  const servantWhatsAppMessage = `✝️ *${churchName}*
🛡️ *دليل الخدام الشامل لتشغيل منصة ${serviceName}*
${patronPriests}

سلام ونعمة يا خدامنا الأحباء، ده ملخص عملي سريع وسهل لإدارة المنصة يوم الجمعة وطوال الأسبوع:

━━━━━━━━━━━━━━━━━━━━
1️⃣ *تسجيل الحضور الأسبوعي (في دقيقة واحدة)*
━━━━━━━━━━━━━━━━━━━━
- ادخل على المنصة واضغط «تسجيل دخول خادم»، واكتب كلمة المرور (أو عبر حساب جوجل).
- من شاشة «تسجيل الحضور»، اضغط «بدء لقاء جديد» لو لقاء اليوم مش مضاف.
- لكل مخدوم: اضغط زر «حاضر» أو «غائب».
- بجوار كل مخدوم حاضر: علّم على بنود الالتزام الأربعة:
  [قداس ⛪ (+10) | آية 📖 (+10) | صلاة 🙏 (+5) | مشاركة 💡 (+5)]
- يتم احتساب المجموع وحساب التتابع (الستريك) تلقائياً!

━━━━━━━━━━━━━━━━━━━━
2️⃣ *إضافة بونص أو خصم مسابقة/سلوك*
━━━━━━━━━━━━━━━━━━━━
- من شاشة الحضور أو ملف المخدوم، اضغط زر ⚡ «بونص / خصم».
- حدد المخدوم، اكتب قيمة النقاط، والسبب (مثلاً: مسابقة سفر التكوين، نشاط الكشافة، إلخ).
- تظهر فوراً في سجل أنشطة المخدوم.

━━━━━━━━━━━━━━━━━━━━
3️⃣ *نظام الجوائز وهدايا التتابع*
━━━━━━━━━━━━━━━━━━━━
- من شاشة «جوائز التتابع»، هتلاقي قائمة المخدومين المستحقين لجوائز الالتزام (4 أو 8 أو 10 أسابيع).
- بعد تسليم الهدية للمخدوم، اضغط زر «تسليم الهدية» لتوثيق استلامها وبدء دورة جديدة.

━━━━━━━━━━━━━━━━━━━━
4️⃣ *ميزة تقرير ولي الأمر عبر واتساب 📱*
━━━━━━━━━━━━━━━━━━━━
- افتح ملف أي مخدوم، واضغط زر «تقرير ولي الأمر عبر واتساب».
- هيتجهز تقرير شهري رسمي منمق بنسبة الحضور، والقداسات، والآيات، ورسالة شكر.
- اضغط زر «إرسال عبر واتساب»، هيفتح محادثة ولي الأمر برسالة جاهزة بضغطة واحدة!

━━━━━━━━━━━━━━━━━━━━
5️⃣ *بطاقات التقدير وبطل الشهر 🌟*
━━━━━━━━━━━━━━━━━━━━
- يمكنك إصدار شهادة تقدير أنيقة لأي مخدوم بلقب (بطل الشهر، نجم الالتزام، حافظ الآيات) ومشاركتها مع أسرته كصورة أو رسالة تشجيعية.

━━━━━━━━━━━━━━━━━━━━
6️⃣ *العمل بدون إنترنت (Offline) والمزامنة*
━━━━━━━━━━━━━━━━━━━━
- التطبيق يعمل بنسبة 100% داخل مبنى الكنيسة حتى لو النت مقطوع.
- كل العمليات بتتسجل محلياً، وأول ما موبايلك يلقط نت بتترفع تلقائياً لقاعدة البيانات السحابية Firebase بدون أي قلق!

خدمة مباركة ومثمرة لمجد اسم المسيح! ✝️`;

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => {
      setCopiedText(null);
    }, 2500);
  };

  return (
    <div 
      dir="rtl"
      className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 text-right overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-stone-950 via-red-950 to-stone-900 text-white p-5 sm:p-6 shrink-0 border-b border-amber-500/30">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-300 flex items-center justify-center shadow-inner shrink-0">
                <BookOpen className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-400/30">
                    دليل الخدمة والمنصة 📖
                  </span>
                  <span className="text-xs text-red-200 font-bold hidden sm:inline">
                    {serviceName}
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-amber-100 font-['Alexandria',sans-serif] mt-0.5">
                  الدليل الشامل للخدام والمخدومين
                </h3>
                <p className="text-[11px] sm:text-xs text-stone-300">
                  {patronPriests}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-white rounded-xl hover:bg-white/10 transition cursor-pointer shrink-0"
              title="إغلاق الدليل"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tab Selector */}
          <div className="mt-4 grid grid-cols-2 gap-2 bg-stone-900/80 p-1.5 rounded-2xl border border-white/10">
            <button
              onClick={() => setActiveTab('students')}
              className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition cursor-pointer ${
                activeTab === 'students'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 shadow-md shadow-amber-500/20'
                  : 'text-stone-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>دليل فرسان إعدادي (المخدومين) 👦👧</span>
            </button>

            <button
              onClick={() => setActiveTab('servants')}
              className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition cursor-pointer ${
                activeTab === 'servants'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 shadow-md shadow-amber-500/20'
                  : 'text-stone-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>دليل الخدام وأمناء الخدمة 🛡️</span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-700 text-xs sm:text-sm leading-relaxed">
          
          {/* TAB 1: STUDENTS GUIDE */}
          {activeTab === 'students' && (
            <div className="space-y-6 animate-in fade-in">
              {/* Copy WhatsApp Banner */}
              <div className="p-4 bg-amber-500/10 border border-amber-400/40 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold shrink-0">
                    <MessageCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-black text-slate-900 text-xs sm:text-sm">
                      رسالة واتساب جاهزة للمخدومين وأولياء الأمور
                    </h5>
                    <p className="text-[11px] text-slate-500">
                      يمكنك نسخ الشرح المنظم بنقرة واحدة ونشره في جروب مخدومي إعدادي.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleCopyText(studentWhatsAppMessage, 'students')}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold text-xs rounded-xl transition shadow-sm flex items-center justify-center gap-2 shrink-0 cursor-pointer active:scale-95"
                >
                  {copiedText === 'students' ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-200" />
                      <span>تم نسخ الرسالة لواتساب! 🎉</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>نسخ دليل المخدومين 📋</span>
                    </>
                  )}
                </button>
              </div>

              {/* Section 1: Points Earning */}
              <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 space-y-3">
                <h4 className="font-black text-slate-900 text-sm sm:text-base flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>1. كيف تجمع النقاط في كل لقاء خدمة؟ (حتى 40 نقطة أساسية)</span>
                </h4>
                <p className="text-xs text-slate-500">
                  في كل أسبوع، يقوم خادمك برصد مشاركتك في 5 بنود روحية وتربوية أساسية:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-xs">
                        1
                      </span>
                      <div>
                        <span className="font-black text-slate-800 text-xs">حضور لقاء الخدمة الأسبوعي</span>
                        <p className="text-[10px] text-slate-500">الحضور في الموعد والالتزام</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 font-black text-xs">
                      +{pointsRules?.attendanceBase ?? 10} نقطة
                    </span>
                  </div>

                  <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-black text-xs">
                        2
                      </span>
                      <div>
                        <span className="font-black text-slate-800 text-xs">حضور القداس والتناول</span>
                        <p className="text-[10px] text-slate-500">المواظبة على سر الإفخارستيا</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 font-black text-xs">
                      +{pointsRules?.liturgy ?? 10} نقطة
                    </span>
                  </div>

                  <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-black text-xs">
                        3
                      </span>
                      <div>
                        <span className="font-black text-slate-800 text-xs">حفظ وتسميع آية الأسبوع</span>
                        <p className="text-[10px] text-slate-500">تسميع الآية المقررة لخادم الأسرة</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 font-black text-xs">
                      +{pointsRules?.verse ?? 10} نقطة
                    </span>
                  </div>

                  <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-black text-xs">
                        4
                      </span>
                      <div>
                        <span className="font-black text-slate-800 text-xs">الصلاة بالأجبية والخشوع</span>
                        <p className="text-[10px] text-slate-500">المواظبة على الصلاة اليومية</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 font-black text-xs">
                      +{pointsRules?.prayer ?? 5} نقاط
                    </span>
                  </div>

                  <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between sm:col-span-2">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center font-black text-xs">
                        5
                      </span>
                      <div>
                        <span className="font-black text-slate-800 text-xs">المشاركة والتفاعل في الدرس والأنشطة</span>
                        <p className="text-[10px] text-slate-500">الإجابة على الأسئلة والمشاركة الإيجابية مع أسرتك</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 font-black text-xs">
                      +{pointsRules?.participation ?? 5} نقاط
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-amber-50 text-amber-900 border border-amber-200 rounded-2xl text-xs flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-600 shrink-0" />
                  <span><b>بونص إضافي للمتميزين</b>: يمكنك كسب من 5 إلى 50 نقطة إضافية عند الفوز في المسابقات أو الأنشطة الكنسية الاستثنائية!</span>
                </div>
              </div>

              {/* Section 2: Deductions */}
              <div className="bg-rose-50/60 border border-rose-200 rounded-3xl p-5 space-y-3">
                <h4 className="font-black text-rose-950 text-sm sm:text-base flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>2. ما الذي يخصم منك نقاط أو يعطل تقدمك؟</span>
                </h4>
                <ul className="space-y-2 text-xs text-rose-900">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-600 mt-1.5 shrink-0" />
                    <span><b>الغياب بدون إذن مسبق</b>: تحصل على 0 نقطة في اللقاء، ويتم تصفير عداد الالتزام المتتالي (الستريك) لتبدأ دورة جديدة.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 shrink-0" />
                    <span><b>الغياب بعذر مسبق للخادم</b>: إذا كان لديك ظرف طارئ وأبلغت خادمك قبل اللقاء، يتم تسجيلك «غائب بعذر»، ولا يتم كسر عداد الستريك بتاعك تقديراً لأمانتك!</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-600 mt-1.5 shrink-0" />
                    <span><b>السلوك غير اللائق أو عدم الالتزام بالهدوء</b>: للخادم الحق في تسجيل خصم بالنقاط مع كتابة السبب بشفافية في ملفك.</span>
                  </li>
                </ul>
              </div>

              {/* Section 3: Rewards Streak */}
              <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 space-y-3">
                <h4 className="font-black text-slate-900 text-sm sm:text-base flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-600" />
                  <span>3. نظام جوائز التتابع الذهبي (الستريك المستمر 🔥)</span>
                </h4>
                <p className="text-xs text-slate-500">
                  كل ما تحضر بدون انقطاع، العداد بيزيد وتتفتحلك هدايا حقيقية تستلمها في الكنيسة:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div className="bg-white p-3.5 rounded-2xl border-2 border-emerald-400/50 shadow-xs text-center space-y-1">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto font-black text-xs">
                      4
                    </div>
                    <h5 className="font-black text-slate-900 text-xs">هدية الالتزام البرونزي</h5>
                    <p className="text-[11px] text-emerald-700 font-bold">4 أسابيع متتالية</p>
                    <p className="text-[10px] text-slate-500">هدية صغيرة تشجيعية + 25 نقطة بونص</p>
                  </div>

                  <div className="bg-white p-3.5 rounded-2xl border-2 border-blue-400/50 shadow-xs text-center space-y-1">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center mx-auto font-black text-xs">
                      8
                    </div>
                    <h5 className="font-black text-slate-900 text-xs">هدية الالتزام الفضي</h5>
                    <p className="text-[11px] text-blue-700 font-bold">8 أسابيع متتالية</p>
                    <p className="text-[10px] text-slate-500">هدية متوسطة ومميزة + 50 نقطة بونص</p>
                  </div>

                  <div className="bg-white p-3.5 rounded-2xl border-2 border-amber-400 shadow-sm text-center space-y-1 bg-gradient-to-b from-amber-50/50 to-white">
                    <div className="w-8 h-8 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center mx-auto font-black text-xs">
                      10
                    </div>
                    <h5 className="font-black text-amber-950 text-xs">الجائزة الكبرى للتميز الذهبي</h5>
                    <p className="text-[11px] text-amber-700 font-black">10 أسابيع متتالية 👑</p>
                    <p className="text-[10px] text-slate-600">الجائزة الكبرى الفاخرة + 100 نقطة بونص</p>
                  </div>
                </div>
              </div>

              {/* Section 4: Student Portal Access */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-3xl space-y-2">
                <h4 className="font-black text-blue-950 text-xs sm:text-sm flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-blue-600" />
                  <span>4. كيف تدخل وتتابع درجاتك؟ (بدون كلمة سر)</span>
                </h4>
                <p className="text-xs text-blue-900 leading-relaxed">
                  افتح رابط المنصة من موبايلك، اضغط «دخول كطالب»، واكتب اسمك أو اختاره من القائمة. فوراً ستفتح بوابتك الشخصية لتشاهد نقاطك، وتستعرض شهادة تقديرك الشهرية، وتعرف ترتيبك على لوحة الشرف!
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: SERVANTS GUIDE */}
          {activeTab === 'servants' && (
            <div className="space-y-6 animate-in fade-in">
              {/* Copy WhatsApp Banner for Servants */}
              <div className="p-4 bg-amber-500/10 border border-amber-400/40 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-black text-slate-900 text-xs sm:text-sm">
                      دليل إرشادات تشغيل الخدمة للخدام
                    </h5>
                    <p className="text-[11px] text-slate-500">
                      يمكنك نسخ الدليل الكامل وإرساله لجروب خدام إعدادي لتوحيد طريقة الرصد.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleCopyText(servantWhatsAppMessage, 'servants')}
                  className="px-4 py-2 bg-gradient-to-r from-stone-900 to-stone-800 hover:from-stone-800 hover:to-stone-700 text-white font-bold text-xs rounded-xl transition shadow-sm flex items-center justify-center gap-2 shrink-0 cursor-pointer active:scale-95 border border-stone-700"
                >
                  {copiedText === 'servants' ? (
                    <>
                      <Check className="w-4 h-4 text-amber-400" />
                      <span>تم نسخ الدليل للخدام! 🎉</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>نسخ دليل الخدام 📋</span>
                    </>
                  )}
                </button>
              </div>

              {/* Step 1: Attendance Routine */}
              <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-xl bg-red-950 text-amber-300 font-black text-xs flex items-center justify-center">
                    1
                  </span>
                  <h4 className="font-black text-slate-900 text-sm sm:text-base">
                    تسجيل الحضور الأسبوعي يوم اللقاء (في دقيقة واحدة)
                  </h4>
                </div>
                <div className="space-y-2 text-xs text-slate-600 mr-2 sm:mr-9">
                  <p>• ادخل على المنصة كخادم مسؤول (PIN خادم أو تسجيل بحساب Google).</p>
                  <p>• من شريط التبويبات اختر <b>«تسجيل الحضور»</b>. إذا كان اللقاء جديداً، اضغط <b>«+ لقاء جديد»</b> واختر التاريخ والاسم (مثلاً: لقاء الجمعة 16 أكتوبر).</p>
                  <p>• أمام كل مخدوم: اضغط زر <b>«حاضر»</b> أو <b>«غائب»</b> أو <b>«غائب بعذر»</b>.</p>
                  <p>• للمخدومين الحاضرين: علّم بضغطة زر على البنود الروحية المنجزة:</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                    <span className="p-2 bg-white rounded-xl border border-slate-200 font-bold text-slate-800 text-center">
                      ⛪ قداس (+10)
                    </span>
                    <span className="p-2 bg-white rounded-xl border border-slate-200 font-bold text-slate-800 text-center">
                      📖 حفظ آية (+10)
                    </span>
                    <span className="p-2 bg-white rounded-xl border border-slate-200 font-bold text-slate-800 text-center">
                      🙏 أجبية/صلاة (+5)
                    </span>
                    <span className="p-2 bg-white rounded-xl border border-slate-200 font-bold text-slate-800 text-center">
                      💡 مشاركة (+5)
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-700 font-medium pt-1">
                    ✓ يقوم النظام بحساب النقاط فورياً وتحديث عداد الستريك ورفع البيانات سحابياً تلقائياً!
                  </p>
                </div>
              </div>

              {/* Step 2: Parent WhatsApp Reports */}
              <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-xl bg-red-950 text-amber-300 font-black text-xs flex items-center justify-center">
                    2
                  </span>
                  <h4 className="font-black text-slate-900 text-sm sm:text-base">
                    تقرير ولي الأمر عبر واتساب (تشجيع الأسرة) 📱
                  </h4>
                </div>
                <div className="space-y-2 text-xs text-slate-600 mr-2 sm:mr-9">
                  <p>• افتح ملف أي مخدوم من شاشة «المخدومين» أو «تسجيل الحضور».</p>
                  <p>• اضغط زر <b>«تقرير ولي الأمر عبر واتساب 📱»</b>.</p>
                  <p>• ستظهر لك شاشة مراجعة تحتوي على تقرير الشهر بالكامل: نسبة الحضور، عدد القداسات، الآيات المحفوظة، ومجموع النقاط، مع إمكانية تعديل رقم هاتف ولي الأمر.</p>
                  <p>• اضغط <b>«إرسال عبر واتساب 📱»</b>؛ سيتم فتح تطبيق واتساب فوراً وتجهيز الرسالة دون الحاجة لكتابة كلمة واحدة!</p>
                </div>
              </div>

              {/* Step 3: Rewards & Delivery */}
              <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-xl bg-red-950 text-amber-300 font-black text-xs flex items-center justify-center">
                    3
                  </span>
                  <h4 className="font-black text-slate-900 text-sm sm:text-base">
                    تسليم جوائز التتابع والاحتفال بالفرسان 🎁
                  </h4>
                </div>
                <div className="space-y-2 text-xs text-slate-600 mr-2 sm:mr-9">
                  <p>• من شاشة <b>«جوائز التتابع»</b>، يظهر شريط تنبيه بالهدايا المستحقة التي لم تُسلّم بعد.</p>
                  <p>• عند تسليم الهدية للولد أو البنت في الكنيسة، اضغط زر <b>«تسليم الهدية»</b>؛ يطلق النظام احتفال زينة (Confetti) ويتم توثيق تاريخ الاستلام لبدء الدورة القادمة.</p>
                </div>
              </div>

              {/* Step 4: Birthday Notifications & Care */}
              <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-xl bg-red-950 text-amber-300 font-black text-xs flex items-center justify-center">
                    4
                  </span>
                  <h4 className="font-black text-slate-900 text-sm sm:text-base">
                    إشعارات أعياد الميلاد والافتقاد الفوري 🎂
                  </h4>
                </div>
                <div className="space-y-2 text-xs text-slate-600 mr-2 sm:mr-9">
                  <p>• في يوم عيد ميلاد أي مخدوم، يظهر شريط تنبيه مميز في أعلى الشاشة وأيقونة جرس الإشعارات تُنبه الخدام.</p>
                  <p>• يمكنك الضغط على زر <b>«معايدة واتساب 💬»</b> أو زر الاتصال للاتصال به وتهنئته في ثوانٍ معدودة.</p>
                </div>
              </div>

              {/* Step 5: Offline Mode */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-5 space-y-2">
                <h4 className="font-black text-emerald-950 text-xs sm:text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>5. العمل بدون إنترنت (Offline Mode) داخل الكنيسة</span>
                </h4>
                <p className="text-xs text-emerald-900 leading-relaxed">
                  إذا كانت شبكة الهاتف ضعيفة داخل قاعة الخدمة، لا تقلق أبداً! سجّل الحضور والدرجات كالمعتاد. النظام يحفظ كل حركة على الهاتف، وبمجرد أن يلتقط الهاتف أي شبكة إنترنت بعد اللقاء، ستتم المزامنة السحابية تلقائياً بنسبة 100%.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <div className="text-[11px] text-slate-500 hidden sm:flex items-center gap-1.5 font-medium">
            <Church className="w-3.5 h-3.5 text-amber-600" />
            <span>{churchName} • لخدمة مجد اسم ربنا يسوع المسيح</span>
          </div>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition cursor-pointer"
          >
            إغلاق الدليل
          </button>
        </div>

      </div>
    </div>
  );
};

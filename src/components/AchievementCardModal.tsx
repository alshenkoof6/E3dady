import React, { useState, useEffect, useRef } from 'react';
import { Student, ServiceSession, PointsRuleConfig, RewardTier, CompetitionLog } from '../types';
import { calculateStudentStats } from '../utils/calculations';
import { 
  X, 
  Download, 
  Share2, 
  Award, 
  Sparkles, 
  Flame, 
  BookOpen, 
  Crown, 
  Check, 
  Copy,
  Calendar,
  Layers,
  ChevronRight
} from 'lucide-react';

export type AchievementTitleType = 
  | 'بطل الشهر'
  | 'بطل التتابع الذهبي'
  | 'افضل قارئ للانجيل وحافظ الآيات';

interface AchievementCardModalProps {
  student: Student;
  sessions: ServiceSession[];
  pointsRules: PointsRuleConfig;
  rewardTiers: RewardTier[];
  competitionLogs: CompetitionLog[];
  churchName?: string;
  serviceName?: string;
  patronPriests?: string;
  initialTitle?: AchievementTitleType;
  onClose: () => void;
}

interface BadgePreset {
  title: AchievementTitleType;
  icon: string;
  tagline: string;
  verse: string;
  verseRef: string;
  bgGradStart: string;
  bgGradMid: string;
  bgGradEnd: string;
  accentGold: string;
  accentLight: string;
  badgeBadgeText: string;
}

const PRESETS: Record<AchievementTitleType, BadgePreset> = {
  'بطل الشهر': {
    title: 'بطل الشهر',
    icon: '👑',
    tagline: 'تكريم المركز الأول والتفوق المتميز في مجموع النقاط والمشاركات',
    verse: '«كُنْتَ أَمِينًا فِي الْقَلِيلِ فَأُقِيمُكَ عَلَى الْكَثِيرِ، ادْخُلْ إِلَى فَرَحِ سَيِّدِكَ»',
    verseRef: '(إنجيل متى 25: 21)',
    bgGradStart: '#0b1329',
    bgGradMid: '#162447',
    bgGradEnd: '#1f4068',
    accentGold: '#f59e0b',
    accentLight: '#fef3c7',
    badgeBadgeText: 'وسام الصدارة والتميز الشهري',
  },
  'بطل التتابع الذهبي': {
    title: 'بطل التتابع الذهبي',
    icon: '🔥',
    tagline: 'تكريم أمانة وثبات الحضور الأسبوعي المتصل بدون انقطاع',
    verse: '«كُونُوا رَاسِخِينَ، غَيْرَ مُتَزَعْزِعِينَ، مُكْثِرِينَ فِي عَمَلِ الرَّبِّ كُلَّ حِينٍ»',
    verseRef: '(رسالة بولس الرسول الأولى إلى أهل كورنثوس 15: 58)',
    bgGradStart: '#2d0606',
    bgGradMid: '#4a0e17',
    bgGradEnd: '#7c2d12',
    accentGold: '#f59e0b',
    accentLight: '#ffedd5',
    badgeBadgeText: 'وسام الأمانة والمواظبة الأسبوعية',
  },
  'افضل قارئ للانجيل وحافظ الآيات': {
    title: 'افضل قارئ للانجيل وحافظ الآيات',
    icon: '📖',
    tagline: 'تكريم الشغف بكلمة الله وحفظ الآيات الأسبوعية والتفاعل في دراسة الكتاب',
    verse: '«سِرَاجٌ لِرِجْلِي كَلاَمُكَ وَنُورٌ لِسَبِيلِي.. أَنْتَ سِتْرِي وَمِجَنِّي. بِكَلاَمِكَ انْتَظَرْتُ»',
    verseRef: '(مزمور 119: 105، 114)',
    bgGradStart: '#062c21',
    bgGradMid: '#064e3b',
    bgGradEnd: '#047857',
    accentGold: '#f59e0b',
    accentLight: '#dcfce7',
    badgeBadgeText: 'وسام محب كلمة الله والكتاب المقدس',
  },
};

export const AchievementCardModal: React.FC<AchievementCardModalProps> = ({
  student,
  sessions,
  pointsRules,
  rewardTiers,
  competitionLogs,
  churchName = 'كنيسة السيدة العذراء مريم بسدود',
  serviceName = 'خدمة المرحلة الإعدادية',
  patronPriests = 'تحت رعاية: أبونا مكسيموس يوسف • أبونا دوماديوس صليب',
  initialTitle = 'بطل الشهر',
  onClose,
}) => {
  const [selectedTitle, setSelectedTitle] = useState<AchievementTitleType>(initialTitle);
  const [isCopied, setIsCopied] = useState(false);
  const [monthName, setMonthName] = useState(() => {
    const now = new Date();
    const monthsAr = [
      'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];
    return `شهر ${monthsAr[now.getMonth()]} ${now.getFullYear()}`;
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const stats = calculateStudentStats(student, sessions, pointsRules, competitionLogs, rewardTiers);
  const preset = PRESETS[selectedTitle];

  // Draw the high-res card onto canvas
  useEffect(() => {
    let isCancelled = false;

    const renderCard = (avatarImg?: HTMLImageElement) => {
      if (isCancelled) return;
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // High resolution: 1080 x 1350 (Instagram portrait / WhatsApp story / status)
      const W = 1080;
      const H = 1350;
      canvas.width = W;
      canvas.height = H;

      // 1. Background Gradient
      const bgGradient = ctx.createLinearGradient(0, 0, W, H);
      bgGradient.addColorStop(0, preset.bgGradStart);
      bgGradient.addColorStop(0.5, preset.bgGradMid);
      bgGradient.addColorStop(1, preset.bgGradEnd);
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, W, H);

      // 2. Subtle Luxury Radial Glow
      const radialGlow = ctx.createRadialGradient(W / 2, 450, 50, W / 2, 450, 600);
      radialGlow.addColorStop(0, 'rgba(245, 158, 11, 0.22)');
      radialGlow.addColorStop(0.6, 'rgba(245, 158, 11, 0.05)');
      radialGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = radialGlow;
      ctx.fillRect(0, 0, W, H);

      // 3. Ornate Double Gold Borders
      const padding = 45;
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 4;
      ctx.strokeRect(padding, padding, W - padding * 2, H - padding * 2);

      ctx.strokeStyle = 'rgba(254, 243, 199, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(padding + 12, padding + 12, W - (padding + 12) * 2, H - (padding + 12) * 2);

      // Corner Ornaments
      const drawCorner = (x: number, y: number, angle: number) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, 30);
        ctx.lineTo(0, 0);
        ctx.lineTo(30, 0);
        ctx.stroke();

        // little golden diamond
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(8, 8, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      };

      drawCorner(padding + 18, padding + 18, 0);
      drawCorner(W - padding - 18, padding + 18, Math.PI / 2);
      drawCorner(W - padding - 18, H - padding - 18, Math.PI);
      drawCorner(padding + 18, H - padding - 18, (Math.PI * 3) / 2);

      // 4. Church Header Title & Priests Patronage
      ctx.textAlign = 'center';
      ctx.direction = 'rtl';

      // Cross motif on top
      ctx.fillStyle = '#f59e0b';
      ctx.font = '28px serif';
      ctx.fillText('✟', W / 2, 102);

      // Church Name
      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 31px "Cairo", sans-serif';
      ctx.fillText(churchName || 'كنيسة السيدة العذراء مريم بسدود', W / 2, 144);

      // Service Name & Family
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '600 20px "Cairo", sans-serif';
      ctx.fillText(`${serviceName || 'خدمة المرحلة الإعدادية'} • ${student.family}`, W / 2, 178);

      // Patron Priests Banner
      ctx.fillStyle = '#fde68a';
      ctx.font = 'bold 19px "Cairo", sans-serif';
      ctx.fillText(patronPriests || 'تحت رعاية: أبونا مكسيموس يوسف • أبونا دوماديوس صليب', W / 2, 210);

      // 5. Central Golden Medal Crest
      const centerY = 365;

      // Glowing outer circle
      ctx.save();
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 35;
      const goldGrad = ctx.createLinearGradient(W / 2 - 90, centerY - 90, W / 2 + 90, centerY + 90);
      goldGrad.addColorStop(0, '#fef08a');
      goldGrad.addColorStop(0.5, '#f59e0b');
      goldGrad.addColorStop(1, '#b45309');
      ctx.fillStyle = goldGrad;
      ctx.beginPath();
      ctx.arc(W / 2, centerY, 80, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Inner Crest
      ctx.fillStyle = preset.bgGradStart;
      ctx.beginPath();
      ctx.arc(W / 2, centerY, 68, 0, Math.PI * 2);
      ctx.fill();

      if (avatarImg) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(W / 2, centerY, 68, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(avatarImg, W / 2 - 68, centerY - 68, 136, 136);
        ctx.restore();

        // Small badge at bottom corner
        ctx.font = '34px sans-serif';
        ctx.fillText(preset.icon, W / 2 + 50, centerY + 65);
      } else {
        // Icon Emoji inside crest
        ctx.font = '72px sans-serif';
        ctx.fillText(preset.icon, W / 2, centerY + 26);
      }

      // Laurel branch stars around crest
      ctx.fillStyle = '#fde047';
      ctx.font = '20px sans-serif';
      ctx.fillText('★  ★  ★', W / 2, centerY + 115);

      // 6. Achievement Title Banner
      const bannerY = 540;
      const bannerW = 620;
      const bannerH = 70;
      const bannerX = W / 2 - bannerW / 2;

      // Ribbon gradient box
      const ribbonGrad = ctx.createLinearGradient(bannerX, 0, bannerX + bannerW, 0);
      ribbonGrad.addColorStop(0, '#d97706');
      ribbonGrad.addColorStop(0.5, '#fbbf24');
      ribbonGrad.addColorStop(1, '#d97706');
      ctx.fillStyle = ribbonGrad;
      ctx.beginPath();
      ctx.roundRect(bannerX, bannerY, bannerW, bannerH, 20);
      ctx.fill();

      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.fillStyle = '#0f172a';
      ctx.font = '900 36px "Cairo", sans-serif';
      ctx.fillText(selectedTitle, W / 2, bannerY + 47);

      // 7. "Presented to" / "يُمنح هذا الوسام للبطل:"
      ctx.fillStyle = '#f8fafc';
      ctx.font = '600 24px "Cairo", sans-serif';
      ctx.fillText('يُمنح وسام التقدير والشرف بكل فخر للبطل:', W / 2, 665);

      // 8. Student Name (Large prominent golden 3D text)
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
      ctx.shadowBlur = 12;
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 58px "Cairo", sans-serif';
      ctx.fillText(student.name, W / 2, 745);
      ctx.restore();

      // Student Subtitle / Class
      ctx.fillStyle = '#fde68a';
      ctx.font = 'bold 24px "Cairo", sans-serif';
      ctx.fillText(`${student.grade} • ${monthName}`, W / 2, 795);

      // 9. Metric Pill Box
      let metricText = '';
      if (selectedTitle === 'بطل التتابع الذهبي') {
        metricText = `🔥 تتابع حضور: ${stats.currentStreak} أسابيع متتالية بأمانة كاملة`;
      } else if (selectedTitle === 'بطل الشهر') {
        metricText = `👑 صدارة الترتيب العام برصيد: ${stats.totalPoints} نقطة تفوق`;
      } else {
        metricText = `📖 حفظ الآيات الأسبوعية والتفاعل الكنسي: ${stats.pointsBreakdown.verse > 0 ? stats.pointsBreakdown.verse + ' نقطة آيات' : 'أداء متميز'}`;
      }

      const pillW = 680;
      const pillH = 55;
      const pillX = W / 2 - pillW / 2;
      const pillY = 835;

      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.6)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(pillX, pillY, pillW, pillH, 16);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 22px "Cairo", sans-serif';
      ctx.fillText(metricText, W / 2, pillY + 36);

      // 10. Biblical Verse Card
      const verseBoxY = 930;
      const verseBoxW = 900;
      const verseBoxH = 175;
      const verseBoxX = W / 2 - verseBoxW / 2;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.strokeStyle = 'rgba(254, 243, 199, 0.25)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(verseBoxX, verseBoxY, verseBoxW, verseBoxH, 24);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 26px "Cairo", sans-serif';
      
      // Split long verse if needed
      const verseWords = preset.verse.split(' ');
      if (verseWords.length > 8) {
        const mid = Math.ceil(verseWords.length / 2);
        const line1 = verseWords.slice(0, mid).join(' ');
        const line2 = verseWords.slice(mid).join(' ');
        ctx.fillText(line1, W / 2, verseBoxY + 55);
        ctx.fillText(line2, W / 2, verseBoxY + 95);
        ctx.fillStyle = '#cbd5e1';
        ctx.font = '500 20px "Cairo", sans-serif';
        ctx.fillText(preset.verseRef, W / 2, verseBoxY + 140);
      } else {
        ctx.fillText(preset.verse, W / 2, verseBoxY + 70);
        ctx.fillStyle = '#cbd5e1';
        ctx.font = '500 20px "Cairo", sans-serif';
        ctx.fillText(preset.verseRef, W / 2, verseBoxY + 120);
      }

      // 11. Footer Signatures & Date
      const footerY = 1175;

      // Right: Date
      ctx.textAlign = 'right';
      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 19px "Cairo", sans-serif';
      const dateFormatted = new Date().toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      ctx.fillText(`تاريخ التكريم: ${dateFormatted}`, W - padding - 40, footerY);

      // Left: Servant Signatures
      ctx.textAlign = 'left';
      ctx.fillText('خدام ومسؤولو مرحلة إعدادي ✟', padding + 40, footerY);

      // Center: Patron Priests in footer
      ctx.textAlign = 'center';
      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 19px "Cairo", sans-serif';
      ctx.fillText('برعاية الآباء الكهنة: أبونا مكسيموس يوسف ✟ أبونا دوماديوس صليب', W / 2, footerY + 34);

      // Center bottom golden motto
      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 19px "Cairo", sans-serif';
      ctx.fillText('«مَعَ الْمَسِيحِ صُلِبْتُ، فَأَحْيَا لاَ أَنَا، بَلِ الْمَسِيحُ يَحْيَا فِيَّ» (غلاطية 2: 20)', W / 2, 1256);
    };

    // Render once fonts are ready or immediately
    if (document.fonts?.ready) {
      document.fonts.ready.then(() => {
        if (isCancelled) return;
        if (student.photoUrl) {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            if (!isCancelled) renderCard(img);
          };
          img.onerror = () => {
            if (!isCancelled) renderCard();
          };
          img.src = student.photoUrl;
        } else {
          renderCard();
        }
      });
    } else {
      renderCard();
    }

    return () => {
      isCancelled = true;
    };
  }, [selectedTitle, student, stats, churchName, serviceName, patronPriests, monthName]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `وسام-${selectedTitle}-${student.name.replace(/\s+/g, '_')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const getCanvasBlob = (canvas: HTMLCanvasElement): Promise<Blob | null> => {
    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), 'image/png');
    });
  };

  const handleShare = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        const blob = await getCanvasBlob(canvas);
        if (!blob) {
          handleDownload();
          return;
        }

        const file = new File(
          [blob], 
          `وسام-${selectedTitle}-${student.name.replace(/\s+/g, '_')}.png`, 
          { type: 'image/png' }
        );

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              title: `وسام ${selectedTitle} - ${student.name}`,
              text: `فخورين بالبطل ${student.name} لحصوله على وسام «${selectedTitle}» في خدمة إعدادي! 🎉`,
              files: [file],
            });
            return;
          } catch (shareErr: unknown) {
            const err = shareErr as { name?: string; message?: string } | undefined;
            // User intentionally canceled or closed share sheet: do not error or download
            if (
              err?.name === 'AbortError' ||
              err?.message?.toLowerCase().includes('cancel') ||
              err?.message?.toLowerCase().includes('abort')
            ) {
              return;
            }
            // If sharing failed due to unsupported file format or browser, fallback to download
            handleDownload();
            return;
          }
        }
      }
      handleDownload();
    } catch {
      handleDownload();
    }
  };

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(window.location.href);
      }
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      // In case clipboard permissions are denied in iframe
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-4xl w-full p-4 sm:p-6 shadow-2xl relative my-auto animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute left-4 top-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-400/40 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-black text-white">
              بطاقة الإنجاز والوسام التكريمي للمشاركة 📲
            </h3>
            <p className="text-xs text-slate-400">
              صورة احترافية جاهزة بجودة عالية باسم المخدوم لمشاركتها على واتساب، إنستجرام، وفيسبوك.
            </p>
          </div>
        </div>

        {/* Achievement Title Switcher (The 3 Titles requested by user) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-5">
          {(['بطل الشهر', 'بطل التتابع الذهبي', 'افضل قارئ للانجيل وحافظ الآيات'] as AchievementTitleType[]).map((t) => {
            const isSelected = selectedTitle === t;
            const p = PRESETS[t];
            return (
              <button
                key={t}
                onClick={() => setSelectedTitle(t)}
                className={`p-3 rounded-2xl border text-start transition relative overflow-hidden ${
                  isSelected
                    ? 'bg-amber-500/15 border-amber-400 text-white shadow-lg shadow-amber-500/10 ring-2 ring-amber-400/30'
                    : 'bg-slate-800/70 border-slate-700/80 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xl">{p.icon}</span>
                  {isSelected && (
                    <span className="text-[10px] font-black bg-amber-400 text-stone-950 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      <span>محدد</span>
                    </span>
                  )}
                </div>
                <h4 className="font-black text-sm text-white">{t}</h4>
                <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{p.badgeBadgeText}</p>
              </button>
            );
          })}
        </div>

        {/* Content Area: Canvas Preview + Options */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Card Preview Container */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center bg-slate-950/60 p-4 rounded-3xl border border-slate-800">
            <div className="relative group max-w-[280px] sm:max-w-[320px] shadow-2xl rounded-2xl overflow-hidden border-2 border-amber-400/40">
              <canvas
                ref={canvasRef}
                className="w-full h-auto block select-none pointer-events-none"
              />
            </div>
            <span className="text-[11px] text-slate-500 mt-2 font-medium">
              معاينة البطاقة (مقاس عالي الدقة 1080 × 1350 للستوري والسوشيال ميديا)
            </span>
          </div>

          {/* Details & Actions Panel */}
          <div className="lg:col-span-6 space-y-4 text-slate-300">
            <div className="bg-slate-800/70 border border-slate-700 rounded-2xl p-4 space-y-2.5">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-700/60">
                <span className="text-slate-400 font-bold">الكنيسة:</span>
                <span className="font-black text-amber-200 text-xs">{churchName || 'كنيسة السيدة العذراء مريم بسدود'}</span>
              </div>
              <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-700/60">
                <span className="text-slate-400 font-bold">رعاية الآباء:</span>
                <span className="font-bold text-slate-200 text-[11px]">{patronPriests || 'أبونا مكسيموس يوسف • أبونا دوماديوس صليب'}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-bold">اسم المخدوم:</span>
                <span className="font-black text-white text-sm">{student.name}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-bold">اللقب والوسام:</span>
                <span className="font-black text-amber-400">{selectedTitle}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-bold">تتابع الحضور الحالي:</span>
                <span className="font-black text-slate-200 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>{stats.currentStreak} أسابيع</span>
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-bold">إجمالي النقاط:</span>
                <span className="font-black text-emerald-400">{stats.totalPoints} نقطة</span>
              </div>
              
              <div className="pt-2 border-t border-slate-700 flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs text-slate-400 font-bold">الشهر / الفترة:</span>
                <input
                  type="text"
                  value={monthName}
                  onChange={(e) => setMonthName(e.target.value)}
                  placeholder="مثال: شهر أكتوبر 2026"
                  className="mr-auto px-2 py-1 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white font-bold focus:outline-none focus:border-amber-400 text-center"
                />
              </div>
            </div>

            {/* Verse Display */}
            <div className="bg-amber-500/10 border border-amber-400/30 rounded-2xl p-3.5">
              <p className="text-xs font-bold text-amber-200 leading-relaxed text-center">
                {preset.verse}
              </p>
              <span className="text-[10px] text-amber-400/80 font-semibold block text-center mt-1">
                {preset.verseRef}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                onClick={handleDownload}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black text-sm rounded-2xl transition shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
              >
                <Download className="w-4 h-4 stroke-[2.5]" />
                <span>تحميل الصورة كملف عالي الجودة (Download PNG)</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleShare}
                  className="py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition border border-slate-700 flex items-center justify-center gap-1.5 active:scale-98 cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>مشاركة مباشرة 📲</span>
                </button>

                <button
                  onClick={handleCopyLink}
                  className="py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs rounded-xl transition border border-slate-700 flex items-center justify-center gap-1.5 active:scale-98 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>{isCopied ? 'تم نسخ الرابط! ✓' : 'نسخ رابط المنصة'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

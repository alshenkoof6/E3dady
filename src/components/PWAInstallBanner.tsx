import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Smartphone, 
  X, 
  Share, 
  PlusSquare, 
  Check, 
  Sparkles,
  Monitor,
  MoreVertical,
  Zap,
  Bell,
  WifiOff
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { triggerGiftCelebration } from '../utils/confetti';

const PWA_DISMISSED_KEY = 'church_prep_pwa_banner_dismissed_time';
const DISMISS_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours cooldown after dismissing

interface PWAInstallBannerProps {
  forceShow?: boolean;
  onClose?: () => void;
}

export const PWAInstallBanner: React.FC<PWAInstallBannerProps> = ({ forceShow = false, onClose }) => {
  const { canInstall, isInstalled, isIOS, installApp, hasDeferredPrompt } = usePWAInstall();
  const [isDismissed, setIsDismissed] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [activePlatformTab, setActivePlatformTab] = useState<'ios' | 'android' | 'desktop'>(() => {
    if (typeof window !== 'undefined') {
      const ua = window.navigator.userAgent.toLowerCase();
      if (/iphone|ipad|ipod/.test(ua)) return 'ios';
      if (/android/.test(ua)) return 'android';
    }
    return 'android';
  });
  const [installSuccess, setInstallSuccess] = useState(false);

  useEffect(() => {
    try {
      const dismissedTime = localStorage.getItem(PWA_DISMISSED_KEY);
      if (dismissedTime && !forceShow) {
        const diff = Date.now() - parseInt(dismissedTime, 10);
        if (diff < DISMISS_COOLDOWN_MS) {
          setIsDismissed(true);
        }
      }
    } catch {}
  }, [forceShow]);

  // When forceShow is triggered externally (e.g. from Header or Settings), open the guide or trigger install
  useEffect(() => {
    if (forceShow) {
      if (hasDeferredPrompt) {
        handleInstallClick();
      } else {
        setShowGuideModal(true);
      }
    }
  }, [forceShow, hasDeferredPrompt]);

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      localStorage.setItem(PWA_DISMISSED_KEY, Date.now().toString());
    } catch {}
    if (onClose) onClose();
  };

  const handleInstallClick = async () => {
    if (hasDeferredPrompt) {
      try {
        const success = await installApp();
        if (success) {
          setInstallSuccess(true);
          triggerGiftCelebration();
          setTimeout(() => {
            setIsDismissed(true);
            setShowGuideModal(false);
            if (onClose) onClose();
          }, 2500);
          return;
        }
      } catch (err) {
        console.warn('Install prompt error:', err);
      }
    }

    // If deferred prompt is not directly available (e.g. iOS Safari or already dismissed in browser), show the guide
    setShowGuideModal(true);
  };

  // If already installed and not forced, hide
  if (isInstalled && !forceShow) return null;
  // If dismissed and not forced, hide
  if (isDismissed && !forceShow) return null;

  return (
    <>
      {/* Floating Welcome & Prompt Banner for first-time visitors */}
      {!forceShow && !isDismissed && !isInstalled && (
        <aside
          aria-label="تثبيت تطبيق الخدمة على الموبايل"
          dir="rtl"
          className="fixed bottom-4 inset-x-3 sm:inset-x-auto sm:left-6 sm:bottom-6 sm:max-w-md z-40 bg-gradient-to-br from-stone-950 via-red-950 to-stone-900 text-white rounded-3xl p-4 shadow-2xl border-2 border-amber-500/50 animate-in slide-in-from-bottom-6 duration-300 backdrop-blur-md"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="relative shrink-0">
                <img
                  src="/pwa-192x192.png"
                  alt="أيقونة تطبيق الخدمة"
                  className="w-13 h-13 rounded-2xl object-cover border-2 border-amber-400/70 shadow-lg"
                />
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500 border border-white"></span>
                </span>
              </div>

              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/25 text-amber-300 border border-amber-400/40">
                    تطبيق الموبايل 📲
                  </span>
                  <span className="text-[11px] text-emerald-300 font-bold flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-400" />
                    خفيف وسريع جداً
                  </span>
                </div>
                <h4 className="text-sm font-black text-amber-100 mt-1">
                  تثبيت منصة الخدمة كتطبيق على هاتفك
                </h4>
                <p className="text-[11px] text-stone-300 leading-tight mt-0.5">
                  استخدم المنصة بكامل الشاشة بدون متصفح مع وصول فوري لدرجات الحضور والإشعارات
                </p>
              </div>
            </div>

            <button
              onClick={handleDismiss}
              className="p-1.5 text-stone-400 hover:text-white rounded-xl hover:bg-white/10 transition shrink-0 cursor-pointer"
              title="إغلاق التنبيه مؤقتاً"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Highlights */}
          <div className="mt-2.5 pt-2 border-t border-white/10 grid grid-cols-3 gap-1.5 text-[10px] text-amber-200/90 font-medium text-center">
            <div className="bg-white/5 py-1 px-1.5 rounded-lg flex items-center justify-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>شاشة كاملة</span>
            </div>
            <div className="bg-white/5 py-1 px-1.5 rounded-lg flex items-center justify-center gap-1">
              <Bell className="w-3 h-3 text-amber-400" />
              <span>إشعارات فورية</span>
            </div>
            <div className="bg-white/5 py-1 px-1.5 rounded-lg flex items-center justify-center gap-1">
              <WifiOff className="w-3 h-3 text-amber-400" />
              <span>دعم بدون نت</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between gap-2">
            <button
              onClick={handleDismiss}
              className="px-3 py-1.5 text-xs text-stone-400 hover:text-stone-200 font-bold transition cursor-pointer"
            >
              لاحقاً
            </button>

            <button
              onClick={handleInstallClick}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black text-xs sm:text-sm rounded-xl transition shadow-lg shadow-amber-500/30 active:scale-95 cursor-pointer"
            >
              {installSuccess ? (
                <>
                  <Check className="w-4 h-4 text-stone-950" />
                  <span>تم التثبيت بنجاح! 🎉</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 stroke-[2.5]" />
                  <span>تثبيت التطبيق الآن 📲</span>
                </>
              )}
            </button>
          </div>
        </aside>
      )}

      {/* Guided Multi-Platform Installation Modal */}
      {showGuideModal && (
        <div 
          dir="rtl"
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-right space-y-5 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
              <div className="flex items-center gap-3">
                <img
                  src="/pwa-192x192.png"
                  alt="شعار الخدمة"
                  className="w-11 h-11 rounded-2xl object-cover border border-amber-500/50 shadow-sm"
                />
                <div>
                  <h4 className="font-black text-slate-900 text-base">
                    تثبيت تطبيق خدمة إعدادي 📲
                  </h4>
                  <p className="text-xs text-slate-500">طريقة تثبيت المنصة كتطبيق على هاتفك أو جهازك</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowGuideModal(false);
                  if (onClose) onClose();
                }}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Platform Selector Tabs */}
            <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-2xl text-xs font-black">
              <button
                onClick={() => setActivePlatformTab('android')}
                className={`py-2 px-2 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  activePlatformTab === 'android'
                    ? 'bg-white text-amber-700 shadow-sm border border-amber-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>أندرويد / سامسونج</span>
              </button>

              <button
                onClick={() => setActivePlatformTab('ios')}
                className={`py-2 px-2 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  activePlatformTab === 'ios'
                    ? 'bg-white text-amber-700 shadow-sm border border-amber-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>آيفون (iOS Safari)</span>
              </button>

              <button
                onClick={() => setActivePlatformTab('desktop')}
                className={`py-2 px-2 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  activePlatformTab === 'desktop'
                    ? 'bg-white text-amber-700 shadow-sm border border-amber-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>كمبيوتر / لابتوب</span>
              </button>
            </div>

            {/* Platform Instructions Content */}
            <div className="space-y-3.5 text-xs text-slate-700">
              {activePlatformTab === 'ios' && (
                <>
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-amber-500 text-stone-950 font-black text-xs flex items-center justify-center shrink-0 shadow-sm">
                      1
                    </span>
                    <p className="leading-relaxed">
                      في متصفح <b>Safari</b>، اضغط على زر <b>المشاركة (Share)</b> <Share className="w-4 h-4 inline mx-1 text-blue-600" /> الموجود في شريط أسفل الشاشة.
                    </p>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-amber-500 text-stone-950 font-black text-xs flex items-center justify-center shrink-0 shadow-sm">
                      2
                    </span>
                    <p className="leading-relaxed">
                      مرر القائمة لأسفل واختر <b>«إضافة إلى الشاشة الرئيسية»</b> <PlusSquare className="w-4 h-4 inline mx-1 text-slate-800" /> (Add to Home Screen).
                    </p>
                  </div>

                  <div className="p-3 bg-emerald-50 text-emerald-900 rounded-2xl border border-emerald-200 flex items-center gap-2.5 text-[11px] font-bold">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>مبروك! ستظهر أيقونة التطبيق الذهبية على شاشة هاتفك الرئيسية فوراً.</span>
                  </div>
                </>
              )}

              {activePlatformTab === 'android' && (
                <>
                  {hasDeferredPrompt ? (
                    <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl text-center space-y-2.5">
                      <p className="font-bold text-amber-900">
                        متصفحك يدعم التثبيت المباشر بنقرة واحدة!
                      </p>
                      <button
                        onClick={handleInstallClick}
                        className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Download className="w-4 h-4" />
                        <span>اضغط هنا لتثبيت التطبيق الآن 📲</span>
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-3">
                        <span className="w-7 h-7 rounded-full bg-amber-500 text-stone-950 font-black text-xs flex items-center justify-center shrink-0 shadow-sm">
                          1
                        </span>
                        <p className="leading-relaxed">
                          في متصفح <b>Chrome</b> أو <b>Samsung Internet</b>، اضغط على زر <b>القائمة (⋮)</b> <MoreVertical className="w-4 h-4 inline mx-0.5 text-slate-800" /> أعلى أو أسفل الشاشة.
                        </p>
                      </div>

                      <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-3">
                        <span className="w-7 h-7 rounded-full bg-amber-500 text-stone-950 font-black text-xs flex items-center justify-center shrink-0 shadow-sm">
                          2
                        </span>
                        <p className="leading-relaxed">
                          اختر <b>«تثبيت التطبيق»</b> (Install app) أو <b>«إضافة إلى الشاشة الرئيسية»</b> (Add to Home screen).
                        </p>
                      </div>

                      <div className="p-3 bg-emerald-50 text-emerald-900 rounded-2xl border border-emerald-200 flex items-center gap-2.5 text-[11px] font-bold">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>سيتم تثبيت التطبيق وسيعمل بكامل الشاشة مثل أي تطبيق يتم تنزيله من المتجر.</span>
                      </div>
                    </>
                  )}
                </>
              )}

              {activePlatformTab === 'desktop' && (
                <>
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-amber-500 text-stone-950 font-black text-xs flex items-center justify-center shrink-0 shadow-sm">
                      1
                    </span>
                    <p className="leading-relaxed">
                      في متصفح Chrome أو Edge على الكمبيوتر، ستجد <b>أيقونة تثبيت صغيرة ⊕</b> في شريط العنوان بالأعلى بجوار زر المفضلة.
                    </p>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-amber-500 text-stone-950 font-black text-xs flex items-center justify-center shrink-0 shadow-sm">
                      2
                    </span>
                    <p className="leading-relaxed">
                      انقر عليها ثم اضغط <b>«تثبيت» (Install)</b> ليفتح التطبيق في نافذة مستقلة وسريعة على سطح المكتب.
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-100">
              <button
                onClick={() => {
                  setShowGuideModal(false);
                  if (onClose) onClose();
                }}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition cursor-pointer"
              >
                فهمت، حسناً
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

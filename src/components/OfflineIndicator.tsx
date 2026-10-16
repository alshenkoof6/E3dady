import React, { useEffect, useState } from 'react';
import { WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  const [wasOffline, setWasOffline] = useState(false);
  const [showRestoredNotice, setShowRestoredNotice] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true);
    } else if (wasOffline) {
      setShowRestoredNotice(true);
      const timer = setTimeout(() => {
        setShowRestoredNotice(false);
        setWasOffline(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  if (isOnline && !showRestoredNotice) {
    return null;
  }

  if (showRestoredNotice) {
    return (
      <div 
        dir="rtl"
        className="fixed bottom-4 left-4 z-50 flex items-center gap-2.5 rounded-2xl bg-emerald-600 text-white px-4 py-2.5 text-xs font-bold shadow-xl border border-emerald-400/40 animate-in slide-in-from-bottom duration-300 backdrop-blur-md"
      >
        <CheckCircle2 className="w-4 h-4 text-emerald-200" />
        <span>تم استعادة الاتصال بالإنترنت بنجاح! يتم تحديث البيانات سحابياً.</span>
      </div>
    );
  }

  return (
    <div 
      dir="rtl"
      className="fixed bottom-4 left-4 z-50 flex items-center gap-3 rounded-2xl bg-amber-600 text-white px-4 py-2.5 text-xs font-bold shadow-2xl border-2 border-amber-300/40 animate-in slide-in-from-bottom duration-300 backdrop-blur-md max-w-sm"
    >
      <div className="w-7 h-7 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
        <WifiOff className="w-4 h-4 text-white animate-pulse" />
      </div>
      <div className="flex-1 leading-snug">
        <p className="font-black text-amber-50">أنت الآن في وضع عدم الاتصال (Offline)</p>
        <p className="text-[11px] text-amber-100 font-normal mt-0.5">
          يمكنك متابعة العمل وتصفح السجلات من الذاكرة المحلية المخزنة.
        </p>
      </div>
    </div>
  );
};

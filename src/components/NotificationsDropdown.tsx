import React, { useState } from 'react';
import { AppNotification, Student } from '../types';
import { 
  Bell, 
  CheckCheck, 
  Cake, 
  Trophy, 
  Gift, 
  Sparkles, 
  X, 
  Phone, 
  MessageCircle, 
  ArrowLeft, 
  Flame, 
  TrendingUp, 
  CalendarCheck,
  Send,
  Smartphone,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { 
  getNotificationPermission, 
  requestNotificationPermission, 
  sendTestNotification, 
  isNotificationSupported 
} from '../utils/notifications';
import { getWhatsAppUrl } from '../utils/phone';

interface NotificationsDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onSelectStudent?: (studentId: string) => void;
  onSelectSession?: (sessionId: string) => void;
  onNavigateTab?: (tab: 'attendance' | 'rewards' | 'leaderboard' | 'reports' | 'students' | 'settings') => void;
  allStudents: Student[];
}

export const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onSelectStudent,
  onSelectSession,
  onNavigateTab,
  allStudents,
}) => {
  const [filterCategory, setFilterCategory] = useState<'all' | 'birthday' | 'milestone' | 'reward'>('all');
  const [permissionState, setPermissionState] = useState<NotificationPermission>(() => getNotificationPermission());
  const [testNotificationSent, setTestNotificationSent] = useState(false);

  if (!isOpen) return null;

  const handleRequestPermission = async () => {
    const res = await requestNotificationPermission();
    setPermissionState(res);
    if (res === 'granted') {
      await sendTestNotification();
      setTestNotificationSent(true);
      setTimeout(() => setTestNotificationSent(false), 4000);
    }
  };

  const handleSendTest = async () => {
    const res = await sendTestNotification();
    if (res) {
      setTestNotificationSent(true);
      setTimeout(() => setTestNotificationSent(false), 4000);
    }
  };

  const filteredNotifications = notifications.filter((notif) => {
    if (filterCategory === 'all') return true;
    if (filterCategory === 'birthday') return notif.category === 'birthday';
    if (filterCategory === 'milestone') return notif.category === 'milestone';
    if (filterCategory === 'reward') return notif.category === 'reward';
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleNotificationClick = (notif: AppNotification) => {
    onMarkAsRead(notif.id);

    if (notif.actionType === 'whatsapp' && notif.studentPhone) {
      const greeting = `كل سنة وأنت طيب وبخير يا ${notif.studentName || 'بطل'}! 🎉🎂\nخدام وأسرة خدمة إعدادي بيباركو لك في عيد ميلادك، وبيتمنولك سنة سعيدة ومباركة مع بابا يسوع ✝️✨\nمستنينك تفرح معانا في اللقاء القادم! ❤️`;
      const url = getWhatsAppUrl(notif.studentPhone, greeting);
      window.open(url, '_blank');
      return;
    }

    if (notif.actionType === 'view_student' && notif.studentId && onSelectStudent) {
      onSelectStudent(notif.studentId);
      onClose();
      return;
    }

    if (notif.actionType === 'view_attendance') {
      if (notif.sessionId && onSelectSession) {
        onSelectSession(notif.sessionId);
      }
      if (onNavigateTab) {
        onNavigateTab('attendance');
      }
      onClose();
      return;
    }

    if (notif.actionType === 'view_rewards') {
      if (onNavigateTab) {
        onNavigateTab('rewards');
      }
      onClose();
      return;
    }

    if (notif.actionType === 'view_leaderboard') {
      if (onNavigateTab) {
        onNavigateTab('leaderboard');
      }
      onClose();
      return;
    }
  };

  return (
    <>
      {/* Backdrop overlay for dismissing */}
      <div 
        className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-[2px] transition-opacity duration-200" 
        onClick={onClose} 
      />

      {/* Floating Center Panel (Dropdown in desktop, responsive sheet in mobile) */}
      <div 
        dir="rtl"
        className="fixed inset-x-3 top-20 sm:absolute sm:inset-x-auto sm:left-4 sm:top-full sm:mt-2 w-auto sm:w-[460px] max-h-[85vh] sm:max-h-[620px] bg-white rounded-3xl shadow-2xl border border-slate-200/90 z-50 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-gradient-to-r from-slate-900 via-stone-900 to-amber-950 text-white flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300 shadow-inner">
              <Bell className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black tracking-tight text-white font-['Alexandria',sans-serif]">
                  الإشعارات والتنبيهات
                </h3>
                {unreadCount > 0 ? (
                  <span className="px-2 py-0.5 text-xs font-black bg-rose-600 text-white rounded-full animate-pulse shadow-sm">
                    {unreadCount} جديد
                  </span>
                ) : (
                  <span className="px-2 py-0.5 text-[11px] font-bold bg-white/10 text-emerald-300 rounded-full border border-white/10">
                    محدّثة كلها ✨
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-300 font-medium mt-0.5">
                أعياد الميلاد، الإحصائيات الاستثنائية، وإنجازات المخدومين
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllAsRead}
                className="px-2.5 py-1 text-xs font-bold text-amber-300 hover:text-white bg-white/10 hover:bg-white/20 rounded-xl transition flex items-center gap-1 border border-white/10"
                title="تحديد كل الإشعارات كمقروءة"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">قراءة الكل</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition"
              title="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Device Push Notifications Banner (Web Notification API) */}
        {isNotificationSupported() && (
          <div className="px-4 py-3 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-rose-500/10 border-b border-amber-500/20 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-800 flex items-center justify-center shrink-0">
                <Smartphone className="w-4 h-4" />
              </div>
              <div className="min-w-0 text-right">
                <p className="text-xs font-black text-slate-900 truncate">
                  {permissionState === 'granted'
                    ? 'إشعارات الهاتف والمتصفح مفعّلة ✅'
                    : 'فعّل إشعارات الموبايل الخارجية 🔔'}
                </p>
                <p className="text-[10px] text-slate-500 truncate">
                  {permissionState === 'granted'
                    ? 'ستصلك تنبيهات أعياد الميلاد والإحصائيات المهمة على جهازك'
                    : 'لتصلك تنبيهات أعياد الميلاد والإنجازات حتى والتطبيق مغلق'}
                </p>
              </div>
            </div>

            <div className="shrink-0">
              {permissionState === 'granted' ? (
                <button
                  onClick={handleSendTest}
                  className="px-2.5 py-1 text-[11px] font-bold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl transition shadow-xs flex items-center gap-1"
                  title="إرسال إشعار تجريبي لاختبار التنبيه على هاتفك أو كمبيوترك"
                >
                  <Send className="w-3 h-3 text-amber-600" />
                  <span>{testNotificationSent ? 'تم الإرسال!' : 'تجربة إشعار'}</span>
                </button>
              ) : (
                <button
                  onClick={handleRequestPermission}
                  className="px-3 py-1.5 text-[11px] font-black bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl transition shadow-md shadow-amber-500/20 flex items-center gap-1 active:scale-95"
                >
                  <Bell className="w-3 h-3" />
                  <span>تفعيل الآن</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setFilterCategory('all')}
            className={`px-3 py-1 rounded-xl text-xs font-black transition whitespace-nowrap ${
              filterCategory === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            الكل ({notifications.length})
          </button>
          <button
            onClick={() => setFilterCategory('birthday')}
            className={`px-3 py-1 rounded-xl text-xs font-black transition whitespace-nowrap flex items-center gap-1 ${
              filterCategory === 'birthday'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            <Cake className="w-3.5 h-3.5 text-rose-500 group-hover:text-white" />
            <span>أعياد ميلاد ({notifications.filter((n) => n.category === 'birthday').length})</span>
          </button>
          <button
            onClick={() => setFilterCategory('milestone')}
            className={`px-3 py-1 rounded-xl text-xs font-black transition whitespace-nowrap flex items-center gap-1 ${
              filterCategory === 'milestone'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            <span>إحصائيات وأرقام ({notifications.filter((n) => n.category === 'milestone').length})</span>
          </button>
          <button
            onClick={() => setFilterCategory('reward')}
            className={`px-3 py-1 rounded-xl text-xs font-black transition whitespace-nowrap flex items-center gap-1 ${
              filterCategory === 'reward'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            <Gift className="w-3.5 h-3.5 text-emerald-500" />
            <span>جوائز ({notifications.filter((n) => n.category === 'reward').length})</span>
          </button>
        </div>

        {/* Notification Items List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2 space-y-1 max-h-[380px]">
          {filteredNotifications.length === 0 ? (
            <div className="py-12 px-6 text-center">
              <div className="w-14 h-14 mx-auto rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3 border border-amber-200">
                <Sparkles className="w-7 h-7" />
              </div>
              <p className="text-sm font-black text-slate-800">لا توجد إشعارات حالياً</p>
              <p className="text-xs text-slate-500 mt-1">
                ستظهر هنا أعياد الميلاد وتنبيهات نسب الحضور والمكافآت تلقائياً
              </p>
            </div>
          ) : (
            filteredNotifications.map((notif) => {
              const student = notif.studentId
                ? allStudents.find((s) => s.id === notif.studentId)
                : undefined;

              return (
                <div
                  key={notif.id}
                  className={`p-3 rounded-2xl transition-all duration-200 text-right flex items-start gap-3 relative group ${
                    notif.isRead
                      ? 'bg-white hover:bg-slate-50'
                      : 'bg-amber-50/50 hover:bg-amber-100/60 border border-amber-200/70 shadow-xs'
                  }`}
                >
                  {/* Category / Avatar Indicator */}
                  <div className="relative shrink-0 mt-0.5">
                    {notif.studentPhoto ? (
                      <img
                        src={notif.studentPhoto}
                        alt={notif.studentName || ''}
                        className="w-11 h-11 rounded-2xl object-cover border-2 border-white shadow-md"
                      />
                    ) : (
                      <div
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-md ${
                          notif.category === 'birthday'
                            ? 'bg-gradient-to-br from-rose-500 to-pink-600 text-white'
                            : notif.category === 'milestone'
                            ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-white'
                            : notif.category === 'reward'
                            ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white'
                            : 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white'
                        }`}
                      >
                        {notif.category === 'birthday' && <Cake className="w-5 h-5" />}
                        {notif.category === 'milestone' && (
                          notif.badgeText?.includes('ستريك') ? (
                            <Flame className="w-5 h-5 text-amber-200" />
                          ) : (
                            <TrendingUp className="w-5 h-5" />
                          )
                        )}
                        {notif.category === 'reward' && <Gift className="w-5 h-5" />}
                        {notif.category === 'cycle' && <Trophy className="w-5 h-5" />}
                      </div>
                    )}

                    {/* Mini Category badge on avatar */}
                    {notif.studentPhoto && (
                      <span className="absolute -bottom-1 -left-1 w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-xs border border-slate-200 text-[10px]">
                        {notif.category === 'birthday' ? '🎂' : notif.category === 'reward' ? '🎁' : '🏆'}
                      </span>
                    )}
                  </div>

                  {/* Body Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {notif.badgeText && (
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${
                              notif.category === 'birthday'
                                ? 'bg-rose-100 text-rose-800 border-rose-200'
                                : notif.category === 'milestone'
                                ? 'bg-amber-100 text-amber-800 border-amber-300'
                                : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            }`}
                          >
                            {notif.badgeText}
                          </span>
                        )}
                        <span className="text-[10px] text-slate-600 font-bold">
                          {notif.dateLabel || 'اليوم'}
                        </span>
                      </div>

                      {/* Unread dot */}
                      {!notif.isRead && (
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse shrink-0" title="إشعار غير مقروء" />
                      )}
                    </div>

                    <h4 className="text-xs sm:text-sm font-black text-slate-900 leading-snug">
                      {notif.title}
                    </h4>

                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {notif.message}
                    </p>

                    {/* Quick interactive action buttons */}
                    <div className="mt-2.5 flex items-center gap-2 flex-wrap">
                      {notif.category === 'birthday' && notif.studentPhone && (
                        <button
                          onClick={() => handleNotificationClick(notif)}
                          className="px-2.5 py-1 rounded-xl text-[11px] font-black bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-xs flex items-center gap-1 active:scale-95"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>معايدة واتساب</span>
                        </button>
                      )}

                      {notif.studentId && onSelectStudent && (
                        <button
                          onClick={() => {
                            onMarkAsRead(notif.id);
                            onSelectStudent(notif.studentId!);
                            onClose();
                          }}
                          className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition flex items-center gap-1 active:scale-95"
                        >
                          <span>عرض الملف</span>
                          <ArrowLeft className="w-3 h-3" />
                        </button>
                      )}

                      {notif.category === 'milestone' && notif.sessionId && (
                        <button
                          onClick={() => handleNotificationClick(notif)}
                          className="px-2.5 py-1 rounded-xl text-[11px] font-black bg-amber-500 hover:bg-amber-600 text-stone-950 transition shadow-xs flex items-center gap-1 active:scale-95"
                        >
                          <CalendarCheck className="w-3.5 h-3.5" />
                          <span>تصفح اللقاء</span>
                        </button>
                      )}

                      {notif.category === 'reward' && (
                        <button
                          onClick={() => handleNotificationClick(notif)}
                          className="px-2.5 py-1 rounded-xl text-[11px] font-black bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-xs flex items-center gap-1 active:scale-95"
                        >
                          <Gift className="w-3.5 h-3.5" />
                          <span>تسليم الجائزة</span>
                        </button>
                      )}

                      {!notif.isRead && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onMarkAsRead(notif.id);
                          }}
                          className="px-2 py-1 rounded-lg text-[10px] font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-200/50 transition mr-auto"
                          title="تحديد كمقروء"
                        >
                          ✓ قراءة
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>نظام الإشعارات الذكي لخدمة إعدادي</span>
          <span className="font-mono text-[11px] font-bold text-amber-700">
            {notifications.length} إشعار مسجل
          </span>
        </div>
      </div>
    </>
  );
};

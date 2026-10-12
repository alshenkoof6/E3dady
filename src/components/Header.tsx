import { CurrentUser } from '../types';
import { 
  Users, 
  CalendarCheck, 
  Gift, 
  Trophy, 
  Settings, 
  PlusCircle, 
  Zap, 
  FileSpreadsheet, 
  Cross,
  BarChart3,
  ShieldCheck,
  UserCheck,
  Lock,
  Cake,
  Eye,
  LogOut,
  Database,
  Cloud
} from 'lucide-react';

interface HeaderProps {
  currentTab: 'attendance' | 'rewards' | 'leaderboard' | 'reports' | 'students' | 'settings';
  setCurrentTab: (tab: 'attendance' | 'rewards' | 'leaderboard' | 'reports' | 'students' | 'settings') => void;
  churchName: string;
  serviceName: string;
  unclaimedRewardsCount: number;
  todayBirthdaysCount?: number;
  currentUser: CurrentUser;
  isCloudConnected?: boolean;
  cloudSyncing?: boolean;
  onOpenLogin: () => void;
  onLogout?: () => void;
  onOpenAddStudent: () => void;
  onOpenAddCompetition: () => void;
  onOpenImportExport: () => void;
  onViewBirthdays?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  churchName,
  serviceName,
  unclaimedRewardsCount,
  todayBirthdaysCount = 0,
  currentUser,
  isCloudConnected = false,
  cloudSyncing = false,
  onOpenLogin,
  onLogout,
  onOpenAddStudent,
  onOpenAddCompetition,
  onOpenImportExport,
  onViewBirthdays,
}) => {
  const isServant = currentUser?.type === 'servant';

  return (
    <header className="bg-gradient-to-r from-red-950 via-red-900 to-amber-950 text-white shadow-xl border-b border-amber-600/30 sticky top-0 z-30">
      {/* Top Bar with Church Info and Quick Actions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-inner">
            <Cross className="w-7 h-7 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-amber-100 font-['Alexandria',sans-serif]">
                {serviceName}
              </h1>
              <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
                إعدادي
              </span>
            </div>
            <p className="text-xs sm:text-sm text-red-200/90 font-medium mt-0.5">
              {churchName}
            </p>
          </div>
        </div>

        {/* Quick Action Buttons & Auth Pill */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Cloud Database Status Badge */}
          {isCloudConnected && (
            <div 
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold bg-white/10 text-emerald-200 rounded-xl border border-emerald-400/25 backdrop-blur-sm"
              title="متصل بقاعدة بيانات Firebase Firestore السحابية"
            >
              <Database className="w-3.5 h-3.5 text-emerald-300" />
              <span className={`w-1.5 h-1.5 rounded-full ${cloudSyncing ? 'bg-amber-400 animate-ping' : 'bg-emerald-400 animate-pulse'}`} />
              <span className="text-[11px] font-mono hidden sm:inline">
                {cloudSyncing ? 'مزامنة...' : 'قاعدة البيانات سحابية'}
              </span>
            </div>
          )}

          {/* User Status Button */}
          {currentUser?.type === 'servant' ? (
            <div className="flex items-center gap-1 bg-amber-500/20 border border-amber-400/40 rounded-xl px-2 py-1 backdrop-blur-sm shadow-xs">
              <button
                onClick={onOpenLogin}
                className="flex items-center gap-1.5 text-xs sm:text-sm font-black text-amber-200 hover:text-white transition"
                title="انقر لتبديل حساب الخادم"
              >
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>أدمن: أ/ {currentUser.servant.name}</span>
              </button>
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="mr-1.5 px-2 py-0.5 text-[11px] font-black bg-rose-600 hover:bg-rose-500 text-white rounded-lg transition shadow-xs flex items-center gap-1"
                  title="تسجيل الخروج والعودة كزائر"
                >
                  <LogOut className="w-3 h-3" />
                  <span>خروج</span>
                </button>
              )}
            </div>
          ) : currentUser?.type === 'student' ? (
            <div className="flex items-center gap-1 bg-blue-500/20 border border-blue-400/40 rounded-xl px-2 py-1 backdrop-blur-sm shadow-xs">
              <button
                onClick={onOpenLogin}
                className="flex items-center gap-1.5 text-xs sm:text-sm font-black text-blue-200 hover:text-white transition"
                title="انقر لتبديل الحساب أو دخول الخادم"
              >
                <UserCheck className="w-4 h-4 text-blue-300" />
                <span>مخدوم: {currentUser.student.name}</span>
              </button>
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="mr-1.5 px-2 py-0.5 text-[11px] font-black bg-rose-600 hover:bg-rose-500 text-white rounded-lg transition shadow-xs flex items-center gap-1"
                  title="تسجيل الخروج والعودة كزائر"
                >
                  <LogOut className="w-3 h-3" />
                  <span>خروج</span>
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold bg-white/10 text-amber-200 rounded-xl border border-white/10">
                <Eye className="w-3.5 h-3.5 text-amber-300" />
                <span>وضع زائر (مشاهدة فقط)</span>
              </span>
              <button
                onClick={onOpenLogin}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-black bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl transition shadow-lg shadow-amber-500/30 active:scale-95 border border-amber-300"
                title="تسجيل دخول الخادم للتعديل أو المخدوم لمتابعة نقاطه"
              >
                <Lock className="w-4 h-4" />
                <span>تسجيل دخول الخادم</span>
              </button>
            </div>
          )}

          {/* Admin Buttons (Visible ONLY if servant) */}
          {isServant && (
            <>
              <button
                onClick={onOpenAddStudent}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-bold bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl transition shadow-md hover:shadow-amber-500/20 active:scale-95"
                title="إضافة ولد أو بنت جديد للخدمة"
              >
                <PlusCircle className="w-4 h-4" />
                <span>إضافة مخدوم</span>
              </button>

              <button
                onClick={onOpenAddCompetition}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-bold bg-white/10 hover:bg-white/20 text-amber-200 border border-white/15 rounded-xl transition backdrop-blur-sm active:scale-95"
                title="إضافة نقاط بونص لمسابقة أو تسجيل خصم سلوكي"
              >
                <Zap className="w-4 h-4 text-amber-400" />
                <span>بونص أو خصم نقاط</span>
              </button>

              <button
                onClick={onOpenImportExport}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-bold bg-white/10 hover:bg-white/20 text-stone-200 border border-white/15 rounded-xl transition backdrop-blur-sm active:scale-95"
                title="استيراد وتصدير داتا الأولاد"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
                <span>الداتا (Excel/JSON)</span>
              </button>

              {todayBirthdaysCount > 0 && (
                <button
                  onClick={onViewBirthdays}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-black bg-rose-600 hover:bg-rose-500 text-white rounded-xl transition shadow-lg shadow-rose-600/30 animate-pulse active:scale-95 border border-rose-300/40"
                  title="يوجد أعياد ميلاد لمخدومين اليوم! انقر للمعايدة"
                >
                  <Cake className="w-4 h-4 text-white" />
                  <span>أعياد ميلاد اليوم ({todayBirthdaysCount})</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-white/10">
        <nav className="flex space-x-1 sm:space-x-2 space-x-reverse overflow-x-auto py-2 no-scrollbar">
          {currentUser?.type === 'student' ? (
            /* Student Only Tabs */
            <>
              <button
                onClick={() => setCurrentTab('students')}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl transition whitespace-nowrap ${
                  currentTab === 'students'
                    ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/30'
                    : 'text-red-100/90 hover:text-white hover:bg-white/10'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                <span>ملفي ورصيد نقاطي</span>
              </button>

              <button
                onClick={() => setCurrentTab('leaderboard')}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl transition whitespace-nowrap ${
                  currentTab === 'leaderboard'
                    ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/30'
                    : 'text-red-100/90 hover:text-white hover:bg-white/10'
                }`}
              >
                <Trophy className="w-4 h-4" />
                <span>لوحة الشرف (فرسان الخدمة)</span>
              </button>
            </>
          ) : isServant ? (
            /* Servant Admin Tabs */
            <>
              <button
                onClick={() => setCurrentTab('attendance')}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl transition whitespace-nowrap ${
                  currentTab === 'attendance'
                    ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/30'
                    : 'text-red-100/90 hover:text-white hover:bg-white/10'
                }`}
              >
                <CalendarCheck className="w-4 h-4" />
                <span>تسجيل الحضور</span>
              </button>

              <button
                onClick={() => setCurrentTab('rewards')}
                className={`relative flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl transition whitespace-nowrap ${
                  currentTab === 'rewards'
                    ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/30'
                    : 'text-red-100/90 hover:text-white hover:bg-white/10'
                }`}
              >
                <Gift className="w-4 h-4" />
                <span>جوائز الالتزام</span>
                {unclaimedRewardsCount > 0 && (
                  <span className="flex items-center justify-center bg-red-500 text-white text-[11px] font-black w-5 h-5 rounded-full ring-2 ring-white animate-pulse">
                    {unclaimedRewardsCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setCurrentTab('leaderboard')}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl transition whitespace-nowrap ${
                  currentTab === 'leaderboard'
                    ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/30'
                    : 'text-red-100/90 hover:text-white hover:bg-white/10'
                }`}
              >
                <Trophy className="w-4 h-4" />
                <span>لوحة الشرف (الفرسان)</span>
              </button>

              <button
                onClick={() => setCurrentTab('reports')}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl transition whitespace-nowrap ${
                  currentTab === 'reports'
                    ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/30'
                    : 'text-red-100/90 hover:text-white hover:bg-white/10'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>التقارير الشهرية</span>
              </button>

              <button
                onClick={() => setCurrentTab('students')}
                className={`relative flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl transition whitespace-nowrap ${
                  currentTab === 'students'
                    ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/30'
                    : 'text-red-100/90 hover:text-white hover:bg-white/10'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>سجل المخدومين</span>
                {todayBirthdaysCount > 0 && (
                  <span className="flex items-center justify-center bg-rose-500 text-white text-[11px] font-black px-1.5 py-0.5 rounded-full ring-2 ring-white animate-pulse">
                    🎂 {todayBirthdaysCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setCurrentTab('settings')}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl transition whitespace-nowrap ${
                  currentTab === 'settings'
                    ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/30'
                    : 'text-red-100/90 hover:text-white hover:bg-white/10'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>لوحة التحكم والقواعد</span>
              </button>
            </>
          ) : (
            /* Visitor / Guest Tabs (Read-only safe views) */
            <>
              <button
                onClick={() => setCurrentTab('leaderboard')}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl transition whitespace-nowrap ${
                  currentTab === 'leaderboard'
                    ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/30'
                    : 'text-red-100/90 hover:text-white hover:bg-white/10'
                }`}
              >
                <Trophy className="w-4 h-4" />
                <span>لوحة الشرف (الفرسان)</span>
              </button>

              <button
                onClick={() => setCurrentTab('attendance')}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl transition whitespace-nowrap ${
                  currentTab === 'attendance'
                    ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/30'
                    : 'text-red-100/90 hover:text-white hover:bg-white/10'
                }`}
              >
                <CalendarCheck className="w-4 h-4" />
                <span>سجل الحضور</span>
                <span className="text-[10px] bg-white/20 text-white px-1.5 py-0.5 rounded-md font-bold">
                  مشاهدة
                </span>
              </button>

              <button
                onClick={() => setCurrentTab('rewards')}
                className={`relative flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl transition whitespace-nowrap ${
                  currentTab === 'rewards'
                    ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/30'
                    : 'text-red-100/90 hover:text-white hover:bg-white/10'
                }`}
              >
                <Gift className="w-4 h-4" />
                <span>جوائز الالتزام</span>
              </button>

              <button
                onClick={() => setCurrentTab('students')}
                className={`relative flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl transition whitespace-nowrap ${
                  currentTab === 'students'
                    ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/30'
                    : 'text-red-100/90 hover:text-white hover:bg-white/10'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>سجل المخدومين</span>
                {todayBirthdaysCount > 0 && (
                  <span className="flex items-center justify-center bg-rose-500 text-white text-[11px] font-black px-1.5 py-0.5 rounded-full ring-2 ring-white animate-pulse">
                    🎂 {todayBirthdaysCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setCurrentTab('reports')}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl transition whitespace-nowrap ${
                  currentTab === 'reports'
                    ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/30'
                    : 'text-red-100/90 hover:text-white hover:bg-white/10'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>التقارير الشهرية</span>
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

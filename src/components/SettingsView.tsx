import React, { useState } from 'react';
import { RewardTier, PointsRuleConfig, AppState, ServiceSession } from '../types';
import { 
  Settings, 
  Gift, 
  Sparkles, 
  Plus, 
  Trash2, 
  Save, 
  RotateCcw, 
  Check, 
  Church, 
  Flame, 
  Award, 
  AlertTriangle,
  Database,
  RefreshCw,
  Calendar,
  AlertCircle,
  X,
  CheckCircle2,
  History,
  Clock,
  Bell,
  Smartphone,
  Send,
  Download,
  Monitor
} from 'lucide-react';
import { 
  isNotificationSupported, 
  getNotificationPermission, 
  requestNotificationPermission, 
  sendTestNotification 
} from '../utils/notifications';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface SettingsViewProps {
  rewardTiers: RewardTier[];
  pointsRules: PointsRuleConfig;
  churchName: string;
  serviceName: string;
  patronPriests?: string;
  isCloudConnected?: boolean;
  sessions?: ServiceSession[];
  onDeleteSession?: (sessionId: string) => void;
  onUpdateRewardTiers: (tiers: RewardTier[]) => void;
  onUpdatePointsRules: (rules: PointsRuleConfig) => void;
  onUpdateChurchDetails: (churchName: string, serviceName: string, patronPriests?: string) => void;
  onResetDefaults: () => void;
  onForceCloudSync?: () => Promise<void>;
  onOpenInstallPWA?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  rewardTiers,
  pointsRules,
  churchName,
  serviceName,
  patronPriests = 'تحت رعاية: أبونا مكسيموس يوسف • أبونا دوماديوس صليب',
  isCloudConnected = true,
  sessions = [],
  onDeleteSession,
  onUpdateRewardTiers,
  onUpdatePointsRules,
  onUpdateChurchDetails,
  onResetDefaults,
  onForceCloudSync,
  onOpenInstallPWA,
}) => {
  const { canInstall, isInstalled, isStandalone, isIOS } = usePWAInstall();
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncDoneMessage, setSyncDoneMessage] = useState(false);
  // Local editable copies
  const [localTiers, setLocalTiers] = useState<RewardTier[]>(rewardTiers);
  const [localRules, setLocalRules] = useState<PointsRuleConfig>(pointsRules);
  const [localChurch, setLocalChurch] = useState(churchName);
  const [localService, setLocalService] = useState(serviceName);
  const [localPriests, setLocalPriests] = useState(patronPriests);
  const [savedSuccessMessage, setSavedSuccessMessage] = useState(false);

  // Points Cycle & Balance Reset state
  const [isResetCycleModalOpen, setIsResetCycleModalOpen] = useState(false);
  const [cycleTitleInput, setCycleTitleInput] = useState(pointsRules.pointsCycleTitle || '');
  const [cycleStartDateInput, setCycleStartDateInput] = useState(
    pointsRules.pointsCycleStartDate || new Date().toISOString().split('T')[0]
  );
  const [cycleActionMessage, setCycleActionMessage] = useState<string | null>(null);

  // Push notifications state
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(() => getNotificationPermission());
  const [testNotificationSent, setTestNotificationSent] = useState(false);

  const handleRequestNotificationPermission = async () => {
    const res = await requestNotificationPermission();
    setNotificationPermission(res);
    if (res === 'granted') {
      await sendTestNotification();
      setTestNotificationSent(true);
      setTimeout(() => setTestNotificationSent(false), 4000);
    }
  };

  const handleSendTestNotification = async () => {
    const res = await sendTestNotification();
    if (res) {
      setTestNotificationSent(true);
      setTimeout(() => setTestNotificationSent(false), 4000);
    }
  };

  React.useEffect(() => {
    setLocalRules(pointsRules);
    if (pointsRules.pointsCycleTitle) setCycleTitleInput(pointsRules.pointsCycleTitle);
    if (pointsRules.pointsCycleStartDate) setCycleStartDateInput(pointsRules.pointsCycleStartDate);
  }, [pointsRules]);

  const handleStartNewCycle = () => {
    const updatedRules: PointsRuleConfig = {
      ...localRules,
      pointsCycleStartDate: cycleStartDateInput,
      pointsCycleTitle: cycleTitleInput.trim() || 'دورة جديدة',
    };
    setLocalRules(updatedRules);
    onUpdatePointsRules(updatedRules);
    setIsResetCycleModalOpen(false);
    setCycleActionMessage('تم تصفير رصيد النقاط وبدء دورة المسابقة الجديدة بنجاح! يتم الآن احتساب نقاط لوحة الصدارة بدءاً من هذا التاريخ مع الحفاظ على كامل سجلات الحضور السابقة.');
    setTimeout(() => setCycleActionMessage(null), 6000);
  };

  const handleCancelCycleReset = () => {
    if (window.confirm('هل تريد بالتأكيد إلغاء التصفير واسترجاع احتساب جميع النقاط منذ بداية الخدمة؟')) {
      const updatedRules: PointsRuleConfig = {
        ...localRules,
        pointsCycleStartDate: undefined,
        pointsCycleTitle: undefined,
      };
      setLocalRules(updatedRules);
      onUpdatePointsRules(updatedRules);
      setCycleActionMessage('تم إلغاء التصفير واستعادة احتساب جميع النقاط التراكمية التاريخية منذ بداية الخدمة.');
      setTimeout(() => setCycleActionMessage(null), 6000);
    }
  };

  const handleSaveAll = () => {
    onUpdateRewardTiers(localTiers);
    onUpdatePointsRules(localRules);
    onUpdateChurchDetails(localChurch, localService, localPriests);
    setSavedSuccessMessage(true);
    setTimeout(() => setSavedSuccessMessage(false), 3000);
  };

  const handleTierChange = (index: number, field: keyof RewardTier, value: any) => {
    const updated = [...localTiers];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    setLocalTiers(updated);
  };

  const handleAddNewTier = () => {
    const nextStreak = localTiers.length > 0 ? Math.max(...localTiers.map((t) => t.requiredStreak)) + 4 : 4;
    const newTier: RewardTier = {
      id: `tier-${Date.now()}`,
      requiredStreak: nextStreak,
      title: `مكافأة تتابع ${nextStreak} مرات`,
      defaultGiftName: 'هدية تشجيعية مميزة',
      description: `مكافأة الالتزام لـ ${nextStreak} مرات متتالية`,
      badgeColor: 'amber',
      icon: 'Gift',
      bonusPointsReward: 30,
      enabled: true,
    };
    setLocalTiers([...localTiers, newTier]);
  };

  const handleDeleteTier = (index: number) => {
    if (localTiers.length <= 1) {
      alert('يجب الإبقاء على مستوى مكافأة واحد على الأقل.');
      return;
    }
    setLocalTiers(localTiers.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Settings className="w-6 h-6 text-amber-600" />
            <span>لوحة التحكم وتعديل قواعد الهدايا والنقاط</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            خصص عدد مرات الحضور المطلوبة لكل هدية، نقاط الأنشطة الكنسية، ونظام التقييم بحرية تامة.
          </p>
        </div>

        <button
          onClick={handleSaveAll}
          className="flex items-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black rounded-2xl transition shadow-md shadow-amber-500/20 active:scale-95 shrink-0"
        >
          {savedSuccessMessage ? <Check className="w-5 h-5 text-emerald-950" /> : <Save className="w-5 h-5" />}
          <span>{savedSuccessMessage ? 'تم الحفظ بنجاح!' : 'حفظ التعديلات'}</span>
        </button>
      </div>

      {/* Cloud Database Integration Status Card */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 rounded-3xl p-5 text-white shadow-md border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shrink-0">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-emerald-200">
                قاعدة بيانات سحابية متصلة (Firebase Firestore)
              </h3>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                مباشر
              </span>
            </div>
            <p className="text-xs text-emerald-100/80 mt-0.5">
              بيانات المخدومين، الحضور، المسابقات، والقواعد يتم حفظها ومزامنتها لحظياً في السحابة لتعمل على كل الأجهزة والهواتف.
            </p>
          </div>
        </div>

        {onForceCloudSync && (
          <button
            type="button"
            onClick={async () => {
              try {
                setIsSyncing(true);
                await onForceCloudSync();
                setSyncDoneMessage(true);
                setTimeout(() => setSyncDoneMessage(false), 3000);
              } catch (e) {
                console.error(e);
              } finally {
                setIsSyncing(false);
              }
            }}
            disabled={isSyncing}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black text-xs rounded-xl transition shadow-md shrink-0 active:scale-95 disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'جاري المزامنة...' : syncDoneMessage ? 'تمت المزامنة بنجاح!' : 'رفع ومزامنة كاملة الآن ☁️'}</span>
          </button>
        )}
      </div>

      {/* 1. STREAK REWARDS RULES SECTION */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-500" />
              <span>مستويات مكافآت التتابع (عدد مرات الحضور المتتالية)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              يمكنك تعديل عدد الأسابيع المطلوبة (مثلاً 4 أو 8 أو 10 مرات)، وتغيير اسم ومحتوى الهدية.
            </p>
          </div>

          <button
            onClick={handleAddNewTier}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition border border-slate-200 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة مستوى مكافأة جديد</span>
          </button>
        </div>

        <div className="space-y-4">
          {localTiers.map((tier, index) => (
            <div
              key={tier.id}
              className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-4 hover:border-amber-300 transition"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-black text-amber-900 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
                  المستوى رقم {index + 1}
                </span>

                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={tier.enabled}
                      onChange={(e) => handleTierChange(index, 'enabled', e.target.checked)}
                      className="rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span>مفعّل</span>
                  </label>

                  <button
                    onClick={() => handleDeleteTier(index)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    title="حذف هذا المستوى"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    عدد مرات الحضور المتتالية (التتابع)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="52"
                    value={tier.requiredStreak}
                    onChange={(e) => handleTierChange(index, 'requiredStreak', parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 text-sm font-bold bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">مثال: 4 مرات، 8 مرات، 10 مرات</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    عنوان المستوى
                  </label>
                  <input
                    type="text"
                    value={tier.title}
                    onChange={(e) => handleTierChange(index, 'title', e.target.value)}
                    className="w-full px-3 py-2 text-sm font-bold bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                    placeholder="مثال: هدية صغيرة (التزام 4 مرات)"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    نقاط بونص تمنح مع الهدية
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={tier.bonusPointsReward}
                    onChange={(e) => handleTierChange(index, 'bonusPointsReward', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm font-bold bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  الهدية المقترحة / الوصف
                </label>
                <input
                  type="text"
                  value={tier.defaultGiftName}
                  onChange={(e) => handleTierChange(index, 'defaultGiftName', e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                  placeholder="مثال: ميدالية ومفكرة روحيّة / باور بانك / تي شيرت الخدمة"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. POINTS EVALUATION SYSTEM */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 space-y-5">
        <div>
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-purple-600" />
            <span>نظام تقييم النقاط في كل اجتماع (البونص والالتزام)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            حدد عدد النقاط الممنوحة لكل نشاط كنسي عند تسجيل حضور المخدوم في الاجتماع.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              الحضور الأساسي للاجتماع
            </label>
            <input
              type="number"
              min="0"
              value={localRules.attendanceBase}
              onChange={(e) => setLocalRules({ ...localRules, attendanceBase: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 text-sm font-black bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500"
            />
            <p className="text-[11px] text-slate-400">تمنح تلقائياً عند تسجيل المخدوم كـ "حاضر".</p>
          </div>

          <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-200 space-y-1.5">
            <label className="block text-xs font-bold text-purple-900">
              حضور القداس الإلهي
            </label>
            <input
              type="number"
              min="0"
              value={localRules.liturgy}
              onChange={(e) => setLocalRules({ ...localRules, liturgy: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 text-sm font-black bg-white border border-purple-300 rounded-xl focus:ring-2 focus:ring-purple-500"
            />
            <p className="text-[11px] text-purple-700/80">تشجيع حضور القداس والتناول.</p>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200 space-y-1.5">
            <label className="block text-xs font-bold text-blue-900">
              حفظ الآية الأسبوعية
            </label>
            <input
              type="number"
              min="0"
              value={localRules.verse}
              onChange={(e) => setLocalRules({ ...localRules, verse: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 text-sm font-black bg-white border border-blue-300 rounded-xl focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-[11px] text-blue-700/80">تمنح عند تسميع آية الدرس للخادم.</p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-1.5">
            <label className="block text-xs font-bold text-emerald-900">
              الالتزام في الصلاة
            </label>
            <input
              type="number"
              min="0"
              value={localRules.prayer}
              onChange={(e) => setLocalRules({ ...localRules, prayer: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 text-sm font-black bg-white border border-emerald-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
            />
            <p className="text-[11px] text-emerald-700/80">الخشوع والوقوف بوقار أثناء صلاة الاجتماع.</p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200 space-y-1.5">
            <label className="block text-xs font-bold text-amber-900">
              المشاركة والتفاعل الفعّال
            </label>
            <input
              type="number"
              min="0"
              value={localRules.participation}
              onChange={(e) => setLocalRules({ ...localRules, participation: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 text-sm font-black bg-white border border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-500"
            />
            <p className="text-[11px] text-amber-700/80">التفاعل في الدرس والإجابة على الأسئلة.</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                قاعدة الاعتذار المسبق والتتابع
              </label>
              <label className="flex items-center gap-2 cursor-pointer mt-2 text-xs font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={localRules.streakPreserveOnExcuse}
                  onChange={(e) => setLocalRules({ ...localRules, streakPreserveOnExcuse: e.target.checked })}
                  className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
                />
                <span>الاعتذار المسبق يحفظ تتابع الحضور ولا يصفّره</span>
              </label>
            </div>
            <p className="text-[10px] text-slate-400 mt-2">
              (إذا تم التعطيل، فإن الاعتذار مثل الغياب سيبدأ التتابع من جديد).
            </p>
          </div>
        </div>
      </div>

      {/* 3. CHURCH & SERVICE BRANDING */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 space-y-4">
        <div>
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
            <Church className="w-5 h-5 text-amber-600" />
            <span>بيانات الكنيسة والخدمة</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">تظهر في أعلى الصفحة والتقارير المطبوعة.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">اسم الكنيسة</label>
            <input
              type="text"
              value={localChurch}
              onChange={(e) => setLocalChurch(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">اسم الخدمة والمرحلة</label>
            <input
              type="text"
              value={localService}
              onChange={(e) => setLocalService(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">رعاية الآباء الكهنة</label>
            <input
              type="text"
              value={localPriests}
              onChange={(e) => setLocalPriests(e.target.value)}
              placeholder="مثال: تحت رعاية: أبونا مكسيموس يوسف • أبونا دوماديوس صليب"
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              تظهر في شهادات وأوسمة التكريم الصادرة للمخدومين وأعلى المنصة.
            </p>
          </div>
        </div>
      </div>

      {/* 4. POINTS CYCLE & RESET SECTION (تصفير رصيد النقاط وبدء دورة مسابقة جديدة) */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-600" />
              <span>إدارة دورات المسابقة وتصفير رصيد النقاط</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              لتوزيع الجوائز عند نهاية فترة معينة (ترم، مسابقة صوم، أو مهرجان) والبدء من جديد مع الحفاظ الكامل على سجلات الحضور.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {localRules.pointsCycleStartDate ? (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsResetCycleModalOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl transition shadow-xs cursor-pointer active:scale-95"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>تصفير مجدداً وبدء دورة جديدة</span>
                </button>
                <button
                  type="button"
                  onClick={handleCancelCycleReset}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition cursor-pointer"
                  title="استرجاع احتساب كل النقاط منذ بداية الخدمة"
                >
                  <History className="w-3.5 h-3.5" />
                  <span>إلغاء التصفير واسترجاع كل النقاط</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsResetCycleModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 rounded-xl transition shadow-sm cursor-pointer active:scale-95"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>تصفير رصيد النقاط وبدء دورة جديدة</span>
              </button>
            )}
          </div>
        </div>

        {cycleActionMessage && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-900 font-semibold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{cycleActionMessage}</span>
          </div>
        )}

        {/* Current status display */}
        {localRules.pointsCycleStartDate ? (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-lg bg-amber-500 text-stone-950 font-black text-xs">
                  دورة نشطة حالياً
                </span>
                <span className="font-bold text-slate-900 text-sm">
                  {localRules.pointsCycleTitle || 'دورة المسابقة الحالية'}
                </span>
              </div>
              <p className="text-xs text-amber-950">
                بدأ احتساب النقاط من تاريخ: <b className="text-amber-900">{localRules.pointsCycleStartDate}</b>.
                الترتيب في لوحة الصدارة وكروت الإنجاز يبدأ العد من هذا التاريخ.
              </p>
            </div>
            <div className="text-left sm:text-right shrink-0">
              <span className="text-[11px] font-bold text-slate-500 block">حالة السجلات التاريخية:</span>
              <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                محفوظة بالكامل دون حذف
              </span>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>الوضع الافتراضي مفعل: يتم احتساب النقاط تراكمياً شاملة جميع اللقاءات منذ بداية تدشين الخدمة.</span>
            </div>
            <span className="font-bold text-slate-500">حساب شامل مستمر</span>
          </div>
        )}
      </div>

      {/* Modal: Start New Points Cycle */}
      {isResetCycleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-amber-600">
                <RotateCcw className="w-5 h-5" />
                <h3 className="font-black text-slate-900 text-base">تصفير رصيد النقاط وبدء دورة جديدة</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsResetCycleModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  اسم أو عنوان الدورة / المسابقة:
                </label>
                <input
                  type="text"
                  placeholder="مثال: دورة الصوم الكبير 2026 أو مسابقة الصيف"
                  value={cycleTitleInput}
                  onChange={(e) => setCycleTitleInput(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  تاريخ بدء احتساب النقاط الجديدة (تاريخ التصفير):
                </label>
                <input
                  type="date"
                  value={cycleStartDateInput}
                  onChange={(e) => setCycleStartDateInput(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  سيتم بدء احتساب نقاط الحضور والأنشطة والمسابقات التي تقع في هذا التاريخ أو بعده.
                </p>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-2xl text-[11px] text-amber-950 space-y-1 leading-relaxed">
                <p className="font-bold flex items-center gap-1 text-amber-900">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
                  <span>تأكيد أمان البيانات:</span>
                </p>
                <p>
                  • لا يتم حذف أي طالب أو سجلات غياب وحضور سابقة.
                </p>
                <p>
                  • تبدأ لوحة الصدارة بحساب النقاط من الصفر للجميع لمنح فرصة عادلة.
                </p>
                <p>
                  • يمكنك في أي وقت إلغاء التصفير واسترجاع النقاط القديمة بضغطة زر.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsResetCycleModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleStartNewCycle}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-black bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl transition shadow-md cursor-pointer active:scale-95"
              >
                <Check className="w-3.5 h-3.5" />
                <span>تأكيد التصفير وبدء الدورة</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. PUSH NOTIFICATIONS SETTINGS SECTION */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Bell className="w-5 h-5 text-amber-600" />
              <span>إشعارات الموبايل والنظام الخارجية (Push Notifications)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              تصلك تنبيهات بأعياد ميلاد المخدومين وإحصائيات الحضور الاستثنائية (عند تخطي 90%) مباشرة على شاشة قفل الهاتف وسطح المكتب مثل فيسبوك.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isNotificationSupported() ? (
              notificationPermission === 'granted' ? (
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>مفعّلة على هذا الجهاز</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleSendTestNotification}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition cursor-pointer active:scale-95"
                    title="إرسال إشعار تجريبي لاختبار التنبيه فوراً"
                  >
                    <Send className="w-3.5 h-3.5 text-amber-600" />
                    <span>{testNotificationSent ? 'تم الإرسال!' : 'تجربة إشعار'}</span>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleRequestNotificationPermission}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-black bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl transition shadow-md shadow-amber-500/20 cursor-pointer active:scale-95"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>تفعيل إشعارات الهاتف الآن</span>
                </button>
              )
            ) : (
              <span className="text-xs text-slate-400 font-medium">
                متصفحك الحالي لا يدعم Web Notifications
              </span>
            )}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-950">
          <div className="space-y-1">
            <span className="font-bold text-amber-900 block">
              💡 ما هي التنبيهات التي يتم إرسالها تلقائياً؟
            </span>
            <ul className="list-disc list-inside space-y-0.5 text-amber-900/90 text-[11px]">
              <li><b>أعياد ميلاد المخدومين</b>: إشعار صباحي يوم عيد ميلاد أي مخدوم مع رابط معايدة سريع عبر واتساب.</li>
              <li><b>أرقام قياسية ونسب الحضور</b>: إشعار احتفالي فور تجاوز نسبة حضور أي لقاء حاجز الـ 90%.</li>
              <li><b>أبطال الالتزام التام</b>: إشعار عند تحقيق مخدوم لسلسلة حضور استثنائية (ستريك 5، 10، 15 أسبوع بدون غياب).</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 6. PWA MOBILE APP INSTALLATION SECTION (تطبيق الهاتف والموبايل) */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-amber-600" />
              <span>تطبيق الهاتف الذكي للمنصة (Progressive Web App - PWA)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              يمكن تثبيت المنصة على أي هاتف (أندرويد أو آيفون) أو جهاز كمبيوتر كتطبيق مستقل خفيف وسريع بكامل الشاشة وبدون الحاجة لمتجر تطبيقات.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isStandalone ? (
              <span className="px-3.5 py-1.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>المنصة تعمل كتطبيق مثبت حالياً</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={onOpenInstallPWA}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-black bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 rounded-xl transition shadow-md shadow-amber-500/20 cursor-pointer active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>تثبيت التطبيق على جهازك الآن 📲</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-1">
            <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>شاشة كاملة وتجربة أصلية</span>
            </span>
            <p className="text-[11px] text-slate-500 leading-tight">
              تصفح خالي من أشرطة المتصفح المزدحمة وأيقونة مخصصة للخدمة على شاشة هاتفك الرئيسية.
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-1">
            <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 text-amber-500" />
              <span>إشعارات حية وتلقائية</span>
            </span>
            <p className="text-[11px] text-slate-500 leading-tight">
              تنبيهات فورية بأعياد ميلاد المخدومين وإحصائيات الحضور القياسية على قفل الشاشة.
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-1">
            <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
              <Monitor className="w-3.5 h-3.5 text-amber-500" />
              <span>توافق مع كافة الأنظمة</span>
            </span>
            <p className="text-[11px] text-slate-500 leading-tight">
              يعمل بسلاسة فائقة على Android و iPhone و iPad و Windows و Mac بدون استهلاك ذاكرة الهاتف.
            </p>
          </div>
        </div>
      </div>

      {/* 7. SESSIONS MANAGEMENT SECTION (حذف وإدارة اللقاءات) */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 space-y-4">
        <div>
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-600" />
            <span>إدارة لقاءات الخدمة المسجلة</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            إذا تم إنشاء لقاء عن طريق الخطأ أو تم إلغاؤه في الواقع، يمكنك حذفه نهائياً من هنا أو من شاشة الحضور الرئيسية.
          </p>
        </div>

        {sessions.length === 0 ? (
          <div className="text-center py-6 px-4 bg-slate-50 border border-slate-200 rounded-2xl">
            <p className="text-xs text-slate-500 font-bold">لا توجد لقاءات مسجلة حالياً.</p>
          </div>
        ) : (
          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
            {sessions.map((sess) => {
              const attendeesCount = Object.values(sess.records || {}).filter((r) => r.status === 'present').length;
              const totalRecords = Object.keys(sess.records || {}).length;
              return (
                <div
                  key={sess.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-50 hover:bg-amber-50/40 border border-slate-200 transition"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-900">{sess.title}</span>
                      <span className="text-[11px] font-bold text-amber-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-lg">
                        {sess.date}
                      </span>
                      {sess.speakerServant && (
                        <span className="text-[10px] text-slate-600 font-semibold hidden sm:inline">
                          (الخادم: {sess.speakerServant})
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500">
                      <span>حاضرون: <b className="text-emerald-700">{attendeesCount}</b></span>
                      <span>إجمالي المسجلين: <b>{totalRecords}</b></span>
                      {sess.verseOfTheWeek && (
                        <span className="truncate max-w-xs text-slate-400">آية: {sess.verseOfTheWeek}</span>
                      )}
                    </div>
                  </div>

                  {onDeleteSession && (
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`هل أنت متأكد من حذف لقاء "${sess.title}" بتاريخ ${sess.date}؟ سيتم حذف جميع تسجيلات الحضور الخاصة بهذا اللقاء.`)) {
                          onDeleteSession(sess.id);
                        }
                      }}
                      className="self-end sm:self-center flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition cursor-pointer active:scale-95"
                      title="حذف هذا اللقاء نهائياً"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                      <span>حذف اللقاء</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. ACTIONS & RESET */}
      <div className="p-5 rounded-3xl bg-slate-100 border border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>إعادة ضبط قواعد الهدايا والنقاط للقيم الأصلية مع الحفاظ على النظام نظيفاً بدون ديمو.</span>
        </div>

        <button
          onClick={() => {
            if (window.confirm('هل أنت متأكد من استعادة القواعد الافتراضية للخدمة؟')) {
              onResetDefaults();
            }
          }}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100/80 rounded-xl transition self-start sm:self-auto border border-rose-200 bg-white cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>استعادة القواعد الافتراضية للخدمة</span>
        </button>
      </div>
    </div>
  );
};

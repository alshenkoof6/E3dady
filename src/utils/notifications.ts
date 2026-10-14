import { AppState, AppNotification, Student } from '../types';
import { calculateAge, isBirthdayToday } from './birthday';
import { calculateStudentStats } from './calculations';

const READ_NOTIFICATIONS_STORAGE_KEY = 'church_prep_read_notification_ids';
const PUSHED_NOTIFICATIONS_STORAGE_KEY = 'church_prep_pushed_notification_dates';

/**
 * Returns list of IDs of notifications marked as read
 */
export function getReadNotificationIds(): string[] {
  try {
    const raw = localStorage.getItem(READ_NOTIFICATIONS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Marks a specific notification as read
 */
export function markNotificationAsRead(id: string): void {
  try {
    const read = getReadNotificationIds();
    if (!read.includes(id)) {
      read.push(id);
      localStorage.setItem(READ_NOTIFICATIONS_STORAGE_KEY, JSON.stringify(read));
    }
  } catch (e) {
    console.error('Error saving read notification:', e);
  }
}

/**
 * Marks all given notification IDs as read
 */
export function markAllNotificationsAsRead(ids: string[]): void {
  try {
    const read = getReadNotificationIds();
    const set = new Set([...read, ...ids]);
    localStorage.setItem(READ_NOTIFICATIONS_STORAGE_KEY, JSON.stringify(Array.from(set)));
  } catch (e) {
    console.error('Error marking all as read:', e);
  }
}

/**
 * Checks if browser supports the Web Notification API
 */
export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

/**
 * Gets current browser notification permission
 */
export function getNotificationPermission(): NotificationPermission {
  if (!isNotificationSupported()) return 'denied';
  return Notification.permission;
}

/**
 * Requests browser permission for notifications
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) return 'denied';
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (err) {
    console.error('Error requesting notification permission:', err);
    return 'denied';
  }
}

/**
 * Triggers a real native system notification on the user's phone or desktop
 */
export function sendSystemNotification(
  title: string, 
  options?: { body?: string; icon?: string; tag?: string; badge?: string }
): boolean {
  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return false;
  }

  try {
    const notifOptions: NotificationOptions = {
      body: options?.body,
      icon: options?.icon || 'https://images.unsplash.com/photo-1544427920-c49ccfb85579?w=128&auto=format&fit=crop&q=80',
      badge: options?.badge || 'https://images.unsplash.com/photo-1544427920-c49ccfb85579?w=72&auto=format&fit=crop&q=80',
      tag: options?.tag,
      dir: 'rtl',
      lang: 'ar',
    };

    const notif = new Notification(title, notifOptions);
    notif.onclick = () => {
      window.focus();
      notif.close();
    };
    return true;
  } catch (e) {
    console.warn('Native notification failed, falling back:', e);
    return false;
  }
}

/**
 * Sends a test notification to verify push works
 */
export async function sendTestNotification(): Promise<boolean> {
  let perm = getNotificationPermission();
  if (perm !== 'granted') {
    perm = await requestNotificationPermission();
  }
  if (perm !== 'granted') {
    return false;
  }

  return sendSystemNotification('🔔 تجربة إشعارات خدمة المرحلة الإعدادية', {
    body: 'مرحباً بك! الإشعارات الخارجية تعمل بنجاح. ستصلك تنبيهات أعياد الميلاد والإحصائيات الاستثنائية فور حدوثها.',
    tag: 'test-notification-' + Date.now(),
  });
}

/**
 * Dispatches high-priority system notifications once per day so the user isn't spammed
 */
export function dispatchExternalNotificationsIfDue(notifications: AppNotification[]): void {
  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return;
  }

  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const pushedRaw = localStorage.getItem(PUSHED_NOTIFICATIONS_STORAGE_KEY);
    const pushedMap: Record<string, string> = pushedRaw ? JSON.parse(pushedRaw) : {};

    // Filter high-priority unread items (birthdays and record milestones)
    const priorityItems = notifications.filter(
      (n) => (n.priority === 'high' || n.category === 'birthday') && !n.isRead
    );

    let sentAny = false;
    for (const item of priorityItems.slice(0, 3)) { // Max 3 notifications per sync to avoid overwhelming
      const key = `${item.id}_${todayStr}`;
      if (!pushedMap[key]) {
        const sent = sendSystemNotification(item.title, {
          body: item.message,
          tag: item.id,
        });
        if (sent) {
          pushedMap[key] = todayStr;
          sentAny = true;
        }
      }
    }

    if (sentAny) {
      localStorage.setItem(PUSHED_NOTIFICATIONS_STORAGE_KEY, JSON.stringify(pushedMap));
    }
  } catch (err) {
    console.error('Error dispatching external notifications:', err);
  }
}

/**
 * Intelligently generates comprehensive list of notifications from AppState
 */
export function generateAppNotifications(appState: AppState): AppNotification[] {
  const notifications: AppNotification[] = [];
  const readIds = new Set(getReadNotificationIds());
  const todayStr = new Date().toISOString().split('T')[0];

  // 1. BIRTHDAYS TODAY
  const birthdayStudents = appState.students.filter((s) => isBirthdayToday(s.birthDate));
  birthdayStudents.forEach((student) => {
    const age = calculateAge(student.birthDate);
    const id = `birthday-${student.id}-${todayStr}`;
    notifications.push({
      id,
      category: 'birthday',
      priority: 'high',
      title: `🎂 عيد ميلاد اليوم: ${student.name}`,
      message: `اليوم نحتفل بعيد ميلاد ${student.name}${age ? ` بمناسبة إتمامه ${age} سنة` : ''}! لا تنسَ معايدته بالحب والفرحة 🎉`,
      timestamp: new Date().toISOString(),
      dateLabel: 'اليوم',
      studentId: student.id,
      studentName: student.name,
      studentPhone: student.phone || student.parentPhone,
      studentPhoto: student.photoUrl,
      badgeText: 'عيد ميلاد 🎂',
      actionType: 'whatsapp',
      isRead: readIds.has(id),
    });
  });

  // Precompute calculated stats for all students
  const studentStatsMap = new Map<string, ReturnType<typeof calculateStudentStats>>();
  appState.students.forEach((student) => {
    studentStatsMap.set(
      student.id,
      calculateStudentStats(
        student,
        appState.sessions,
        appState.pointsRules,
        appState.competitionLogs,
        appState.rewardTiers
      )
    );
  });

  // 2. EXCEPTIONAL ATTENDANCE MILESTONES (>= 90%)
  if (appState.sessions && appState.sessions.length > 0) {
    // Check all sessions or recent sessions for >= 90% attendance
    const sortedSessions = [...appState.sessions].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    sortedSessions.forEach((session, index) => {
      const records = Object.values(session.records || {});
      const totalStudentsCount = appState.students.length;
      if (totalStudentsCount < 3) return; // Need at least 3 students for meaningful stats

      const presentCount = records.filter((r) => r.status === 'present').length;
      const attendanceRate = Math.round((presentCount / totalStudentsCount) * 100);

      // Milestone condition: >= 90%
      if (attendanceRate >= 90 && presentCount >= 3) {
        const id = `milestone-attendance-90-${session.id}`;
        const isLatest = index === 0;
        notifications.push({
          id,
          category: 'milestone',
          priority: isLatest ? 'high' : 'normal',
          title: `نسبة حضور استثنائية: ${attendanceRate}%! 🚀`,
          message: `في لقاء "${session.title}" (${session.date}) تجاوزت نسبة الحضور ${attendanceRate}% بحضور ${presentCount} من أصل ${totalStudentsCount} مخدوم! عاش مجهود الخدام 👏`,
          timestamp: session.date,
          dateLabel: isLatest ? 'أحدث لقاء' : session.date,
          sessionId: session.id,
          metricValue: `${attendanceRate}%`,
          badgeText: `إنجاز حضور ${attendanceRate}% 📈`,
          actionType: 'view_attendance',
          isRead: readIds.has(id),
        });
      }
    });
  }

  // 3. CONSECUTIVE STREAK MILESTONES (أبطال المواظبة الذهبية)
  appState.students.forEach((student) => {
    const stats = studentStatsMap.get(student.id);
    if (!stats) return;

    // Check key streak milestones: 5, 8, 10, 15, 20
    const streakMilestones = [20, 15, 10, 8, 5];
    const achievedMilestone = streakMilestones.find((m) => stats.currentStreak >= m);

    if (achievedMilestone) {
      const id = `milestone-streak-${student.id}-${achievedMilestone}`;
      notifications.push({
        id,
        category: 'milestone',
        priority: achievedMilestone >= 10 ? 'high' : 'normal',
        title: `بطل مواظبة بدون غياب! 🔥 (${achievedMilestone} لقاءات)`,
        message: `المخدوم ${student.name} (${student.family}) حقق سلسلة التزام مبهرة بـ ${stats.currentStreak} لقاءات متتالية! تستحق التقدير والتشجيع 👏`,
        timestamp: new Date().toISOString(),
        dateLabel: 'مستمر الآن',
        studentId: student.id,
        studentName: student.name,
        studentPhoto: student.photoUrl,
        metricValue: `${stats.currentStreak} لقاء`,
        badgeText: `ستريك ${stats.currentStreak} 🔥`,
        actionType: 'view_student',
        isRead: readIds.has(id),
      });
    }
  });

  // 4. POINTS MILESTONES (100, 250, 500, 1000)
  appState.students.forEach((student) => {
    const stats = studentStatsMap.get(student.id);
    if (!stats) return;

    const pointsMilestones = [1000, 500, 250, 100];
    const achievedPointsMilestone = pointsMilestones.find((p) => stats.totalPoints >= p);

    if (achievedPointsMilestone) {
      const id = `milestone-points-${student.id}-${achievedPointsMilestone}`;
      notifications.push({
        id,
        category: 'milestone',
        priority: 'normal',
        title: `تخطي حاجز ${achievedPointsMilestone} نقطة! ⭐️`,
        message: `تألق المخدوم ${student.name} وكسر حاجز ${achievedPointsMilestone} نقطة برصيد إجمالي ${stats.totalPoints} نقطة في لوحة الشرف! 🏆`,
        timestamp: new Date().toISOString(),
        dateLabel: 'رصيد النقاط',
        studentId: student.id,
        studentName: student.name,
        studentPhoto: student.photoUrl,
        metricValue: `${stats.totalPoints} نقطة`,
        badgeText: `${stats.totalPoints} نقطة ⭐️`,
        actionType: 'view_leaderboard',
        isRead: readIds.has(id),
      });
    }
  });

  // 5. UNCLAIMED REWARDS (جوائز مستحقة للتسليم)
  appState.students.forEach((student) => {
    const stats = studentStatsMap.get(student.id);
    if (!stats) return;

    stats.eligibleTiers.forEach((et) => {
      if (et.canClaimNow) {
        const tier = et.tier;
        const id = `reward-unclaimed-${student.id}-${tier.id}`;
        notifications.push({
          id,
          category: 'reward',
          priority: 'high',
          title: `هدية مستحقة بانتظار التسليم 🎁`,
          message: `المخدوم ${student.name} أنجز التزام ${tier.requiredStreak} لقاءات واستحق "${tier.title}" (${tier.defaultGiftName}).`,
          timestamp: new Date().toISOString(),
          dateLabel: 'بانتظار التسليم',
          studentId: student.id,
          studentName: student.name,
          studentPhoto: student.photoUrl,
          badgeText: tier.title,
          actionType: 'view_rewards',
          isRead: readIds.has(id),
        });
      }
    });
  });

  // 6. POINTS CYCLE NOTIFICATION
  if (appState.pointsRules.pointsCycleStartDate) {
    const id = `cycle-active-${appState.pointsRules.pointsCycleStartDate}`;
    notifications.push({
      id,
      category: 'cycle',
      priority: 'low',
      title: `دورة مسابقة نشطة 🏆`,
      message: `${appState.pointsRules.pointsCycleTitle || 'دورة جديدة'}: تم بدء احتساب نقاط الترتيب من تاريخ ${appState.pointsRules.pointsCycleStartDate}، مع بقاء كافة سجلات الحضور محفوظة بالكامل.`,
      timestamp: appState.pointsRules.pointsCycleStartDate,
      dateLabel: appState.pointsRules.pointsCycleStartDate,
      badgeText: 'دورة جارية',
      actionType: 'view_leaderboard',
      isRead: readIds.has(id),
    });
  }

  // Sort notifications: unread first, then by priority (high > normal > low), then by category
  const priorityWeight: Record<string, number> = { high: 3, normal: 2, low: 1 };
  notifications.sort((a, b) => {
    if (a.isRead !== b.isRead) {
      return a.isRead ? 1 : -1;
    }
    const weightDiff = (priorityWeight[b.priority] || 1) - (priorityWeight[a.priority] || 1);
    if (weightDiff !== 0) return weightDiff;
    return 0;
  });

  return notifications;
}

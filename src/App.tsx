import React, { useState, useEffect, useMemo } from 'react';
import { 
  AppState, 
  Student, 
  ServiceSession, 
  RewardTier, 
  PointsRuleConfig, 
  CompetitionLog, 
  AttendanceStatus, 
  ClaimedReward,
  ServantAccount,
  CurrentUser
} from './types';
import { loadAppState, saveAppState, resetToDefaults } from './utils/storage';
import { initialServants } from './data/initialData';
import { calculateStudentStats } from './utils/calculations';
import { Header } from './components/Header';
import { AttendanceView } from './components/AttendanceView';
import { RewardsTracker } from './components/RewardsTracker';
import { LeaderboardView } from './components/LeaderboardView';
import { MonthlyReportsView } from './components/MonthlyReportsView';
import { StudentsView } from './components/StudentsView';
import { SettingsView } from './components/SettingsView';
import { AddStudentModal } from './components/AddStudentModal';
import { AddCompetitionModal } from './components/AddCompetitionModal';
import { ImportExportModal } from './components/ImportExportModal';
import { GiftDeliveryModal } from './components/GiftDeliveryModal';
import { StudentProfileModal } from './components/StudentProfileModal';
import { LoginModal } from './components/LoginModal';
import { StudentPortalView } from './components/StudentPortalView';
import { AchievementCardModal, AchievementTitleType } from './components/AchievementCardModal';
import { BirthdayNotificationBanner } from './components/BirthdayNotificationBanner';
import { getTodayBirthdays } from './utils/birthday';
import { 
  testConnection, 
  subscribeToDatabase, 
  loginWithGoogle, 
  logoutGoogle, 
  syncStudentToFirestore, 
  deleteStudentFromFirestore, 
  syncSessionToFirestore, 
  deleteSessionFromFirestore, 
  syncCompetitionToFirestore, 
  syncSettingsToFirestore, 
  uploadFullStateToFirestore,
  auth 
} from './services/firebase';

export default function App() {
  const [appState, setAppState] = useState<AppState>(() => loadAppState());
  // Current user authentication (default is null for normal visitor / guest)
  const [currentUser, setCurrentUser] = useState<CurrentUser>(() => {
    try {
      const saved = localStorage.getItem('church_prep_current_user');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    // Default to Guest (null) - normal visitor mode
    return null;
  });

  const [currentTab, setCurrentTab] = useState<'attendance' | 'rewards' | 'leaderboard' | 'reports' | 'students' | 'settings'>(() => {
    try {
      const saved = localStorage.getItem('church_prep_current_user');
      if (saved) {
        const u = JSON.parse(saved);
        if (u.type === 'servant') return 'attendance';
      }
    } catch (e) {}
    return 'leaderboard';
  });

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Active session for attendance tracking
  const [currentSessionId, setCurrentSessionId] = useState<string>(() => {
    const sessions = appState.sessions;
    return sessions.length > 0 ? sessions[sessions.length - 1].id : '';
  });

  // Modal Dialogs state
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isAddCompetitionOpen, setIsAddCompetitionOpen] = useState(false);
  const [competitionModalMode, setCompetitionModalMode] = useState<'bonus' | 'penalty'>('bonus');
  const [competitionModalStudentId, setCompetitionModalStudentId] = useState<string | undefined>(undefined);
  const [isImportExportOpen, setIsImportExportOpen] = useState(false);
  const [profileStudent, setProfileStudent] = useState<Student | null>(null);
  const [rewardDeliveryData, setRewardDeliveryData] = useState<{ student: Student; tier: RewardTier } | null>(null);
  const [achievementModalData, setAchievementModalData] = useState<{ student: Student; title?: AchievementTitleType } | null>(null);

  // Cloud Database synchronization states
  const [isCloudConnected, setIsCloudConnected] = useState(true);
  const [cloudSyncing, setCloudSyncing] = useState(false);

  // Auto-save to localStorage whenever appState changes
  useEffect(() => {
    saveAppState(appState);
  }, [appState]);

  // Initial cloud connection check and real-time synchronization listener
  useEffect(() => {
    testConnection().then((connected) => setIsCloudConnected(connected));

    const unsubscribe = subscribeToDatabase(
      (cloudData) => {
        setAppState((prev) => {
          let updated = { ...prev };
          let hasChanges = false;

          if (cloudData.students !== undefined && cloudData.students.length > 0) {
            updated.students = cloudData.students;
            hasChanges = true;
          }

          if (cloudData.sessions !== undefined && cloudData.sessions.length > 0) {
            updated.sessions = cloudData.sessions;
            hasChanges = true;
          }

          if (cloudData.competitions !== undefined && cloudData.competitions.length > 0) {
            updated.competitionLogs = cloudData.competitions;
            hasChanges = true;
          }

          if (cloudData.settings) {
            if (cloudData.settings.churchName && cloudData.settings.churchName !== 'خدمة المرحلة الإعدادية في الكنيسة' && cloudData.settings.churchName !== 'كنيسة القديسين') {
              updated.churchName = cloudData.settings.churchName;
            } else {
              updated.churchName = 'كنيسة السيدة العذراء مريم بسدود';
            }
            if (cloudData.settings.serviceName) updated.serviceName = cloudData.settings.serviceName;
            updated.patronPriests = cloudData.settings.patronPriests || 'تحت رعاية: أبونا مكسيموس يوسف • أبونا دوماديوس صليب';
            if (cloudData.settings.pointsRules) updated.pointsRules = cloudData.settings.pointsRules;
            if (cloudData.settings.rewardTiers) updated.rewardTiers = cloudData.settings.rewardTiers;
            hasChanges = true;
          }

          return hasChanges ? updated : prev;
        });
        setIsCloudConnected(true);
      },
      (error) => {
        console.warn('Real-time sync notification:', error);
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  // Keep currentSessionId valid if sessions list changes
  useEffect(() => {
    if (appState.sessions.length > 0) {
      const exists = appState.sessions.some((s) => s.id === currentSessionId);
      if (!exists) {
        setCurrentSessionId(appState.sessions[appState.sessions.length - 1].id);
      }
    } else {
      setCurrentSessionId('');
    }
  }, [appState.sessions, currentSessionId]);

  // Extract families
  const existingFamilies = useMemo(() => {
    const fams = new Set<string>();
    appState.students.forEach((s) => {
      if (s.family) fams.add(s.family);
    });
    return Array.from(fams);
  }, [appState.students]);

  // Calculate total unclaimed eligible rewards for Header Badge
  const unclaimedRewardsCount = useMemo(() => {
    let count = 0;
    appState.students.forEach((student) => {
      const stats = calculateStudentStats(
        student,
        appState.sessions,
        appState.pointsRules,
        appState.competitionLogs,
        appState.rewardTiers
      );
      stats.eligibleTiers.forEach((et) => {
        if (et.canClaimNow) count++;
      });
    });
    return count;
  }, [appState]);

  // Calculate students who have a birthday today
  const todayBirthdays = useMemo(() => {
    return getTodayBirthdays(appState.students);
  }, [appState.students]);

  const isServant = currentUser?.type === 'servant';

  // 1. Session Updates
  const handleUpdateSessionData = (sessionId: string, updates: Partial<ServiceSession>) => {
    setAppState((prev) => {
      const updatedSessions = prev.sessions.map((s) => (s.id === sessionId ? { ...s, ...updates } : s));
      const target = updatedSessions.find((s) => s.id === sessionId);
      if (target) {
        setCloudSyncing(true);
        syncSessionToFirestore(target)
          .catch((e) => console.warn('Firestore sync note:', e))
          .finally(() => setCloudSyncing(false));
      }
      return {
        ...prev,
        sessions: updatedSessions,
      };
    });
  };

  // 2. Student Attendance & Bonus Updates
  const handleUpdateStudentAttendance = (
    sessionId: string,
    studentId: string,
    status: AttendanceStatus,
    bonusUpdates?: {
      prayer?: boolean;
      liturgy?: boolean;
      verse?: boolean;
      participation?: boolean;
      customPoints?: number;
      customReason?: string;
      penaltyPoints?: number;
      penaltyReason?: string;
    },
    notes?: string
  ) => {
    setAppState((prev) => {
      let targetSession: ServiceSession | null = null;
      const updatedSessions = prev.sessions.map((sess) => {
        if (sess.id !== sessionId) return sess;

        const currentRecord = sess.records[studentId] || {
          status: 'absent' as AttendanceStatus,
          bonus: {
            prayer: false,
            liturgy: false,
            verse: false,
            participation: false,
            customPoints: 0,
          },
        };

        const updatedBonus = bonusUpdates
          ? {
              ...currentRecord.bonus,
              ...bonusUpdates,
            }
          : currentRecord.bonus;

        const updated = {
          ...sess,
          records: {
            ...sess.records,
            [studentId]: {
              status,
              bonus: updatedBonus,
              notes: notes !== undefined ? notes : currentRecord.notes,
            },
          },
        };
        targetSession = updated;
        return updated;
      });

      if (targetSession) {
        setCloudSyncing(true);
        syncSessionToFirestore(targetSession)
          .catch((e) => console.warn('Firestore sync note:', e))
          .finally(() => setCloudSyncing(false));
      }

      return {
        ...prev,
        sessions: updatedSessions,
      };
    });
  };

  // 3. Bulk attendance status
  const handleBulkUpdateAttendance = (sessionId: string, status: AttendanceStatus) => {
    setAppState((prev) => {
      let targetSession: ServiceSession | null = null;
      const updatedSessions = prev.sessions.map((sess) => {
        if (sess.id !== sessionId) return sess;

        const newRecords = { ...sess.records };
        prev.students.forEach((s) => {
          const currentRec = newRecords[s.id] || {
            status: 'absent' as AttendanceStatus,
            bonus: {
              prayer: false,
              liturgy: false,
              verse: false,
              participation: false,
              customPoints: 0,
            },
          };
          newRecords[s.id] = {
            ...currentRec,
            status,
          };
        });

        const updated = {
          ...sess,
          records: newRecords,
        };
        targetSession = updated;
        return updated;
      });

      if (targetSession) {
        setCloudSyncing(true);
        syncSessionToFirestore(targetSession)
          .catch((e) => console.warn('Firestore sync note:', e))
          .finally(() => setCloudSyncing(false));
      }

      return {
        ...prev,
        sessions: updatedSessions,
      };
    });
  };

  // Auth Handlers
  const handleLoginServant = (servant: ServantAccount) => {
    const user: CurrentUser = { type: 'servant', servant };
    setCurrentUser(user);
    try {
      localStorage.setItem('church_prep_current_user', JSON.stringify(user));
    } catch (e) {}
    if (currentTab === 'students') setCurrentTab('attendance');
  };

  const handleLoginGoogle = async () => {
    try {
      const user = await loginWithGoogle();
      const servantAccount: ServantAccount = {
        id: `google-${user.uid}`,
        name: user.displayName || user.email?.split('@')[0] || 'خادم مسؤول',
        username: user.email || 'servant',
        password: '',
        title: 'خادم مسؤول (Google)',
      };
      handleLoginServant(servantAccount);
      setIsCloudConnected(true);
    } catch (error) {
      console.error('Google Sign-In error:', error);
      alert('تعذر تسجيل الدخول بحساب Google. يمكنك المتابعة بتسجيل الدخول كخادم محلياً.');
    }
  };

  const handleLoginStudent = (student: Student) => {
    const user: CurrentUser = { type: 'student', student };
    setCurrentUser(user);
    try {
      localStorage.setItem('church_prep_current_user', JSON.stringify(user));
    } catch (e) {}
    setCurrentTab('students');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('church_prep_current_user');
      logoutGoogle().catch(() => {});
    } catch (e) {}
    setCurrentTab('leaderboard');
  };

  // 4. Create New Session
  const handleCreateNewSession = (
    date: string, 
    title: string, 
    verse: string, 
    speakerServant: string = 'مينا', 
    guestSpeakerName?: string
  ) => {
    const newSession: ServiceSession = {
      id: `session-${date}-${Date.now()}`,
      date,
      title,
      verseOfTheWeek: verse,
      speakerServant,
      guestSpeakerName,
      records: {},
    };

    setAppState((prev) => ({
      ...prev,
      sessions: [...prev.sessions, newSession],
    }));

    setCurrentSessionId(newSession.id);
    setCloudSyncing(true);
    syncSessionToFirestore(newSession)
      .catch((e) => console.warn('Firestore sync note:', e))
      .finally(() => setCloudSyncing(false));
  };

  // 5. Open Reward delivery modal
  const handleDeliverReward = (student: Student, tier: RewardTier) => {
    setRewardDeliveryData({ student, tier });
  };

  // 6. Confirm Reward delivery
  const handleConfirmRewardDelivery = (studentId: string, claimData: ClaimedReward) => {
    setAppState((prev) => {
      let targetStudent: Student | null = null;
      const updatedStudents = prev.students.map((s) => {
        if (s.id !== studentId) return s;
        const updated = {
          ...s,
          rewardsClaimed: [...s.rewardsClaimed, claimData],
        };
        targetStudent = updated;
        return updated;
      });

      if (targetStudent) {
        setCloudSyncing(true);
        syncStudentToFirestore(targetStudent)
          .catch((e) => console.warn('Firestore sync note:', e))
          .finally(() => setCloudSyncing(false));
      }

      return {
        ...prev,
        students: updatedStudents,
      };
    });
  };

  // 7. Revoke Reward claim (undo)
  const handleRevokeReward = (studentId: string, claimId: string) => {
    if (!window.confirm('هل أنت متأكد من التراجع عن تسليم هذه الهدية؟')) return;
    setAppState((prev) => {
      let targetStudent: Student | null = null;
      const updatedStudents = prev.students.map((s) => {
        if (s.id !== studentId) return s;
        const updated = {
          ...s,
          rewardsClaimed: s.rewardsClaimed.filter((c) => c.id !== claimId),
        };
        targetStudent = updated;
        return updated;
      });

      if (targetStudent) {
        setCloudSyncing(true);
        syncStudentToFirestore(targetStudent)
          .catch((e) => console.warn('Firestore sync note:', e))
          .finally(() => setCloudSyncing(false));
      }

      return {
        ...prev,
        students: updatedStudents,
      };
    });
  };

  // 8. Add or Edit Student
  const handleSaveStudent = (student: Student) => {
    setAppState((prev) => {
      const exists = prev.students.some((s) => s.id === student.id);
      let updatedStudents: Student[];
      if (exists) {
        updatedStudents = prev.students.map((s) => (s.id === student.id ? student : s));
      } else {
        updatedStudents = [...prev.students, student];
      }
      return {
        ...prev,
        students: updatedStudents,
      };
    });

    setCloudSyncing(true);
    syncStudentToFirestore(student)
      .catch((e) => console.warn('Firestore sync note:', e))
      .finally(() => setCloudSyncing(false));
  };

  // 9. Delete Student
  const handleDeleteStudent = (studentId: string) => {
    setAppState((prev) => ({
      ...prev,
      students: prev.students.filter((s) => s.id !== studentId),
    }));

    setCloudSyncing(true);
    deleteStudentFromFirestore(studentId)
      .catch((e) => console.warn('Firestore sync note:', e))
      .finally(() => setCloudSyncing(false));
  };

  // 10. Add Competition Bonus
  const handleAddCompetition = (comp: CompetitionLog) => {
    setAppState((prev) => ({
      ...prev,
      competitionLogs: [comp, ...prev.competitionLogs],
    }));

    setCloudSyncing(true);
    syncCompetitionToFirestore(comp)
      .catch((e) => console.warn('Firestore sync note:', e))
      .finally(() => setCloudSyncing(false));
  };

  const handleOpenAddBonusOrPenalty = (student?: Student, mode: 'bonus' | 'penalty' = 'bonus') => {
    setCompetitionModalMode(mode);
    setCompetitionModalStudentId(student?.id);
    setIsAddCompetitionOpen(true);
  };

  // 11. Bulk Import Students
  const handleImportStudents = (newStudents: Student[]) => {
    setAppState((prev) => ({
      ...prev,
      students: [...prev.students, ...newStudents],
    }));

    setCloudSyncing(true);
    Promise.all(newStudents.map((s) => syncStudentToFirestore(s)))
      .catch((e) => console.warn('Firestore import sync note:', e))
      .finally(() => setCloudSyncing(false));
  };

  // 12. Restore Full State
  const handleRestoreFullState = (newState: AppState) => {
    setAppState(newState);
    if (newState.sessions.length > 0) {
      setCurrentSessionId(newState.sessions[newState.sessions.length - 1].id);
    }
    setCloudSyncing(true);
    uploadFullStateToFirestore(newState)
      .catch((e) => console.warn('Firestore full sync note:', e))
      .finally(() => setCloudSyncing(false));
  };

  // 13. Update Settings
  const handleUpdateRewardTiers = (tiers: RewardTier[]) => {
    setAppState((prev) => {
      const updated = { ...prev, rewardTiers: tiers };
      syncSettingsToFirestore({
        churchName: updated.churchName,
        serviceName: updated.serviceName,
        pointsRules: updated.pointsRules,
        rewardTiers: updated.rewardTiers,
      }).catch((e) => console.warn('Firestore settings sync note:', e));
      return updated;
    });
  };

  const handleUpdatePointsRules = (rules: PointsRuleConfig) => {
    setAppState((prev) => {
      const updated = { ...prev, pointsRules: rules };
      syncSettingsToFirestore({
        churchName: updated.churchName,
        serviceName: updated.serviceName,
        pointsRules: updated.pointsRules,
        rewardTiers: updated.rewardTiers,
      }).catch((e) => console.warn('Firestore settings sync note:', e));
      return updated;
    });
  };

  const handleUpdateChurchDetails = (churchName: string, serviceName: string, patronPriests?: string) => {
    setAppState((prev) => {
      const updated = { 
        ...prev, 
        churchName, 
        serviceName, 
        patronPriests: patronPriests || prev.patronPriests || 'تحت رعاية: أبونا مكسيموس يوسف • أبونا دوماديوس صليب' 
      };
      syncSettingsToFirestore({
        churchName: updated.churchName,
        serviceName: updated.serviceName,
        patronPriests: updated.patronPriests,
        pointsRules: updated.pointsRules,
        rewardTiers: updated.rewardTiers,
      }).catch((e) => console.warn('Firestore settings sync note:', e));
      return updated;
    });
  };

  const handleResetDefaults = () => {
    const def = resetToDefaults();
    setAppState(def);
    if (def.sessions.length > 0) {
      setCurrentSessionId(def.sessions[def.sessions.length - 1].id);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-['Cairo',sans-serif]">
      {/* Header Bar */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        churchName={appState.churchName}
        serviceName={appState.serviceName}
        patronPriests={appState.patronPriests}
        unclaimedRewardsCount={unclaimedRewardsCount}
        todayBirthdaysCount={todayBirthdays.length}
        currentUser={currentUser}
        isCloudConnected={isCloudConnected}
        cloudSyncing={cloudSyncing}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
        onOpenAddStudent={() => {
          setEditingStudent(null);
          setIsAddStudentOpen(true);
        }}
        onOpenAddCompetition={() => handleOpenAddBonusOrPenalty(undefined, 'bonus')}
        onOpenImportExport={() => setIsImportExportOpen(true)}
        onViewBirthdays={() => setCurrentTab('students')}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full">
        {/* Birthday Notification Alert Banner (Visible for servants) */}
        {currentUser?.type === 'servant' && (
          <BirthdayNotificationBanner
            birthdayStudents={todayBirthdays}
            onSelectStudent={(s) => setProfileStudent(s)}
          />
        )}
        {currentUser?.type === 'student' ? (
          /* Student Mode: Personal Portal or Leaderboard */
          currentTab === 'leaderboard' ? (
            <LeaderboardView
              students={appState.students}
              sessions={appState.sessions}
              pointsRules={appState.pointsRules}
              rewardTiers={appState.rewardTiers}
              competitionLogs={appState.competitionLogs}
              onSelectStudent={(s) => setProfileStudent(s)}
            />
          ) : (
            <StudentPortalView
              student={currentUser.student}
              sessions={appState.sessions}
              pointsRules={appState.pointsRules}
              rewardTiers={appState.rewardTiers}
              competitionLogs={appState.competitionLogs}
              churchName={appState.churchName}
              serviceName={appState.serviceName}
              onLogout={handleLogout}
              onOpenLoginModal={() => setIsLoginModalOpen(true)}
              onOpenAchievementCard={() => setAchievementModalData({ student: currentUser.student, title: 'بطل الشهر' })}
            />
          )
        ) : (
          /* Servant or Guest Mode */
          <>
            {currentTab === 'attendance' && (
              <AttendanceView
                students={appState.students}
                sessions={appState.sessions}
                servants={appState.servants}
                currentSessionId={currentSessionId}
                pointsRules={appState.pointsRules}
                rewardTiers={appState.rewardTiers}
                competitionLogs={appState.competitionLogs}
                isServant={isServant}
                onOpenLogin={() => setIsLoginModalOpen(true)}
                onSelectSession={setCurrentSessionId}
                onUpdateSessionData={handleUpdateSessionData}
                onUpdateStudentAttendance={handleUpdateStudentAttendance}
                onBulkUpdateAttendance={handleBulkUpdateAttendance}
                onCreateNewSession={handleCreateNewSession}
                onDeliverReward={handleDeliverReward}
                onOpenAddStudent={() => {
                  setEditingStudent(null);
                  setIsAddStudentOpen(true);
                }}
                onOpenImportExport={() => setIsImportExportOpen(true)}
              />
            )}

            {currentTab === 'rewards' && (
              <RewardsTracker
                students={appState.students}
                sessions={appState.sessions}
                pointsRules={appState.pointsRules}
                rewardTiers={appState.rewardTiers}
                competitionLogs={appState.competitionLogs}
                isServant={isServant}
                onOpenLogin={() => setIsLoginModalOpen(true)}
                onDeliverReward={handleDeliverReward}
                onRevokeReward={handleRevokeReward}
              />
            )}

            {currentTab === 'leaderboard' && (
              <LeaderboardView
                students={appState.students}
                sessions={appState.sessions}
                pointsRules={appState.pointsRules}
                rewardTiers={appState.rewardTiers}
                competitionLogs={appState.competitionLogs}
                onSelectStudent={(s) => setProfileStudent(s)}
                onOpenAchievementCard={(s, t) => setAchievementModalData({ student: s, title: t })}
              />
            )}

            {currentTab === 'reports' && (
              <MonthlyReportsView
                students={appState.students}
                sessions={appState.sessions}
                pointsRules={appState.pointsRules}
                rewardTiers={appState.rewardTiers}
                competitionLogs={appState.competitionLogs}
                churchName={appState.churchName}
                serviceName={appState.serviceName}
                onSelectStudent={(s) => setProfileStudent(s)}
                onOpenAchievementCard={(s, t) => setAchievementModalData({ student: s, title: t })}
              />
            )}

            {currentTab === 'students' && (
              <StudentsView
                students={appState.students}
                sessions={appState.sessions}
                pointsRules={appState.pointsRules}
                rewardTiers={appState.rewardTiers}
                competitionLogs={appState.competitionLogs}
                isServant={isServant}
                onOpenLogin={() => setIsLoginModalOpen(true)}
                onSelectStudent={(s) => setProfileStudent(s)}
                onOpenAddStudent={() => {
                  setEditingStudent(null);
                  setIsAddStudentOpen(true);
                }}
                onOpenImportExport={() => setIsImportExportOpen(true)}
                onDeleteStudent={handleDeleteStudent}
                onEditStudent={(s) => {
                  setEditingStudent(s);
                  setIsAddStudentOpen(true);
                }}
                onOpenAchievementCard={(s, t) => setAchievementModalData({ student: s, title: t })}
              />
            )}

            {currentTab === 'settings' && (
              isServant ? (
                <SettingsView
                  rewardTiers={appState.rewardTiers}
                  pointsRules={appState.pointsRules}
                  churchName={appState.churchName}
                  serviceName={appState.serviceName}
                  patronPriests={appState.patronPriests}
                  isCloudConnected={isCloudConnected}
                  onUpdateRewardTiers={handleUpdateRewardTiers}
                  onUpdatePointsRules={handleUpdatePointsRules}
                  onUpdateChurchDetails={handleUpdateChurchDetails}
                  onResetDefaults={handleResetDefaults}
                  onForceCloudSync={async () => {
                    setCloudSyncing(true);
                    await uploadFullStateToFirestore(appState);
                    setCloudSyncing(false);
                  }}
                />
              ) : (
                <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 text-center max-w-lg mx-auto my-8 shadow-sm">
                  <div className="w-16 h-16 rounded-3xl bg-amber-500/20 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-300">
                    <span className="text-3xl">🔒</span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900 mb-1">لوحة التحكم مخصصة للخدام</h3>
                  <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                    لتعديل قواعد النقاط، أسماء الأسر، هدايا التتابع، وإعدادات الخدمة، يرجى تسجيل دخول الخادم المسؤول.
                  </p>
                  <button
                    onClick={() => setIsLoginModalOpen(true)}
                    className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs rounded-xl shadow-md inline-flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
                  >
                    <span>تسجيل دخول الخادم</span>
                  </button>
                </div>
              )
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-5 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="font-semibold text-slate-700">
            {appState.serviceName} • {appState.churchName}
          </p>
          <p className="text-slate-400">
            «كُلُّ مَا تَفْعَلُونَهُ فَافْعَلُوهُ مِنْ كُلِّ الْقَلْبِ، كَمَا لِلرَّبِّ وَلَيْسَ لِلنَّاسِ» (كو 3: 23)
          </p>
        </div>
      </footer>

      {/* Modals */}
      {isAddStudentOpen && (
        <AddStudentModal
          initialStudent={editingStudent}
          existingFamilies={existingFamilies}
          onClose={() => {
            setIsAddStudentOpen(false);
            setEditingStudent(null);
          }}
          onSaveStudent={handleSaveStudent}
        />
      )}

      {isAddCompetitionOpen && (
        <AddCompetitionModal
          students={appState.students}
          initialMode={competitionModalMode}
          initialStudentId={competitionModalStudentId}
          onClose={() => {
            setIsAddCompetitionOpen(false);
            setCompetitionModalStudentId(undefined);
          }}
          onAddCompetition={handleAddCompetition}
        />
      )}

      {isImportExportOpen && (
        <ImportExportModal
          students={appState.students}
          appState={appState}
          onClose={() => setIsImportExportOpen(false)}
          onImportStudents={handleImportStudents}
          onRestoreFullState={handleRestoreFullState}
        />
      )}

      {rewardDeliveryData && (
        <GiftDeliveryModal
          student={rewardDeliveryData.student}
          tier={rewardDeliveryData.tier}
          onClose={() => setRewardDeliveryData(null)}
          onConfirmDelivery={handleConfirmRewardDelivery}
        />
      )}

      {profileStudent && (
        <StudentProfileModal
          student={profileStudent}
          sessions={appState.sessions}
          pointsRules={appState.pointsRules}
          rewardTiers={appState.rewardTiers}
          competitionLogs={appState.competitionLogs}
          isServant={isServant}
          onClose={() => setProfileStudent(null)}
          onEditStudent={(s) => {
            setProfileStudent(null);
            setEditingStudent(s);
            setIsAddStudentOpen(true);
          }}
          onOpenAddBonusOrPenalty={(s, m) => handleOpenAddBonusOrPenalty(s, m)}
          onOpenAchievementCard={(s) => setAchievementModalData({ student: s, title: 'بطل الشهر' })}
        />
      )}

      {isLoginModalOpen && (
        <LoginModal
          servants={appState.servants}
          students={appState.students}
          currentUser={currentUser}
          onClose={() => setIsLoginModalOpen(false)}
          onLoginServant={handleLoginServant}
          onLoginStudent={handleLoginStudent}
          onLogout={handleLogout}
          onLoginGoogle={handleLoginGoogle}
        />
      )}

      {achievementModalData && (
        <AchievementCardModal
          student={achievementModalData.student}
          sessions={appState.sessions}
          pointsRules={appState.pointsRules}
          rewardTiers={appState.rewardTiers}
          competitionLogs={appState.competitionLogs}
          churchName={appState.churchName}
          serviceName={appState.serviceName}
          patronPriests={appState.patronPriests}
          initialTitle={achievementModalData.title || 'بطل الشهر'}
          onClose={() => setAchievementModalData(null)}
        />
      )}
    </div>
  );
}

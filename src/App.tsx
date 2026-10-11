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
import { BirthdayNotificationBanner } from './components/BirthdayNotificationBanner';
import { getTodayBirthdays } from './utils/birthday';

export default function App() {
  const [appState, setAppState] = useState<AppState>(() => loadAppState());
  const [currentTab, setCurrentTab] = useState<'attendance' | 'rewards' | 'leaderboard' | 'reports' | 'students' | 'settings'>('attendance');
  
  // Current user authentication (servant admin or student)
  const [currentUser, setCurrentUser] = useState<CurrentUser>(() => {
    try {
      const saved = localStorage.getItem('church_prep_current_user');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    // Default to Mina as Admin Servant
    return { type: 'servant', servant: initialServants[0] };
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
  const [isImportExportOpen, setIsImportExportOpen] = useState(false);
  const [profileStudent, setProfileStudent] = useState<Student | null>(null);
  const [rewardDeliveryData, setRewardDeliveryData] = useState<{ student: Student; tier: RewardTier } | null>(null);

  // Auto-save to localStorage whenever appState changes
  useEffect(() => {
    saveAppState(appState);
  }, [appState]);

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

  // 1. Session Updates
  const handleUpdateSessionData = (sessionId: string, updates: Partial<ServiceSession>) => {
    setAppState((prev) => ({
      ...prev,
      sessions: prev.sessions.map((s) => (s.id === sessionId ? { ...s, ...updates } : s)),
    }));
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
    },
    notes?: string
  ) => {
    setAppState((prev) => {
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

        return {
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
      });

      return {
        ...prev,
        sessions: updatedSessions,
      };
    });
  };

  // 3. Bulk attendance status
  const handleBulkUpdateAttendance = (sessionId: string, status: AttendanceStatus) => {
    setAppState((prev) => {
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

        return {
          ...sess,
          records: newRecords,
        };
      });

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
    } catch (e) {}
    setIsLoginModalOpen(true);
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
  };

  // 5. Open Reward delivery modal
  const handleDeliverReward = (student: Student, tier: RewardTier) => {
    setRewardDeliveryData({ student, tier });
  };

  // 6. Confirm Reward delivery
  const handleConfirmRewardDelivery = (studentId: string, claimData: ClaimedReward) => {
    setAppState((prev) => ({
      ...prev,
      students: prev.students.map((s) => {
        if (s.id !== studentId) return s;
        return {
          ...s,
          rewardsClaimed: [...s.rewardsClaimed, claimData],
        };
      }),
    }));
  };

  // 7. Revoke Reward claim (undo)
  const handleRevokeReward = (studentId: string, claimId: string) => {
    if (!window.confirm('هل أنت متأكد من التراجع عن تسليم هذه الهدية؟')) return;
    setAppState((prev) => ({
      ...prev,
      students: prev.students.map((s) => {
        if (s.id !== studentId) return s;
        return {
          ...s,
          rewardsClaimed: s.rewardsClaimed.filter((c) => c.id !== claimId),
        };
      }),
    }));
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
  };

  // 9. Delete Student
  const handleDeleteStudent = (studentId: string) => {
    setAppState((prev) => ({
      ...prev,
      students: prev.students.filter((s) => s.id !== studentId),
    }));
  };

  // 10. Add Competition Bonus
  const handleAddCompetition = (comp: CompetitionLog) => {
    setAppState((prev) => ({
      ...prev,
      competitionLogs: [comp, ...prev.competitionLogs],
    }));
  };

  // 11. Bulk Import Students
  const handleImportStudents = (newStudents: Student[]) => {
    setAppState((prev) => ({
      ...prev,
      students: [...prev.students, ...newStudents],
    }));
  };

  // 12. Restore Full State
  const handleRestoreFullState = (newState: AppState) => {
    setAppState(newState);
    if (newState.sessions.length > 0) {
      setCurrentSessionId(newState.sessions[newState.sessions.length - 1].id);
    }
  };

  // 13. Update Settings
  const handleUpdateRewardTiers = (tiers: RewardTier[]) => {
    setAppState((prev) => ({ ...prev, rewardTiers: tiers }));
  };

  const handleUpdatePointsRules = (rules: PointsRuleConfig) => {
    setAppState((prev) => ({ ...prev, pointsRules: rules }));
  };

  const handleUpdateChurchDetails = (churchName: string, serviceName: string) => {
    setAppState((prev) => ({ ...prev, churchName, serviceName }));
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
        unclaimedRewardsCount={unclaimedRewardsCount}
        todayBirthdaysCount={todayBirthdays.length}
        currentUser={currentUser}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onOpenAddStudent={() => {
          setEditingStudent(null);
          setIsAddStudentOpen(true);
        }}
        onOpenAddCompetition={() => setIsAddCompetitionOpen(true)}
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
            />
          )
        ) : (
          /* Servant Admin Mode: Full Controls */
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
              />
            )}

            {currentTab === 'students' && (
              <StudentsView
                students={appState.students}
                sessions={appState.sessions}
                pointsRules={appState.pointsRules}
                rewardTiers={appState.rewardTiers}
                competitionLogs={appState.competitionLogs}
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
              />
            )}

            {currentTab === 'settings' && (
              <SettingsView
                rewardTiers={appState.rewardTiers}
                pointsRules={appState.pointsRules}
                churchName={appState.churchName}
                serviceName={appState.serviceName}
                onUpdateRewardTiers={handleUpdateRewardTiers}
                onUpdatePointsRules={handleUpdatePointsRules}
                onUpdateChurchDetails={handleUpdateChurchDetails}
                onResetDefaults={handleResetDefaults}
              />
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
          onClose={() => setIsAddCompetitionOpen(false)}
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
          onClose={() => setProfileStudent(null)}
          onEditStudent={(s) => {
            setProfileStudent(null);
            setEditingStudent(s);
            setIsAddStudentOpen(true);
          }}
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
        />
      )}
    </div>
  );
}

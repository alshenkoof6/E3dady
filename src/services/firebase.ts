import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  collection, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  getDocFromServer,
  writeBatch
} from 'firebase/firestore';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { Student, ServiceSession, CompetitionLog, AppState, RewardTier, PointsRuleConfig } from '../types';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// CRITICAL: Initialize Firestore with firestoreDatabaseId from config
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Error Handling Specification
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test initial connection to Firestore
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore offline / check connection:', error.message);
      return false;
    }
    // Any other response means we connected to the server
    return true;
  }
}

// Google Login for Servants
export async function loginWithGoogle(): Promise<User> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

export async function logoutGoogle(): Promise<void> {
  await signOut(auth);
}

// Real-time listener for the whole database
export function subscribeToDatabase(
  onData: (data: {
    students?: Student[];
    sessions?: ServiceSession[];
    competitions?: CompetitionLog[];
    settings?: {
      churchName: string;
      serviceName: string;
      pointsRules?: PointsRuleConfig;
      rewardTiers?: RewardTier[];
    };
  }) => void,
  onError?: (err: any) => void
) {
  const unsubscribers: (() => void)[] = [];

  // 1. Students collection listener
  const studentsPath = 'students';
  const unsubStudents = onSnapshot(
    collection(db, studentsPath),
    (snapshot) => {
      const students: Student[] = [];
      snapshot.forEach((d) => {
        students.push(d.data() as Student);
      });
      onData({ students });
    },
    (error) => {
      console.warn('Students listener notice:', error.message);
      onError?.(error);
      try {
        handleFirestoreError(error, OperationType.LIST, studentsPath);
      } catch (e) {}
    }
  );
  unsubscribers.push(unsubStudents);

  // 2. Sessions collection listener
  const sessionsPath = 'sessions';
  const unsubSessions = onSnapshot(
    collection(db, sessionsPath),
    (snapshot) => {
      const sessions: ServiceSession[] = [];
      snapshot.forEach((d) => {
        sessions.push(d.data() as ServiceSession);
      });
      // Sort sessions chronologically
      sessions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      onData({ sessions });
    },
    (error) => {
      console.warn('Sessions listener notice:', error.message);
      onError?.(error);
      try {
        handleFirestoreError(error, OperationType.LIST, sessionsPath);
      } catch (e) {}
    }
  );
  unsubscribers.push(unsubSessions);

  // 3. Competitions collection listener
  const compsPath = 'competitions';
  const unsubComps = onSnapshot(
    collection(db, compsPath),
    (snapshot) => {
      const competitions: CompetitionLog[] = [];
      snapshot.forEach((d) => {
        competitions.push(d.data() as CompetitionLog);
      });
      competitions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      onData({ competitions });
    },
    (error) => {
      console.warn('Competitions listener notice:', error.message);
      onError?.(error);
      try {
        handleFirestoreError(error, OperationType.LIST, compsPath);
      } catch (e) {}
    }
  );
  unsubscribers.push(unsubComps);

  // 4. Settings general document listener
  const settingsPath = 'settings/general';
  const unsubSettings = onSnapshot(
    doc(db, 'settings', 'general'),
    (snapshot) => {
      if (snapshot.exists()) {
        const d = snapshot.data();
        onData({
          settings: {
            churchName: d.churchName,
            serviceName: d.serviceName,
            pointsRules: d.pointsRules,
            rewardTiers: d.rewardTiers,
          },
        });
      }
    },
    (error) => {
      console.warn('Settings listener notice:', error.message);
      onError?.(error);
      try {
        handleFirestoreError(error, OperationType.GET, settingsPath);
      } catch (e) {}
    }
  );
  unsubscribers.push(unsubSettings);

  return () => {
    unsubscribers.forEach((unsub) => unsub());
  };
}

// Student write operations
export async function syncStudentToFirestore(student: Student): Promise<void> {
  const path = `students/${student.id}`;
  try {
    await setDoc(doc(db, 'students', student.id), student);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteStudentFromFirestore(studentId: string): Promise<void> {
  const path = `students/${studentId}`;
  try {
    await deleteDoc(doc(db, 'students', studentId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Session write operations
export async function syncSessionToFirestore(session: ServiceSession): Promise<void> {
  const path = `sessions/${session.id}`;
  try {
    await setDoc(doc(db, 'sessions', session.id), session);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteSessionFromFirestore(sessionId: string): Promise<void> {
  const path = `sessions/${sessionId}`;
  try {
    await deleteDoc(doc(db, 'sessions', sessionId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Competition write operations
export async function syncCompetitionToFirestore(comp: CompetitionLog): Promise<void> {
  const path = `competitions/${comp.id}`;
  try {
    await setDoc(doc(db, 'competitions', comp.id), comp);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Settings write operations
export async function syncSettingsToFirestore(settings: {
  churchName: string;
  serviceName: string;
  pointsRules: PointsRuleConfig;
  rewardTiers: RewardTier[];
}): Promise<void> {
  const path = 'settings/general';
  try {
    await setDoc(doc(db, 'settings', 'general'), settings);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Upload initial state / batch sync
export async function uploadFullStateToFirestore(state: AppState): Promise<void> {
  const batch = writeBatch(db);

  // Settings
  const settingsRef = doc(db, 'settings', 'general');
  batch.set(settingsRef, {
    churchName: state.churchName,
    serviceName: state.serviceName,
    pointsRules: state.pointsRules,
    rewardTiers: state.rewardTiers,
  });

  // Students
  state.students.forEach((std) => {
    const stdRef = doc(db, 'students', std.id);
    batch.set(stdRef, std);
  });

  // Sessions
  state.sessions.forEach((sess) => {
    const sessRef = doc(db, 'sessions', sess.id);
    batch.set(sessRef, sess);
  });

  // Competitions
  state.competitionLogs.forEach((comp) => {
    const compRef = doc(db, 'competitions', comp.id);
    batch.set(compRef, comp);
  });

  try {
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'batch-full-sync');
  }
}

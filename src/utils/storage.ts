import { AppState } from '../types';
import { initialAppState } from '../data/initialData';

// Production key for live data with NO demo records
const STORAGE_KEY = 'church_prep_live_clean_v4';

// Array of legacy/demo storage keys to purge
const OBSOLETE_KEYS = [
  'church_prep_service_data_v1',
  'church_prep_service_data_clean_v2',
  'church_prep_service_data',
  'church_prep_sessions_v1',
  'church_prep_students_v1',
];

export function loadAppState(): AppState {
  try {
    // Purge any legacy demo keys
    OBSOLETE_KEYS.forEach((key) => {
      try {
        localStorage.removeItem(key);
      } catch (e) {}
    });

    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialAppState;

    const parsed = JSON.parse(raw);

    // If parsed state contains old demo artifacts, purge and start fresh
    const hasDemoStudents =
      Array.isArray(parsed.students) &&
      parsed.students.some((s: any) => s.id === 'std-1' || s.id === 'std-2' || s.id === 'std-3' || s.name?.includes('ديمو'));

    const hasDemoSessions =
      Array.isArray(parsed.sessions) &&
      parsed.sessions.some((sess: any) => sess.id === 'session-1' || sess.id === 'session-2' || sess.id === 'session-3');

    if (hasDemoStudents || hasDemoSessions) {
      localStorage.removeItem(STORAGE_KEY);
      return initialAppState;
    }

    return {
      churchName: parsed.churchName || initialAppState.churchName,
      serviceName: parsed.serviceName || initialAppState.serviceName,
      students: Array.isArray(parsed.students) ? parsed.students : initialAppState.students,
      sessions: Array.isArray(parsed.sessions) ? parsed.sessions : initialAppState.sessions,
      rewardTiers: Array.isArray(parsed.rewardTiers) ? parsed.rewardTiers : initialAppState.rewardTiers,
      pointsRules: parsed.pointsRules || initialAppState.pointsRules,
      competitionLogs: Array.isArray(parsed.competitionLogs) ? parsed.competitionLogs : initialAppState.competitionLogs,
      servants: Array.isArray(parsed.servants) && parsed.servants.length > 0 ? parsed.servants : initialAppState.servants,
    };
  } catch (error) {
    console.error('Error reading localStorage:', error);
    return initialAppState;
  }
}

export function saveAppState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
}

export function resetToDefaults(): AppState {
  try {
    localStorage.removeItem(STORAGE_KEY);
    OBSOLETE_KEYS.forEach((key) => localStorage.removeItem(key));
  } catch (e) {}
  return initialAppState;
}

export function clearAllSavedData(): AppState {
  try {
    localStorage.removeItem(STORAGE_KEY);
    OBSOLETE_KEYS.forEach((key) => localStorage.removeItem(key));
  } catch (e) {}
  return {
    ...initialAppState,
    students: [],
    sessions: [],
    competitionLogs: [],
  };
}

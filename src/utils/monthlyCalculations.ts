import { 
  Student, 
  ServiceSession, 
  PointsRuleConfig, 
  CompetitionLog, 
  GradeLevel, 
  AttendanceStatus, 
  AttendanceBonus 
} from '../types';

export interface StudentMonthlyRecord {
  student: Student;
  sessionsHeld: number;
  presentCount: number;
  absentCount: number;
  excusedCount: number;
  attendanceRate: number; // 0 - 100
  liturgyCount: number;
  verseCount: number;
  prayerCount: number;
  participationCount: number;
  monthlyPoints: number;
  pointsBreakdown: {
    attendance: number;
    liturgy: number;
    verse: number;
    prayer: number;
    participation: number;
    sessionCustom: number;
    competitions: number;
    tierRewards: number;
  };
  meetingDetails: {
    sessionId: string;
    date: string;
    title: string;
    status: AttendanceStatus | 'unrecorded';
    bonus?: AttendanceBonus;
  }[];
}

export interface GradeMonthlyMetrics {
  grade: GradeLevel;
  studentCount: number;
  totalPresent: number;
  totalPossible: number;
  attendanceRate: number;
  totalPoints: number;
  averagePointsPerStudent: number;
}

export interface FamilyMonthlyMetrics {
  family: string;
  studentCount: number;
  attendanceRate: number;
  totalPoints: number;
}

export interface OverallMonthlyPerformance {
  yearMonth: string; // "YYYY-MM"
  monthNameArabic: string;
  sessionsInMonth: ServiceSession[];
  sessionsCount: number;
  totalStudents: number;
  averageAttendanceRate: number; // 0 - 100
  totalPointsAwarded: number;
  averagePointsPerStudent: number;
  liturgyRate: number; // % of present attendances that included liturgy
  verseRate: number;   // % of present attendances that included verse
  prayerRate: number;  // % of present attendances that included prayer
  participationRate: number; // % of present attendances that included participation
  studentsRecords: StudentMonthlyRecord[];
  gradeMetrics: GradeMonthlyMetrics[];
  familyMetrics: FamilyMonthlyMetrics[];
  topPerformers: StudentMonthlyRecord[];
  needsFollowUp: StudentMonthlyRecord[]; // Students with low attendance in the month
}

// Arabic month names mapping
export const ARABIC_MONTHS: Record<string, string> = {
  '01': 'يناير',
  '02': 'فبراير',
  '03': 'مارس',
  '04': 'أبريل',
  '05': 'مايو',
  '06': 'يونيو',
  '07': 'يوليو',
  '08': 'أغسطس',
  '09': 'سبتمبر',
  '10': 'أكتوبر',
  '11': 'نوفمبر',
  '12': 'ديسمبر',
};

export function getArabicMonthYear(yearMonth: string): string {
  const [year, month] = yearMonth.split('-');
  const monthName = ARABIC_MONTHS[month] || month;
  return `${monthName} ${year}`;
}

export function extractAvailableMonths(sessions: ServiceSession[]): string[] {
  const months = new Set<string>();
  sessions.forEach((s) => {
    if (s.date && s.date.length >= 7) {
      months.add(s.date.substring(0, 7)); // "YYYY-MM"
    }
  });

  // If no sessions, return current month
  if (months.size === 0) {
    const now = new Date();
    const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    return [ym];
  }

  // Sort descending (latest month first)
  return Array.from(months).sort((a, b) => b.localeCompare(a));
}

export function calculateMonthlyPerformance(
  yearMonth: string,
  students: Student[],
  sessions: ServiceSession[],
  pointsRules: PointsRuleConfig,
  competitionLogs: CompetitionLog[]
): OverallMonthlyPerformance {
  // Filter sessions in this month and sort chronologically ascending
  const sessionsInMonth = sessions
    .filter((s) => s.date.startsWith(yearMonth))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const sessionsCount = sessionsInMonth.length;
  const monthNameArabic = getArabicMonthYear(yearMonth);

  // Filter competitions in this month
  const monthlyCompetitions = competitionLogs.filter((c) => c.date.startsWith(yearMonth));

  let aggregatePresentCount = 0;
  let aggregatePossibleCount = 0;
  let aggregateLiturgyCount = 0;
  let aggregateVerseCount = 0;
  let aggregatePrayerCount = 0;
  let aggregateParticipationCount = 0;
  let aggregateTotalPoints = 0;

  const studentsRecords: StudentMonthlyRecord[] = students.map((student) => {
    let presentCount = 0;
    let absentCount = 0;
    let excusedCount = 0;
    let liturgyCount = 0;
    let verseCount = 0;
    let prayerCount = 0;
    let participationCount = 0;
    let sessionCustomPoints = 0;

    const meetingDetails: StudentMonthlyRecord['meetingDetails'] = [];

    sessionsInMonth.forEach((session) => {
      const rec = session.records[student.id];
      if (!rec) {
        absentCount++;
        meetingDetails.push({
          sessionId: session.id,
          date: session.date,
          title: session.title,
          status: 'unrecorded',
        });
        return;
      }

      meetingDetails.push({
        sessionId: session.id,
        date: session.date,
        title: session.title,
        status: rec.status,
        bonus: rec.bonus,
      });

      if (rec.status === 'present') {
        presentCount++;
        if (rec.bonus?.liturgy) liturgyCount++;
        if (rec.bonus?.verse) verseCount++;
        if (rec.bonus?.prayer) prayerCount++;
        if (rec.bonus?.participation) participationCount++;
        if (rec.bonus?.customPoints) sessionCustomPoints += rec.bonus.customPoints;
      } else if (rec.status === 'excused') {
        excusedCount++;
      } else {
        absentCount++;
      }
    });

    // Competitions in this month
    let compPoints = 0;
    monthlyCompetitions.forEach((comp) => {
      if (comp.awardedStudentIds.includes(student.id)) {
        compPoints += comp.points;
      }
    });

    // Rewards claimed in this month
    let rewardPoints = 0;
    student.rewardsClaimed.forEach((claim) => {
      if (claim.date.startsWith(yearMonth)) {
        // Can add reward milestone points
      }
    });

    const attendancePoints = presentCount * pointsRules.attendanceBase;
    const liturgyPoints = liturgyCount * pointsRules.liturgy;
    const versePoints = verseCount * pointsRules.verse;
    const prayerPoints = prayerCount * pointsRules.prayer;
    const partPoints = participationCount * pointsRules.participation;

    const monthlyPoints =
      attendancePoints +
      liturgyPoints +
      versePoints +
      prayerPoints +
      partPoints +
      sessionCustomPoints +
      compPoints +
      rewardPoints;

    const attendanceRate = sessionsCount > 0 ? Math.round((presentCount / sessionsCount) * 100) : 0;

    aggregatePresentCount += presentCount;
    aggregatePossibleCount += sessionsCount;
    aggregateLiturgyCount += liturgyCount;
    aggregateVerseCount += verseCount;
    aggregatePrayerCount += prayerCount;
    aggregateParticipationCount += participationCount;
    aggregateTotalPoints += monthlyPoints;

    return {
      student,
      sessionsHeld: sessionsCount,
      presentCount,
      absentCount,
      excusedCount,
      attendanceRate,
      liturgyCount,
      verseCount,
      prayerCount,
      participationCount,
      monthlyPoints,
      pointsBreakdown: {
        attendance: attendancePoints,
        liturgy: liturgyPoints,
        verse: versePoints,
        prayer: prayerPoints,
        participation: partPoints,
        sessionCustom: sessionCustomPoints,
        competitions: compPoints,
        tierRewards: rewardPoints,
      },
      meetingDetails,
    };
  });

  // Overall rates
  const averageAttendanceRate =
    aggregatePossibleCount > 0
      ? Math.round((aggregatePresentCount / aggregatePossibleCount) * 100)
      : 0;

  const averagePointsPerStudent =
    students.length > 0 ? Math.round(aggregateTotalPoints / students.length) : 0;

  const liturgyRate =
    aggregatePresentCount > 0
      ? Math.round((aggregateLiturgyCount / aggregatePresentCount) * 100)
      : 0;

  const verseRate =
    aggregatePresentCount > 0
      ? Math.round((aggregateVerseCount / aggregatePresentCount) * 100)
      : 0;

  const prayerRate =
    aggregatePresentCount > 0
      ? Math.round((aggregatePrayerCount / aggregatePresentCount) * 100)
      : 0;

  const participationRate =
    aggregatePresentCount > 0
      ? Math.round((aggregateParticipationCount / aggregatePresentCount) * 100)
      : 0;

  // Grade Breakdown
  const grades: GradeLevel[] = ['أولى إعدادي', 'ثانية إعدادي', 'ثالثة إعدادي'];
  const gradeMetrics: GradeMonthlyMetrics[] = grades.map((grade) => {
    const gradeStudents = studentsRecords.filter((r) => r.student.grade === grade);
    const count = gradeStudents.length;
    const gradePresent = gradeStudents.reduce((acc, curr) => acc + curr.presentCount, 0);
    const gradePossible = count * sessionsCount;
    const rate = gradePossible > 0 ? Math.round((gradePresent / gradePossible) * 100) : 0;
    const totalPts = gradeStudents.reduce((acc, curr) => acc + curr.monthlyPoints, 0);
    const avgPts = count > 0 ? Math.round(totalPts / count) : 0;

    return {
      grade,
      studentCount: count,
      totalPresent: gradePresent,
      totalPossible: gradePossible,
      attendanceRate: rate,
      totalPoints: totalPts,
      averagePointsPerStudent: avgPts,
    };
  });

  // Family Breakdown
  const familyMap = new Map<string, { count: number; present: number; totalPts: number }>();
  studentsRecords.forEach((r) => {
    const fam = r.student.family || 'أخرى';
    const current = familyMap.get(fam) || { count: 0, present: 0, totalPts: 0 };
    current.count += 1;
    current.present += r.presentCount;
    current.totalPts += r.monthlyPoints;
    familyMap.set(fam, current);
  });

  const familyMetrics: FamilyMonthlyMetrics[] = Array.from(familyMap.entries()).map(
    ([family, data]) => {
      const possible = data.count * sessionsCount;
      const rate = possible > 0 ? Math.round((data.present / possible) * 100) : 0;
      return {
        family,
        studentCount: data.count,
        attendanceRate: rate,
        totalPoints: data.totalPts,
      };
    }
  ).sort((a, b) => b.attendanceRate - a.attendanceRate);

  // Top performers this month (sorted by monthly points then attendance rate)
  const topPerformers = [...studentsRecords]
    .sort((a, b) => b.monthlyPoints - a.monthlyPoints || b.attendanceRate - a.attendanceRate)
    .slice(0, 5);

  // Needs follow-up (attendance rate < 50% or 0 present in the month, if sessions held > 0)
  const needsFollowUp = sessionsCount > 0
    ? [...studentsRecords]
        .filter((r) => r.attendanceRate < 50)
        .sort((a, b) => a.attendanceRate - b.attendanceRate)
    : [];

  return {
    yearMonth,
    monthNameArabic,
    sessionsInMonth,
    sessionsCount,
    totalStudents: students.length,
    averageAttendanceRate,
    totalPointsAwarded: aggregateTotalPoints,
    averagePointsPerStudent,
    liturgyRate,
    verseRate,
    prayerRate,
    participationRate,
    studentsRecords,
    gradeMetrics,
    familyMetrics,
    topPerformers,
    needsFollowUp,
  };
}

/**
 * Returns the set of student IDs and their ranks for the top 3 spots in a given month.
 */
export function getTop3StudentIdsForMonth(
  yearMonth: string,
  students: Student[],
  sessions: ServiceSession[],
  pointsRules: PointsRuleConfig,
  competitionLogs: CompetitionLog[]
): {
  top3Ids: Set<string>;
  top3Map: Map<string, { rank: 1 | 2 | 3; monthlyPoints: number; student: Student }>;
  top3List: { rank: 1 | 2 | 3; monthlyPoints: number; student: Student }[];
} {
  const perf = calculateMonthlyPerformance(yearMonth, students, sessions, pointsRules, competitionLogs);
  const sorted = [...perf.studentsRecords].sort(
    (a, b) => b.monthlyPoints - a.monthlyPoints || b.attendanceRate - a.attendanceRate
  );

  const top3List: { rank: 1 | 2 | 3; monthlyPoints: number; student: Student }[] = [];
  const top3Ids = new Set<string>();
  const top3Map = new Map<string, { rank: 1 | 2 | 3; monthlyPoints: number; student: Student }>();

  // Only consider students with attendance or points if sessions held
  const validCandidates = sorted.slice(0, 3);
  validCandidates.forEach((r, idx) => {
    if (r.monthlyPoints > 0 || perf.sessionsCount > 0) {
      const rank = (idx + 1) as 1 | 2 | 3;
      const item = { rank, monthlyPoints: r.monthlyPoints, student: r.student };
      top3List.push(item);
      top3Ids.add(r.student.id);
      top3Map.set(r.student.id, item);
    }
  });

  return { top3Ids, top3Map, top3List };
}

export interface StudentMonthlyTop3Info {
  isTop3: boolean;
  rank?: 1 | 2 | 3;
  monthNameArabic: string;
  yearMonth: string;
  monthlyPoints: number;
  latestMonthName: string;
  latestMonthRank: number;
  latestMonthPoints: number;
  pointsToTop3: number;
  thirdPlacePoints: number;
  eligibleMonths: {
    yearMonth: string;
    monthNameArabic: string;
    rank: 1 | 2 | 3;
    monthlyPoints: number;
  }[];
}

/**
 * Checks if a specific student has achieved a Top 3 rank at the end of any recorded month,
 * and calculates their current monthly standing.
 */
export function getStudentMonthlyTop3Info(
  studentId: string,
  students: Student[],
  sessions: ServiceSession[],
  pointsRules: PointsRuleConfig,
  competitionLogs: CompetitionLog[],
  targetMonth?: string
): StudentMonthlyTop3Info {
  const availableMonths = extractAvailableMonths(sessions);
  const latestMonth = targetMonth || availableMonths[0] || new Date().toISOString().substring(0, 7);
  const latestMonthName = getArabicMonthYear(latestMonth);

  const eligibleMonths: {
    yearMonth: string;
    monthNameArabic: string;
    rank: 1 | 2 | 3;
    monthlyPoints: number;
  }[] = [];

  let latestMonthRank = 0;
  let latestMonthPoints = 0;
  let thirdPlacePoints = 0;
  let pointsToTop3 = 0;

  // Process available months
  availableMonths.forEach((ym) => {
    const { top3Map } = getTop3StudentIdsForMonth(ym, students, sessions, pointsRules, competitionLogs);
    if (top3Map.has(studentId)) {
      const match = top3Map.get(studentId)!;
      eligibleMonths.push({
        yearMonth: ym,
        monthNameArabic: getArabicMonthYear(ym),
        rank: match.rank,
        monthlyPoints: match.monthlyPoints,
      });
    }

    if (ym === latestMonth) {
      const perf = calculateMonthlyPerformance(ym, students, sessions, pointsRules, competitionLogs);
      const sorted = [...perf.studentsRecords].sort(
        (a, b) => b.monthlyPoints - a.monthlyPoints || b.attendanceRate - a.attendanceRate
      );
      const studentIdx = sorted.findIndex((r) => r.student.id === studentId);
      if (studentIdx !== -1) {
        latestMonthRank = studentIdx + 1;
        latestMonthPoints = sorted[studentIdx].monthlyPoints;
      }
      if (sorted[2]) {
        thirdPlacePoints = sorted[2].monthlyPoints;
        if (latestMonthRank > 3) {
          pointsToTop3 = Math.max(1, thirdPlacePoints - latestMonthPoints + 1);
        }
      }
    }
  });

  const isTop3 = eligibleMonths.length > 0;
  const currentOrBestMonth = eligibleMonths[0];

  return {
    isTop3,
    rank: currentOrBestMonth?.rank,
    monthNameArabic: currentOrBestMonth?.monthNameArabic || latestMonthName,
    yearMonth: currentOrBestMonth?.yearMonth || latestMonth,
    monthlyPoints: currentOrBestMonth?.monthlyPoints ?? latestMonthPoints,
    latestMonthName,
    latestMonthRank,
    latestMonthPoints,
    pointsToTop3,
    thirdPlacePoints,
    eligibleMonths,
  };
}

import { Student, ServiceSession, PointsRuleConfig, RewardTier, CompetitionLog, ClaimedReward } from '../types';

export interface StudentCalculatedStats {
  student: Student;
  currentStreak: number;
  bestStreak: number;
  totalPresent: number;
  totalAbsent: number;
  totalExcused: number;
  totalSessions: number;
  attendanceRate: number; // percentage 0 - 100
  totalPoints: number;
  allTimePoints: number;
  isCycleActive: boolean;
  cycleStartDate?: string;
  cycleTitle?: string;
  pointsBreakdown: {
    attendance: number;
    prayer: number;
    liturgy: number;
    verse: number;
    participation: number;
    competitions: number;
    penalties: number;
    sessionCustom: number;
    tierRewards: number;
  };
  eligibleTiers: {
    tier: RewardTier;
    alreadyClaimed: boolean;
    canClaimNow: boolean;
  }[];
  latestStatus?: 'present' | 'absent' | 'excused';
}

export function calculateStudentStats(
  student: Student,
  sessions: ServiceSession[],
  pointsRules: PointsRuleConfig,
  competitionLogs: CompetitionLog[],
  rewardTiers: RewardTier[]
): StudentCalculatedStats {
  // Sort sessions chronologically ascending
  const sortedSessions = [...sessions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const cycleStartDate = pointsRules.pointsCycleStartDate;
  const isCycleActive = Boolean(cycleStartDate);

  let currentStreak = 0;
  let bestStreak = 0;
  let runningStreak = 0;

  let totalPresent = 0;
  let totalAbsent = 0;
  let totalExcused = 0;

  let attendancePoints = 0;
  let prayerPoints = 0;
  let liturgyPoints = 0;
  let versePoints = 0;
  let participationPoints = 0;
  let sessionCustomPoints = 0;
  let totalPenalties = 0;

  let allTimeRaw = 0;

  // Track session by session from earliest to latest
  sortedSessions.forEach((session) => {
    const rec = session.records[student.id];
    if (!rec) return; // not enrolled or not recorded yet

    const inCycle = !cycleStartDate || session.date >= cycleStartDate;

    // Check session penalty points regardless of status
    if (rec.bonus?.penaltyPoints && rec.bonus.penaltyPoints > 0) {
      allTimeRaw -= rec.bonus.penaltyPoints;
      if (inCycle) {
        totalPenalties += rec.bonus.penaltyPoints;
      }
    }

    if (rec.status === 'present') {
      totalPresent++;
      runningStreak++;
      if (runningStreak > bestStreak) {
        bestStreak = runningStreak;
      }

      // Add points for all-time
      allTimeRaw += pointsRules.attendanceBase;
      if (rec.bonus.prayer) allTimeRaw += pointsRules.prayer;
      if (rec.bonus.liturgy) allTimeRaw += pointsRules.liturgy;
      if (rec.bonus.verse) allTimeRaw += pointsRules.verse;
      if (rec.bonus.participation) allTimeRaw += pointsRules.participation;
      if (rec.bonus.customPoints) allTimeRaw += rec.bonus.customPoints;

      // Add points for active cycle
      if (inCycle) {
        attendancePoints += pointsRules.attendanceBase;
        if (rec.bonus.prayer) prayerPoints += pointsRules.prayer;
        if (rec.bonus.liturgy) liturgyPoints += pointsRules.liturgy;
        if (rec.bonus.verse) versePoints += pointsRules.verse;
        if (rec.bonus.participation) participationPoints += pointsRules.participation;
        if (rec.bonus.customPoints) {
          if (rec.bonus.customPoints < 0) {
            totalPenalties += Math.abs(rec.bonus.customPoints);
          } else {
            sessionCustomPoints += rec.bonus.customPoints;
          }
        }
      }

    } else if (rec.status === 'absent') {
      totalAbsent++;
      runningStreak = 0;
    } else if (rec.status === 'excused') {
      totalExcused++;
      if (!pointsRules.streakPreserveOnExcuse) {
        runningStreak = 0;
      }
      // If preserve on excuse, runningStreak remains untouched
    }
  });

  currentStreak = runningStreak;

  // Points from competition logs (differentiating positive bonuses from negative deductions)
  let competitionsPoints = 0;
  competitionLogs.forEach((comp) => {
    if (comp.awardedStudentIds.includes(student.id)) {
      allTimeRaw += comp.points;
      const inCycle = !cycleStartDate || comp.date >= cycleStartDate;
      if (inCycle) {
        if (comp.points < 0 || comp.type === 'penalty') {
          totalPenalties += Math.abs(comp.points);
        } else {
          competitionsPoints += comp.points;
        }
      }
    }
  });

  // Points from claimed reward tier bonus points
  let tierRewardsPoints = 0;
  student.rewardsClaimed.forEach((claim) => {
    const tier = rewardTiers.find((t) => t.id === claim.tierId);
    if (tier && tier.bonusPointsReward) {
      allTimeRaw += tier.bonusPointsReward;
      const inCycle = !cycleStartDate || claim.date >= cycleStartDate;
      if (inCycle) {
        tierRewardsPoints += tier.bonusPointsReward;
      }
    }
  });

  const rawTotal =
    attendancePoints +
    prayerPoints +
    liturgyPoints +
    versePoints +
    participationPoints +
    sessionCustomPoints +
    competitionsPoints +
    tierRewardsPoints -
    totalPenalties;

  const totalPoints = Math.max(0, rawTotal);
  const allTimePoints = Math.max(0, allTimeRaw);

  const totalSessions = totalPresent + totalAbsent + totalExcused;
  const attendanceRate = totalSessions > 0 ? Math.round((totalPresent / totalSessions) * 100) : 0;

  // Check eligible tiers
  const eligibleTiers = rewardTiers
    .filter((tier) => tier.enabled)
    .sort((a, b) => a.requiredStreak - b.requiredStreak)
    .map((tier) => {
      // Check if already claimed for the current milestone reach
      // e.g. student achieved 4, claimed tier-4
      const claimedForThisTier = student.rewardsClaimed.filter(
        (c) => c.tierId === tier.id || c.milestoneStreak === tier.requiredStreak
      );
      const alreadyClaimed = claimedForThisTier.length > 0;
      const canClaimNow = currentStreak >= tier.requiredStreak && !alreadyClaimed;

      return {
        tier,
        alreadyClaimed,
        canClaimNow,
      };
    });

  // Latest status
  const latestSession = sortedSessions[sortedSessions.length - 1];
  const latestStatus = latestSession?.records[student.id]?.status;

  return {
    student,
    currentStreak,
    bestStreak,
    totalPresent,
    totalAbsent,
    totalExcused,
    totalSessions,
    attendanceRate,
    totalPoints,
    allTimePoints,
    isCycleActive,
    cycleStartDate: pointsRules.pointsCycleStartDate,
    cycleTitle: pointsRules.pointsCycleTitle,
    pointsBreakdown: {
      attendance: attendancePoints,
      prayer: prayerPoints,
      liturgy: liturgyPoints,
      verse: versePoints,
      participation: participationPoints,
      competitions: competitionsPoints,
      penalties: totalPenalties,
      sessionCustom: sessionCustomPoints,
      tierRewards: tierRewardsPoints,
    },
    eligibleTiers,
    latestStatus,
  };
}

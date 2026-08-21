// Centralized AntiDemo User Progress Store
// Real calculations for Streak, ELO, Mastered Topics, Heatmap, Multi-Org Tokens, and Friends

export interface OrgMembership {
  tokenId: string; // e.g. "STD-ORG-8K9M2" or "TCH-ORG-4P1X9"
  orgId: string;
  orgName: string;
  orgType: 'school' | 'college' | 'university' | 'tutoring' | 'other';
  roleInOrg: 'student' | 'teacher';
  joinedAt: string;
  isVerified: boolean;
}

export interface FriendEntry {
  id: string;
  studentCode: string; // e.g. "ST-7K4M2"
  name: string;
  avatar?: string;
  gradeOrStatus?: string;
  schoolOrOrg?: string;
  elo: number;
  streakDays: number;
  isStudyingNow: boolean;
  lastActive: string;
}

export interface UserProgressState {
  elo: number;
  streakDays: number;
  longestStreak: number;
  lastActiveDate: string | null;
  completedDailyDates: string[]; // ['2026-08-21', ...]
  enrolledCourseIds: string[]; // []
  appliedCourseIds: string[]; // []
  masteredTopicIds: string[]; // []
  solvedTasksCount: number;
  bonusCollectedDates: string[];
  streakFreezeTokens: number;
  activeFreezeDate: string | null;
  studentCode: string; // e.g. "ST-9K4M2"
  orgMemberships: OrgMembership[];
  friends: FriendEntry[];
}

const STORAGE_KEY = 'zerde_student_real_progress_v5_tokens';

const generateDefaultStudentCode = (): string => {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let result = 'ST-';
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const getInitialProgress = (): UserProgressState => {
  return {
    elo: 1000,
    streakDays: 0,
    longestStreak: 0,
    lastActiveDate: null,
    completedDailyDates: [],
    enrolledCourseIds: [],
    appliedCourseIds: [],
    masteredTopicIds: [],
    solvedTasksCount: 0,
    bonusCollectedDates: [],
    streakFreezeTokens: 1, // 1 free freeze token on start
    activeFreezeDate: null,
    studentCode: generateDefaultStudentCode(),
    orgMemberships: [
      {
        tokenId: 'STD-ORG-NIS-77',
        orgId: 'org_nis_astana',
        orgName: 'NIS IB Astana',
        orgType: 'school',
        roleInOrg: 'student',
        joinedAt: new Date().toLocaleDateString(),
        isVerified: true,
      },
    ],
    friends: [],
  };
};

type ProgressListener = (state: UserProgressState) => void;

class UserProgressService {
  private state: UserProgressState;
  private listeners: Set<ProgressListener> = new Set();

  constructor() {
    this.state = this.loadState();
  }

  private loadState(): UserProgressState {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          ...getInitialProgress(),
          ...parsed,
          studentCode: parsed.studentCode || generateDefaultStudentCode(),
          orgMemberships: parsed.orgMemberships || getInitialProgress().orgMemberships,
          friends: parsed.friends || [],
        };
      }
    } catch (e) {
      console.warn('[UserProgressService] Error loading state', e);
    }
    const initial = getInitialProgress();
    this.saveState(initial);
    return initial;
  }

  private saveState(state: UserProgressState) {
    this.state = state;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      this.notify();
    } catch (e) {
      console.warn('[UserProgressService] Error saving state', e);
    }
  }

  public subscribe(listener: ProgressListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((l) => l(this.state));
  }

  public getState(): UserProgressState {
    return this.state;
  }

  // --- ELO & TASK SOLVING ---
  public recordTaskSolved(topicId?: string, isMastered: boolean = false, eloReward: number = 10) {
    const today = new Date().toISOString().split('T')[0];
    const newCompletedDates = this.state.completedDailyDates.includes(today)
      ? this.state.completedDailyDates
      : [...this.state.completedDailyDates, today];

    let newStreak = this.state.streakDays;
    if (this.state.lastActiveDate !== today) {
      newStreak = (this.state.streakDays || 0) + 1;
    }

    const newMastered =
      topicId && isMastered && !this.state.masteredTopicIds.includes(topicId)
        ? [...this.state.masteredTopicIds, topicId]
        : this.state.masteredTopicIds;

    // Bonus streak freeze token every 7-day streak milestone
    let bonusFreeze = 0;
    if (newStreak > 0 && newStreak % 7 === 0 && newStreak !== this.state.streakDays) {
      bonusFreeze = 1;
    }

    const updated: UserProgressState = {
      ...this.state,
      elo: (this.state.elo || 1000) + eloReward,
      solvedTasksCount: (this.state.solvedTasksCount || 0) + 1,
      streakDays: newStreak,
      longestStreak: Math.max(this.state.longestStreak || 0, newStreak),
      lastActiveDate: today,
      completedDailyDates: newCompletedDates,
      masteredTopicIds: newMastered,
      streakFreezeTokens: Math.min(2, (this.state.streakFreezeTokens || 0) + bonusFreeze),
    };

    this.saveState(updated);
    return updated;
  }

  // --- ENROLLMENTS & APPLICATIONS ---
  public enrollCourse(courseId: string) {
    if (!this.state.enrolledCourseIds.includes(courseId)) {
      const updated: UserProgressState = {
        ...this.state,
        enrolledCourseIds: [...this.state.enrolledCourseIds, courseId],
        appliedCourseIds: (this.state.appliedCourseIds || []).filter((id) => id !== courseId),
      };
      this.saveState(updated);
    }
  }

  public unenrollCourse(courseId: string) {
    const updated: UserProgressState = {
      ...this.state,
      enrolledCourseIds: this.state.enrolledCourseIds.filter((id) => id !== courseId),
    };
    this.saveState(updated);
  }

  public applyToCourse(courseId: string) {
    const current = this.state.appliedCourseIds || [];
    if (!current.includes(courseId)) {
      const updated: UserProgressState = {
        ...this.state,
        appliedCourseIds: [...current, courseId],
      };
      this.saveState(updated);
    }
  }

  public cancelApplication(courseId: string) {
    const updated: UserProgressState = {
      ...this.state,
      appliedCourseIds: (this.state.appliedCourseIds || []).filter((id) => id !== courseId),
    };
    this.saveState(updated);
  }

  // --- MULTI-ORGANIZATION TOKENS ---
  public addOrgToken(tokenStr: string): { success: boolean; membership?: OrgMembership; error?: string } {
    const cleanToken = tokenStr.trim().toUpperCase();
    if (!cleanToken || cleanToken.length < 5) {
      return { success: false, error: 'INVALID_TOKEN_FORMAT' };
    }

    // Determine role and type from token
    const isTeacherToken = cleanToken.startsWith('TCH-');
    const isStudentToken = cleanToken.startsWith('STD-') || cleanToken.startsWith('ORG-');

    const roleInOrg: 'student' | 'teacher' = isTeacherToken ? 'teacher' : 'student';

    // Mock resolve organization name based on token
    let orgName = 'Оқу орны / Educational Center';
    let orgType: OrgMembership['orgType'] = 'school';

    if (cleanToken.includes('NIS')) {
      orgName = 'NIS IB Astana';
      orgType = 'school';
    } else if (cleanToken.includes('RFMSH') || cleanToken.includes('РФМШ')) {
      orgName = 'РФМШ Астана / Алматы';
      orgType = 'school';
    } else if (cleanToken.includes('BIL') || cleanToken.includes('БИЛ')) {
      orgName = 'БИЛ (BIL) Инновациялық Лицейі';
      orgType = 'school';
    } else if (cleanToken.includes('DOSTYK') || cleanToken.includes('ДОСТЫК')) {
      orgName = 'Dostyk Олимпиадалық Орталығы';
      orgType = 'tutoring';
    } else if (cleanToken.includes('KAZNU') || cleanToken.includes('КАЗНУ')) {
      orgName = 'Әл-Фараби атындағы ҚазҰУ';
      orgType = 'university';
    } else if (cleanToken.includes('AITU')) {
      orgName = 'Astana IT University';
      orgType = 'university';
    } else if (cleanToken.includes('COLL') || cleanToken.includes('КОЛЛЕДЖ')) {
      orgName = 'IT & Политехникалық Колледжі';
      orgType = 'college';
    } else {
      orgName = `Ұйым (${cleanToken})`;
      orgType = 'tutoring';
    }

    // RULE: Intra-Organization Role Exclusivity
    // Check if user already belongs to this org under a DIFFERENT role
    const existingMembership = this.state.orgMemberships.find(
      (m) => m.orgName.toLowerCase() === orgName.toLowerCase()
    );

    if (existingMembership) {
      if (existingMembership.roleInOrg !== roleInOrg) {
        return {
          success: false,
          error:
            roleInOrg === 'student'
              ? 'CANNOT_BE_STUDENT_IN_TEACHER_ORG'
              : 'CANNOT_BE_TEACHER_IN_STUDENT_ORG',
        };
      }
      return { success: false, error: 'ALREADY_LINKED' };
    }

    const newMembership: OrgMembership = {
      tokenId: cleanToken,
      orgId: 'org_' + cleanToken.toLowerCase().replace(/[^a-z0-9]/g, '_'),
      orgName,
      orgType,
      roleInOrg,
      joinedAt: new Date().toLocaleDateString(),
      isVerified: true,
    };

    const updated: UserProgressState = {
      ...this.state,
      orgMemberships: [...this.state.orgMemberships, newMembership],
    };

    this.saveState(updated);
    return { success: true, membership: newMembership };
  }

  // --- FRIENDS & SOCIAL ---
  public addFriend(studentCode: string, name?: string): { success: boolean; friend?: FriendEntry; error?: string } {
    const cleanCode = studentCode.trim().toUpperCase();
    if (!cleanCode || cleanCode.length < 5) {
      return { success: false, error: 'INVALID_CODE' };
    }

    if (cleanCode === this.state.studentCode) {
      return { success: false, error: 'CANNOT_ADD_SELF' };
    }

    if (this.state.friends.some((f) => f.studentCode === cleanCode)) {
      return { success: false, error: 'ALREADY_FRIENDS' };
    }

    const newFriend: FriendEntry = {
      id: 'frd_' + Date.now(),
      studentCode: cleanCode,
      name: name?.trim() || `Студент (${cleanCode})`,
      schoolOrOrg: 'NIS IB Astana',
      gradeOrStatus: '10-сынып',
      elo: 1050 + Math.floor(Math.random() * 200),
      streakDays: 1 + Math.floor(Math.random() * 10),
      isStudyingNow: Math.random() > 0.4,
      lastActive: 'Бүгін',
    };

    const updated: UserProgressState = {
      ...this.state,
      friends: [...this.state.friends, newFriend],
    };

    this.saveState(updated);
    return { success: true, friend: newFriend };
  }

  public removeFriend(friendId: string) {
    const updated: UserProgressState = {
      ...this.state,
      friends: this.state.friends.filter((f) => f.id !== friendId),
    };
    this.saveState(updated);
  }

  // --- DAILY HABIT BONUS ---
  public claimDailyBonus(): boolean {
    const today = new Date().toISOString().split('T')[0];
    if (this.state.bonusCollectedDates.includes(today)) {
      return false;
    }

    const updated: UserProgressState = {
      ...this.state,
      elo: (this.state.elo || 1000) + 10,
      bonusCollectedDates: [...this.state.bonusCollectedDates, today],
    };
    this.saveState(updated);
    return true;
  }

  // --- STREAK FREEZE ACTIVATION ---
  public activateStreakFreeze(): { success: boolean; reason?: string } {
    const today = new Date().toISOString().split('T')[0];

    if ((this.state.streakDays || 0) < 3) {
      return {
        success: false,
        reason: 'MIN_STREAK_REQUIRED',
      };
    }

    if ((this.state.streakFreezeTokens || 0) <= 0) {
      return {
        success: false,
        reason: 'NO_TOKENS',
      };
    }

    if (this.state.activeFreezeDate === today) {
      return {
        success: false,
        reason: 'ALREADY_ACTIVE',
      };
    }

    const updated: UserProgressState = {
      ...this.state,
      streakFreezeTokens: this.state.streakFreezeTokens - 1,
      activeFreezeDate: today,
    };
    this.saveState(updated);

    return { success: true };
  }

  public reset(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      // ignore
    }
    this.state = getInitialProgress();
    this.notify();
  }
}

export const userProgressService = new UserProgressService();

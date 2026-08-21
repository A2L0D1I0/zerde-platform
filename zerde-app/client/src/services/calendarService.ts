// Centralized Calendar & Roadmap Service v3 (Clean Zero-Fake State)
// Vector SVG Icons, Universal Categories, Teacher Verification Queue, and Real Gamification.

import { userProgressService } from './userProgressService';

export type CalendarEventType =
  | 'student_personal'
  | 'teacher_group'
  | 'teacher_student'
  | 'teacher_personal';

export type EventColorTag =
  | 'purple'
  | 'blue'
  | 'emerald'
  | 'amber'
  | 'rose'
  | 'cyan';

export interface CategoryMeta {
  id: string;
  nameKZ: string;
  nameRU: string;
  nameEN: string;
  colorTag: EventColorTag;
  vectorIcons: string[]; // 1 to 3 Lucide icon names, e.g. ['BookOpen', 'Target', 'Sparkles']
  isCustom?: boolean;
}

export interface CalendarEvent {
  id: string;
  title: string; // Flexible block: user-defined text
  description?: string; // Flexible block
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  type: CalendarEventType;
  authorId: string;
  authorName: string;
  authorRole: 'student' | 'teacher';
  targetGroupId?: string; // e.g. '1' for 9 «А», '2' for 9 «Б»
  targetGroupName?: string; // e.g. '9 «А»'
  targetStudentId?: string;
  targetStudentName?: string;
  isCompleted: boolean;
  completedAt?: string;
  categoryId: string; // 'study', 'review', 'project', 'deadline', 'practice', 'personal', or custom id
  colorTag: EventColorTag;
  vectorIcons: string[]; // 1 to 3 vector icon names for background pattern
  eloReward?: number; // Verified reward for teacher tasks
  verificationStatus?: 'pending' | 'verified' | 'rejected'; // For teacher verification queue
  verifiedAt?: string;
  verifiedByTeacherId?: string;
}

export const AVAILABLE_VECTOR_ICONS = [
  'BookOpen',
  'Target',
  'Sparkles',
  'RotateCcw',
  'Brain',
  'Zap',
  'Compass',
  'Layers',
  'FileCode',
  'Clock',
  'AlertCircle',
  'Calendar',
  'Dumbbell',
  'TrendingUp',
  'Award',
  'User',
  'Star',
  'Heart',
  'Atom',
  'Code',
  'PenTool',
  'Flame',
  'HelpCircle',
  'Bookmark',
];

export const DEFAULT_UNIVERSAL_CATEGORIES: CategoryMeta[] = [
  {
    id: 'study',
    nameKZ: 'Оқу',
    nameRU: 'Учеба',
    nameEN: 'Study',
    colorTag: 'purple',
    vectorIcons: ['BookOpen', 'Target', 'Sparkles'],
  },
  {
    id: 'review',
    nameKZ: 'Қайталау',
    nameRU: 'Повторение',
    nameEN: 'Review',
    colorTag: 'emerald',
    vectorIcons: ['RotateCcw', 'Brain', 'Zap'],
  },
  {
    id: 'project',
    nameKZ: 'Жоба',
    nameRU: 'Проект',
    nameEN: 'Project',
    colorTag: 'blue',
    vectorIcons: ['Compass', 'Layers', 'FileCode'],
  },
  {
    id: 'deadline',
    nameKZ: 'Дедлайн (СОР/СОЧ)',
    nameRU: 'Дедлайн (СОР/СОЧ)',
    nameEN: 'Deadline',
    colorTag: 'rose',
    vectorIcons: ['Clock', 'AlertCircle', 'Calendar'],
  },
  {
    id: 'practice',
    nameKZ: 'Практика',
    nameRU: 'Практика',
    nameEN: 'Practice',
    colorTag: 'amber',
    vectorIcons: ['Dumbbell', 'TrendingUp', 'Award'],
  },
  {
    id: 'personal',
    nameKZ: 'Жеке жоспар',
    nameRU: 'Личное',
    nameEN: 'Personal',
    colorTag: 'cyan',
    vectorIcons: ['User', 'Star', 'Heart'],
  },
];

const EVENTS_STORAGE_KEY = 'zerde_calendar_events_clean_v5';
const CATEGORIES_STORAGE_KEY = 'zerde_calendar_custom_categories_v3';

export const getDefaultInitialEvents = (): CalendarEvent[] => {
  return [];
};

type EventChangeListener = () => void;

class CalendarService {
  private listeners: Set<EventChangeListener> = new Set();

  public subscribe(listener: EventChangeListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  // --- CATEGORIES MANAGEMENT ---
  public getCategories(): CategoryMeta[] {
    try {
      const stored = localStorage.getItem(CATEGORIES_STORAGE_KEY);
      if (stored) {
        const custom: CategoryMeta[] = JSON.parse(stored);
        return [...DEFAULT_UNIVERSAL_CATEGORIES, ...custom];
      }
    } catch (e) {
      console.warn('[CalendarService] Error reading custom categories', e);
    }
    return DEFAULT_UNIVERSAL_CATEGORIES;
  }

  public addCustomCategory(cat: Omit<CategoryMeta, 'id' | 'isCustom'>): CategoryMeta {
    const newCat: CategoryMeta = {
      ...cat,
      id: 'cat_custom_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      isCustom: true,
    };

    try {
      const stored = localStorage.getItem(CATEGORIES_STORAGE_KEY);
      const custom: CategoryMeta[] = stored ? JSON.parse(stored) : [];
      custom.push(newCat);
      localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(custom));
      this.notify();
    } catch (e) {
      console.warn('[CalendarService] Error saving custom category', e);
    }

    return newCat;
  }

  // --- EVENTS MANAGEMENT ---
  public getAll(): CalendarEvent[] {
    try {
      const stored = localStorage.getItem(EVENTS_STORAGE_KEY);
      if (stored) {
        const events: CalendarEvent[] = JSON.parse(stored);
        // Ensure no legacy demo events remain
        const legacyDemoIds = new Set(['evt_1', 'evt_2', 'evt_3', 'evt_4', 'evt_5', 'evt_6']);
        return events.filter((e) => !legacyDemoIds.has(e.id));
      }
    } catch (e) {
      console.warn('[CalendarService] Error reading from localStorage', e);
    }
    return [];
  }

  private saveAll(events: CalendarEvent[]) {
    try {
      const legacyDemoIds = new Set(['evt_1', 'evt_2', 'evt_3', 'evt_4', 'evt_5', 'evt_6']);
      const cleanEvents = events.filter((e) => !legacyDemoIds.has(e.id));
      localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(cleanEvents));
      this.notify();
    } catch (e) {
      console.warn('[CalendarService] Error saving to localStorage', e);
    }
  }

  public getEventsForStudent(studentId?: string, groupId: string = '1'): CalendarEvent[] {
    const all = this.getAll();
    return all.filter((evt) => {
      if (evt.type === 'student_personal') {
        return !studentId || evt.authorId === studentId;
      }
      if (evt.type === 'teacher_group') {
        return !evt.targetGroupId || evt.targetGroupId === groupId;
      }
      if (evt.type === 'teacher_student') {
        return !studentId || evt.targetStudentId === studentId;
      }
      return false;
    });
  }

  public getEventsForTeacher(teacherId?: string, filterGroupId?: string): CalendarEvent[] {
    const all = this.getAll();
    return all.filter((evt) => {
      if (evt.type === 'student_personal') return false;
      if (filterGroupId && filterGroupId !== 'all') {
        if (evt.targetGroupId && evt.targetGroupId !== filterGroupId) return false;
      }
      return true;
    });
  }

  public getPendingVerificationsForTeacher(teacherId?: string, groupId?: string): CalendarEvent[] {
    const all = this.getAll();
    return all.filter((evt) => {
      if (evt.type !== 'teacher_group' && evt.type !== 'teacher_student') return false;
      if (groupId && groupId !== 'all' && evt.targetGroupId && evt.targetGroupId !== groupId) return false;
      return evt.verificationStatus === 'pending';
    });
  }

  public addEvent(evt: Omit<CalendarEvent, 'id'>): CalendarEvent {
    const all = this.getAll();
    const categories = this.getCategories();
    const catMeta = categories.find((c) => c.id === evt.categoryId) || categories[0];

    const newEvent: CalendarEvent = {
      ...evt,
      id: 'evt_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      colorTag: evt.colorTag || catMeta.colorTag,
      vectorIcons: evt.vectorIcons && evt.vectorIcons.length > 0 ? evt.vectorIcons : catMeta.vectorIcons,
      isCompleted: evt.isCompleted || false,
    };

    all.push(newEvent);
    this.saveAll(all);
    return newEvent;
  }

  public deleteEvent(eventId: string): boolean {
    const all = this.getAll();
    const filtered = all.filter((e) => e.id !== eventId);
    if (filtered.length !== all.length) {
      this.saveAll(filtered);
      return true;
    }
    return false;
  }

  public isDailyBonusClaimedToday(): boolean {
    const todayStr = new Date().toISOString().split('T')[0];
    const progress = userProgressService.getState();
    return progress.bonusCollectedDates.includes(todayStr);
  }

  public toggleEventCompleted(eventId: string): {
    event: CalendarEvent | null;
    completed: boolean;
    earnedDailyBonus: boolean;
  } {
    const all = this.getAll();
    const target = all.find((e) => e.id === eventId);
    if (!target) return { event: null, completed: false, earnedDailyBonus: false };

    target.isCompleted = !target.isCompleted;
    target.completedAt = target.isCompleted ? new Date().toISOString() : undefined;

    let earnedDailyBonus = false;
    if (target.isCompleted) {
      // Record task in progress service
      userProgressService.recordTaskSolved(undefined, false, 5);

      const todayStr = new Date().toISOString().split('T')[0];
      const todayEvents = all.filter((e) => e.date === todayStr);
      const allTodayCompleted = todayEvents.length > 0 && todayEvents.every((e) => e.isCompleted);

      if (allTodayCompleted) {
        earnedDailyBonus = userProgressService.claimDailyBonus();
      }
    }

    this.saveAll(all);
    return {
      event: target,
      completed: target.isCompleted,
      earnedDailyBonus,
    };
  }

  public verifyEvent(
    eventId: string,
    isApproved: boolean,
    teacherId: string = 'tch_01'
  ): { event: CalendarEvent | null; eloAwarded: number } {
    const all = this.getAll();
    const target = all.find((e) => e.id === eventId);
    if (!target) return { event: null, eloAwarded: 0 };

    target.verificationStatus = isApproved ? 'verified' : 'rejected';
    target.verifiedAt = new Date().toISOString();
    target.verifiedByTeacherId = teacherId;

    let eloAwarded = 0;
    if (isApproved) {
      eloAwarded = target.eloReward || 25;
      userProgressService.recordTaskSolved(undefined, true, eloAwarded);
    }

    this.saveAll(all);
    return { event: target, eloAwarded };
  }
}

export const calendarService = new CalendarService();

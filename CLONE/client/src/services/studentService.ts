import {
  StudentDashboardData,
  StudentHeatmapData,
  HeatmapDay,
  ClassLeaderboardEntry,
  StudentRoadmapData,
  SM2MemoryCard,
  Topic,
} from '@/types';
import api from '@/api/client';
import { userProgressService } from './userProgressService';

export const mockTopicsList: Topic[] = [];

export const generateWeeklyStudyDays = (lang: 'KZ' | 'RU' | 'EN' = 'KZ') => {
  const days = [];
  const now = new Date();
  const currentDayOfWeek = (now.getDay() + 6) % 7; // Monday = 0

  const daysKZ = ['Дс', 'Сс', 'Ср', 'Бс', 'Жм', 'Сн', 'Жк'];
  const daysRU = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
  const daysEN = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const dayNames = lang === 'KZ' ? daysKZ : lang === 'RU' ? daysRU : daysEN;

  const monday = new Date(now);
  monday.setDate(now.getDate() - currentDayOfWeek);

  const prog = userProgressService.getState();

  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const isToday = i === currentDayOfWeek;
    const isPast = i < currentDayOfWeek;
    const isFuture = i > currentDayOfWeek;
    const isCompleted = prog.completedDailyDates.includes(dateStr);

    days.push({
      date: dateStr,
      dayOfWeek: dayNames[i],
      dayNumber: d.getDate(),
      isCompleted,
      isToday,
      isFuture,
      tasksCount: isCompleted ? 1 : 0,
      streakActive: isCompleted || (isToday && prog.streakDays > 0),
    });
  }

  return days;
};

export const generate365DaysHeatmap = (): HeatmapDay[] => {
  const days: HeatmapDay[] = [];
  const now = new Date();

  for (let i = 364; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = d.toISOString().split('T')[0];

    days.push({
      date: dateStr,
      tasksCompleted: 0,
      level: 0,
    });
  }

  return days;
};

class StudentService {
  public async getDashboard(studentId?: string): Promise<StudentDashboardData | null> {
    try {
      const response = await api.get<any>('/student/dashboard', { params: { studentId } });
      const data = response?.data || response;
      if (data && (data.user || data.elo !== undefined)) {
        return data;
      }
    } catch (err) {
      console.warn('[StudentService] Backend dashboard fetch failed:', err);
    }

    const progress = userProgressService.getState();

    return {
      user: {
        id: studentId || 'current_user',
        email: 'student@school.kz',
        full_name: 'Оқушы',
        role: 'student',
        grade: '10-сынып',
        school: '',
        language: 'KZ',
        theme: 'dark',
        overallElo: progress.elo,
        streakDays: progress.streakDays,
        eloRank: {
          level: progress.elo >= 1600 ? 'Самғау' : progress.elo >= 1400 ? 'Қыран' : progress.elo >= 1200 ? 'Тұғыр' : 'Өскін',
          symbol: progress.elo >= 1600 ? '⭐' : progress.elo >= 1400 ? '🦅' : progress.elo >= 1200 ? '🌿' : '🌱',
          minElo: 1000,
          maxElo: 1600,
        },
      },
      elo: progress.elo,
      rank: progress.elo >= 1600 ? 'Самғау' : progress.elo >= 1400 ? 'Қыран' : progress.elo >= 1200 ? 'Тұғыр' : 'Өскін',
      rank_badge: '🌱 Өскін',
      streak_days: progress.streakDays,
      streak_freeze_available: (progress.streakFreezeTokens || 0) > 0,
      pinned_course: null,
      recent_topics: [],
      memory_cards: {
        due_today: 0,
        total_reviewed: 0,
        retention_rate: 100,
      },
      daily_focus: {
        title: 'Интерактивті оқу мақсаты',
        duration_minutes: 3,
        topic_id: 'top_focus_1',
        elo_reward: 15,
      },
    };
  }

  public async getHeatmap(studentId?: string): Promise<StudentHeatmapData> {
    try {
      const response = await api.get<any>('/student/heatmap', { params: { studentId } });
      const data = response?.data || response;
      if (data && Array.isArray(data.matrix)) {
        return data;
      }
    } catch (err) {
      console.warn('[StudentService] Backend heatmap fetch failed:', err);
    }

    const matrix = generate365DaysHeatmap();
    const progress = userProgressService.getState();
    return {
      year: new Date().getFullYear(),
      total_contributions: progress.solvedTasksCount,
      current_streak: progress.streakDays,
      longest_streak: progress.longestStreak,
      matrix,
    };
  }

  public async getLeaderboard(courseId?: string): Promise<ClassLeaderboardEntry[]> {
    try {
      const response = await api.get<any>('/student/leaderboard', { params: { courseId } });
      const data = Array.isArray(response) ? response : Array.isArray(response?.data) ? response.data : [];
      if (data.length > 0) {
        return data;
      }
    } catch (err) {
      console.warn('[StudentService] Backend leaderboard fetch failed:', err);
    }

    const progress = userProgressService.getState();

    // If student is not enrolled in any course, there is no course leaderboard
    if (!progress.enrolledCourseIds || progress.enrolledCourseIds.length === 0) {
      return [];
    }

    const rawList: Omit<ClassLeaderboardEntry, 'rank'>[] = [
      {
        id: 'current_user',
        name: 'Сіз',
        grade: '10-сынып',
        school: '',
        elo: progress.elo,
        eloRankLevel:
          progress.elo >= 1600
            ? 'Самғау'
            : progress.elo >= 1400
            ? 'Қыран'
            : progress.elo >= 1200
            ? 'Тұғыр'
            : 'Өскін',
        streakDays: progress.streakDays,
        masteredCount: progress.masteredTopicIds.length,
        isCurrentUser: true,
      },
    ];

    // Include real added friends if any
    (progress.friends || []).forEach((f) => {
      rawList.push({
        id: f.id,
        name: f.name,
        grade: f.gradeOrStatus || '10-сынып',
        school: f.schoolOrOrg || '',
        elo: f.elo,
        eloRankLevel:
          f.elo >= 1600
            ? 'Самғау'
            : f.elo >= 1400
            ? 'Қыран'
            : f.elo >= 1200
            ? 'Тұғыр'
            : 'Өскін',
        streakDays: f.streakDays,
        masteredCount: Math.floor(f.elo / 100),
        isCurrentUser: false,
      });
    });

    rawList.sort((a, b) => b.elo - a.elo);

    return rawList.map((entry, idx) => ({
      ...entry,
      rank: idx + 1,
    }));
  }

  public async getRoadmap(studentId?: string): Promise<StudentRoadmapData | null> {
    try {
      const response = await api.get<any>('/student/roadmap', { params: { studentId } });
      return response?.data || response || null;
    } catch (err) {
      console.warn('[StudentService] Backend roadmap fetch failed:', err);
      return null;
    }
  }

  public async getSM2Cards(): Promise<SM2MemoryCard[]> {
    return [];
  }
}

export const studentService = new StudentService();

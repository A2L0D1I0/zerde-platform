import bcryptjs from 'bcryptjs';
import { getDb } from './database';
import {

  User,
  SafeUser,
  Course,
  Topic,
  Enrollment,
  NotificationItem,
  StudentDashboardData,
  StudentHeatmapData,
  StudentRoadmapData,
  EloRank,
  TopicStatus,
  EnrollmentStatus,
  AppLanguage,
  AppTheme,
  Organization,
  CourseInvitation,
  CourseApplicationData
} from '../types';



class DataStore {
  private users: Map<string, User> = new Map();
  private organizations: Map<string, Organization> = new Map();
  private courses: Map<string, Course> = new Map();
  private courseInvitations: Map<string, CourseInvitation> = new Map();
  private topics: Map<string, Topic[]> = new Map(); // course_id -> topics
  private enrollments: Map<string, Enrollment> = new Map(); // id -> enrollment
  private notifications: Map<string, NotificationItem[]> = new Map(); // user_id -> notifications
  private studentStats: Map<string, { elo: number; streak_days: number; last_active: string }> = new Map();

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    // 0. Seed Organizations (Valid official schools for registration)
    const org1: Organization = {
      id: 'org_nis_01',
      name: 'NIS IB Astana',
      org_token: 'ORG-8F3K9A',
      type: 'school',
      created_at: new Date('2026-01-01T08:00:00Z').toISOString()
    };

    this.organizations.set(org1.id, org1);

    // Restore any registered users from SQLite database
    try {
      const db = getDb();
      const sqliteUsers = db.prepare("SELECT * FROM users").all() as any[];
      for (const row of sqliteUsers) {
        if (!this.users.has(row.uuid)) {
          this.users.set(row.uuid, {
            id: row.uuid,
            email: row.email,
            password_hash: row.password_hash,
            full_name: row.full_name,
            role: row.role,
            bio: row.bio || '',
            grade: row.grade ? `${row.grade}` : '',
            school: row.school || '',
            organization_id: row.organization_id ? `org_${row.organization_id}` : undefined,
            language: 'kz',
            theme: 'dark',
            created_at: row.created_at || new Date().toISOString(),
            updated_at: row.updated_at || new Date().toISOString()
          });
          if (row.role === 'student') {
            this.studentStats.set(row.uuid, {
              elo: 1000,
              streak_days: 0,
              last_active: new Date().toISOString()
            });
          }
        }
      }
    } catch (e) {
      // ignore
    }
  }

  // --- Users ---
  public findUserByEmail(email: string): User | undefined {
    for (const u of this.users.values()) {
      if (u.email.toLowerCase() === email.toLowerCase()) {
        return u;
      }
    }
    return undefined;
  }

  public findUserById(id: string): User | undefined {
    return this.users.get(id);
  }

  public createUser(userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): User {
    const id = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    const newUser: User = {
      ...userData,
      id,
      created_at: now,
      updated_at: now
    };
    this.users.set(id, newUser);
    if (userData.role === 'student') {
      this.studentStats.set(id, {
        elo: 1000,
        streak_days: 0,
        last_active: now
      });
    }

    try {
      const db = getDb();
      db.prepare(`
        INSERT OR REPLACE INTO users (uuid, email, password_hash, full_name, role, bio, grade, school, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        id,
        newUser.email,
        newUser.password_hash,
        newUser.full_name,
        newUser.role,
        newUser.bio || '',
        parseInt(newUser.grade || '0') || null,
        newUser.school || '',
        now,
        now
      );
    } catch (e) {
      // ignore
    }

    return newUser;
  }


  public updateUser(id: string, updates: Partial<User>): User | undefined {
    const user = this.users.get(id);
    if (!user) return undefined;
    const updated: User = {
      ...user,
      ...updates,
      updated_at: new Date().toISOString()
    };
    this.users.set(id, updated);
    return updated;
  }

  public toSafeUser(user: User): SafeUser {
    const { password_hash, ...safe } = user;
    const stats = this.studentStats.get(user.id);
    const overallElo = stats ? stats.elo : (user.role === 'teacher' ? 2000 : 1000);
    const streakDays = stats ? stats.streak_days : 0;
    const { rank } = this.getEloRank(overallElo);
    const symbol = overallElo >= 1600 ? '🚀' : overallElo >= 1350 ? '🦅' : overallElo >= 1150 ? '🏔️' : '🌱';
    return {
      ...safe,
      overallElo,
      streakDays,
      eloRank: {
        level: rank,
        symbol,
        minElo: overallElo >= 1600 ? 1600 : overallElo >= 1350 ? 1350 : overallElo >= 1150 ? 1150 : 0,
        maxElo: overallElo >= 1600 ? 3000 : overallElo >= 1350 ? 1600 : overallElo >= 1150 ? 1350 : 1150
      }
    };
  }


  // --- Organizations & Security Tokens ---
  public validateOrgToken(token: string): Organization | null {
    if (!token) return null;
    const clean = token.trim().toUpperCase();
    for (const org of this.organizations.values()) {
      if (org.org_token.toUpperCase() === clean) {
        return org;
      }
    }
    try {
      const db = getDb();
      const row = db.prepare('SELECT * FROM organizations WHERE UPPER(org_token) = ?').get(clean) as any;
      if (row) {
        const org: Organization = {
          id: `org_${row.id}`,
          name: row.name,
          org_token: row.org_token,
          type: (row.type as any) || 'school',
          created_at: row.created_at
        };
        this.organizations.set(org.id, org);
        return org;
      }
    } catch (e) {
      // ignore
    }
    return null;
  }

  public getOrganizationById(id: string): Organization | undefined {
    return this.organizations.get(id);
  }

  // --- Courses ---
  public generateShortCourseCode(): string {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let code = '';
    do {
      code = '';
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
    } while (Array.from(this.courses.values()).some((c) => c.short_code === code));
    return code;
  }

  public getAllCourses(filters?: { subject?: string; grade?: string; search?: string; language?: string }): Course[] {
    let list = Array.from(this.courses.values());
    if (filters) {
      if (filters.subject) {
        list = list.filter(c => c.subject.toLowerCase() === filters.subject!.toLowerCase());
      }
      if (filters.grade) {
        list = list.filter(c => c.grade.toLowerCase().includes(filters.grade!.toLowerCase()));
      }
      if (filters.language && filters.language !== 'all') {
        list = list.filter(c => c.language === 'all' || c.language === filters.language);
      }
      if (filters.search) {
        const q = filters.search.toLowerCase();
        list = list.filter(
          c =>
            c.title.toLowerCase().includes(q) ||
            c.description.toLowerCase().includes(q) ||
            (c.short_code && c.short_code.toLowerCase().includes(q))
        );
      }
    }
    return list;
  }

  public getCourseById(id: string): Course | undefined {
    return this.courses.get(id);
  }

  public findCourseByShortCode(code: string): Course | undefined {
    if (!code) return undefined;
    const clean = code.trim().toUpperCase();
    for (const c of this.courses.values()) {
      if (c.short_code && c.short_code.toUpperCase() === clean) {
        return c;
      }
    }
    return undefined;
  }

  public createCourse(courseData: Omit<Course, 'id' | 'short_code' | 'students_count' | 'created_at' | 'updated_at'> & { short_code?: string }): Course {
    const id = `crs_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    const short_code = courseData.short_code || this.generateShortCourseCode();
    const newCourse: Course = {
      ...courseData,
      id,
      short_code,
      students_count: 0,
      created_at: now,
      updated_at: now
    };
    this.courses.set(id, newCourse);
    this.topics.set(id, []);
    return newCourse;
  }

  // --- Course Invitations (Teacher -> Student) ---
  public createCourseInvitation(courseId: string, teacherId: string, studentName: string, studentEmail: string): CourseInvitation {
    const id = `inv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const course = this.getCourseById(courseId);
    const teacher = this.findUserById(teacherId);
    const invitation: CourseInvitation = {
      id,
      course_id: courseId,
      course_title: course?.title || 'Курс',
      course_short_code: course?.short_code || '',
      teacher_id: teacherId,
      teacher_name: teacher?.full_name || 'Оқытушы',
      student_name: studentName,
      student_email: studentEmail.trim().toLowerCase(),
      status: 'pending',
      created_at: new Date().toISOString()
    };
    this.courseInvitations.set(id, invitation);
    return invitation;
  }

  public getStudentInvitations(email: string): CourseInvitation[] {
    const clean = email.trim().toLowerCase();
    return Array.from(this.courseInvitations.values()).filter(
      (inv) => inv.student_email.toLowerCase() === clean && inv.status === 'pending'
    );
  }

  public acceptCourseInvitation(invitationId: string, student: SafeUser | User): Enrollment | null {
    const inv = this.courseInvitations.get(invitationId);
    if (!inv || inv.status !== 'pending') return null;
    inv.status = 'accepted';
    const enrollment = this.createEnrollment(inv.course_id, student);
    enrollment.status = 'enrolled';
    return enrollment;
  }

  public updateCourse(id: string, updates: Partial<Course>): Course | undefined {
    const course = this.courses.get(id);
    if (!course) return undefined;
    const updated: Course = {
      ...course,
      ...updates,
      updated_at: new Date().toISOString()
    };
    this.courses.set(id, updated);
    return updated;
  }

  // --- Topics ---
  public getCourseTopics(courseId: string): Topic[] {
    return this.topics.get(courseId) || [];
  }

  public addTopic(topicData: Omit<Topic, 'id'>): Topic {
    const id = `top_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const topic: Topic = { ...topicData, id };
    const list = this.topics.get(topicData.course_id) || [];
    list.push(topic);
    this.topics.set(topicData.course_id, list);
    return topic;
  }

  // --- Enrollments ---
  public getEnrollmentsByCourse(courseId: string): Enrollment[] {
    return Array.from(this.enrollments.values()).filter(e => e.course_id === courseId);
  }

  public getStudentEnrollments(studentId: string): Enrollment[] {
    return Array.from(this.enrollments.values()).filter(e => e.student_id === studentId);
  }

  public getStudentCourses(studentId: string): (Course & { enrollment_status: EnrollmentStatus; rejection_reason?: string; application_data?: CourseApplicationData })[] {
    const studentEnrs = Array.from(this.enrollments.values()).filter(
      e => e.student_id === studentId && !e.is_dismissed
    );
    const result: (Course & { enrollment_status: EnrollmentStatus; rejection_reason?: string; application_data?: CourseApplicationData })[] = [];
    for (const enr of studentEnrs) {
      const course = this.courses.get(enr.course_id);
      if (course) {
        result.push({
          ...course,
          enrollment_status: enr.status,
          rejection_reason: enr.rejection_reason,
          application_data: enr.application_data
        });
      }
    }
    return result;
  }

  public getTeacherEnrollmentRequests(teacherId?: string): any[] {
    const pendingEnrs = Array.from(this.enrollments.values()).filter(e => e.status === 'pending_approval');
    const result: any[] = [];

    for (const e of pendingEnrs) {
      const course = this.courses.get(e.course_id);
      if (!course) continue;
      if (teacherId && course.teacher_id !== teacherId && teacherId !== 'usr_admin_01') {
        continue;
      }
      const student = this.users.get(e.student_id);
      const stats = this.studentStats.get(e.student_id) || { elo: 1000, streak_days: 0 };

      result.push({
        id: e.id,
        studentId: e.student_id,
        studentName: e.student_name,
        studentEmail: e.student_email,
        courseId: e.course_id,
        courseTitle: course.title,
        courseShortCode: course.short_code,
        grade: e.grade || student?.grade || '9 «А»',
        school: e.school || student?.school || 'РФМШ',
        currentElo: stats.elo || 1000,
        date: e.applied_at,
        avatarInitial: e.student_name.charAt(0).toUpperCase(),
        application_data: e.application_data,
        status: e.status
      });
    }
    return result;
  }

  public findEnrollment(courseId: string, studentId: string): Enrollment | undefined {
    for (const e of this.enrollments.values()) {
      if (e.course_id === courseId && e.student_id === studentId) {
        return e;
      }
    }
    return undefined;
  }

  public createEnrollment(courseId: string, student: SafeUser | User, applicationData?: CourseApplicationData): Enrollment {
    const course = this.courses.get(courseId);
    if (course && course.teacher_id === student.id) {
      throw new Error('Мұғалім өзі жасаған курсына оқушы ретінде қатыса алмайды (Teacher cannot enroll in own course)');
    }

    const existing = this.findEnrollment(courseId, student.id);
    const now = new Date().toISOString();
    const stats = this.studentStats.get(student.id);

    if (existing) {
      existing.status = 'pending_approval';
      existing.application_data = applicationData || existing.application_data;
      existing.rejection_reason = undefined;
      existing.is_dismissed = false;
      existing.updated_at = now;
      return existing;
    }
    const id = `enr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const newEnrollment: Enrollment = {
      id,
      course_id: courseId,
      student_id: student.id,
      student_name: student.full_name,
      student_email: student.email,
      grade: student.grade,
      school: student.school,
      current_elo: stats?.elo ?? 1000,
      status: 'pending_approval',
      application_data: applicationData,
      is_dismissed: false,
      applied_at: now,
      updated_at: now
    };
    this.enrollments.set(id, newEnrollment);

    // Notify teacher
    if (course) {
      const teacherId = course.teacher_id;
      const teacherNotifs = this.notifications.get(teacherId) || [];
      teacherNotifs.unshift({
        id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
        user_id: teacherId,
        title: '📩 Жаңа өтініш түсті',
        message: `${student.full_name} «${course.title}» курсына жазылуға өтініш жіберді.`,
        type: 'course_enrollment',
        is_read: false,
        action_url: `/teacher/courses/${courseId}/enrollments`,
        created_at: now
      });
      this.notifications.set(teacherId, teacherNotifs);
    }

    return newEnrollment;
  }

  public cancelApplication(courseId: string, studentId: string): boolean {
    const enr = this.findEnrollment(courseId, studentId);
    if (!enr || enr.status !== 'pending_approval') return false;
    this.enrollments.delete(enr.id);
    return true;
  }

  public dismissRejectedCourse(courseId: string, studentId: string): boolean {
    const enr = this.findEnrollment(courseId, studentId);
    if (!enr) return false;
    enr.is_dismissed = true;
    enr.updated_at = new Date().toISOString();
    return true;
  }

  public updateEnrollmentStatus(courseId: string, studentId: string, status: EnrollmentStatus, rejectionReason?: string): Enrollment | undefined {
    const enrollment = this.findEnrollment(courseId, studentId);
    if (!enrollment) return undefined;

    const prevStatus = enrollment.status;
    enrollment.status = status;
    if (rejectionReason) {
      enrollment.rejection_reason = rejectionReason;
    }
    enrollment.updated_at = new Date().toISOString();

    const course = this.courses.get(courseId);
    if (course) {
      if (status === 'enrolled' && prevStatus !== 'enrolled') {
        course.students_count = Math.max(0, course.students_count + 1);
      } else if (status === 'expelled' && prevStatus === 'enrolled') {
        course.students_count = Math.max(0, course.students_count - 1);
      }
      course.updated_at = new Date().toISOString();
    }

    // Add notification to student
    const studentNotifs = this.notifications.get(studentId) || [];
    const notifId = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;
    let title = 'Курс мәртебесі жаңартылды';
    let message = `Сіздің «${course?.title || 'Курс'}» курсы бойынша өтінішіңіз қаралды: ${status}`;

    if (status === 'enrolled') {
      title = '🎉 Курсқа қабылдандыңыз!';
      message = `Мұғалім сіздің «${course?.title || 'Курс'}» курсына өтінішіңізді мақұлдады. Оқуды бастаңыз!`;
    } else if (status === 'rejected') {
      title = '❌ Курсқа өтініш қабылданбады';
      message = `Сіздің «${course?.title || 'Курс'}» курсына өтінішіңіз қабылданбады.${rejectionReason ? ` Себебі: ${rejectionReason}` : ''}`;
    } else if (status === 'expelled') {
      title = '⚠️ Курстан шығарылдыңыз';
      message = `Мұғалім сізді «${course?.title || 'Курс'}» курсынан шығарды.`;
    }

    studentNotifs.unshift({
      id: notifId,
      user_id: studentId,
      title,
      message,
      type: 'course_enrollment',
      is_read: false,
      action_url: `/courses/${courseId}`,
      created_at: new Date().toISOString()
    });
    this.notifications.set(studentId, studentNotifs);

    return enrollment;
  }


  // --- Student Dashboard & Metrics ---
  public getEloRank(elo: number): { rank: EloRank; badge: string } {
    if (elo >= 1600) return { rank: 'Самғау', badge: '🚀 Самғау (Master)' };
    if (elo >= 1350) return { rank: 'Қыран', badge: '🦅 Қыран (Expert)' };
    if (elo >= 1150) return { rank: 'Тұғыр', badge: '🏔️ Тұғыр (Advanced)' };
    return { rank: 'Өскін', badge: '🌱 Өскін (Beginner)' };
  }

  public getStudentDashboard(studentId: string): StudentDashboardData | null {
    const user = this.users.get(studentId);
    if (!user) return null;

    const stats = this.studentStats.get(studentId) || { elo: 1000, streak_days: 0, last_active: new Date().toISOString() };
    const { rank, badge } = this.getEloRank(stats.elo);

    // Find pinned course (first enrolled course)
    const studentEnrs = this.getStudentEnrollments(studentId).filter(e => e.status === 'enrolled');
    let pinnedCourse: (Course & { progress_percentage: number; next_topic: string }) | null = null;
    let recentTopics: Topic[] = [];

    if (studentEnrs.length > 0) {
      const course = this.courses.get(studentEnrs[0].course_id);
      if (course) {
        const topics = this.getCourseTopics(course.id);
        const completedCount = topics.filter(t => t.status_practice === 'completed').length;
        const progress = topics.length > 0 ? Math.round((completedCount / topics.length) * 100) : 0;
        const nextTopic = topics.find(t => t.status_practice !== 'completed')?.title || 'Барлық тақырыптар орындалды';
        pinnedCourse = {
          ...course,
          progress_percentage: progress,
          next_topic: nextTopic
        };
        recentTopics = topics.slice(0, 4);
      }
    }

    return {
      user: this.toSafeUser(user),
      elo: stats.elo,
      rank,
      rank_badge: badge,
      streak_days: stats.streak_days,
      streak_freeze_available: false,
      pinned_course: pinnedCourse,
      recent_topics: recentTopics,
      memory_cards: {
        due_today: stats.streak_days > 0 ? 3 : 0,
        total_reviewed: stats.streak_days > 0 ? 15 : 0,
        retention_rate: 100
      },
      daily_focus: {
        title: pinnedCourse ? `3-минуттық экспресс: ${pinnedCourse.next_topic}` : 'Интерактивті кіріспе жаттығу',
        duration_minutes: 3,
        topic_id: 'top_focus_01',
        elo_reward: 15
      }
    };
  }

  public getStudentHeatmap(studentId: string): StudentHeatmapData {
    const stats = this.studentStats.get(studentId) || { elo: 1000, streak_days: 0, last_active: new Date().toISOString() };
    const matrix = [];
    const now = new Date();
    let totalContributions = 0;

    // Generate 365 days of activity
    for (let i = 364; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      const dateStr = d.toISOString().split('T')[0];

      let count = 0;
      let level: 0 | 1 | 2 | 3 | 4 = 0;

      if (stats.streak_days > 0 && i < stats.streak_days) {
        count = Math.floor(Math.random() * 4) + 2;
        level = Math.min(4, Math.max(1, count)) as 1 | 2 | 3 | 4;
      }

      totalContributions += count;
      matrix.push({ date: dateStr, count, level });
    }

    return {
      year: now.getFullYear(),
      total_contributions: totalContributions,
      current_streak: stats.streak_days,
      longest_streak: stats.streak_days,
      matrix
    };
  }

  public getStudentRoadmap(studentId: string): StudentRoadmapData {
    const stats = this.studentStats.get(studentId) || { elo: 1000, streak_days: 0, last_active: new Date().toISOString() };

    return {
      target_exam: 'ҰБТ / ЕНТ 2026',
      target_date: '2026-06-15',
      days_remaining: 115,
      predicted_score: Math.min(140, Math.round((stats.elo / 2000) * 140)),
      target_score: 135,
      current_elo: stats.elo,
      milestones: [
        {
          id: 'ms_01',
          title: 'Сызықтық теңдеулер жүйесі',
          deadline: '2026-03-01',
          status: stats.elo >= 1200 ? 'completed' : 'in_progress',
          mastery: stats.elo >= 1200 ? 100 : 40
        },
        {
          id: 'ms_02',
          title: 'Квадрат теңсіздіктер',
          deadline: '2026-03-20',
          status: stats.elo >= 1400 ? 'completed' : 'in_progress',
          mastery: stats.elo >= 1400 ? 100 : 20
        },
        {
          id: 'ms_03',
          title: 'Бөлшек-рационал теңдеулер',
          deadline: '2026-04-10',
          status: 'upcoming',
          mastery: 0
        }
      ]
    };
  }


  public getLeaderboard(): any[] {
    const students = Array.from(this.users.values()).filter(u => u.role === 'student');
    const result = students.map((u) => {
      const stats = this.studentStats.get(u.id) || { elo: 1000, streak_days: 0 };
      let rankBadge = '🌱 Өскін';
      if (stats.elo >= 1600) rankBadge = '🚀 Самғау';
      else if (stats.elo >= 1400) rankBadge = '🦅 Қыран';
      else if (stats.elo >= 1200) rankBadge = '🏛️ Тұғыр';

      return {
        id: u.id,
        name: u.full_name,
        avatar_url: u.avatar_url,
        elo: stats.elo,
        rank_badge: rankBadge,
        streak_days: stats.streak_days,
        completed_topics: Math.max(1, Math.round(stats.elo / 100)),
      };
    });

    result.sort((a, b) => b.elo - a.elo);
    return result.map((item, idx) => ({ ...item, rank: idx + 1 }));
  }

  // --- Notifications ---

  public getNotifications(userId: string): NotificationItem[] {
    return this.notifications.get(userId) || [];
  }

  public addNotification(userId: string, item: NotificationItem): NotificationItem {
    const list = this.notifications.get(userId) || [];
    list.unshift(item);
    this.notifications.set(userId, list);
    return item;
  }

  public markNotificationRead(userId: string, notificationId: string): NotificationItem | null {
    const list = this.notifications.get(userId) || [];
    const notif = list.find(n => n.id === notificationId);
    if (!notif) return null;
    notif.is_read = true;
    return notif;
  }

  public markAllNotificationsRead(userId: string): number {
    const list = this.notifications.get(userId) || [];
    let count = 0;
    list.forEach(n => {
      if (!n.is_read) {
        n.is_read = true;
        count++;
      }
    });
    return count;
  }
}

export const store = new DataStore();

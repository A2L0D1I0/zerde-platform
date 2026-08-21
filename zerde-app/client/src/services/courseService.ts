import { api } from '@/api/client';
import { Course, Topic, Enrollment, CourseApplicationData } from '@/types';


export const mockDefaultCourses: (Course & { enrollment_status?: 'enrolled' | 'pending_approval' | 'none'; topics?: Topic[] })[] = [
  {
    id: 'crs_physics_9',
    short_code: '7X9K2M',
    title: 'Физика: 9 сынып — Механика және Динамика',
    title_kz: 'Физика: 9 сынып — Механика және Динамика',
    title_ru: 'Физика: 9 класс — Механика и Динамика',
    title_en: 'Physics: Grade 9 — Mechanics & Dynamics',
    subject: 'Физика',
    subject_kz: 'Физика',
    subject_ru: 'Физика',
    subject_en: 'Physics',
    description: 'Ньютон заңдары, кинематика, күштер векторлары және ZVDSL+ интерактивті схемалары',
    description_kz: 'Ньютон заңдары, кинематика, күштер векторлары және ZVDSL+ интерактивті схемалары',
    description_ru: 'Законы Ньютона, кинематика, векторы сил и интерактивные схемы ZVDSL+',
    description_en: "Newton's laws, kinematics, force vectors and interactive ZVDSL+ diagrams",
    teacher_id: 'usr_teacher_01',
    teacher_name: 'Гульнара Сериковна Алимжанова',
    grade: '9 «А»',
    language: 'KZ',
    is_active: true,
    students_count: 24,
    progress_percentage: 65,
    next_topic: 'Ньютонның екінші заңы және күштер векторлары',
    next_topic_kz: 'Ньютонның екінші заңы және күштер векторлары',
    next_topic_ru: 'Второй закон Ньютона и векторы сил',
    next_topic_en: "Newton's Second Law and Force Vectors",
    enrollment_status: 'none',
  },
  {
    id: 'crs_kazakh_9',
    short_code: 'K8F42A',
    title: 'Қазақ тілі: Синтаксис және Морфемика',
    title_kz: 'Қазақ тілі: Синтаксис және Морфемика',
    title_ru: 'Казахский язык: Синтаксис и Морфемика',
    title_en: 'Kazakh Language: Syntax and Morphemics',
    subject: 'Қазақ тілі',
    subject_kz: 'Қазақ тілі',
    subject_ru: 'Казахский язык',
    subject_en: 'Kazakh Language',
    description: 'Сөйлем мүшелері, сөзжасам, морфемдік талдау мен стильдік нормалар',
    description_kz: 'Сөйлем мүшелері, сөзжасам, морфемдік талдау мен стильдік нормалар',
    description_ru: 'Члены предложения, словообразование, морфемный разбор и стилистические нормы',
    description_en: 'Sentence structure, word formation, morphemic analysis and stylistic norms',
    teacher_id: 'usr_teacher_01',
    teacher_name: 'Гульнара Сериковна Алимжанова',
    grade: '9 «А»',
    language: 'KZ',
    is_active: true,
    students_count: 20,
    progress_percentage: 90,
    next_topic: 'Сабақтас құрмалас сөйлемнің түрлері',
    next_topic_kz: 'Сабақтас құрмалас сөйлемнің түрлері',
    next_topic_ru: 'Виды сложноподчиненных предложений',
    next_topic_en: 'Types of Complex Sentences',
    enrollment_status: 'none',
  },
  {
    id: 'crs_math_ent',
    short_code: 'M3N9P1',
    title: 'Математика: ҰБТ / ЕНТ 2026 Интенсив',
    title_kz: 'Математика: ҰБТ / ЕНТ 2026 Интенсив',
    title_ru: 'Математика: ЕНТ 2026 Интенсив',
    title_en: 'Mathematics: ENT 2026 Intensive',
    subject: 'Математика',
    subject_kz: 'Математика',
    subject_ru: 'Математика',
    subject_en: 'Mathematics',
    description: 'Математикалық сауаттылық, алгебралық теңдеулер, стереометрия және логикалық есептер',
    description_kz: 'Математикалық сауаттылық, алгебралық теңдеулер, стереометрия және логикалық есептер',
    description_ru: 'Математическая грамотность, алгебраические уравнения, стереометрия и логические задачи',
    description_en: 'Mathematical literacy, algebraic equations, solid geometry and logic problems',
    teacher_id: 'usr_teacher_01',
    teacher_name: 'Гульнара Сериковна Алимжанова',
    grade: '10-11 сынып',
    language: 'ALL',
    is_active: true,
    students_count: 18,
    progress_percentage: 0,
    next_topic: 'ҰБТ тест құрылымы және стратегия',
    next_topic_kz: 'ҰБТ тест құрылымы және стратегия',
    next_topic_ru: 'Структура теста ЕНТ и стратегия',
    next_topic_en: 'ENT test structure and strategy',
    enrollment_status: 'none',
  },
  {
    id: 'crs_python_robo',
    short_code: 'W4Q8R2',
    title: 'Python & Robotics: Автоматтандыру негіздері',
    title_kz: 'Python & Robotics: Автоматтандыру негіздері',
    title_ru: 'Python & Robotics: Основы автоматизации',
    title_en: 'Python & Robotics: Automation Fundamentals',
    subject: 'Информатика',
    subject_kz: 'Информатика',
    subject_ru: 'Информатика',
    subject_en: 'Computer Science',
    description: 'Алгоритмдер, деректер құрылымы және микроконтроллерлерді бағдарламалау',
    description_kz: 'Алгоритмдер, деректер құрылымы және микроконтроллерлерді бағдарламалау',
    description_ru: 'Алгоритмы, структуры данных и программирование микроконтроллеров',
    description_en: 'Algorithms, data structures and microcontroller programming',
    teacher_id: 'usr_teacher_01',
    teacher_name: 'Гульнара Сериковна Алимжанова',
    grade: 'Барлық сыныптар',
    language: 'ALL',
    is_active: true,
    students_count: 15,
    progress_percentage: 0,
    next_topic: 'PID контроллер баптауы',
    next_topic_kz: 'PID контроллер баптауы',
    next_topic_ru: 'Настройка PID-контроллера',
    next_topic_en: 'PID Controller Tuning',
    enrollment_status: 'none',
  },
];

class CourseService {
  private localEnrollmentState: Map<string, 'enrolled' | 'pending_approval' | 'none'> = new Map();

  constructor() {
    // Clean default state for new users
  }


  public async getAllCourses(filters?: {
    subject?: string;
    grade?: string;
    search?: string;
    language?: string;
  }): Promise<Course[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.subject && filters.subject !== 'all') params.append('subject', filters.subject);
      if (filters?.grade && filters.grade !== 'all') params.append('grade', filters.grade);
      if (filters?.search) params.append('search', filters.search);
      if (filters?.language && filters.language !== 'all') params.append('language', filters.language);

      const qs = params.toString();
      const response = await api.get<{ courses: Course[] } | Course[]>(`/courses${qs ? `?${qs}` : ''}`);
      const list = Array.isArray(response) ? response : (response as any)?.courses || [];
      if (list.length > 0) {
        return list.map((c: Course) => ({
          ...c,
          enrollment_status: this.localEnrollmentState.get(c.id) || (c as any).enrollment_status || 'none',
        }));
      }
    } catch (e) {
      console.warn('[CourseService] Offline/Mock fallback for courses');
    }

    // Local filter fallback
    let list = [...mockDefaultCourses];
    if (filters) {
      if (filters.subject && filters.subject !== 'all') {
        list = list.filter((c) => c.subject.toLowerCase() === filters.subject!.toLowerCase());
      }
      if (filters.grade && filters.grade !== 'all') {
        list = list.filter((c) => c.grade.toLowerCase().includes(filters.grade!.toLowerCase()));
      }
      if (filters.language && filters.language !== 'all') {
        list = list.filter((c) => c.language === 'ALL' || c.language === filters.language);
      }
      if (filters.search) {
        const q = filters.search.toLowerCase();
        list = list.filter(
          (c) =>
            c.title.toLowerCase().includes(q) ||
            c.description.toLowerCase().includes(q) ||
            c.teacher_name.toLowerCase().includes(q)
        );
      }
    }

    return list.map((c) => ({
      ...c,
      enrollment_status: this.localEnrollmentState.get(c.id) || c.enrollment_status || 'none',
    }));
  }

  public async getCourseById(id: string): Promise<Course | null> {
    try {
      const response = await api.get<{ course: Course; topics: Topic[] }>(`/courses/${id}`);
      if (response?.course) {
        return {
          ...response.course,
          enrollment_status: this.localEnrollmentState.get(id) || 'none',
        };
      }
    } catch (e) {
      console.warn(`[CourseService] Offline/Mock fallback for course ${id}`);
    }

    const found = mockDefaultCourses.find((c) => c.id === id);
    if (!found) return null;
    return {
      ...found,
      enrollment_status: this.localEnrollmentState.get(id) || found.enrollment_status || 'none',
    };
  }

  public async joinByShortCode(shortCode: string): Promise<{ success: boolean; course: Course; message: string }> {
    try {
      const response: any = await api.get(`/courses/by-code/${shortCode.trim().toUpperCase()}`);
      if (response?.course) {
        await this.enroll(response.course.id);
        return {
          success: true,
          course: response.course,
          message: 'Курс тобына сәтті қосылдыңыз! 🎉',
        };
      }
    } catch (err: any) {
      throw new Error(err?.response?.data?.message || 'Бұл кодпен курс табылмады');
    }
    throw new Error('Курс табылмады');
  }

  public async inviteStudent(courseId: string, studentName: string, studentEmail: string): Promise<{ success: boolean; message: string }> {
    const res: any = await api.post(`/courses/${courseId}/invite`, {
      student_name: studentName,
      student_email: studentEmail,
    });
    return res;
  }

  public async getMyInvitations(): Promise<any[]> {
    try {
      const res: any = await api.get('/courses/invitations/my');
      return res?.invitations || [];
    } catch (e) {
      return [];
    }
  }

  public async acceptInvitation(invitationId: string): Promise<any> {
    const res: any = await api.post(`/courses/invitations/${invitationId}/accept`);
    return res;
  }

  public async getMyCourses(): Promise<Course[]> {
    try {
      const response = await api.get<{ courses: Course[] } | Course[]>('/courses/my-courses');
      const list = Array.isArray(response) ? response : (response as any)?.courses || [];
      if (list.length > 0) {
        return list;
      }
    } catch (e) {
      console.warn('[CourseService] Offline/Mock fallback for my-courses');
    }

    // Filter local mock courses where status is active
    return mockDefaultCourses
      .map((c) => {
        const localStatus = this.localEnrollmentState.get(c.id);
        if (localStatus) {
          return { ...c, enrollment_status: localStatus };
        }
        return c;
      })
      .filter((c) => c.enrollment_status && c.enrollment_status !== 'none');
  }

  public async searchCourseByCodeOrTitle(query: string): Promise<Course | null> {
    if (!query.trim()) return null;
    const clean = query.trim().toUpperCase();

    // 1. Check direct short code endpoint
    try {
      const res: any = await api.get(`/courses/by-code/${clean}`);
      if (res?.course) {
        const status = this.localEnrollmentState.get(res.course.id) || res.course.enrollment_status || 'none';
        return { ...res.course, enrollment_status: status };
      }
    } catch (e) {
      // ignore
    }

    // 2. Search catalog fallback
    const all = await this.getAllCourses({ search: query.trim() });
    if (all.length > 0) {
      return all[0];
    }
    return null;
  }

  public async applyToCourse(courseId: string, applicationData: CourseApplicationData): Promise<{ success: boolean; status: 'pending_approval'; message: string }> {
    try {
      const response: any = await api.post(`/courses/${courseId}/apply`, {
        application_data: applicationData,
      });
      if (response) {
        this.localEnrollmentState.set(courseId, 'pending_approval');
        return {
          success: true,
          status: 'pending_approval',
          message: response.message || 'Өтініш сәтті жіберілді. Мұғалімнің мақұлдауын күтіңіз.',
        };
      }
    } catch (e: any) {
      console.warn(`[CourseService] Offline fallback for apply to course ${courseId}`);
    }

    this.localEnrollmentState.set(courseId, 'pending_approval');
    return {
      success: true,
      status: 'pending_approval',
      message: 'Өтініш жіберілді! Мұғалімнің мақұлдауын күтіңіз.',
    };
  }

  public async cancelApplication(courseId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response: any = await api.post(`/courses/${courseId}/cancel-application`);
      this.localEnrollmentState.delete(courseId);
      return {
        success: true,
        message: response?.message || 'Өтініш кері қайтарылды',
      };
    } catch (e: any) {
      this.localEnrollmentState.delete(courseId);
      return {
        success: true,
        message: 'Өтініш кері қайтарылды',
      };
    }
  }

  public async dismissRejectedCourse(courseId: string): Promise<{ success: boolean; message: string }> {
    try {
      await api.delete(`/courses/${courseId}/dismiss`);
      this.localEnrollmentState.delete(courseId);
    } catch (e) {
      this.localEnrollmentState.delete(courseId);
    }
    return {
      success: true,
      message: 'Курс тізімнен өшірілді',
    };
  }

  public async enroll(courseId: string): Promise<{ success: boolean; status: 'pending_approval' | 'enrolled'; message: string }> {
    try {
      const response: any = await api.post(`/courses/${courseId}/enroll`);
      if (response) {
        const status = response.enrollment?.status || 'pending_approval';
        this.localEnrollmentState.set(courseId, status);
        return {
          success: true,
          status,
          message: response.message || 'Өтініш сәтті жіберілді. Мұғалімнің мақұлдауын күтіңіз.',
        };
      }
    } catch (e: any) {
      console.warn(`[CourseService] Offline fallback for enrolling course ${courseId}`);
    }

    // Local state fallback
    this.localEnrollmentState.set(courseId, 'pending_approval');
    return {
      success: true,
      status: 'pending_approval',
      message: 'Өтініш жіберілді! Мұғалімнің мақұлдауын күтіңіз (pending_approval).',
    };
  }

  public getEnrollmentStatus(courseId: string): 'enrolled' | 'pending_approval' | 'rejected' | 'none' {
    return (this.localEnrollmentState.get(courseId) as any) || 'none';
  }
}

export const courseService = new CourseService();
export default courseService;



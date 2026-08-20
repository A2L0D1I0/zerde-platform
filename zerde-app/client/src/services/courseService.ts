import { api } from '@/api/client';
import { Course, Topic, Enrollment } from '@/types';

export const mockDefaultCourses: (Course & { enrollment_status?: 'enrolled' | 'pending_approval' | 'none'; topics?: Topic[] })[] = [
  {
    id: 'crs_math_9',
    title: 'Алгебра және анализ бастамалары (9-сынып)',
    subject: 'Математика',
    description: 'Квадрат теңдеулер, Виет теоремасы, аралықтар әдісі және функциялар графигі',
    teacher_id: 'usr_teacher_01',
    teacher_name: 'Айгүл Серікқызы',
    grade: '9 «А»',
    language: 'KZ',
    is_active: true,
    students_count: 24,
    progress_percentage: 78,
    next_topic: 'Квадраттық теңсіздіктер (Интервалдар әдісі)',
    enrollment_status: 'enrolled',
  },
  {
    id: 'crs_physics_9',
    title: 'Физика: Механика және Динамика заңдары',
    subject: 'Физика',
    description: 'Ньютон заңдары, кинематика, күштер векторлары және ZVDSL+ интерактивті схемалары',
    teacher_id: 'usr_teacher_01',
    teacher_name: 'Асан Серікұлы',
    grade: '9 «А»',
    language: 'KZ',
    is_active: true,
    students_count: 24,
    progress_percentage: 65,
    next_topic: 'Ньютонның екінші заңы және күштер векторлары',
    enrollment_status: 'enrolled',
  },
  {
    id: 'crs_kazakh_9',
    title: 'Қазақ тілі: Синтаксис және Морфемика',
    subject: 'Қазақ тілі',
    description: 'Сөйлем мүшелері, сөзжасам, морфемдік талдау мен стильдік нормалар',
    teacher_id: 'usr_teacher_01',
    teacher_name: 'Гүлнар Амангелдіқызы',
    grade: '9 «А»',
    language: 'KZ',
    is_active: true,
    students_count: 20,
    progress_percentage: 90,
    next_topic: 'Сабақтас құрмалас сөйлемнің түрлері',
    enrollment_status: 'enrolled',
  },
  {
    id: 'crs_math_ent',
    title: 'Математика: ҰБТ / ЕНТ 2026 Интенсив',
    subject: 'Математика',
    description: 'Математикалық сауаттылық, алгебралық теңдеулер, стереометрия және логикалық есептер',
    teacher_id: 'usr_teacher_01',
    teacher_name: 'Айгүл Серікқызы',
    grade: '10-11 сынып',
    language: 'ALL',
    is_active: true,
    students_count: 18,
    progress_percentage: 0,
    next_topic: 'ҰБТ тест құрылымы және стратегия',
    enrollment_status: 'pending_approval',
  },
  {
    id: 'crs_chem_olympiad',
    title: 'Олимпиадалық Химия: Органика және Термохимия',
    subject: 'Химия',
    description: 'Бензол сақинасы, изомерия, химиялық кинетика және кванттық ұяшықтар',
    teacher_id: 'usr_teacher_02',
    teacher_name: 'Дәурен Мұратұлы',
    grade: '9-11 сынып',
    language: 'KZ',
    is_active: true,
    students_count: 16,
    progress_percentage: 0,
    next_topic: 'Ароматты көмірсутектер синтезі',
    enrollment_status: 'none',
  },
  {
    id: 'crs_python_robo',
    title: 'Python & Robotics: Автоматтандыру және IoT',
    subject: 'Информатика',
    description: 'Алгоритмдер, деректер құрылымы, Arduino микроконтроллерлері мен датчиктер',
    teacher_id: 'usr_teacher_03',
    teacher_name: 'Ерлан Бауыржанұлы',
    grade: 'Барлық сыныптар',
    language: 'ALL',
    is_active: true,
    students_count: 15,
    progress_percentage: 0,
    next_topic: 'PID контроллер баптауы',
    enrollment_status: 'none',
  },
];

class CourseService {
  private localEnrollmentState: Map<string, 'enrolled' | 'pending_approval' | 'none'> = new Map();

  constructor() {
    // Initial seeded statuses
    mockDefaultCourses.forEach((c) => {
      if (c.enrollment_status) {
        this.localEnrollmentState.set(c.id, c.enrollment_status);
      }
    });
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

  public getEnrollmentStatus(courseId: string): 'enrolled' | 'pending_approval' | 'none' {
    return this.localEnrollmentState.get(courseId) || 'none';
  }
}

export const courseService = new CourseService();
export default courseService;

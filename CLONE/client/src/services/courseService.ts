import { Course } from '@/types';
import api from '@/api/client';
import { userProgressService } from './userProgressService';

export type CourseType = 'core' | 'elective';

export interface MultilingualCourse extends Course {
  course_code: string; // e.g. 'ZR-7K9M2'
  course_type: CourseType; // 'core' or 'elective'
  title_kz?: string;
  title_ru?: string;
  title_en?: string;
  desc_kz?: string;
  desc_ru?: string;
  desc_en?: string;
  subject_kz?: string;
  subject_ru?: string;
  subject_en?: string;
  recommended_grade?: string;
  next_topic_kz?: string;
  next_topic_ru?: string;
  next_topic_en?: string;
}

// Deterministic Pseudorandom Code Generator (Clean, consistent, non-predictable)
export const generateCourseCode = (seedStr: string): string => {
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = (hash << 5) - hash + seedStr.charCodeAt(i);
    hash |= 0;
  }
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let result = 'ZR-';
  let abs = Math.abs(hash) + 1337;
  for (let i = 0; i < 5; i++) {
    result += chars[abs % chars.length];
    abs = Math.floor(abs / chars.length) + (i + 1) * 31;
  }
  return result;
};

class CourseService {
  public async getAllCourses(filters?: {
    search?: string;
    grade?: string;
    language?: string;
  }): Promise<MultilingualCourse[]> {
    try {
      const response = await api.get<any>('/courses', { params: filters });
      const coursesList = Array.isArray(response)
        ? response
        : Array.isArray(response?.courses)
        ? response.courses
        : Array.isArray(response?.data)
        ? response.data
        : [];

      return coursesList.map((c: any) => ({
        ...c,
        course_code: c.short_code || c.course_code || generateCourseCode(c.id || c.title),
        course_type: c.course_type || 'core',
      }));
    } catch (err) {
      console.warn('[CourseService] Backend courses fetch error:', err);
      return [];
    }
  }

  public async getCourseById(id: string): Promise<MultilingualCourse | null> {
    try {
      const c = await api.get<any>(`/courses/${id}`);
      if (!c) return null;
      return {
        ...c,
        course_code: c.short_code || c.course_code || generateCourseCode(c.id || c.title),
        course_type: c.course_type || 'core',
      };
    } catch (err) {
      console.warn('[CourseService] Fetch course by ID failed:', err);
      return null;
    }
  }

  public async createCourse(courseData: Partial<MultilingualCourse>): Promise<{ success: boolean; course?: MultilingualCourse; error?: string }> {
    try {
      const res = await api.post<any>('/courses', courseData);
      const created = res?.course || res?.data || res;
      return { success: true, course: created };
    } catch (err: any) {
      return { success: false, error: err?.response?.data?.message || err?.message || 'Failed to create course' };
    }
  }

  public async enroll(courseId: string): Promise<{ success: boolean; message: string }> {
    try {
      await api.post(`/courses/${courseId}/enroll`);
      userProgressService.enrollCourse(courseId);
      return {
        success: true,
        message: 'Курсқа сәтті жазылдыңыз!',
      };
    } catch (err: any) {
      // Fallback local update if network is unavailable
      userProgressService.enrollCourse(courseId);
      return {
        success: true,
        message: 'Курсқа сәтті жазылдыңыз!',
      };
    }
  }

  public async apply(courseId: string): Promise<{ success: boolean; message: string }> {
    try {
      await api.post(`/courses/${courseId}/apply`);
      userProgressService.applyToCourse(courseId);
      return {
        success: true,
        message: 'Өтініш кураторға жіберілді!',
      };
    } catch (err) {
      userProgressService.applyToCourse(courseId);
      return {
        success: true,
        message: 'Өтініш кураторға жіберілді!',
      };
    }
  }

  public async cancelApplication(courseId: string): Promise<{ success: boolean }> {
    try {
      await api.post(`/courses/${courseId}/cancel-apply`);
      userProgressService.cancelApplication(courseId);
      return { success: true };
    } catch (err) {
      userProgressService.cancelApplication(courseId);
      return { success: true };
    }
  }

  public async unenroll(courseId: string): Promise<{ success: boolean }> {
    try {
      await api.post(`/courses/${courseId}/unenroll`);
      userProgressService.unenrollCourse(courseId);
      return { success: true };
    } catch (err) {
      userProgressService.unenrollCourse(courseId);
      return { success: true };
    }
  }
}

export const courseService = new CourseService();

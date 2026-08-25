/**
 * Zerde Unified Identifier & Code Generation Service
 * Generates human-readable, deterministic and unique codes for:
 * 1. Courses (e.g. ZR-ALG09-KZ, ZR-PHYS10-RU)
 * 2. Student Master Passports (e.g. MP-NIS-09-1042, MP-BIL-10-8821)
 * 3. Question Bank Tasks (e.g. Q-ALG09-Q1-A01, Q-PHYS10-Q1-B02)
 */

export interface CourseCodeParams {
  title?: string;
  subjectType?: string;
  language?: string;
  grade?: string | number;
}

export interface StudentPassportParams {
  school?: string;
  grade?: string | number;
  userId?: number | string;
  fullName?: string;
}

export interface TaskCodeParams {
  courseCode?: string;
  quarter?: number;
  mode?: 'A' | 'B';
  seq?: number;
  skillCode?: string;
}

const SUBJECT_PREFIX_MAP: Record<string, string> = {
  algebra: 'ALG',
  geometry: 'GEOM',
  physics: 'PHYS',
  chemistry: 'CHEM',
  biology: 'BIO',
  informatics: 'CS',
  kazakh_lang: 'KAZ',
  kazakh_lit: 'KAZLIT',
  russian_lang: 'RUS',
  russian_lit: 'RUSLIT',
  english_lang: 'ENG',
};

const SCHOOL_PREFIX_MAP: Record<string, string> = {
  'NIS IB Astana': 'NIS',
  'NIS': 'NIS',
  'Ekibastuz BIL': 'BIL',
  'BIL': 'BIL',
  'РФМШ': 'RFMSH',
  'Дарын': 'DARYN',
};

export class IdGeneratorService {
  /**
   * Generates a clean, human-readable Course Code
   * e.g. ZR-ALG09-KZ, ZR-PHYS10-RU, ZR-CHEM09-ALL
   */
  public static generateCourseCode(params: CourseCodeParams): string {
    const { title = '', subjectType = 'algebra', language = 'KZ', grade = 9 } = params;

    // Detect subject abbreviation
    let subjPrefix = SUBJECT_PREFIX_MAP[subjectType.toLowerCase()] || 'CRS';
    if (subjPrefix === 'CRS' && title) {
      if (/алгебра/i.test(title)) subjPrefix = 'ALG';
      else if (/геометр/i.test(title)) subjPrefix = 'GEOM';
      else if (/физик/i.test(title)) subjPrefix = 'PHYS';
      else if (/хим/i.test(title)) subjPrefix = 'CHEM';
      else if (/биолог/i.test(title)) subjPrefix = 'BIO';
      else if (/информ/i.test(title)) subjPrefix = 'CS';
      else if (/қазақ/i.test(title)) subjPrefix = 'KAZ';
      else if (/орыс|русск/i.test(title)) subjPrefix = 'RUS';
      else if (/ағылш|english/i.test(title)) subjPrefix = 'ENG';
    }

    // Extract grade
    let gradeNum = 9;
    const match = title.match(/(\d{1,2})/);
    if (match) {
      gradeNum = parseInt(match[1], 10);
    } else if (grade) {
      const gMatch = String(grade).match(/(\d{1,2})/);
      if (gMatch) gradeNum = parseInt(gMatch[1], 10);
    }
    const gradeStr = String(gradeNum).padStart(2, '0');

    // Language suffix
    const langSuffix = (language || 'KZ').toUpperCase();

    // Random 2-digit entropy to ensure absolute uniqueness
    const entropy = Math.floor(10 + Math.random() * 90);

    return `ZR-${subjPrefix}${gradeStr}-${langSuffix}-${entropy}`;
  }

  /**
   * Generates a unique Student Master Passport Code
   * e.g. MP-NIS-09-7841, MP-BIL-10-2309
   */
  public static generateStudentPassportCode(params: StudentPassportParams): string {
    const { school = 'NIS', grade = '9', userId = 1 } = params;

    let schoolCode = 'GEN';
    for (const [key, val] of Object.entries(SCHOOL_PREFIX_MAP)) {
      if (school.toLowerCase().includes(key.toLowerCase())) {
        schoolCode = val;
        break;
      }
    }

    const gMatch = String(grade).match(/(\d{1,2})/);
    const gradeStr = gMatch ? String(gMatch[1]).padStart(2, '0') : '09';

    const idNum = typeof userId === 'number' ? userId : parseInt(String(userId).replace(/\D/g, ''), 10) || 1;
    const idPad = String(idNum).padStart(4, '0');

    return `MP-${schoolCode}-${gradeStr}-${idPad}`;
  }

  /**
   * Generates a unique Task / Question Code
   * e.g. Q-ALG09-Q1-A01, Q-PHYS10-Q1-B05
   */
  public static generateTaskCode(params: TaskCodeParams): string {
    const { courseCode = 'ALG09', quarter = 1, mode = 'A', seq = 1, skillCode = '' } = params;

    const cleanCourse = courseCode.replace(/^ZR-/, '').split('-')[0] || 'GEN';
    const qStr = `Q${quarter || 1}`;
    const modeStr = mode === 'B' ? 'B' : 'A';
    const seqStr = String(seq).padStart(2, '0');

    return `Q-${cleanCourse}-${qStr}-${modeStr}${seqStr}`;
  }
}

export const idGenerator = IdGeneratorService;

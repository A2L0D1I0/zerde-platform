import { Router, Request, Response } from 'express';
import { getDb } from '../../db/database';

const router = Router();

// GET /api/questions
router.get('/', (req: Request, res: Response) => {
  const db = getDb();
  const topicId = req.query.topicId as string;
  const courseId = req.query.courseId as string;
  const lang = ((req.query.lang as string) || 'kz').toLowerCase();

  let query = 'SELECT * FROM question_bank';
  const params: any[] = [];

  if (topicId) {
    query += ' WHERE topic_id = ?';
    params.push(topicId);
  }

  query += ' ORDER BY id ASC LIMIT 20';

  const rows = db.prepare(query).all(...params) as any[];

  const questions = rows.map((r) => {
    let options = [];
    let zvdslSchema = null;

    try {
      options = JSON.parse(r.options_json || '[]');
    } catch (e) {
      options = [];
    }

    try {
      if (r.zvdsl_canvas_json) {
        zvdslSchema = JSON.parse(r.zvdsl_canvas_json);
      }
    } catch (e) {
      zvdslSchema = null;
    }

    const questionText = lang === 'ru' ? (r.question_ru || r.question_kz) : lang === 'en' ? (r.question_en || r.question_kz) : r.question_kz;
    const explanation = lang === 'ru' ? (r.explanation_ru || r.explanation_kz) : lang === 'en' ? (r.explanation_en || r.explanation_kz) : r.explanation_kz;

    return {
      id: String(r.id),
      topicId: r.topic_id,
      difficulty: r.difficulty,
      mode: r.mode === 'B' ? 'TYPE_B_OPEN' : 'TYPE_A_CHOICE',
      questionText: questionText,
      options,
      correctAnswer: r.correct_answer,
      explanation,
      socraticHint: {
        mentorQuestion: lang === 'ru' ? 'На что следует обратить внимание?' : lang === 'en' ? 'What should we consider first?' : 'Неге назар аудару керек?',
        guidingStep: explanation,
        zvdslSchema,
      },
    };
  });

  res.json({ success: true, data: questions });
});

// GET /api/questions/:id
router.get('/:id', (req: Request, res: Response) => {
  const db = getDb();
  const lang = ((req.query.lang as string) || 'kz').toLowerCase();
  const row = db.prepare('SELECT * FROM question_bank WHERE id = ?').get(req.params.id) as any;

  if (!row) {
    return res.status(404).json({ success: false, error: 'Сұрақ табылмады' });
  }

  let options = [];
  let zvdslSchema = null;

  try {
    options = JSON.parse(row.options_json || '[]');
  } catch (e) {
    options = [];
  }

  try {
    if (row.zvdsl_canvas_json) {
      zvdslSchema = JSON.parse(row.zvdsl_canvas_json);
    }
  } catch (e) {
    zvdslSchema = null;
  }

  const questionText = lang === 'ru' ? (row.question_ru || row.question_kz) : lang === 'en' ? (row.question_en || row.question_kz) : row.question_kz;
  const explanation = lang === 'ru' ? (row.explanation_ru || row.explanation_kz) : lang === 'en' ? (row.explanation_en || row.explanation_kz) : row.explanation_kz;

  res.json({
    success: true,
    data: {
      id: String(row.id),
      topicId: row.topic_id,
      difficulty: row.difficulty,
      mode: row.mode === 'B' ? 'TYPE_B_OPEN' : 'TYPE_A_CHOICE',
      questionText,
      options,
      correctAnswer: row.correct_answer,
      explanation,
      socraticHint: {
        mentorQuestion: lang === 'ru' ? 'На что следует обратить внимание?' : lang === 'en' ? 'What should we consider first?' : 'Неге назар аудару керек?',
        guidingStep: explanation,
        zvdslSchema,
      },
    },
  });
});

export default router;

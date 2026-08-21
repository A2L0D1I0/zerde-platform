import { NotificationItem, WeeklyDigestData, User } from '../types';
import { store } from '../db/store';

export type TriggerType = 'STREAK_SAVER' | 'AGA_REMINDER' | 'MEMORY_BURN' | 'WEEKLY_DIGEST';

export class RetentionService {
  /**
   * Generate a notification based on one of the 4 psychological triggers
   */
  public generateTrigger(
    type: TriggerType,
    user: User,
    customParams?: {
      streak_days?: number;
      elo_earned?: number;
      class_rank?: number;
      formulas_count?: number;
      topic_title?: string;
    }
  ): NotificationItem {
    const id = `notif_${type.toLowerCase()}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();
    const lang = user.language || 'kz';
    const name = user.full_name.split(' ')[0] || 'Оқушы';

    let title = '';
    let message = '';
    let actionUrl = '/trainer';
    let priority: 'urgent' | 'high' | 'normal' = 'normal';

    const streak = customParams?.streak_days || 12;
    const elo = customParams?.elo_earned || 45;
    const rank = customParams?.class_rank || 3;
    const formulasCount = customParams?.formulas_count || 3;
    const topic = customParams?.topic_title || (lang === 'kz' ? 'Интервалдар әдісі және Ньютон заңдары' : 'Метод интервалов и законы Ньютона');

    switch (type) {
      case 'STREAK_SAVER':
        priority = 'urgent';
        actionUrl = '/trainer';
        if (lang === 'kz') {
          title = '🔥 Стрикті сақтап қал! (Streak Saver)';
          message = `${name}, сенің ${streak} күндік стригің түн ортасында сөнеді! 3 минутта экспресс-жаттығуды орындап, оқу серияңды сақтап қал!`;
        } else if (lang === 'ru') {
          title = '🔥 Спаси свой стрик! (Streak Saver)';
          message = `${name}, твой стрик ${streak} дней сгорит в полночь! 3 минуты на спасение!`;
        } else {
          title = '🔥 Save your streak! (Streak Saver)';
          message = `${name}, your ${streak}-day streak will expire at midnight! 3 minutes to save it!`;
        }
        break;

      case 'AGA_REMINDER':
        priority = 'high';
        actionUrl = '/trainer';
        if (lang === 'kz') {
          title = '🧠 «Аға» наставнигі шақырады';
          message = `«Аға» саған ${topic} бойынша 3-минуттық экспресс-фокус дайындап қойды! Логикалық қадамдарды шешіп, +15 ELO ал!`;
        } else if (lang === 'ru') {
          title = '🧠 Наставник «Аға» ждет тебя';
          message = `«Аға» уже подготовил 3-минутный фокус по ${topic}! Зайди решить логическую развилку и получи +15 ELO!`;
        } else {
          title = '🧠 Mentor "Ağa" is calling';
          message = `"Ağa" has prepared a 3-minute focus drill on ${topic}! Solve the thought fork and earn +15 ELO!`;
        }
        break;

      case 'MEMORY_BURN':
        priority = 'high';
        actionUrl = '/student';
        if (lang === 'kz') {
          title = '🎴 Формулалар жадыңнан өшуде! (Memory Burn)';
          message = `1-тоқсандағы ${formulasCount} негізгі формула жадыңнан өшуге жақын! Қайталауға небәрі 1 минут жеткілікті.`;
        } else if (lang === 'ru') {
          title = '🎴 Сгорание формул в памяти! (Memory Burn)';
          message = `${formulasCount} формулы 1-й четверти скоро забудутся! 1 минута на повторение 🎴`;
        } else {
          title = '🎴 Formulas fading in memory! (Memory Burn)';
          message = `${formulasCount} formulas from Quarter 1 will fade soon! 1 minute to review 🎴`;
        }
        break;

      case 'WEEKLY_DIGEST':
        priority = 'normal';
        actionUrl = '/student';
        if (lang === 'kz') {
          title = '🏆 Апталық оқу дайджесті';
          message = `Осы аптада сен +${elo} ELO жинап, сыныптағы ТОП-${rank} қатарына ендің! Нәтижеңді тексер.`;
        } else if (lang === 'ru') {
          title = '🏆 Еженедельный дайджест';
          message = `За неделю ты заработал +${elo} ELO и вошел в ТОП-${rank} класса! Посмотри свой прогресс.`;
        } else {
          title = '🏆 Weekly Learning Digest';
          message = `This week you earned +${elo} ELO and entered the class TOP-${rank}! Check your achievements.`;
        }
        break;
    }

    return {
      id,
      user_id: user.id,
      title,
      message,
      type,
      trigger_type: type,
      is_read: false,
      action_url: actionUrl,
      priority,
      created_at: now,
      metadata: {
        streak_days: streak,
        expires_in_minutes: 180,
        elo_reward: 15,
        formulas_count: formulasCount,
        top_rank: rank,
        topic_title: topic
      }
    };
  }

  /**
   * Generate complete Weekly Digest email data & HTML template
   */
  public generateWeeklyDigest(userId: string): WeeklyDigestData {
    const user = store.findUserById(userId);
    const studentName = user ? user.full_name : 'Әлихан Нұрланұлы';
    const lang = user?.language || 'kz';
    const currentElo = 1420;
    const eloEarned = 45;
    const classRank = 3;
    const totalStudents = 24;
    const streakMaintained = 14;
    const tasksCompleted = 18;
    const retentionRate = 94;

    const masteredSkills = [
      'Ньютонның 2-заңы және үйкеліс күші векторлары (Active Canvas)',
      'Интервалдар әдісі және квадрат теңсіздіктер таңбасы',
      'Фенол мен бензол сақинасының құрылымы (ZVDSL+ Chem)',
      'Қазақ тіліндегі шартты бағыныңқы сабақтас сөйлемдер'
    ];

    const focusNextWeek = 'Бөлшек-рационал теңсіздіктердің ОДЗ есебі және Атомдағы кванттық ұяшықтар (Хунд ережесі)';
    const mentorQuote = lang === 'kz'
      ? '«Табандылық пен күнделікті 3 минуттық фокус — үлкен жеңістердің баспалдағы. Стрикті үзбей алға ұмтыл!» — «Аға» наставнигі'
      : '«Постоянство и ежедневный 3-минутный фокус — ключ к великим победам. Держи свой стрик!» — Наставник «Аға»';

    const now = new Date();
    const startWeek = new Date(now.getTime() - 7 * 86400000);
    const weekRange = `${startWeek.toLocaleDateString()} — ${now.toLocaleDateString()}`;

    const htmlTemplate = this.renderWeeklyDigestHtml({
      studentName,
      weekRange,
      eloEarned,
      currentElo,
      classRank,
      totalStudents,
      streakMaintained,
      tasksCompleted,
      retentionRate,
      masteredSkills,
      focusNextWeek,
      mentorQuote,
      lang
    });

    return {
      user_id: userId,
      student_name: studentName,
      week_range: weekRange,
      elo_earned: eloEarned,
      current_elo: currentElo,
      class_rank: classRank,
      total_students: totalStudents,
      streak_maintained: streakMaintained,
      tasks_completed: tasksCompleted,
      retention_rate: retentionRate,
      mastered_skills: masteredSkills,
      focus_next_week: focusNextWeek,
      mentor_quote: mentorQuote,
      html_template: htmlTemplate
    };
  }

  /**
   * Render modern responsive HTML email for Weekly Digest
   */
  private renderWeeklyDigestHtml(params: {
    studentName: string;
    weekRange: string;
    eloEarned: number;
    currentElo: number;
    classRank: number;
    totalStudents: number;
    streakMaintained: number;
    tasksCompleted: number;
    retentionRate: number;
    masteredSkills: string[];
    focusNextWeek: string;
    mentorQuote: string;
    lang: string;
  }): string {
    const isKz = params.lang === 'kz';

    return `
<!DOCTYPE html>
<html lang="${params.lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Zerde Weekly Digest</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #0d1117;
      color: #e6edf3;
    }
    .wrapper {
      max-width: 600px;
      margin: 20px auto;
      background: #161b22;
      border: 1px solid #30363d;
      border-radius: 12px;
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #1f6feb 0%, #238636 100%);
      padding: 28px 24px;
      text-align: center;
      color: #ffffff;
    }
    .header h1 {
      margin: 0;
      font-size: 22px;
      font-weight: 700;
      letter-spacing: -0.5px;
    }
    .header p {
      margin: 6px 0 0;
      font-size: 13px;
      opacity: 0.9;
    }
    .content {
      padding: 24px;
    }
    .greeting {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 16px;
      color: #f0f6fc;
    }
    .stats-grid {
      display: table;
      width: 100%;
      margin-bottom: 20px;
    }
    .stat-card {
      display: table-cell;
      width: 25%;
      padding: 12px;
      background: #0d1117;
      border: 1px solid #30363d;
      border-radius: 8px;
      text-align: center;
    }
    .stat-card:not(:last-child) {
      border-right: none;
    }
    .stat-val {
      font-size: 18px;
      font-weight: bold;
      color: #58a6ff;
      font-family: ui-monospace, SFMono-Regular, monospace;
    }
    .stat-label {
      font-size: 10px;
      color: #8b949e;
      text-transform: uppercase;
      margin-top: 4px;
    }
    .highlight-box {
      background: rgba(35, 134, 54, 0.15);
      border: 1px solid #238636;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 20px;
    }
    .highlight-title {
      font-size: 13px;
      font-weight: bold;
      color: #3fb950;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .skills-list {
      margin: 10px 0 0;
      padding-left: 20px;
      font-size: 12px;
      color: #c9d1d9;
      line-height: 1.6;
    }
    .mentor-card {
      background: #0d1117;
      border-left: 4px solid #d29922;
      border-top: 1px solid #30363d;
      border-right: 1px solid #30363d;
      border-bottom: 1px solid #30363d;
      border-radius: 0 8px 8px 0;
      padding: 14px;
      margin-bottom: 24px;
      font-size: 12px;
      font-style: italic;
      color: #d29922;
    }
    .btn-container {
      text-align: center;
      margin: 24px 0 12px;
    }
    .cta-btn {
      display: inline-block;
      background: #238636;
      color: #ffffff;
      text-decoration: none;
      font-weight: 600;
      font-size: 14px;
      padding: 12px 28px;
      border-radius: 6px;
      border: 1px solid rgba(240, 246, 252, 0.1);
    }
    .footer {
      background: #0d1117;
      border-top: 1px solid #30363d;
      padding: 16px 24px;
      text-align: center;
      font-size: 11px;
      color: #8b949e;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>🚀 ZERDE • ${isKz ? 'Апталық Оқу Дайджесті' : 'Еженедельный Дайджест Обучения'}</h1>
      <p>${params.weekRange}</p>
    </div>

    <div class="content">
      <div class="greeting">
        ${isKz ? `Сәлем, ${params.studentName}! 👋` : `Привет, ${params.studentName}! 👋`}
      </div>
      <p style="font-size: 13px; color: #8b949e; line-height: 1.5; margin-bottom: 20px;">
        ${isKz
          ? 'Өткен аптадағы білім жетістіктерің мен «Аға» наставнигімен бірге орындалған 3-минуттық фокустарыңның қорытындысы дайын!'
          : 'Итоги твоих учебных достижений и 3-минутных фокусов с наставником «Аға» за прошедшую неделю готовы!'}
      </p>

      <!-- Stats Grid -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <tr>
          <td class="stat-card">
            <div class="stat-val">+${params.eloEarned}</div>
            <div class="stat-label">ELO ${isKz ? 'Өсімі' : 'Прирост'}</div>
          </td>
          <td class="stat-card">
            <div class="stat-val" style="color: #3fb950;">${params.currentElo}</div>
            <div class="stat-label">${isKz ? 'Рейтинг' : 'Рейтинг'}</div>
          </td>
          <td class="stat-card">
            <div class="stat-val" style="color: #d29922;">${params.classRank}/${params.totalStudents}</div>
            <div class="stat-label">${isKz ? 'Сыныптағы ТОП' : 'ТОП Класса'}</div>
          </td>
          <td class="stat-card">
            <div class="stat-val" style="color: #f0883e;">🔥 ${params.streakMaintained}</div>
            <div class="stat-label">${isKz ? 'Стрик (күн)' : 'Стрик (дней)'}</div>
          </td>
        </tr>
      </table>

      <!-- Highlights -->
      <div class="highlight-box">
        <div class="highlight-title">
          ✅ ${isKz ? 'Осы аптада толық меңгерілген дағдылар:' : 'Навыки, полностью освоенные за неделю:'}
        </div>
        <ul class="skills-list">
          ${params.masteredSkills.map(s => `<li>${s}</li>`).join('')}
        </ul>
      </div>

      <!-- Mentor Quote -->
      <div class="mentor-card">
        ${params.mentorQuote}
      </div>

      <!-- Next Week Focus -->
      <div style="font-size: 12px; color: #8b949e; margin-bottom: 20px; line-height: 1.5;">
        <strong style="color: #f0f6fc;">${isKz ? 'Келесі аптадағы басты фокус:' : 'Главный фокус следующей недели:'}</strong><br>
        ${params.focusNextWeek}
      </div>

      <!-- CTA -->
      <div class="btn-container">
        <a href="http://localhost:5173/trainer" class="cta-btn">
          ${isKz ? '🔥 Жаттығуды жалғастыру (+15 ELO)' : '🔥 Продолжить обучение (+15 ELO)'}
        </a>
      </div>
    </div>

    <div class="footer">
      Zerde Intelligent Educational Platform • 2026<br>
      ${isKz ? 'Хабарламалар баптауын жеке профиліңізде өзгерте аласыз.' : 'Вы можете настроить уведомления в своем профиле.'}
    </div>
  </div>
</body>
</html>
    `.trim();
  }
}

export const retentionService = new RetentionService();

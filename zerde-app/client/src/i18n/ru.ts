/**
 * Zerde Educational Platform - Russian Localization Dictionary (ru.ts)
 * 
 * Socratic AI EduTech Platform Localization
 * Academic & professional Russian interface translations.
 * Specialized / Untranslated terms: ELO, Aga (Аға), Zerde, ZVDSL+, Thought-Forks, Eureka, Q-Matrix, CDM.
 */

export const ru = {
  // =========================================================================
  // 1. BRAND & HEADER
  // =========================================================================
  'brand.title': 'Zerde',
  'brand.subtitle': 'Интеллектуальная образовательная платформа',
  'brand.tagline': 'Socratic AI Education',
  'brand.description': 'Сократическая платформа адаптивного обучения на основе когнитивной диагностики CDM и концепций GitHub Primer',
  
  'header.search_placeholder': 'Поиск курсов, тем и навыков... (⌘K)',
  'header.search': 'Поиск',
  'header.streak': 'дней стрик',
  'header.elo': 'ELO',
  'header.notifications': 'Уведомления',
  'header.no_notifications': 'Нет новых уведомлений',
  'header.mark_all_read': 'Отметить все как прочитанные',
  'header.profile': 'Профиль',
  'header.settings': 'Настройки',
  'header.logout': 'Выйти',
  'header.switch_role': 'Сменить роль',

  // =========================================================================
  // 2. ROLES
  // =========================================================================
  'role.student': 'Ученик',
  'role.teacher': 'Учитель',
  'role.admin': 'Администратор',
  'role.mentor': 'Наставник «Аға»',

  // =========================================================================
  // 3. NAVIGATION
  // =========================================================================
  'nav.home': 'Главная',
  'nav.courses': 'Предметы',
  'nav.trainer': 'Тренажер',
  'nav.progress': 'Прогресс',
  'nav.classes': 'Классы',
  'nav.builder': 'Конструктор курсов',
  'nav.analytics': 'Аналитика',
  'nav.roadmap': 'Roadmap',
  'nav.smartboard': 'Смарт-доска',
  'nav.catalog': 'Каталог',
  'nav.settings': 'Настройки',

  // =========================================================================
  // 4. ELO RANKS & MASTERY LEVELS
  // =========================================================================
  'rank.oskin': 'Өскін 🌱 (Росток)',
  'rank.tughyr': 'Тұғыр 🌿 (Опора)',
  'rank.qyran': 'Қыран 🦅 (Беркут)',
  'rank.samgau': 'Самғау ⭐ (Парение)',
  'rank.current_rank': 'Текущий ранг',
  'rank.next_rank': 'Следующий ранг',
  'rank.elo_points': 'Баллы ELO',

  // =========================================================================
  // 5. AUTHENTICATION & ONBOARDING
  // =========================================================================
  'auth.welcome_title': 'Добро пожаловать в образовательную экосистему Zerde',
  'auth.welcome_subtitle': 'Сократическая платформа обучения на базе когнитивной модели CDM и интерфейсов GitHub Primer',
  'auth.login': 'Вход',
  'auth.register': 'Регистрация',
  'auth.demo_login_title': 'Быстрый демо-вход (1 клик):',
  'auth.demo_student': 'Ученик (Азамат)',
  'auth.demo_student_stats': '1420 ELO • 12 дней',
  'auth.demo_teacher': 'Учитель (Гульнара С.)',
  'auth.demo_teacher_stats': '24 ученика • 3 курса',
  'auth.email': 'Email',
  'auth.password': 'Пароль',
  'auth.full_name': 'ФИО',
  'auth.grade': 'Класс',
  'auth.school': 'Школа / Лицей',
  'auth.forgot_password': 'Забыли пароль?',
  'auth.have_account': 'Уже есть аккаунт? Войти',
  'auth.no_account': 'Нет аккаунта? Зарегистрироваться',
  'auth.student_desc': 'Войдите как ученик, чтобы развивать навыки и повышать ELO-рейтинг с наставником «Аға»',
  'auth.teacher_desc': 'Войдите как учитель, чтобы конструировать курсы и отслеживать тепловую матрицу класса',

  // =========================================================================
  // 6. STUDENT DASHBOARD & LEARNING PASSPORT
  // =========================================================================
  'student.greeting': 'Добрый день',
  'student.activity_title': 'Учебная активность',
  'student.activity_subtitle': 'Коммиты знаний и решенные задачи за последние 90 дней',
  'student.contributions': 'задач выполнено',
  'student.current_streak': 'Текущий стрик',
  'student.longest_streak': 'Рекордный стрик',
  'student.pinned_subject': 'Закрепленный предмет & Фокус',
  'student.start_focus': 'Начать 3-минутный фокус',
  'student.focus_duration': '3 минуты',
  'student.quarter_topics': 'Темы четверти',
  'student.quarter_topics_subtitle': 'Жизненный цикл тем в стиле GitHub Issues',
  'student.spaced_repetition': 'Интервальное повторение SM-2',
  'student.due_cards': 'карточек на сегодня',
  'student.start_review': 'Повторить формулы',
  'student.estimated_time': 'Примерное время',
  'student.passport_title': 'Паспорт ученика',
  'student.cognitive_profile': 'Когнитивный профиль Q-Matrix',
  'student.mastered_skills': 'Освоенные микронавыки',
  'student.target_exam': 'Целевой экзамен',
  'student.leaderboard_title': 'Таблица лидеров класса',
  'student.leaderboard_rank': 'Место в рейтинге',
  'student.weekly_goal': 'Цель недели',
  'student.completed_tasks': 'Выполненные задачи',
  'student.streak_freeze_available': 'Заморозка стрика доступна',

  // =========================================================================
  // 7. STATUSES & LIFECYCLE BADGES
  // =========================================================================
  'status.mastered': 'Усвоено [✓ Зачтено]',
  'status.pending': 'Ожидает [⏳ На проверке]',
  'status.in_progress': 'В работе [● Открыто]',
  'status.queued': 'В очереди [○ В очереди]',
  'status.locked': 'Заблокировано 🔒',
  'status.completed': 'Завершено',
  'status.failed': 'Требует доработки',

  // =========================================================================
  // 8. SOCRATIC TRAINER «АҒА» & COGNITIVE ENGINE
  // =========================================================================
  'trainer.title': 'Сократический тренажер «Аға»',
  'trainer.subtitle': 'Персональный AI-наставник с когнитивной диагностикой CDM и развилками мысли',
  'trainer.mode_a': 'Режим А: Выбор варианта',
  'trainer.mode_b': 'Режим Б: Тетрадь и фото',
  'trainer.mode_a_desc': 'Анализ когнитивных ловушек и дистракторов в тестовом формате',
  'trainer.mode_b_desc': 'Развернутое решение с загрузкой рукописной работы из тетради',
  'trainer.question_number': 'Вопрос',
  'trainer.thought_forks': 'Развилки мысли (Thought-Forks)',
  'trainer.thought_forks_desc': 'Выберите корректную стратегию рассуждения перед выполнением вычислений',
  'trainer.socratic_hint': 'Сократическая наводка наставника «Аға»',
  'trainer.socratic_hint_default': 'Не спешите выбирать готовый ответ. Проанализируйте логические связи на интерактивном полотне!',
  'trainer.active_canvas': 'Интерактивное полотно Active Canvas',
  'trainer.zvdsl_renderer': 'Интерактивная модель ZVDSL+',
  'trainer.desmos_plane': 'Координатная плоскость Desmos',
  'trainer.listen_aga': 'Послушать наставника «Аға»',
  'trainer.notebook_upload': 'Загрузка решения из тетради',
  'trainer.notebook_drag_drop': 'Перетащите фото страницы или нажмите для выбора файла',
  'trainer.notebook_camera': 'Сделать снимок камерой',
  'trainer.solution_placeholder': 'Опишите ход рассуждений или оставьте комментарий к загруженному фото...',
  'trainer.check_answer': 'Проверить ответ',
  'trainer.next_question': 'Следующий вопрос',
  'trainer.prev_question': 'Предыдущий вопрос',
  'trainer.retry': 'Пройти повторно',
  'trainer.finish_session': 'Завершить сессию',
  'trainer.session_completed': 'Сессия успешно завершена 🎉',
  'trainer.eureka_moment': 'Эврика! (Eureka Moment) 🎉 +15 ELO',
  'trainer.eureka_desc': 'Логический шаг выполнен безупречно! Рейтинг ELO повышен.',
  'trainer.ethics_violation': 'Нарушение академической этики -20 ELO',
  'trainer.ethics_violation_desc': 'Обнаружена попытка несанкционированного списывания или использования готовых ответов.',
  'trainer.scientific_explanation': 'Полное научное объяснение',
  'trainer.cognitive_trap': 'Когнитивная ловушка',
  'trainer.inspect_schema': 'Просмотреть схему',

  // =========================================================================
  // 9. TEACHER DASHBOARD & DINA / CDM MATRIX
  // =========================================================================
  'teacher.title': 'Кабинет учителя',
  'teacher.subtitle': 'Мониторинг успеваемости, диагностика когнитивных дефицитов и управление классом',
  'teacher.select_class': 'Выбор класса',
  'teacher.live_sync': 'Live DINA Sync',
  'teacher.syncing': 'Синхронизация...',
  'teacher.synced_success': 'Данные учеников и показатели ELO успешно обновлены',
  'teacher.lesson_signal_title': '«Сигнал дня» — Кластерный дефицит за 5 секунд',
  'teacher.affected_students': 'учеников допустили общую системную ошибку',
  'teacher.common_misconception': 'Типичное заблуждение',
  'teacher.ai_recommendation': 'Рекомендация ИИ: провести 5-минутную экспресс-разминку на смарт-доске в начале урока',
  'teacher.launch_smartboard': 'Вывести на смарт-доску (F11)',
  'teacher.traffic_light_title': 'Светофорная сводка успеваемости',
  'teacher.mastered_label': '🟢 Усвоено (≥70%)',
  'teacher.in_progress_label': '🟡 В процессе (40-69%)',
  'teacher.deficit_label': '🔴 Пробел (<40%)',
  'teacher.cluster_mastery': 'Кластерное освоение',
  'teacher.in_revision': 'На этапе закрепления',
  'teacher.needs_intervention': 'Требуется интервенция',
  'teacher.avg_class_elo': 'Средний ELO класса',
  'teacher.avg_class_streak': 'Средний стрик',
  'teacher.express_enrollments': 'Экспресс-заявки на зачисление',
  'teacher.pending_requests': 'ожидают решения',
  'teacher.no_pending_requests': 'Нет ожидающих заявок. Все ученики зачислены ✅',
  'teacher.approve': 'Одобрить',
  'teacher.reject': 'Отклонить',
  'teacher.approved_success': 'Заявка одобрена! Ученик зачислен на курс (1-Click Enrolled).',
  'teacher.rejected_success': 'Заявка отклонена.',
  'teacher.heatmap_matrix_title': 'Журнал класса: Тепловая матрица 24 ученика × 16 микронавыков',
  'teacher.qmatrix_desc': 'Когнитивная Q-Matrix диагностика CDM: нажмите на ячейку для детального анализа лога ошибок',
  'teacher.search_student': 'Поиск ученика...',
  'teacher.all_students': 'Все ученики',
  'teacher.deficits_only': 'Только с пробелами',
  'teacher.mastered_only': 'Только освоившие',
  'teacher.sort_by_elo': 'По рейтингу ELO',
  'teacher.sort_by_name': 'По алфавиту',
  'teacher.sort_by_deficits': 'По числу пробелов',

  // =========================================================================
  // 10. SMARTBOARD MODE (F11 PROJECTOR STUDIO)
  // =========================================================================
  'smartboard.title': 'Смарт-доска: Студия 5-минутной интервенции',
  'smartboard.f11_mode': 'F11 Режим проектора',
  'smartboard.timer_title': 'Таймер экспресс-разминки',
  'smartboard.timer_finished': '5-минутная интервенция завершена! ⏰',
  'smartboard.timer_finished_desc': 'Проанализируйте распределение ответов класса и подведите итоги.',
  'smartboard.start_timer': 'Старт',
  'smartboard.pause_timer': 'Пауза',
  'smartboard.reset_timer': 'Сброс',
  'smartboard.contrast_toggle': 'Высокая контрастность',
  'smartboard.reveal_solution': 'Показать решение',
  'smartboard.hide_solution': 'Скрыть решение',
  'smartboard.class_poll': 'Голосование класса',
  'smartboard.total_votes': 'Всего ответов',
  'smartboard.vote_option': 'Вариант',
  'smartboard.exit_smartboard': 'Выйти из режима смарт-доски',

  // =========================================================================
  // 11. AI CO-PILOT COURSE BUILDER
  // =========================================================================
  'course_builder.title': 'AI Co-Pilot Конструктор курсов',
  'course_builder.subtitle': 'Автоматическая генерация силлабуса, целей СОР/СОЧ и тестовых заданий на базе ИИ',
  'course_builder.course_title': 'Название курса',
  'course_builder.subject': 'Предмет',
  'course_builder.grade': 'Класс',
  'course_builder.upload_doc': 'Загрузить PDF / DOCX',
  'course_builder.upload_desc': 'Загрузите учебник или конспект для извлечения графа знаний Knowledge Graph',
  'course_builder.parsing_doc': 'Анализ документа и построение графа понятий...',
  'course_builder.copilot_greeting': 'Здравствуйте, коллега! Я ваш AI Co-Pilot. Загрузите файл силлабуса (PDF/DOCX) или опишите тему, и я автоматически сформирую дерево микронавыков, цели СОР/СОЧ, дескрипторы и тестовые задания.',
  'course_builder.prompt_placeholder': 'Напишите запрос для AI Co-Pilot (например: "Создай курс по теме квадратных неравенств для 9 класса")...',
  'course_builder.send': 'Отправить',
  'course_builder.syllabus_tree': 'Дерево силлабуса и тем',
  'course_builder.sor_soch_goals': 'Цели обучения СОР/СОЧ',
  'course_builder.descriptors': 'Дескрипторы критериального оценивания',
  'course_builder.add_topic': 'Добавить тему',
  'course_builder.generate_tests': 'Сгенерировать тесты',
  'course_builder.publish_course': 'Опубликовать курс',
  'course_builder.questions_count': 'заданий',
  'course_builder.quarter': 'Четверть',

  // =========================================================================
  // 12. 1-CLICK KUNDELIK.KZ EXPORT
  // =========================================================================
  'kundelik.modal_title': '1-Click экспорт дескрипторов и оценок в Kundelik.kz',
  'kundelik.modal_subtitle': 'Автоматическая генерация ведомости формативного оценивания (1-10 баллов) и дескрипторов',
  'kundelik.select_quarter': 'Четверть',
  'kundelik.assessment_type': 'Вид оценивания',
  'kundelik.formative': 'Формативное (1-10)',
  'kundelik.sor': 'БЖБ / СОР',
  'kundelik.soch': 'ТЖБ / СОЧ',
  'kundelik.date': 'Дата',
  'kundelik.copy_clipboard': 'Скопировать в буфер для Kundelik (Ctrl+V)',
  'kundelik.copied': 'Скопировано в буфер! 📋',
  'kundelik.copied_desc': 'Вставьте данные в электронный журнал Kundelik.kz с помощью комбинации клавиш Ctrl+V',
  'kundelik.download_csv': 'Скачать Excel / CSV',
  'kundelik.download_json': 'Скачать JSON отчет',
  'kundelik.student_name': 'ФИО ученика',
  'kundelik.score': 'Балл (1-10)',
  'kundelik.descriptor': 'Дескриптор (Обратная связь)',
  'kundelik.level': 'Уровень достижений',
  'kundelik.level_high': 'Высокий (Жоғары)',
  'kundelik.level_medium': 'Средний (Орта)',
  'kundelik.level_low': 'Низкий (Төмен)',
  'kundelik.avg_score': 'Средний балл класса',

  // =========================================================================
  // 13. PERSONAL ROADMAP & EXAM TARGET (ЕНТ / ҰБТ 2026)
  // =========================================================================
  'roadmap.title': 'Персональный образовательный Roadmap',
  'roadmap.subtitle': 'Адаптивная траектория подготовки к экзаменам и олимпиадам',
  'roadmap.target_ent': 'ҰБТ / ЕНТ 2026',
  'roadmap.target_sor_soch': 'СОР / СОЧ 3-я четверть',
  'roadmap.target_olympiad': 'Республиканская Олимпиада',
  'roadmap.days_remaining': 'дней осталось',
  'roadmap.countdown_title': 'Обратный отсчет до целевого экзамена',
  'roadmap.current_score': 'Текущий балл',
  'roadmap.target_score': 'Целевой балл',
  'roadmap.predicted_score': 'Прогнозируемый балл',
  'roadmap.score_trajectory': 'Траектория баллов: 94 → 132 балла',
  'roadmap.milestones': 'Контрольные чекпоинты (Milestones)',
  'roadmap.microskills': 'Ключевые микронавыки',
  'roadmap.start_milestone_drill': 'Начать отработку чекпоинта',
  'roadmap.checkpoint_mastered': 'Чекпоинт успешно освоен',

  // =========================================================================
  // 14. COURSE CATALOG & ENROLLMENT
  // =========================================================================
  'catalog.title': 'Каталог курсов & Учебные программы',
  'catalog.subtitle': 'Динамические силлабусы, спецкурсы и олимпиадные треки от ведущих педагогов',
  'catalog.all_courses': 'Все курсы',
  'catalog.my_courses': 'Мои курсы',
  'catalog.pending_courses': 'Ожидают зачисления',
  'catalog.enroll': 'Записаться на курс',
  'catalog.applying': 'Отправка заявки...',
  'catalog.applied_success': 'Заявка успешно отправлена! 🎉',
  'catalog.enrolled': 'Вы зачислены',
  'catalog.continue_learning': 'Перейти к обучению',
  'catalog.filter_subject': 'Предмет',
  'catalog.filter_grade': 'Класс',
  'catalog.students_count': 'учеников',

  // =========================================================================
  // 15. DUOLINGO-STYLE NOTIFICATIONS & STREAK SAVER
  // =========================================================================
  'notifications.title': 'Центр уведомлений',
  'notifications.no_notifications': 'Нет новых уведомлений',
  'notifications.mark_all_read': 'Отметить все как прочитанные',
  'notifications.streak_saver_title': '🔥 Спаси свой стрик! (Duolingo Streak Saver)',
  'notifications.streak_saver_desc': 'Твой стрик погаснет в полночь! Выполни 3-минутный экспресс-фокус и сохрани непрерывную серию обучения.',
  'notifications.aga_reminder_title': '🧠 Наставник «Аға» ждет тебя',
  'notifications.aga_reminder_desc': '«Аға» подготовил для тебя 3-минутный фокус по интервальному методу и законам динамики!',
  'notifications.memory_burn_title': '🎴 Формулы стираются из памяти! (Memory Burn)',
  'notifications.memory_burn_desc': '3 ключевые формулы за 1-ю четверть близки к забыванию. Повторите их всего за 1 минуту!',
  'notifications.weekly_digest_title': '🏆 Еженедельный дайджест успехов',
  'notifications.weekly_digest_desc': 'На этой неделе вы заработали +45 ELO и вошли в ТОП-3 класса! Ознакомьтесь с результатами.',
  'notifications.streak_freeze_activated': '❄️ Заморозка стрика (Streak Freeze) активирована!',
  'notifications.midnight_countdown': 'До полуночи осталось:',

  // =========================================================================
  // 16. TEXT-TO-SPEECH (TTS) & NEURAL VOICES
  // =========================================================================
  'tts.listen': 'Озвучить',
  'tts.listening': 'Воспроизведение...',
  'tts.stop': 'Остановить',
  'tts.voice_male': 'Нейро-голос Дмитрий (Edge Neural)',
  'tts.voice_female': 'Нейро-голос Светлана (Edge Neural)',
  'tts.edge_neural': 'Edge Neural TTS',
  'tts.speech_fallback': 'Web Speech API',

  // =========================================================================
  // 17. COMMAND PALETTE (⌘K)
  // =========================================================================
  'palette.title': 'Быстрый поиск и команды',
  'palette.placeholder': 'Введите команду или название предмета... (⌘K)',
  'palette.courses': 'Курсы и предметы',
  'palette.actions': 'Действия',
  'palette.navigation': 'Навигация',
  'palette.switch_theme': 'Сменить тему оформления',
  'palette.switch_to_teacher': 'Перейти в кабинет учителя',
  'palette.switch_to_student': 'Перейти в кабинет ученика',
  'palette.empty': 'Ничего не найдено.',

  // =========================================================================
  // 18. COMMON ACTIONS, ERRORS & SYSTEM LABELS
  // =========================================================================
  'action.save': 'Сохранить',
  'action.cancel': 'Отмена',
  'action.close': 'Закрыть',
  'action.submit': 'Отправить',
  'action.login': 'Войти',
  'action.register': 'Регистрация',
  'action.back': 'Назад',
  'action.next': 'Далее',
  'action.understand': 'Понятно',
  'action.try_again': 'Попробовать снова',
  'action.enroll': 'Записаться на курс',
  'action.download': 'Скачать',
  'action.copy': 'Копировать',
  'action.delete': 'Удалить',
  'action.edit': 'Редактировать',
  'action.create': 'Создать',
  'action.search': 'Искать',
  'action.filter': 'Фильтровать',
  'action.refresh': 'Обновить',
  'action.confirm': 'Подтвердить',

  'error.generic': 'Произошла непредвиденная ошибка',
  'error.network': 'Ошибка соединения с сервером',
  'error.unauthorized': 'Сессия устарела. Пожалуйста, выполните вход заново',
  'error.not_found': 'Запрашиваемый ресурс не найден',

  'common.loading': 'Загрузка...',
  'common.success': 'Успешно',
  'common.error': 'Ошибка',
  'common.warning': 'Внимание',
  'common.info': 'Информация',
  'common.minutes': 'мин',
  'common.seconds': 'сек',
  'common.days': 'дней',
  'common.points': 'баллов',
  'common.total': 'Всего',

  // ==========================================
  // 19. NEW KEYS: ZERO-HARDCODE, SLOTS & DELTA-DIFF
  // ==========================================
  'student.predicted_grade_label': 'Прогноз оценки:',
  'student.eureka_reward_tag': '+15 ELO за Eureka',
  'student.quarter_one_label': 'I Четверть',
  'teacher.tab_gradebook': 'Журнал & Аналитика',
  'teacher.tab_ai_studio': 'AI Course Studio',
  'teacher.tab_smartboard': 'Смарт-доска (F11)',
  'course.single_language_lock': 'Закрепить только на одном языке',
  'course.single_language_lock_desc': 'Для языковых курсов (Русский язык, Литература, English) сохранять задания на языке оригинала',
  'course.custom_language_placeholder': 'Впишите свой язык (напр. Французский)...',
  'teacher.slots_title': 'Слоты документов (макс. 5)',
  'teacher.slots_window_open': 'Окно изменений открыто (Каникулы / 1-2 дня)',
  'smartboard.intervention_done_title': '5-минутная интервенция завершена! ⏰',
  'smartboard.intervention_done_desc': 'Проанализируйте ответы учеников и подведите итоги.',

  // ==========================================
  // 20. AUTH, ORG TOKENS & COURSE CODES
  // ==========================================
  'auth.bio_label': 'О себе (Кратко)',
  'auth.bio_placeholder': 'Научные интересы или специализация...',
  'auth.org_token_label': 'Организационный токен доступа (Security Token)',
  'auth.org_token_placeholder': 'Например: ORG-8F3K9A или ZK-7492-X',
  'auth.org_token_hint': 'Официальный токен, выданный вашим учебным заведением',
  'auth.role_switcher_student': 'Ученик / Студент',
  'auth.role_switcher_teacher': 'Преподаватель / Учитель',
  'courses.join_by_code_title': 'Присоединиться к курсу по коду',
  'courses.join_by_code_desc': 'Введите 6-значный случайный код, предоставленный преподавателем',
  'courses.join_by_code_placeholder': '6-значный код (напр: 7X9K2M)...',
  'courses.join_by_code_btn': 'Присоединиться к курсу',
  'courses.invite_student_title': 'Пригласить ученика в группу',
  'courses.invite_student_name': 'ФИО ученика',
  'courses.invite_student_email': 'Email ученика',
  'courses.send_invite_btn': 'Отправить приглашение',
  'courses.short_code_badge': 'Код курса:',

  'courses.copy_code_tooltip': 'Копировать код',
  'courses.code_copied_toast': 'Код курса скопирован! 📋',
  'common.error_occurred': 'Произошла ошибка',
  'common.name': 'Полное имя',
  'common.failed_to_save': 'Не удалось сохранить данные',
  'common.add': 'Добавить',
  'common.cancel': 'Отмена',
  'common.saved': 'Успешно сохранено!',
  'courses.catalog_title': 'Каталог курсов & Учебные программы',
  'courses.catalog_subtitle': 'Динамические силлабусы, спецкурсы и олимпиадные треки от преподавателей',
  'courses.enrolled_filter': 'Мои курсы',
  'courses.pending_filter': 'Заявки',
  'courses.enrollment_pending': 'На рассмотрении',
  'courses.apply_enroll': 'Подать заявку',

  'student.continue_learning': 'Продолжить обучение',
  'trainer.mentor_name': 'Наставник «Аға»',
  'trainer.active_canvas_hint': 'Изменяйте ветви параболы и корни, чтобы исследовать чередование знаков интервалов!',
  'student.leaderboard_desc': 'Еженедельный ELO и стрик рейтинг группы',
  'student.top_5_badge': 'Топ-5',
  'student.you_badge': 'Вы',
  'student.days_unit_short': 'д',
  'student.spaced_repetition_title': 'SM-2 Интервальное повторение',
  'student.formulas_unit': 'формул',
  'student.sm2_all_completed': 'Все карточки на сегодня повторены! Память обновлена на 100%.',
  'student.review_card_btn': 'Повторить',
  'student.elo_rating_label': 'Рейтинг ELO',
  'student.streak_days_label': 'Учебный стрик',
  'student.days_unit': 'дней',
  'student.consecutive_commits': 'Непрерывные коммиты',
  'student.quarter_goal_label': 'Цель четверти:',
  'student.verified_passport': 'Верифицированный паспорт',
  'student.streak_count': 'Стрик',
  'student.exam_countdown': 'ЕНТ 2026: 74 дня осталось',
  'student.pinned_subjects': 'Закрепленные предметы',
  'student.all_courses': 'Все курсы',
  'courses.next_topic_title': 'Следующая тема',
  'student.roadmap_tab': 'Персональный Roadmap: ЕНТ 2026',
  'student.score_trajectory_desc': 'Траектория целевого балла: 94 → 132 балла (74 дня осталось)',
  'student.full_roadmap_btn': 'Полный Roadmap',
  'student.linear_equations': 'Линейные уравнения',
  'student.quadratic_inequalities': 'Квадратные неравенства',

  'student.rational_equations': 'Дробно-рациональные уравнения',
  'student.quarter_topics_desc': 'Двухфакторный зачет и учебная матрица',
  'student.last_3_months': 'Последние 3 месяца',
  'student.less': 'Меньше',
  'student.more': 'Больше',
  'common.topics': 'тем',
  'student.study_days_title': 'Недельный ритм обучения',
  'student.active_streak_label': 'дн. активный стрик',
  'student.tasks_unit': 'зад.',
  'student.no_enrolled_courses_title': 'Вы еще не записаны ни на один курс',

  'student.no_enrolled_courses_desc': 'Введите 6-значный код курса или выберите курс в каталоге',
  'auth.city_label': 'Город / Регион',
  'auth.city_placeholder': 'e.g. Алматы, Астана, Шымкент',
  'auth.target_exam_label': 'Основная цель / Экзамен',
  'auth.target_exam_placeholder': 'e.g. ЕНТ 2026, Олимпиада, СОР / СОЧ',
  'auth.subject_label': 'Преподаваемый предмет',
  'auth.subject_placeholder': 'e.g. Математика, Физика, Казахский язык',
  'auth.has_account': 'Уже есть аккаунт? Войти',
  'trainer.question_label': 'Вопрос',
  'trainer.select_option': 'Выбор варианта',
  'trainer.full_solution': 'Полное решение / Фото',
  'trainer.socratic_hint_title': 'Сократическая подсказка наставника «Аға»:',
  'trainer.eureka_toast_msg': 'Новый рейтинг',
  'trainer.hint_title': 'Совет наставника «Аға»',
  'trainer.hint_msg': 'Проанализируйте ошибку и попробуйте выйти из когнитивной ловушки.',
  'roadmap.exam_selected': 'Выбран целевой экзамен',
  'roadmap.time_until_exam': 'До начала экзамена:',
  'roadmap.daily_required_time': 'Ежедневный темп:',
  'roadmap.ai_confidence': 'Надежность прогноза ИИ',
  'roadmap.target_score_grant': 'Целевой балл (Порог гранта)',
  'roadmap.intermediate_milestone': 'Промежуточная цель',
  'roadmap.target': 'Цель',
  'courses.search_placeholder': 'Поиск по названию курса или предмету...',
  'student.explore_courses_btn': 'Записаться на курс',
  'trainer.socratic_title': 'Сократический тренажер «Аға»',
  'trainer.mode': 'Режим',
} as const;



export default ru;









/**
 * ZERDE ЭКОЖҮЙЕСІНІҢ ҚАЗАҚША ЛОКАЛИЗАЦИЯСЫ (ҚАЗАҚ ТІЛІ / KAZAKH)
 * 
 * Аутентичный, академически выверенный и живой казахский язык.
 * Непереводимые термины сохранены: ELO, Aga (Аға), Zerde, ZVDSL+, Thought-Forks, Eureka, Q-Matrix, CDM.
 */

export const kz = {
  // ==========================================
  // 1. BRAND & HEADER (Бренд және тақырыпша)
  // ==========================================
  'brand.title': 'Zerde',
  'brand.subtitle': 'Интеллектуалды білім беру экожүйесі',
  'brand.tagline': 'Socratic AI Education • Терең ойлауға жетелейтін білім',
  'brand.description': 'GitHub Primer негізіндегі Сократикалық жасанды интеллект платформасы',
  
  'header.search_placeholder': 'Курстар мен тақырыптарды іздеу... (⌘K)',
  'header.streak': 'күндік стрик',
  'header.elo': 'ELO',
  'header.notifications': 'Хабарландырулар',
  'header.no_notifications': 'Жаңа хабарландыру жоқ',
  'header.mark_all_read': 'Барлығын оқылды деп белгілеу',
  'header.profile': 'Профиль',
  'header.settings': 'Баптаулар',
  'header.logout': 'Жүйеден шығу',
  'header.switch_role': 'Рөлді ауыстыру',
  'header.theme_toggle': 'Тақырыпты ауыстыру',
  'header.online_status': 'Желіде',

  // ==========================================
  // 2. ROLES (Пайдаланушы рөлдері)
  // ==========================================
  'role.student': 'Оқушы',
  'role.teacher': 'Мұғалім',
  'role.admin': 'Әкімші',
  'role.mentor': 'Тәлімгер',

  // ==========================================
  // 3. NAVIGATION (Навигация және мәзір)
  // ==========================================
  'nav.home': 'Басты бет',
  'nav.courses': 'Курстар',
  'nav.trainer': 'Тренажер',
  'nav.progress': 'Прогресс',
  'nav.roadmap': 'Жол картасы',
  'nav.classes': 'Сыныптар',
  'nav.builder': 'Конструктор',
  'nav.analytics': 'Аналитика',
  'nav.smartboard': 'Смарт-тақта',
  'nav.back_to_dashboard': 'Басты кабинетке қайту',

  // ==========================================
  // 4. ELO RANKS (ELO дәрежелері мен лигалары)
  // ==========================================
  'rank.oskin': 'Өскін 🌱',
  'rank.oskin_desc': 'Бастапқы деңгей (800–1199 ELO)',
  'rank.tughyr': 'Тұғыр 🌿',
  'rank.tughyr_desc': 'Негізгі деңгей (1200–1499 ELO)',
  'rank.qyran': 'Қыран 🦅',
  'rank.qyran_desc': 'Озат деңгей (1500–1799 ELO)',
  'rank.samgau': 'Самғау ⭐',
  'rank.samgau_desc': 'Шың деңгей (1800+ ELO)',
  'rank.current_rank': 'Ағымдағы дәрежеңіз',
  'rank.next_rank_needed': 'Келесі дәрежеге дейін {points} ELO қажет',

  // ==========================================
  // 5. AUTH (Кіру, Тіркелу және Демо)
  // ==========================================
  'auth.welcome_title': 'Zerde білім беру экожүйесіне қош келдіңіз',
  'auth.welcome_subtitle': 'GitHub Primer негізіндегі Сократикалық білім беру платформасы',
  'auth.login_tab': 'Кіру',
  'auth.register_tab': 'Тіркелу',
  'auth.student_role_desc': 'Оқушы ретінде кіріп, «Аға» наставнигімен ELO рейтингіңізді көтеріңіз',
  'auth.teacher_role_desc': 'Мұғалім ретінде кіріп, курстар құрыңыз және сынып аналитикасын бақылаңыз',
  'auth.email_label': 'Электрондық пошта',
  'auth.email_placeholder': 'myschool@zerde.kz',
  'auth.password_label': 'Құпия сөз',
  'auth.password_placeholder': '••••••••',
  'auth.forgot_password': 'Құпия сөзді ұмыттыңыз ба?',
  'auth.reset_password': 'Құпия сөзді қалпына келтіру',
  'auth.full_name_label': 'Толық аты-жөніңіз',
  'auth.full_name_placeholder': 'Азамат Темірханов',
  'auth.grade_label': 'Сыныбыңыз',
  'auth.school_label': 'Мектеп',
  'auth.school_placeholder': '№17 IT-лицей',
  'auth.demo_access_title': 'Жылдам демо-кіру (1 басумен):',
  'auth.demo_student_btn': 'Оқушы: Азамат (10 «А» • 1435 ELO)',
  'auth.demo_teacher_btn': 'Мұғалім: Гүлнар Серікқызы (Алгебра)',
  'auth.submitting': 'Кіру орындалуда...',
  'auth.already_have_account': 'Бұрын тіркелгенсіз бе? Кіру',
  'auth.dont_have_account': 'Аккаунтыңыз жоқ па? Тіркелу',
  'auth.terms_agree': 'Тіркелу арқылы сіз пайдалану шарттары мен құпиялылық саясатын қабылдайсыз',

  // ==========================================
  // 6. STUDENT DASHBOARD (Оқушы кабинеті)
  // ==========================================
  'student.greeting': 'Қайырлы күн',
  'student.activity_title': 'Оқу белсенділігі',
  'student.activity_subtitle': 'Соңғы 90 күндегі үздіксіз білім коммиттері',
  'student.contributions': 'тапсырма орындалды',
  'student.no_contributions': 'Бұл күні белсенділік тіркелмеген',
  'student.current_streak': 'Ағымдағы стрик',
  'student.longest_streak': 'Рекордтық стрик',
  'student.streak_days_count': '{count} күн қатарынан',
  'student.streak_freeze_status': 'Стрик қорғанысы: Белсенді ❄️',
  'student.pinned_subject': 'Бекітілген пән & Фокус',
  'student.start_focus': 'Фокусты бастау',
  'student.focus_duration': '3 минут',
  'student.predicted_score': 'Болжамды балл',
  'student.quarter_topics': 'Тоқсан тақырыптары',
  'student.quarter_topics_subtitle': 'Мемлекеттік стандарт бойынша тақырыптардың өмірлік циклі',
  'student.spaced_repetition': 'Интервалды қайталау (SM-2)',
  'student.spaced_repetition_desc': 'Эббингауздың ұмыту қисығына негізделген жадты бекіту жүйесі',
  'student.due_cards': 'қайталауға дайын карточка',
  'student.start_review': 'Қайталауды бастау',
  'student.estimated_time': 'Шамамен уақыт',
  'student.retention_rate': 'Жадта сақталу көрсеткіші',
  'student.total_reviewed': 'Барлық қайталанған формулалар',
  'student.passport_title': 'Оқушының білім паспорты',
  'student.leaderboard_title': 'Сыныптық көшбасшылар тақтасы',
  'student.leaderboard_rank': 'Орын',
  'student.leaderboard_student': 'Оқушы',
  'student.leaderboard_elo': 'ELO ұпайы',
  'student.leaderboard_mastered': 'Игерілген тақырыптар',
  'student.weekday_carousel_title': 'Оқу апталығы',
  'student.active_session': 'Белсенді оқу сессиясы',
  'student.recommendation_reason': 'Тәлімгер ұсынысы',

  // ==========================================
  // 7. STATUSES (Тақырыптар мен тапсырмалар күйі)
  // ==========================================
  'status.mastered': 'Усвоено (✓ Жабық)',
  'status.mastered_short': '✓ Жабық',
  'status.pending': 'Ожидает (⏳ Мұғалімде)',
  'status.pending_short': '⏳ Мұғалімде',
  'status.in_progress': 'В работе (● Ашық)',
  'status.in_progress_short': '● Ашық',
  'status.queued': 'В очереди (○ Кезекте)',
  'status.queued_short': '○ Кезекте',
  'status.locked': 'Құлыпталған 🔒',
  'status.locked_short': 'Құлыпталған',
  'status.completed': 'Аяқталды',
  'status.active': 'Белсенді',
  'status.enrolled': 'Қабылданды',
  'status.expelled': 'Шығарылды',
  'status.pending_approval': 'Мақұлдау күтілуде',

  // ==========================================
  // 8. SOCRATIC TRAINER & «АҒА» (Тренажер және наставник)
  // ==========================================
  'trainer.title': 'Сократикалық тренажер «Аға»',
  'trainer.socratic_mentor': 'Сократикалық наставник «Аға»',
  'trainer.mentor_badge': 'AI Сократ Тәлімгері',
  'trainer.mode_a_title': 'А режимі — Нұсқаны таңдау (Thought-Forks)',
  'trainer.mode_a_desc': 'Тұжырымдарды сараптап, ойлау тармақтарын салыстырыңыз',
  'trainer.mode_b_title': 'Б режимі — Дәптер және фото шешім',
  'trainer.mode_b_desc': 'Қолжазба дәптер бетін жүктеп, қадамдық тексеруден өтіңіз',
  'trainer.thought_forks': 'Ой тараулары (Thought-Forks)',
  'trainer.thought_forks_desc': 'Әр жауап нұсқасының логикалық бағыты мен мүмкін болатын тұзағы',
  'trainer.desmos_plane': 'Desmos интерактивті координаталық жазықтығы',
  'trainer.zvdsl_canvas': 'ZVDSL+ математикалық-графиктік модельдеу',
  'trainer.explanation_title': 'Түсініктеме & Дәлелдеу',
  'trainer.eureka_moment': '💡 Эврика сәті! (+15 ELO)',
  'trainer.eureka_desc': 'Өздігіңізден терең заңдылықты түсініп, дұрыс логикалық шешім таптыңыз!',
  'trainer.academic_integrity_violation': '⚠️ Академиялық этиканы бұзу (-20 ELO)',
  'trainer.integrity_warning': 'Дайын жауапты көшіру немесе көмекші құралдарды заңсыз пайдалану белгілері анықталды',
  'trainer.check_solution': 'Шешімді тексеру',
  'trainer.next_question': 'Келесі сұрақ',
  'trainer.prev_question': 'Алдыңғы сұрақ',
  'trainer.hint_btn': 'Сократтан тұспал сұрау',
  'trainer.inspect_canvas': 'Кенепті қарау 👁️',
  'trainer.upload_notebook_photo': 'Дәптер суретін жүктеу',
  'trainer.drag_drop_photo': 'Суретті осында сүйреңіз немесе файлды таңдаңыз',
  'trainer.ocr_processing': 'Қолжазба танылуда (OCR)...',
  'trainer.step_by_step_analysis': 'Қадамдық аналитика',
  'trainer.distractor_trap': 'Қателік тұзағы',
  'trainer.question_counter': 'Сұрақ {current} / {total}',
  'trainer.subject_label': 'Пән',
  'trainer.topic_label': 'Тақырып',
  'trainer.qmatrix_cdm': 'Q-Matrix & CDM танымдық диагностикасы',
  'trainer.socratic_dialogue': 'Сократикалық сұхбат',
  'trainer.thinking_step': 'Ойлау қадамы',
  'trainer.confirm_submission': 'Жауапты растау',

  // ==========================================
  // 9. TEACHER PORTAL & DASHBOARD (Мұғалім кабинеті)
  // ==========================================
  'teacher.portal_title': 'Мұғалім кабинеті',
  'teacher.class_matrix_title': '24 оқушының жылулық матрицасы (Q-Matrix)',
  'teacher.class_matrix_desc': 'Сыныптағы әр оқушының микро-дағдылар мен білім дефициттерін нақты уақытта көру',
  'teacher.lesson_signal_title': 'Күн белгісі (Сигнал дня за 5 секунд)',
  'teacher.lesson_signal_badge': '5 секундтық шешім',
  'teacher.lesson_signal_deficit': 'Басты қиындық тудырған тақырып',
  'teacher.lesson_signal_recommendation': 'Педагогикалық ұсыныс: Сабақтың алғашқы 5 минутын осы дефицитті жоюға арнаңыз',
  'teacher.smartboard_mode': 'Смарт-тақта F11 режимі',
  'teacher.smartboard_desc': 'Интерактивті тақтаға шығару, бірлескен талдау және дауыс беру',
  'teacher.warmup_5min': 'Сабақ алдындағы 5 минуттық сергіту',
  'teacher.warmup_timer': 'Интервенция таймері: 05:00',
  'teacher.voting_title': 'Сыныптық жылдам дауыс беру',
  'teacher.voting_desc': 'Оқушылар нұсқаларды таңдап, нәтижесі экранда бірден көрінеді',
  'teacher.voting_results': 'Дауыс беру қорытындысы',
  'teacher.select_classroom': 'Сыныпты таңдаңыз',
  'teacher.filter_all': 'Барлық оқушылар',
  'teacher.filter_deficits': 'Дефициті барлар',
  'teacher.filter_mastered': 'Игергендер',
  'teacher.sort_by_elo': 'ELO бойынша сұрыптау',
  'teacher.sort_by_name': 'Аты-жөні бойынша',
  'teacher.sort_by_deficits': 'Дефицит саны бойынша',
  'teacher.enrollment_requests': 'Курсқа қабылдау өтініштері',
  'teacher.approve_request': 'Қабылдау',
  'teacher.reject_request': 'Қабылдамау',
  'teacher.skill_detail_modal': 'Оқушының дағды деталдары',
  'teacher.cdm_probability': 'Игеру ықтималдығы (CDM)',
  'teacher.open_builder': 'Курс конструкторын ашу',
  'teacher.sync_status': 'Деректер синхрондалды',

  // ==========================================
  // 10. AI COURSE BUILDER (Курс конструкторы)
  // ==========================================
  'builder.title': 'AI Co-Pilot курс конструкторы',
  'builder.subtitle': 'Мемлекеттік стандартқа сай интерактивті курс пен СОР/СОЧ тапсырмаларын құрастыру',
  'builder.upload_doc_title': 'Оқу бағдарламасын жүктеу (PDF / DOCX)',
  'builder.upload_doc_desc': 'Файлды жүктеңіз — AI оқу мақсаттары мен тақырыптарды автоматты түрде талдайды',
  'builder.copilot_chat_title': 'Педагогикалық AI Co-Pilot диалогы',
  'builder.copilot_placeholder': 'Тақырыпты жазыңыз немесе түзету енгізіңіз (мысалы: "3-дескрипторды күшейт")...',
  'builder.curriculum_analysis': 'Оқу бағдарламасын талдау',
  'builder.sor_soch_goals': 'СОР / СОЧ оқу мақсаттары',
  'builder.descriptors_list': 'Бағалау дескрипторлары',
  'builder.generate_questions': 'Тесттер мен тапсырмаларды генерациялау',
  'builder.publish_course': 'Курсты жариялау',
  'builder.course_title_label': 'Курс атауы',
  'builder.subject_label': 'Пән',
  'builder.grade_label': 'Сынып',
  'builder.add_topic_manual': 'Жаңа тақырып қосу',
  'builder.delete_topic': 'Тақырыпты өшіру',
  'builder.preview_zvdsl': 'ZVDSL+ сұлбасын алдын ала көру',
  'builder.distractor_rationale': 'Дистрактор тұзағының негіздемесі',
  'builder.saving_course': 'Курс сақталуда...',
  'builder.course_published_success': 'Курс сәтті жарияланды және оқушыларға қолжетімді!',

  // ==========================================
  // 11. KUNDELIK.KZ EXPORT (Күнделік.kz 1-Click экспорт)
  // ==========================================
  'kundelik.modal_title': 'Күнделік.kz 1-Click экспорт',
  'kundelik.modal_subtitle': 'Формативті бағалау ведомосі және автоматты дескрипторлар',
  'kundelik.assessment_type': 'Бағалау түрі',
  'kundelik.formative': 'Формативті бағалау (1-10 балл)',
  'kundelik.sor': 'БЖБ / СОР',
  'kundelik.soch': 'ТЖБ / СОЧ',
  'kundelik.quarter_select': 'Тоқсан',
  'kundelik.date_select': 'Өткізілген күні',
  'kundelik.topic_select': 'Бағаланатын тақырып',
  'kundelik.copy_clipboard': 'Күнделікке көшіру (1-Click)',
  'kundelik.copied_success': 'Алмасу буферіне сәтті көшірілді! Күнделік.kz кестесіне Ctrl+V арқылы қойыңыз.',
  'kundelik.download_excel': 'Excel (.xlsx) жүктеу',
  'kundelik.download_csv': 'CSV (.csv) жүктеу',
  'kundelik.table_num': '№',
  'kundelik.table_student': 'Оқушының аты-жөні',
  'kundelik.table_score': 'Балл (1–10)',
  'kundelik.table_descriptor': 'Дескриптор (Кері байланыс)',
  'kundelik.table_level': 'Деңгейі',
  'kundelik.level_high': 'Жоғары',
  'kundelik.level_mid': 'Орта',
  'kundelik.level_low': 'Төмен',

  // ==========================================
  // 12. ROADMAP (Жеке оқу бағдары)
  // ==========================================
  'roadmap.title': 'Жеке оқу бағдары',
  'roadmap.subtitle': 'ҰБТ және емтихандарға арналған дербес білім траекториясы',
  'roadmap.target_exam': 'Мақсатты емтихан',
  'roadmap.unt_2026': 'ҰБТ / ЕНТ 2026',
  'roadmap.sor_soch_q3': '3-тоқсан БЖБ/ТЖБ',
  'roadmap.olympiad': 'Республикалық олимпиада',
  'roadmap.countdown_timer': 'Емтиханға дейін қалған уақыт',
  'roadmap.days': 'күн',
  'roadmap.hours': 'сағат',
  'roadmap.minutes': 'минут',
  'roadmap.seconds': 'секунд',
  'roadmap.score_trajectory': 'Ұпайлар траекториясы: 94 ➔ 132 балл',
  'roadmap.current_score': 'Ағымдағы деңгей',
  'roadmap.target_score': 'Мақсатты балл',
  'roadmap.predicted_score': 'Болжамды балл',
  'roadmap.points_growth': '94 ➔ 132 балл (+38 балл өсім)',
  'roadmap.milestones_title': 'Бақылау белестері',
  'roadmap.micro_skills': 'Микро-дағдылар мен талаптар',
  'roadmap.start_milestone_trainer': 'Осы белесті пысықтау',
  'roadmap.milestone_completed': 'Игерілген белес',
  'roadmap.milestone_in_progress': 'Қазіргі белес',
  'roadmap.milestone_locked': 'Алдағы белес',

  // ==========================================
  // 13. COURSE CATALOG (Курстар каталогы)
  // ==========================================
  'catalog.title': 'Курстар каталогы',
  'catalog.subtitle': 'Мектеп бағдарламасы мен тереңдетілген пәндік курстар',
  'catalog.search_placeholder': 'Курс немесе мұғалім атын іздеу...',
  'catalog.all_tab': 'Барлық курстар',
  'catalog.enrolled_tab': 'Менің курстарым',
  'catalog.pending_tab': 'Өтініштер',
  'catalog.all_subjects': 'Барлық пәндер',
  'catalog.all_grades': 'Барлық сыныптар',
  'catalog.apply_btn': 'Өтініш беру',
  'catalog.applying': 'Өтініш жіберілуде...',
  'catalog.enrolled_badge': 'Қабылданды',
  'catalog.pending_badge': 'Мақұлдауда',
  'catalog.continue_learning': 'Оқуды жалғастыру',
  'catalog.students_enrolled': '{count} оқушы жазылған',
  'catalog.teacher_label': 'Мұғалім',
  'catalog.grade_label': 'Сынып',
  'catalog.subject_label': 'Пән',
  'catalog.course_details': 'Курс бағдарламасы',

  // ==========================================
  // 14. NOTIFICATIONS & STREAK (Хабарландырулар және Стрик)
  // ==========================================
  'notifications.title': 'Хабарландырулар орталығы',
  'notifications.mark_all_read': 'Барлығын оқылды деп белгілеу',
  'notifications.empty': 'Жаңа хабарландыру жоқ',
  'notifications.streak_saver_title': '🔥 Стрикті сақтап қал! (Streak Saver)',
  'notifications.streak_saver_msg': 'Сенің үздіксіз оқу стригің түн ортасында жойылуы мүмкін! 3 минутта экспресс-жаттығуды орындап, оқу серияңды сақтап қал!',
  'notifications.streak_freeze_btn': '❄️ Стрикті қатыру (Streak Freeze)',
  'notifications.streak_freeze_used': 'Стрик сәтті қатырылды!',
  'notifications.aga_reminder_title': '🧠 «Аға» наставнигі шақырады',
  'notifications.aga_reminder_msg': '«Аға» саған дефицит тақырыптарың бойынша арнайы 3-минуттық фокус дайындап қойды!',
  'notifications.memory_burn_title': '🎴 Ұмытылу қаупі! (Memory Burn)',
  'notifications.memory_burn_msg': 'Бұрын өткен негізгі формулалар жадыңнан өшуге жақын. 1 минутта қайталап, бекітіп ал!',
  'notifications.weekly_digest_title': '🏆 Апталық оқу дайджесті',
  'notifications.weekly_digest_msg': 'Осы аптадағы білім жетістіктерің, ELO өсімі және сыныптағы рейтингің дайын!',
  'notifications.view_digest': 'Дайджестті қарау',
  'notifications.digest_modal_title': 'Апталық жеке есеп',
  'notifications.filter_all': 'Барлығы',
  'notifications.filter_unread': 'Оқылмағандар',
  'notifications.filter_triggers': 'Маңызды сигналдар',

  // ==========================================
  // 15. TTS & NEURAL VOICES (Дауыстап оқу)
  // ==========================================
  'tts.listen': 'Дауыстап оқу',
  'tts.listening': 'Ойнатылуда...',
  'tts.stop': 'Тоқтату',
  'tts.voice_daulet': 'Дәулет (Қазақша ер дауысы • Edge Neural)',
  'tts.voice_aigul': 'Айгүл (Қазақша әйел дауысы • Edge Neural)',
  'tts.speed': 'Оқу жылдамдығы',
  'tts.audio_generated': 'Аудио сәтті генерацияланды',

  // ==========================================
  // 16. COMMAND PALETTE (Пәрмендер палитрасы)
  // ==========================================
  'palette.title': 'Жылдам іздеу және әрекеттер',
  'palette.placeholder': 'Команда немесе пәнді жазыңыз... (⌘K)',
  'palette.courses': 'Курстар мен пәндер',
  'palette.actions': 'Әрекеттер',
  'palette.navigation': 'Навигация',
  'palette.switch_theme': 'Теманы ауыстыру',
  'palette.switch_to_teacher': 'Мұғалім кабинетіне өту',
  'palette.switch_to_student': 'Оқушы кабинетіне өту',
  'palette.empty': 'Ештеңе табылмады.',

  // ==========================================
  // 17. COMMON ACTIONS (Жалпы әрекеттер)
  // ==========================================
  'action.save': 'Сақтау',
  'action.cancel': 'Бас тарту',
  'action.close': 'Жабу',
  'action.submit': 'Жіберу',
  'action.login': 'Кіру',
  'action.register': 'Тіркелу',
  'action.back': 'Артқа',
  'action.next': 'Келесі',
  'action.understand': 'Түсіндім',
  'action.try_again': 'Қайта көру',
  'action.enroll': 'Курсқа жазылу',
  'action.start': 'Бастау',
  'action.finish': 'Аяқтау',
  'action.copy': 'Көшіру',
  'action.download': 'Жүктеп алу',
  'action.upload': 'Жүктеу',
  'action.filter': 'Сүзгі',
  'action.search': 'Іздеу',
  'action.refresh': 'Жаңарту',
  'action.apply': 'Қолдану',
  'action.confirm': 'Растау',
  'action.delete': 'Өшіру',
  'action.edit': 'Өңдеу',

  // ==========================================
  // 18. COMMON LABELS & UNITS (Жалпы белгілер)
  // ==========================================
  'common.loading': 'Жүктелуде...',
  'common.success': 'Сәтті орындалды',
  'common.error': 'Қате орын алды',
  'common.attention': 'Назар аударыңыз',
  'common.minutes': 'мин',
  'common.seconds': 'сек',
  'common.hours': 'сағ',
  'common.points': 'балл',
  'common.level': 'Деңгей',
  'common.score': 'Балл',
  'common.grade': 'Сынып',
  'common.subject': 'Пән',
  'common.date': 'Күні',
  'common.all': 'Барлығы',
  'common.no_data': 'Мәлімет жоқ',

  // ==========================================
  // 19. ERRORS & NOTICES (Қателер мен ескертулер)
  // ==========================================
  'errors.network': 'Интернет байланысын тексеріңіз',
  'errors.unauthorized': 'Сессия аяқталды, жүйеге қайта кіріңіз',
  'errors.server': 'Серверде қате орын алды. Қайталап көріңіз',
  'errors.not_found': 'Сұралған мәлімет табылмады',
  'errors.validation': 'Енгізілген деректерді тексеріңіз',

  // ==========================================
  // 20. NEW KEYS: ZERO-HARDCODE, SLOTS & DELTA-DIFF
  // ==========================================
  'student.predicted_grade_label': 'Болжамды баға:',
  'student.eureka_reward_tag': '+15 ELO Eureka сыйлығы',
  'student.quarter_one_label': 'I Тоқсан',
  'teacher.tab_gradebook': 'Журнал & Аналитика',
  'teacher.tab_ai_studio': 'AI Course Studio',
  'teacher.tab_smartboard': 'Смарт-доска (F11)',
  'course.single_language_lock': 'Тек бір тілде бекіту',
  'course.single_language_lock_desc': 'Тілдік пәндер үшін (Қазақ әдебиеті, English) тапсырмаларды түпнұсқа тілінде сақтау',
  'course.custom_language_placeholder': 'Өз тіліңізді жазыңыз (мыс. Француз тілі)...',
  'teacher.slots_title': 'Құжат слоты (макс. 5)',
  'teacher.slots_window_open': 'Өзгерту терезесі ашық (Демалыс / 1-2 күн)',
  'teacher.slots_window_locked': 'Оқу кезеңі: құжаттарды өзгерту бұғатталған',
  'teacher.delta_diff_title': 'AI Delta-Diff: өзгерістерді талдау',
  'teacher.delta_diff_confirm': 'Жаңа жоспарды бекіту',
  'teacher.delta_diff_dialogue': 'Co-Pilot сұхбаты',
  // ==========================================
  // 21. AUTH, ORG TOKENS & COURSE CODES (Жаңа кілттер)
  // ==========================================
  'auth.bio_label': 'Өзіңіз туралы (Қысқаша)',
  'auth.bio_placeholder': 'Ғылыми бағытыңыз немесе қызығушылықтарыңыз...',
  'auth.org_token_label': 'Ұйымның қауіпсіздік токені (Security Token)',
  'auth.org_token_placeholder': 'Мысалы: ORG-8F3K9A немесе ZK-7492-X',
  'auth.org_token_hint': 'Оқу орны (мектеп, университет) берген ресми токен',
  'auth.role_switcher_student': 'Оқушы / Студент',
  'auth.role_switcher_teacher': 'Оқытушы / Ұстаз',
  'courses.join_by_code_title': 'Код арқылы курсқа қосылу',
  'courses.join_by_code_desc': 'Оқытушы берген 6 таңбалы кездейсоқ кодты енгізіңіз',
  'courses.join_by_code_placeholder': '6 таңбалы код (мыс: 7X9K2M)...',
  'courses.join_by_code_btn': 'Курсқа қосылу',
  'courses.invite_student_title': 'Оқушыны топқа шақыру',
  'courses.invite_student_name': 'Оқушының аты-жөні',
  'courses.invite_student_email': 'Оқушының email поштасы',
  'courses.send_invite_btn': 'Шақыру жіберу',
  'courses.short_code_badge': 'Курс коды:',

  'courses.copy_code_tooltip': 'Кодты көшіру',
  'courses.code_copied_toast': 'Курс коды көшірілді! 📋',
  'common.error_occurred': 'Қате орын алды',
  'common.name': 'Толық аты-жөні',
  'common.failed_to_save': 'Деректерді сақтау мүмкін болмады',
  'common.add': 'Қосу',
  'common.cancel': 'Бас тарту',
  'common.saved': 'Сәтті сақталды!',
  'courses.catalog_title': 'Курстар каталогы & Оқу бағдарламалары',
  'courses.catalog_subtitle': 'Мұғалімдер жасаған динамикалық силлабустар, спецкурстар мен олимпиадалық бағыттар',
  'courses.enrolled_filter': 'Менің курстарым',
  'courses.pending_filter': 'Өтініштер',
  'courses.enrollment_pending': 'Күтілуде (pending_approval)',
  'courses.apply_enroll': 'Өтініш беру',
  'student.continue_learning': 'Оқуды жалғастыру',
  'trainer.mentor_name': '«Аға» наставнигі',
  'trainer.active_canvas_hint': 'Парабола тармақтары мен нөлдерін өзгертіп, таңбалардың ауысу заңдылығын зерттеңіз!',
  'student.leaderboard_desc': 'Апталық ELO және стрик рейтингі',
  'student.top_5_badge': 'Топ-5',
  'student.you_badge': 'Сен',
  'student.days_unit_short': 'к',
  'student.spaced_repetition_title': 'SM-2 Интервалды қайталау',
  'student.formulas_unit': 'формула',
  'student.sm2_all_completed': 'Бүгінгі барлық карточкалар қайталанды! Жад 100% жаңартылды.',
  'student.review_card_btn': 'Қайталау',
  'student.elo_rating_label': 'Рейтинг ELO',
  'student.streak_days_label': 'Оқу стригі',
  'student.days_unit': 'күн',
  'student.consecutive_commits': 'Үздіксіз коммит',
  'student.quarter_goal_label': 'Тоқсандық мақсат:',
  'student.verified_passport': 'Расталған паспорт',
  'student.streak_count': 'Стрик',
  'student.exam_countdown': 'ҰБТ 2026: 74 күн қалды',
  'student.pinned_subjects': 'Бекітілген пәндер',
  'student.all_courses': 'Барлық курстар',
  'courses.next_topic_title': 'Келесі тақырып',
  'student.roadmap_tab': 'Персоналды Roadmap: ҰБТ / ЕНТ 2026',
  'student.score_trajectory_desc': 'Мақсатты балл траекториясы: 94 → 132 балл (74 күн қалды)',
  'student.full_roadmap_btn': 'Толық Roadmap',
  'student.linear_equations': 'Сызықтық теңдеулер',
  'student.quadratic_inequalities': 'Квадрат теңсіздіктер',
  'student.quarter_topics_desc': 'Екі факторлы зачет пен оқу матрицасы',
  'student.last_3_months': 'Соңғы 3 ай',
  'student.less': 'Аз',
  'student.more': 'Көп',
} as const;




export type KzTranslationKey = keyof typeof kz;
export default kz;



import React, { useState } from 'react';
import { ClassMatrixResponse, ClassMatrixStudent, SkillMeta } from '@zerde/shared';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/context/LanguageContext';
import { Search, Users, Sparkles, UserPlus, Info } from 'lucide-react';

interface MasteryMatrixProps {
  data: ClassMatrixResponse | null;
  onSelectStudentSkill?: (student: ClassMatrixStudent, skill: SkillMeta) => void;
}

export const MasteryMatrix: React.FC<MasteryMatrixProps> = ({
  data,
  onSelectStudentSkill,
}) => {
  const { t, getLocalized, language } = useLanguage();
  const [search, setSearch] = useState('');

  if (!data) {
    return (
      <div className="p-8 text-center text-xs text-primer-fg-muted font-mono rounded-xl border border-primer-border-default bg-primer-canvas-subtle">
        {t('teacher.loading_data')}
      </div>
    );
  }

  // Zero-Fake Empty State
  if (data.matrix.length === 0) {
    return (
      <div className="rounded-xl border border-primer-border-default bg-primer-canvas-subtle p-8 shadow-primer-xs text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-primer-canvas-inset border border-primer-border-muted flex items-center justify-center mx-auto text-xl text-primer-fg-muted">
          <Users className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-primer-fg-default">
            {t('teacher.no_students_in_class', { classroom: data.classroom_name })}
          </h3>
          <p className="text-xs text-primer-fg-muted max-w-md mx-auto">
            {language === 'RU'
              ? 'Когда ученики присоединятся к этой группе или зарегистрируются по школьному токену, их реальные результаты автоматически появятся в этом журнале (Zero-Fake SQLite).'
              : language === 'EN'
              ? 'When students join this group or register with your school code, their real-time skill telemetry will appear in this live matrix (Zero-Fake SQLite).'
              : 'Оқушылар мектеп токенімен тіркелгенде немесе топқа қосылғанда олардың нақты нәтижелері осы журналда автоматты түрде пайда болады (Zero-Fake SQLite).'}
          </p>
        </div>
      </div>
    );
  }

  const filteredStudents = data.matrix.filter((s) =>
    s.student_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="rounded-xl border border-primer-border-default bg-primer-canvas-subtle p-4 shadow-primer-xs space-y-3">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-primer-border-muted">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-primer-accent-fg" />
          <h3 className="text-sm font-bold text-primer-fg-default">
            {t('teacher.class_matrix_title')} ({data.classroom_name})
          </h3>
          <span className="text-xs font-mono text-primer-fg-muted">
            {filteredStudents.length} {t('common.students') || 'оқушы'}
          </span>
        </div>

        <div className="w-full sm:w-64">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={language === 'RU' ? 'Поиск ученика...' : language === 'EN' ? 'Search student...' : 'Оқушыны іздеу...'}
            className="text-xs h-8"
          />
        </div>
      </div>

      {/* Traffic Light Legend */}
      <div className="flex items-center gap-3 text-[11px] text-primer-fg-muted flex-wrap px-1">
        <span className="font-semibold">{language === 'RU' ? 'Светофор:' : language === 'EN' ? 'Traffic Light:' : 'Бағдаршам:'}</span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          <span>{language === 'RU' ? 'Освоен (≥80%)' : language === 'EN' ? 'Mastered (≥80%)' : 'Игерілді (≥80%)'}</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          <span>{language === 'RU' ? 'В процессе (50-79%)' : language === 'EN' ? 'In Progress (50-79%)' : 'Дамуда (50-79%)'}</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
          <span>{language === 'RU' ? 'Дефицит (<50%)' : language === 'EN' ? 'Deficit (<50%)' : 'Дефицит (<50%)'}</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-gray-500"></span>
          <span>{language === 'RU' ? 'Нет данных (—)' : language === 'EN' ? 'No Data (—)' : 'Дерек жоқ (—)'}</span>
        </span>
      </div>

      {/* 2D Matrix Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="border-b border-primer-border-default bg-primer-canvas-inset/50">
              <th className="py-2.5 px-3 font-semibold text-primer-fg-muted whitespace-nowrap min-w-[180px]">
                {language === 'RU' ? 'Ученик' : language === 'EN' ? 'Student' : 'Оқушы'}
              </th>
              <th className="py-2.5 px-2 font-semibold text-primer-fg-muted whitespace-nowrap text-center">
                {language === 'RU' ? 'Рейтинг XP' : language === 'EN' ? 'XP Rating' : 'XP рейтингі'}
              </th>
              {data.skills_header.map((skill) => {
                const skillTitle = getLocalized(skill, 'name', skill.code);
                return (
                  <th
                    key={skill.code}
                    className="py-2.5 px-2 font-semibold text-primer-fg-muted text-center whitespace-nowrap min-w-[95px]"
                    title={skillTitle}
                  >
                    {skillTitle.length > 16 ? skillTitle.slice(0, 15) + '…' : skillTitle}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((std, idx) => (
              <tr
                key={std.student_id}
                className="border-b border-primer-border-muted/40 hover:bg-primer-canvas-inset/40 transition-colors"
              >
                <td className="py-2 px-3 font-medium text-primer-fg-default whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-mono text-primer-fg-muted w-4">
                      {idx + 1}.
                    </span>
                    <span>{std.student_name}</span>
                  </div>
                </td>

                <td className="py-2 px-2 text-center whitespace-nowrap">
                  <Badge variant="outline" className="text-[10px] font-mono py-0 px-1.5 font-bold">
                    {std.rank} ({std.current_elo})
                  </Badge>
                </td>

                {data.skills_header.map((skill) => {
                  const mastery = std.skills[skill.code];
                  const prob = mastery ? mastery.probability : null;
                  const hasAttempts = mastery && mastery.attemptsCount > 0;

                  const isMastered = prob !== null && prob >= 0.80;
                  const isDeveloping = prob !== null && prob >= 0.50 && prob < 0.80;
                  const isDeficient = prob !== null && prob < 0.50 && hasAttempts;

                  let cellColor = 'bg-primer-canvas-inset text-primer-fg-muted border-primer-border-muted';
                  let displayText = '—';

                  if (hasAttempts && prob !== null) {
                    displayText = `${Math.round(prob * 100)}%`;
                    if (isMastered) {
                      cellColor = 'bg-emerald-950/40 text-emerald-300 border-emerald-600/50 font-bold';
                    } else if (isDeveloping) {
                      cellColor = 'bg-amber-950/40 text-amber-300 border-amber-600/50 font-bold';
                    } else {
                      cellColor = 'bg-rose-950/40 text-rose-300 border-rose-600/50 font-bold';
                    }
                  }

                  return (
                    <td
                      key={skill.code}
                      onClick={() => onSelectStudentSkill && onSelectStudentSkill(std, skill)}
                      className="py-2 px-2 text-center cursor-pointer"
                    >
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono border transition-transform hover:scale-105 ${cellColor}`}
                      >
                        {displayText}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MasteryMatrix;

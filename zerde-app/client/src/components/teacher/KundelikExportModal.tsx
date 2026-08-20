import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import {
  Download,
  Copy,
  CheckCircle2,
  FileSpreadsheet,
  FileText,
  Sparkles,
  Layers,
  Calendar,
  Filter,
} from 'lucide-react';
import { ClassMatrixStudent } from '@/api/teacherApi';

interface KundelikExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: ClassMatrixStudent[];
  className?: string;
  subjectName?: string;
}

export const KundelikExportModal: React.FC<KundelikExportModalProps> = ({
  isOpen,
  onClose,
  students,
  className = '9 «А»',
  subjectName = 'Алгебра',
}) => {
  const { showToast } = useToast();

  const [quarter, setQuarter] = useState<number>(3);
  const [assessmentType, setAssessmentType] = useState<'formative' | 'sor' | 'soch'>('formative');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedTopic, setSelectedTopic] = useState<string>('Бөлшек-рационал теңсіздіктер және интервалдар әдісі');
  const [copied, setCopied] = useState<boolean>(false);

  // Generate Kundelik Formative Assessment dataset with descriptors & scores
  const exportRows = useMemo(() => {
    return students.map((std, idx) => {
      // Calculate average mastery score across student's skills (scale 1..10)
      const skillValues = Object.values(std.skills || {});
      const avgProb =
        skillValues.length > 0
          ? skillValues.reduce((acc, s) => acc + (s.probability || 0.5), 0) / skillValues.length
          : 0.7;

      let score = Math.round(avgProb * 10);
      if (score < 1) score = 1;
      if (score > 10) score = 10;

      // Descriptors based on score
      let descriptorKZ = 'Тапсырманы толық қатесіз орындады. Барлық дескрипторлар меңгерілген.';
      let descriptorRU = 'Полностью освоил тему. Все критерии и дескрипторы достигнуты.';

      if (score <= 4) {
        descriptorKZ = 'Бөлшек-рационал теңсіздікте бөлім нөлдерін ескеруде қиналды. Қосымша пысықтау қажет.';
        descriptorRU = 'Испытывает затруднения с нулями знаменателя. Требуется повторение.';
      } else if (score <= 7) {
        descriptorKZ = 'Интервалдар әдісін қолданады, бірақ кейбір таңбаларды анықтауда қате жіберді.';
        descriptorRU = 'Применяет метод интервалов, но допускает ошибки при смене знаков.';
      }

      return {
        number: idx + 1,
        studentId: std.student_id,
        name: std.student_name,
        email: std.email,
        score,
        descriptorKZ,
        descriptorRU,
        elo: std.current_elo,
        level: score >= 8 ? 'Жоғары (Высокий)' : score >= 5 ? 'Орта (Средний)' : 'Төмен (Низкий)',
      };
    });
  }, [students]);

  // Copy TSV to clipboard for direct 1-click paste into Kundelik.kz spreadsheet
  const handleCopyClipboard = () => {
    const header = `№\tОқушы аты-жөні\tБалл (1-10)\tДескриптор (Кері байланыс)\tДеңгейі\n`;
    const body = exportRows
      .map((r) => `${r.number}\t${r.name}\t${r.score}\t${r.descriptorKZ}\t${r.level}`)
      .join('\n');

    navigator.clipboard.writeText(header + body);
    setCopied(true);
    showToast({
      type: 'success',
      title: 'Күнделікке көшірілді! 📋',
      message: 'Kundelik.kz журналының бағалау ұяшығына Ctrl+V арқылы тікелей қойыңыз.',
    });
    setTimeout(() => setCopied(false), 3000);
  };

  // Download CSV
  const handleDownloadCSV = () => {
    const header = `"№","Оқушы аты-жөні","Балл (1-10)","Дескриптор","Деңгейі","ELO","Мерзімі"\n`;
    const body = exportRows
      .map(
        (r) =>
          `"${r.number}","${r.name}","${r.score}","${r.descriptorKZ}","${r.level}","${r.elo}","${date}"`
      )
      .join('\n');

    const blob = new Blob(['\uFEFF' + header + body], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Kundelik_${className}_${subjectName}_Q${quarter}_${date}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    showToast({
      type: 'success',
      title: 'CSV файлы жүктелді! 📥',
      message: `${className} сыныбының ведомості сәтті экспортталды.`,
    });
  };

  // Download JSON format
  const handleDownloadJSON = () => {
    const data = {
      platform: 'Zerde Intelligent Educational Platform',
      version: '1.0',
      export_type: 'KUNDELIK_FORMATIVE_ASSESSMENT',
      classroom: className,
      subject: subjectName,
      quarter,
      assessment_type: assessmentType,
      date,
      topic: selectedTopic,
      total_students: exportRows.length,
      average_score: (
        exportRows.reduce((a, b) => a + b.score, 0) / exportRows.length
      ).toFixed(1),
      students: exportRows,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Kundelik_${className}_${subjectName}_Q${quarter}_${date}.json`;
    link.click();
    URL.revokeObjectURL(url);

    showToast({
      type: 'success',
      title: 'JSON есебі сақталды! 📄',
      message: 'API және сыртқы LMS жүйелері үшін құрылымдалған деректер дайын.',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto">
        <DialogHeader className="pb-3 border-b border-primer-border-muted">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-primer-accent-fg">
              <FileSpreadsheet className="w-5 h-5" />
              <DialogTitle className="text-sm sm:text-base font-bold text-primer-fg-default">
                1-Click Kundelik.kz Дескрипторлар мен Бағаларды Экспорттау
              </DialogTitle>
            </div>
            <Badge variant="done" className="text-[10px] font-mono">
              Kundelik v3 API Ready
            </Badge>
          </div>
          <DialogDescription className="text-xs text-primer-fg-muted">
            {className} сыныбы бойынша формативті бағалау дескрипторлары мен 1-10 баллдық ведомостіні автоматты генерациялау
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 text-xs">
          {/* Export Settings Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 p-3 rounded-lg bg-primer-canvas-inset border border-primer-border-muted">
            {/* Quarter Selector */}
            <div>
              <label className="text-[10px] font-bold text-primer-fg-subtle uppercase tracking-wider block mb-1">
                Тоқсан
              </label>
              <select
                value={quarter}
                onChange={(e) => setQuarter(Number(e.target.value))}
                className="w-full h-8 px-2 bg-primer-canvas-default border border-primer-border-default rounded text-xs font-semibold text-primer-fg-default cursor-pointer"
              >
                <option value={1}>1-тоқсан</option>
                <option value={2}>2-тоқсан</option>
                <option value={3}>3-тоқсан</option>
                <option value={4}>4-тоқсан</option>
              </select>
            </div>

            {/* Assessment Type */}
            <div>
              <label className="text-[10px] font-bold text-primer-fg-subtle uppercase tracking-wider block mb-1">
                Бағалау түрі
              </label>
              <select
                value={assessmentType}
                onChange={(e) => setAssessmentType(e.target.value as any)}
                className="w-full h-8 px-2 bg-primer-canvas-default border border-primer-border-default rounded text-xs font-semibold text-primer-fg-default cursor-pointer"
              >
                <option value="formative">Формативті (1-10)</option>
                <option value="sor">БЖБ / СОР</option>
                <option value="soch">ТЖБ / СОЧ</option>
              </select>
            </div>

            {/* Date Picker */}
            <div>
              <label className="text-[10px] font-bold text-primer-fg-subtle uppercase tracking-wider block mb-1">
                Күні
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full h-8 px-2 bg-primer-canvas-default border border-primer-border-default rounded text-xs text-primer-fg-default font-mono cursor-pointer"
              />
            </div>

            {/* Topic Selection */}
            <div>
              <label className="text-[10px] font-bold text-primer-fg-subtle uppercase tracking-wider block mb-1">
                Пән / Сынып
              </label>
              <div className="h-8 px-2 bg-primer-canvas-default border border-primer-border-default rounded text-xs flex items-center font-bold text-primer-fg-default">
                {subjectName} ({className})
              </div>
            </div>
          </div>

          {/* Quick 1-Click Action Banner */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 p-3 rounded-lg border border-primer-success-muted/60 bg-primer-success-subtle/30">
            <div className="flex items-center gap-2 text-primer-success-fg">
              <Sparkles className="w-4 h-4 shrink-0" />
              <span className="text-xs font-bold text-primer-fg-default">
                24 оқушының бағалары мен дескрипторлары дайын (Орташа балл:{' '}
                {(exportRows.reduce((a, b) => a + b.score, 0) / exportRows.length).toFixed(1)} / 10)
              </span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                variant="primary"
                size="sm"
                onClick={handleCopyClipboard}
                className="gap-1.5 font-bold flex-1 sm:flex-initial"
              >
                {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Көшірілді!' : 'Күнделікке көшіру (Ctrl+V)'}</span>
              </Button>
            </div>
          </div>

          {/* Table Preview (24 Students) */}
          <div className="border border-primer-border-default rounded-lg overflow-hidden bg-primer-canvas-subtle">
            <div className="max-h-64 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 z-10 bg-primer-canvas-inset border-b border-primer-border-muted text-[11px] font-bold text-primer-fg-muted uppercase tracking-wider">
                  <tr>
                    <th className="px-3 py-2 w-8">#</th>
                    <th className="px-3 py-2">Оқушы аты-жөні</th>
                    <th className="px-3 py-2 text-center w-20">Балл (1-10)</th>
                    <th className="px-3 py-2">Дескриптор (Кері байланыс)</th>
                    <th className="px-3 py-2 text-right">Деңгейі</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primer-border-muted/50 font-sans">
                  {exportRows.map((row) => (
                    <tr key={row.studentId} className="hover:bg-primer-canvas-inset/40 transition">
                      <td className="px-3 py-2 font-mono text-primer-fg-muted">{row.number}</td>
                      <td className="px-3 py-2 font-semibold text-primer-fg-default">{row.name}</td>
                      <td className="px-3 py-2 text-center font-mono font-bold">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-xs ${
                            row.score >= 8
                              ? 'bg-primer-success-subtle text-primer-success-fg border border-primer-success-muted/50'
                              : row.score >= 5
                              ? 'bg-primer-attention-subtle text-primer-attention-fg border border-primer-attention-muted/50'
                              : 'bg-primer-danger-subtle text-primer-danger-fg border border-primer-danger-muted/50'
                          }`}
                        >
                          {row.score}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-[11px] text-primer-fg-muted line-clamp-1 max-w-xs">
                        {row.descriptorKZ}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <span
                          className={`text-[10px] font-medium ${
                            row.score >= 8
                              ? 'text-primer-success-fg'
                              : row.score >= 5
                              ? 'text-primer-attention-fg'
                              : 'text-primer-danger-fg'
                          }`}
                        >
                          {row.level}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row justify-between items-center gap-2 pt-3 border-t border-primer-border-muted">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleDownloadCSV}
              className="gap-1.5 text-xs font-semibold"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Excel / CSV жүктеу</span>
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleDownloadJSON}
              className="gap-1.5 text-xs font-semibold"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>JSON есеп</span>
            </Button>
          </div>

          <Button variant="outline" size="sm" onClick={onClose} className="w-full sm:w-auto">
            Жабу
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default KundelikExportModal;

import { useRef, useState, type ChangeEvent } from 'react';
import { extractBitrixTasks, parseBitrixTasks } from '@/lib/bitrix/bitrix-tasks';
import { generateDemoBitrixTasks } from '@/lib/demo/demo-data';
import { formatRuDate, getTodayIsoDate } from '@/lib/utils/dates';
import {
  getCheckInsKeptAfterImport,
  replaceWithImportedEmployees,
  resetToDemoData,
  useAppDataStore,
} from '@/store/app-data';

const DEMO_EXPORT_FILE_NAME = 'bitrix-tasks-demo.json';
const MAX_SHOWN_WARNINGS = 30;

type ImportFeedback = {
  message: string;
  warnings: string[];
};

function downloadJsonFile(fileName: string, data: unknown) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

export function useDataSourceView() {
  const source = useAppDataStore((state) => state.source);
  const loadedOn = useAppDataStore((state) => state.loadedOn);
  const employeeCount = useAppDataStore((state) => state.employees.length);
  const checkInCount = useAppDataStore((state) => state.checkIns.length);
  const [feedback, setFeedback] = useState<ImportFeedback | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function importFile(file: File) {
    try {
      const { employees, warnings } = parseBitrixTasks(extractBitrixTasks(JSON.parse(await file.text())));
      if (employees.length === 0) {
        setFeedback({ message: 'В файле не нашлось ни одной задачи о приёме. Данные не изменены.', warnings });
        return;
      }

      const removedCheckInCount = checkInCount - getCheckInsKeptAfterImport(employees).length;
      const removedNote = removedCheckInCount
        ? `\nБудет удалено разговоров: ${removedCheckInCount}${source === 'demo' ? ' (демо)' : ''}.`
        : '';
      if (!window.confirm(`Заменить текущие данные сотрудниками из файла (${employees.length})?${removedNote}`)) {
        setFeedback({ message: 'Импорт отменён, данные не изменены.', warnings: [] });
        return;
      }

      replaceWithImportedEmployees(employees);
      setFeedback({
        message: `Загружено сотрудников: ${employees.length}. Предупреждений: ${warnings.length}.`,
        warnings,
      });
    } catch (error) {
      setFeedback({ message: `Не удалось прочитать файл: ${(error as Error).message}`, warnings: [] });
    }
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (file) void importFile(file);
  }

  function resetToDemo() {
    if (!window.confirm('Вернуть демо-данные? Загруженные данные и введённые разговоры будут заменены.')) return;
    resetToDemoData();
    setFeedback({ message: 'Демо-данные восстановлены.', warnings: [] });
  }

  return {
    sourceText: `${source === 'demo' ? 'демо-данные' : 'загруженная выгрузка'} от ${formatRuDate(loadedOn)}`,
    employeeCount,
    checkInCount,
    feedback,
    shownWarnings: feedback?.warnings.slice(0, MAX_SHOWN_WARNINGS) ?? [],
    hiddenWarningCount: Math.max((feedback?.warnings.length ?? 0) - MAX_SHOWN_WARNINGS, 0),
    fileInputRef,
    openFilePicker: () => fileInputRef.current?.click(),
    handleFileChange,
    downloadDemoExport: () =>
      downloadJsonFile(DEMO_EXPORT_FILE_NAME, { result: { tasks: generateDemoBitrixTasks(getTodayIsoDate()) } }),
    resetToDemo,
  };
}

import {
  DISMISSAL_TASK_FIELDS,
  DISMISSAL_TASK_TITLE_PREFIX,
  HIRE_TASK_FIELDS,
  HIRE_TASK_TITLE_PREFIX,
  TASK_FIELD_LABELS,
  type TaskField,
} from '@/lib/bitrix/bitrix-task-format';

const formatFieldList = (fields: TaskField[]) => fields.map((field) => TASK_FIELD_LABELS[field]).join(', ');

export function TaskFormatHelp() {
  return (
    <>
      <p>
        Приложение читает задачи Битрикс24 о приёме и увольнении (ответ REST-метода <code>tasks.task.list</code>,
        сохранённый в JSON). Нужны задачи с заголовком «{HIRE_TASK_TITLE_PREFIX} Фамилия Имя» и «
        {DISMISSAL_TASK_TITLE_PREFIX} Фамилия Имя», в описании которых построчно указаны поля:
      </p>
      <pre>
        {[
          `Приём:      ${formatFieldList(HIRE_TASK_FIELDS)}`,
          `Увольнение: ${formatFieldList(DISMISSAL_TASK_FIELDS)}`,
          'Даты: 2026-09-15 или 15.09.2026',
        ].join('\n')}
      </pre>
    </>
  );
}

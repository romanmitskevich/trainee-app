export const HIRE_TASK_TITLE_PREFIX = 'Приём сотрудника:';
export const DISMISSAL_TASK_TITLE_PREFIX = 'Увольнение сотрудника:';

export const TASK_FIELD_LABELS = {
  employeeId: 'Табельный номер',
  position: 'Должность',
  department: 'Подразделение',
  managerName: 'Руководитель',
  hireDate: 'Дата выхода',
  lastWorkDate: 'Последний рабочий день',
  exitReason: 'Причина',
} as const;

export type TaskField = keyof typeof TASK_FIELD_LABELS;

export const HIRE_TASK_FIELDS: TaskField[] = ['employeeId', 'position', 'department', 'managerName', 'hireDate'];
export const DISMISSAL_TASK_FIELDS: TaskField[] = ['employeeId', 'lastWorkDate', 'exitReason'];

export function formatTaskDescription(values: Partial<Record<TaskField, string>>): string {
  return Object.entries(values)
    .map(([field, value]) => `${TASK_FIELD_LABELS[field as TaskField]}: ${value}`)
    .join('\n');
}

import type { Employee } from '@/lib/employees/employee.types';
import { parseDate } from '@/lib/utils/dates';
import {
  DISMISSAL_TASK_TITLE_PREFIX,
  HIRE_TASK_TITLE_PREFIX,
  TASK_FIELD_LABELS,
  type TaskField,
} from './bitrix-task-format';
import type { BitrixTask } from './bitrix-task.types';

const FIELD_LINE_PATTERN = /^\s*([^:]+):\s*(.*?)\s*$/;
const UNKNOWN_MANAGER = 'Не указан';
const UNKNOWN_EXIT_REASON = 'Не указана';

export type BitrixImportResult = {
  employees: Employee[];
  warnings: string[];
};

type TaskFields = Map<string, string>;

function getTaskTitle(task: BitrixTask): string {
  return (task.title ?? '').trim();
}

function readTaskFields(task: BitrixTask): TaskFields {
  const fields: TaskFields = new Map();
  for (const line of (task.description ?? '').split(/\r?\n/)) {
    const match = line.match(FIELD_LINE_PATTERN);
    if (match?.[1] && match[2] !== undefined) fields.set(match[1].trim().toLowerCase(), match[2]);
  }
  return fields;
}

function getFieldValue(fields: TaskFields, field: TaskField): string {
  return fields.get(TASK_FIELD_LABELS[field].toLowerCase()) ?? '';
}

export function extractBitrixTasks(json: unknown): BitrixTask[] {
  if (Array.isArray(json)) return json as BitrixTask[];
  const response = json as { tasks?: unknown; result?: { tasks?: unknown } } | null;
  if (Array.isArray(response?.result?.tasks)) return response.result.tasks as BitrixTask[];
  if (Array.isArray(response?.tasks)) return response.tasks as BitrixTask[];
  throw new Error('Не нашёл список задач: ожидается массив, {tasks: [...]} или {result: {tasks: [...]}}');
}

function parseHireTask(task: BitrixTask): { employee: Employee } | { warning: string } {
  const fields = readTaskFields(task);
  const fullName = getTaskTitle(task).slice(HIRE_TASK_TITLE_PREFIX.length).trim();
  const employeeId = getFieldValue(fields, 'employeeId');
  const position = getFieldValue(fields, 'position');
  const department = getFieldValue(fields, 'department');
  const hireDate = parseDate(getFieldValue(fields, 'hireDate'));

  if (!employeeId || !position || !department || !hireDate) {
    const requiredValues: [TaskField, string | null][] = [
      ['employeeId', employeeId],
      ['position', position],
      ['department', department],
      ['hireDate', hireDate],
    ];
    const missingLabels = requiredValues.filter(([, value]) => !value).map(([field]) => TASK_FIELD_LABELS[field]);
    return {
      warning: `Задача ${task.id} (${fullName || 'без имени'}): нет или неверно поле ${missingLabels.join(', ')}`,
    };
  }

  return {
    employee: {
      id: employeeId,
      fullName,
      position,
      department,
      managerName: getFieldValue(fields, 'managerName') || UNKNOWN_MANAGER,
      hireDate,
    },
  };
}

function applyDismissalTask(task: BitrixTask, employeesById: Map<string, Employee>): string | null {
  const fields = readTaskFields(task);
  const employeeId = getFieldValue(fields, 'employeeId');
  const employee = employeesById.get(employeeId);
  if (!employee) return `Задача ${task.id}: увольнение без задачи о приёме (таб. № ${employeeId || '—'})`;

  const lastWorkDate = parseDate(getFieldValue(fields, 'lastWorkDate'));
  if (!lastWorkDate || lastWorkDate < employee.hireDate) {
    return `Задача ${task.id}: неверный последний рабочий день у ${employee.fullName}`;
  }

  employee.lastWorkDate = lastWorkDate;
  employee.exitReason = getFieldValue(fields, 'exitReason') || UNKNOWN_EXIT_REASON;
  return null;
}

export function parseBitrixTasks(tasks: BitrixTask[]): BitrixImportResult {
  const warnings: string[] = [];
  const employeesById = new Map<string, Employee>();

  const hireTasks = tasks.filter((task) => getTaskTitle(task).startsWith(HIRE_TASK_TITLE_PREFIX));
  const dismissalTasks = tasks.filter((task) => getTaskTitle(task).startsWith(DISMISSAL_TASK_TITLE_PREFIX));

  for (const task of hireTasks) {
    const result = parseHireTask(task);
    if ('warning' in result) {
      warnings.push(result.warning);
    } else if (employeesById.has(result.employee.id)) {
      warnings.push(`Задача ${task.id}: табельный номер ${result.employee.id} уже встречался, пропускаю`);
    } else {
      employeesById.set(result.employee.id, result.employee);
    }
  }

  for (const task of dismissalTasks) {
    const warning = applyDismissalTask(task, employeesById);
    if (warning) warnings.push(warning);
  }

  return { employees: [...employeesById.values()], warnings };
}

import { getWorkDayNumber } from '@/lib/utils/dates';
import type { Employee } from './employee.types';

/** Новичок — первые 90 дней работы: испытательный срок до 3 месяцев */
export const NEWCOMER_PERIOD_DAYS = 90;

export function isEmployedOn(employee: Employee, date: string): boolean {
  return employee.hireDate <= date && (!employee.lastWorkDate || employee.lastWorkDate >= date);
}

export function isNewcomerOn(employee: Employee, date: string): boolean {
  return isEmployedOn(employee, date) && getWorkDayNumber(employee.hireDate, date) <= NEWCOMER_PERIOD_DAYS;
}

/** Сколько дней человек отработал до ухода; null — ещё работает */
export function getDaysWorkedBeforeExit(employee: Employee): number | null {
  return employee.lastWorkDate ? getWorkDayNumber(employee.hireDate, employee.lastWorkDate) : null;
}

export function hasLeftAsNewcomer(employee: Employee): boolean {
  const daysWorked = getDaysWorkedBeforeExit(employee);
  return daysWorked !== null && daysWorked <= NEWCOMER_PERIOD_DAYS;
}

/** Руководители всех работающих сотрудников, по алфавиту */
export function getManagerNames(employees: Employee[], date: string): string[] {
  const names = employees.filter((employee) => isEmployedOn(employee, date)).map((employee) => employee.managerName);
  return [...new Set(names)].sort((first, second) => first.localeCompare(second, 'ru'));
}

import type { Employee } from '@/lib/employees/employee.types';
import { isNewcomerOn } from '@/lib/employees/employment';
import { getWorkDayNumber } from '@/lib/utils/dates';
import type { CheckIn } from './check-in.types';
import { compareCheckInsByDate, signalsLeavingRisk } from './check-ins';
import { CHECKPOINT_DAYS, CHECKPOINT_GRACE_DAYS } from './checkpoints.constants';

export type CheckInUrgency = 'overdue' | 'due' | 'none';

export type Newcomer = {
  employee: Employee;
  workDay: number;
  checkIns: CheckIn[];
  lastCheckIn: CheckIn | null;
  dueCheckpointDay: number | null;
  urgency: CheckInUrgency;
  overdueDays: number;
  nextCheckpointDay: number | null;
  missedCheckpointDays: number[];
  isAtRisk: boolean;
};

export function getReachedCheckpointDays(workDay: number): number[] {
  return CHECKPOINT_DAYS.filter((checkpointDay) => checkpointDay <= workDay);
}

export function getNewcomer(employee: Employee, allCheckIns: CheckIn[], today: string): Newcomer {
  const workDay = getWorkDayNumber(employee.hireDate, today);
  const checkIns = allCheckIns.filter((checkIn) => checkIn.employeeId === employee.id).sort(compareCheckInsByDate);
  const recordedCheckpointDays = new Set(checkIns.map((checkIn) => checkIn.checkpointDay));

  const reachedCheckpointDays = getReachedCheckpointDays(workDay);
  const currentCheckpointDay = reachedCheckpointDays.at(-1) ?? null;
  const dueCheckpointDay =
    currentCheckpointDay !== null && !recordedCheckpointDays.has(currentCheckpointDay) ? currentCheckpointDay : null;

  const daysSinceDueCheckpoint = dueCheckpointDay === null ? 0 : workDay - dueCheckpointDay;
  const urgency: CheckInUrgency =
    dueCheckpointDay === null ? 'none' : daysSinceDueCheckpoint > CHECKPOINT_GRACE_DAYS ? 'overdue' : 'due';
  const lastCheckIn = checkIns.at(-1) ?? null;

  return {
    employee,
    workDay,
    checkIns,
    lastCheckIn,
    dueCheckpointDay,
    urgency,
    overdueDays: urgency === 'overdue' ? daysSinceDueCheckpoint - CHECKPOINT_GRACE_DAYS : 0,
    nextCheckpointDay: CHECKPOINT_DAYS.find((checkpointDay) => checkpointDay > workDay) ?? null,
    missedCheckpointDays: reachedCheckpointDays.filter(
      (checkpointDay) => checkpointDay !== currentCheckpointDay && !recordedCheckpointDays.has(checkpointDay),
    ),
    isAtRisk: lastCheckIn !== null && signalsLeavingRisk(lastCheckIn),
  };
}

function getAttentionRank(newcomer: Newcomer): number {
  const needsCheckIn = newcomer.urgency !== 'none';
  if (newcomer.isAtRisk && needsCheckIn) return 0;
  if (newcomer.urgency === 'overdue') return 1;
  if (newcomer.urgency === 'due') return 2;
  if (newcomer.isAtRisk || newcomer.missedCheckpointDays.length > 0) return 3;
  return 4;
}

export function getNewcomers(employees: Employee[], checkIns: CheckIn[], today: string): Newcomer[] {
  return employees
    .filter((employee) => isNewcomerOn(employee, today))
    .map((employee) => getNewcomer(employee, checkIns, today))
    .sort(
      (first, second) =>
        getAttentionRank(first) - getAttentionRank(second) ||
        second.overdueDays - first.overdueDays ||
        first.workDay - second.workDay,
    );
}

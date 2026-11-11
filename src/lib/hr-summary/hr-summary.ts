import type { Employee } from '@/lib/employees/employee.types';
import { NEWCOMER_PERIOD_DAYS, getDaysWorkedBeforeExit, hasLeftAsNewcomer } from '@/lib/employees/employment';
import type { CheckIn } from '@/lib/newcomers/check-in.types';
import { CHECKPOINT_DAYS, CHECKPOINT_GRACE_DAYS } from '@/lib/newcomers/checkpoints.constants';
import { getNewcomers } from '@/lib/newcomers/newcomers';
import { addDays } from '@/lib/utils/dates';
import { getRatio } from '@/lib/utils/percent';

const DAYS_IN_YEAR = 365;
const UNKNOWN_EXIT_REASON = 'Не указана';

const EXIT_STAGES = [
  { label: '1–14 день', firstDay: 1, lastDay: 14 },
  { label: '15–30 день', firstDay: 15, lastDay: 30 },
  { label: '31–60 день', firstDay: 31, lastDay: 60 },
  { label: '61–90 день', firstDay: 61, lastDay: 90 },
];

export type DepartmentLoss = {
  department: string;
  hiredCount: number;
  leftAsNewcomerCount: number;
  lossRate: number;
};

export type LabeledCount = {
  label: string;
  count: number;
};

export type HrSummary = {
  hiredCount: number;
  exitCount: number;
  newcomerExitCount: number;
  newcomerExitShare: number;
  departmentLosses: DepartmentLoss[];
  newcomerExitsByStage: LabeledCount[];
  newcomerExitsByReason: LabeledCount[];
  onTimeCheckInCount: number;
  expectedCheckInCount: number;
};

export function getHrSummary(employees: Employee[], checkIns: CheckIn[], today: string): HrSummary {
  const yearAgo = addDays(today, -DAYS_IN_YEAR);
  const isWithinLastYear = (date: string | undefined) => !!date && date > yearAgo && date <= today;

  const hiredLastYear = employees.filter((employee) => isWithinLastYear(employee.hireDate));
  const exitedLastYear = employees.filter((employee) => isWithinLastYear(employee.lastWorkDate));
  const newcomerExits = exitedLastYear.filter(hasLeftAsNewcomer);

  return {
    hiredCount: hiredLastYear.length,
    exitCount: exitedLastYear.length,
    newcomerExitCount: newcomerExits.length,
    newcomerExitShare: getRatio(newcomerExits.length, exitedLastYear.length),
    departmentLosses: getDepartmentLosses(employees, today),
    newcomerExitsByStage: countByExitStage(newcomerExits),
    newcomerExitsByReason: countByLabel(newcomerExits.map((employee) => employee.exitReason ?? UNKNOWN_EXIT_REASON)),
    ...getCheckInCoverage(employees, checkIns, today),
  };
}

function getDepartmentLosses(employees: Employee[], today: string): DepartmentLoss[] {
  const cohortStart = addDays(today, -DAYS_IN_YEAR);
  const cohortEnd = addDays(today, -NEWCOMER_PERIOD_DAYS);
  const cohort = employees.filter((employee) => employee.hireDate > cohortStart && employee.hireDate <= cohortEnd);
  const departments = [...new Set(cohort.map((employee) => employee.department))];

  return departments
    .map((department) => {
      const hired = cohort.filter((employee) => employee.department === department);
      const leftAsNewcomerCount = hired.filter(hasLeftAsNewcomer).length;
      return {
        department,
        hiredCount: hired.length,
        leftAsNewcomerCount,
        lossRate: getRatio(leftAsNewcomerCount, hired.length),
      };
    })
    .sort((first, second) => second.lossRate - first.lossRate);
}

function countByExitStage(newcomerExits: Employee[]): LabeledCount[] {
  const daysWorked = newcomerExits.map((employee) => getDaysWorkedBeforeExit(employee) ?? 0);
  return EXIT_STAGES.map((stage) => ({
    label: stage.label,
    count: daysWorked.filter((days) => days >= stage.firstDay && days <= stage.lastDay).length,
  }));
}

function countByLabel(labels: string[]): LabeledCount[] {
  const counts = new Map<string, number>();
  for (const label of labels) counts.set(label, (counts.get(label) ?? 0) + 1);
  return [...counts].map(([label, count]) => ({ label, count })).sort((first, second) => second.count - first.count);
}

function getCheckInCoverage(employees: Employee[], checkIns: CheckIn[], today: string) {
  let expectedCheckInCount = 0;
  let onTimeCheckInCount = 0;

  for (const newcomer of getNewcomers(employees, checkIns, today)) {
    const passedCheckpointDays = CHECKPOINT_DAYS.filter(
      (checkpointDay) => checkpointDay + CHECKPOINT_GRACE_DAYS < newcomer.workDay,
    );
    for (const checkpointDay of passedCheckpointDays) {
      expectedCheckInCount++;
      const deadline = addDays(newcomer.employee.hireDate, checkpointDay - 1 + CHECKPOINT_GRACE_DAYS);
      const wasOnTime = newcomer.checkIns.some(
        (checkIn) => checkIn.checkpointDay === checkpointDay && checkIn.date <= deadline,
      );
      if (wasOnTime) onTimeCheckInCount++;
    }
  }

  return { expectedCheckInCount, onTimeCheckInCount };
}

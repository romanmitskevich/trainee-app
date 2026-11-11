import {
  DISMISSAL_TASK_TITLE_PREFIX,
  HIRE_TASK_TITLE_PREFIX,
  formatTaskDescription,
} from '@/lib/bitrix/bitrix-task-format';
import type { BitrixTask } from '@/lib/bitrix/bitrix-task.types';
import { parseBitrixTasks } from '@/lib/bitrix/bitrix-tasks';
import type { Employee } from '@/lib/employees/employee.types';
import { NEWCOMER_PERIOD_DAYS, isNewcomerOn } from '@/lib/employees/employment';
import type { CheckIn } from '@/lib/newcomers/check-in.types';
import { CHECKPOINT_GRACE_DAYS, LOW_MOOD_THRESHOLD } from '@/lib/newcomers/checkpoints.constants';
import { getReachedCheckpointDays } from '@/lib/newcomers/newcomers';
import { addDays, getWorkDayNumber } from '@/lib/utils/dates';
import { createSeededRandom, type SeededRandom } from '@/lib/utils/seeded-random';
import {
  DEMO_DEPARTMENTS,
  DEMO_MOOD_DISTRIBUTION,
  DEMO_NOTES_BY_MOOD,
  EXPERIENCED_EXIT_REASONS,
  FEMALE_FIRST_NAMES,
  MALE_FIRST_NAMES,
  SURNAMES,
  type DemoDepartment,
} from './demo-company';

const TASKS_SEED = 2026;
const CHECK_INS_SEED = 7;

const FIRST_EMPLOYEE_ID = 1000;
const FIRST_TASK_ID = 50000;

const EXISTING_STAFF_MIN_TENURE_DAYS = 400;
const EXISTING_STAFF_MAX_TENURE_DAYS = 3000;
const EXISTING_STAFF_EXIT_PROBABILITY = 0.2;

const RECENT_HIRE_COUNT = 145;
const RECENT_HIRE_WINDOW_DAYS = 450;
const EXPERIENCED_EXIT_PROBABILITY = 0.1;
const EXPERIENCED_EXIT_MIN_DAYS_WORKED = 120;

const PAST_CHECK_IN_PROBABILITY = 0.65;
const DUE_CHECK_IN_PROBABILITY = 0.2;
const MIGHT_LEAVE_PROBABILITY_WHEN_LOW_MOOD = 0.6;
const MIGHT_LEAVE_PROBABILITY_OTHERWISE = 0.05;

type DemoHire = {
  employeeId: string;
  fullName: string;
  hireDate: string;
};

export function generateDemoBitrixTasks(today: string): BitrixTask[] {
  const random = createSeededRandom(TASKS_SEED);
  const tasks: BitrixTask[] = [];
  let lastEmployeeId = FIRST_EMPLOYEE_ID;
  let lastTaskId = FIRST_TASK_ID;

  function createFullName(): string {
    const isMale = random.chance(0.5);
    return `${random.pick(SURNAMES)} ${random.pick(isMale ? MALE_FIRST_NAMES : FEMALE_FIRST_NAMES)}`;
  }

  function addHireTask(department: DemoDepartment, hireDate: string): DemoHire {
    const hire = { employeeId: String(++lastEmployeeId), fullName: createFullName(), hireDate };
    tasks.push({
      id: String(++lastTaskId),
      title: `${HIRE_TASK_TITLE_PREFIX} ${hire.fullName}`,
      description: formatTaskDescription({
        employeeId: hire.employeeId,
        position: random.pick(department.positions),
        department: department.name,
        managerName: department.managerName,
        hireDate,
      }),
      createdDate: `${addDays(hireDate, -random.integer(3, 10))}T10:00:00+03:00`,
      closedDate: `${hireDate}T09:00:00+03:00`,
      status: '5',
    });
    return hire;
  }

  function addDismissalTask(hire: DemoHire, lastWorkDate: string, exitReason: string) {
    tasks.push({
      id: String(++lastTaskId),
      title: `${DISMISSAL_TASK_TITLE_PREFIX} ${hire.fullName}`,
      description: formatTaskDescription({ employeeId: hire.employeeId, lastWorkDate, exitReason }),
      createdDate: `${addDays(lastWorkDate, -random.integer(0, 3))}T12:00:00+03:00`,
      closedDate: `${lastWorkDate}T18:00:00+03:00`,
      status: '5',
    });
  }

  for (const department of DEMO_DEPARTMENTS) {
    for (let index = 0; index < department.existingStaffCount; index++) {
      const tenureDays = random.integer(EXISTING_STAFF_MIN_TENURE_DAYS, EXISTING_STAFF_MAX_TENURE_DAYS);
      const hire = addHireTask(department, addDays(today, -tenureDays));
      if (random.chance(EXISTING_STAFF_EXIT_PROBABILITY)) {
        addDismissalTask(hire, addDays(today, -random.integer(0, 364)), random.pick(EXPERIENCED_EXIT_REASONS));
      }
    }
  }

  for (let index = 0; index < RECENT_HIRE_COUNT; index++) {
    const department = pickDepartmentByHireShare(random);
    const hireDate = addDays(today, -random.integer(0, RECENT_HIRE_WINDOW_DAYS - 1));
    const hire = addHireTask(department, hireDate);
    const daysWorkedSoFar = getWorkDayNumber(hireDate, today);

    if (random.chance(department.newcomerExitProbability)) {
      const lastWorkDay = pickNewcomerLastWorkDay(random);
      if (lastWorkDay < daysWorkedSoFar) {
        addDismissalTask(hire, addDays(hireDate, lastWorkDay - 1), random.pick(department.newcomerExitReasons));
      }
    } else if (daysWorkedSoFar > EXPERIENCED_EXIT_MIN_DAYS_WORKED && random.chance(EXPERIENCED_EXIT_PROBABILITY)) {
      const lastWorkDay = random.integer(NEWCOMER_PERIOD_DAYS + 2, daysWorkedSoFar - 1);
      addDismissalTask(hire, addDays(hireDate, lastWorkDay - 1), random.pick(EXPERIENCED_EXIT_REASONS));
    }
  }

  return tasks.sort((first, second) => first.createdDate.localeCompare(second.createdDate));
}

function pickDepartmentByHireShare(random: SeededRandom): DemoDepartment {
  let remainingShare = random.next();
  const department = DEMO_DEPARTMENTS.find((candidate) => (remainingShare -= candidate.hireShare) < 0);
  return department ?? random.pick(DEMO_DEPARTMENTS);
}

function pickNewcomerLastWorkDay(random: SeededRandom): number {
  const roll = random.next();
  if (roll < 0.4) return random.integer(1, 14);
  if (roll < 0.75) return random.integer(15, 45);
  return random.integer(46, NEWCOMER_PERIOD_DAYS);
}

export function generateDemoCheckIns(employees: Employee[], today: string): CheckIn[] {
  const random = createSeededRandom(CHECK_INS_SEED);
  const checkIns: CheckIn[] = [];

  for (const employee of employees.filter((candidate) => isNewcomerOn(candidate, today))) {
    const workDay = getWorkDayNumber(employee.hireDate, today);

    for (const checkpointDay of getReachedCheckpointDays(workDay)) {
      const isPastGracePeriod = workDay - checkpointDay > CHECKPOINT_GRACE_DAYS;
      if (!random.chance(isPastGracePeriod ? PAST_CHECK_IN_PROBABILITY : DUE_CHECK_IN_PROBABILITY)) continue;

      const mood = random.pick(DEMO_MOOD_DISTRIBUTION);
      const date = addDays(employee.hireDate, checkpointDay - 1 + random.integer(0, 2));
      checkIns.push({
        employeeId: employee.id,
        checkpointDay,
        date: date > today ? today : date,
        mood,
        mightLeave: random.chance(
          mood <= LOW_MOOD_THRESHOLD ? MIGHT_LEAVE_PROBABILITY_WHEN_LOW_MOOD : MIGHT_LEAVE_PROBABILITY_OTHERWISE,
        ),
        note: random.pick(DEMO_NOTES_BY_MOOD[mood] ?? ['']),
      });
    }
  }

  return checkIns;
}

export function generateDemoDataset(today: string): { employees: Employee[]; checkIns: CheckIn[] } {
  const { employees } = parseBitrixTasks(generateDemoBitrixTasks(today));
  return { employees, checkIns: generateDemoCheckIns(employees, today) };
}

import { useMemo } from 'react';
import { getManagerNames } from '@/lib/employees/employment';
import { getNewcomers } from '@/lib/newcomers/newcomers';
import { getTodayIsoDate } from '@/lib/utils/dates';
import { useAppDataStore } from '@/store/app-data';
import { ALL_MANAGERS, selectManager, useManagerFilterStore } from '@/store/manager-filter';

export function useNewcomersView() {
  const employees = useAppDataStore((state) => state.employees);
  const checkIns = useAppDataStore((state) => state.checkIns);
  const storedManager = useManagerFilterStore((state) => state.selectedManager);
  const today = getTodayIsoDate();

  const allNewcomers = useMemo(() => getNewcomers(employees, checkIns, today), [employees, checkIns, today]);
  const managerNames = useMemo(() => getManagerNames(employees, today), [employees, today]);

  const selectedManager = managerNames.includes(storedManager) ? storedManager : ALL_MANAGERS;
  const isAllManagers = selectedManager === ALL_MANAGERS;
  const newcomers = isAllManagers
    ? allNewcomers
    : allNewcomers.filter((newcomer) => newcomer.employee.managerName === selectedManager);

  return {
    newcomers,
    managerNames,
    selectedManager,
    selectManager,
    dueCheckInCount: newcomers.filter((newcomer) => newcomer.urgency !== 'none').length,
    atRiskCount: newcomers.filter((newcomer) => newcomer.isAtRisk).length,
    emptyMessage: isAllManagers ? 'Новичков нет.' : 'У этого руководителя сейчас нет новичков.',
  };
}

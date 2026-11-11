import { useMemo } from 'react';
import { getHrSummary } from '@/lib/hr-summary/hr-summary';
import { getNewcomers } from '@/lib/newcomers/newcomers';
import { getTodayIsoDate } from '@/lib/utils/dates';
import { formatPercent, getRatio } from '@/lib/utils/percent';
import { useAppDataStore } from '@/store/app-data';

export function useHrSummaryView() {
  const employees = useAppDataStore((state) => state.employees);
  const checkIns = useAppDataStore((state) => state.checkIns);
  const today = getTodayIsoDate();

  const summary = useMemo(() => getHrSummary(employees, checkIns, today), [employees, checkIns, today]);
  const atRiskNewcomers = useMemo(
    () => getNewcomers(employees, checkIns, today).filter((newcomer) => newcomer.isAtRisk),
    [employees, checkIns, today],
  );

  return {
    summary,
    atRiskNewcomers,
    newcomerExitShareText: formatPercent(summary.newcomerExitShare),
    onTimeCheckInText:
      summary.expectedCheckInCount > 0
        ? formatPercent(getRatio(summary.onTimeCheckInCount, summary.expectedCheckInCount))
        : '—',
  };
}

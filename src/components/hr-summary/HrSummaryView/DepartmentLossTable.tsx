import { ProgressBar } from '@/components/ui/ProgressBar';
import type { DepartmentLoss } from '@/lib/hr-summary/hr-summary';
import { formatPercent } from '@/lib/utils/percent';
import styles from './HrSummaryView.module.css';

type DepartmentLossTableProps = {
  departmentLosses: DepartmentLoss[];
};

export function DepartmentLossTable({ departmentLosses }: DepartmentLossTableProps) {
  return (
    <table>
      <thead>
        <tr>
          <th>Подразделение</th>
          <th>Пришли</th>
          <th>Ушли в первые 90 дней</th>
          <th className={styles.wideColumn}>Доля</th>
        </tr>
      </thead>
      <tbody>
        {departmentLosses.map((departmentLoss) => (
          <tr key={departmentLoss.department}>
            <td>{departmentLoss.department}</td>
            <td>{departmentLoss.hiredCount}</td>
            <td>{departmentLoss.leftAsNewcomerCount}</td>
            <td>
              <div className={styles.rateCell}>
                <ProgressBar ratio={departmentLoss.lossRate} /> {formatPercent(departmentLoss.lossRate)}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

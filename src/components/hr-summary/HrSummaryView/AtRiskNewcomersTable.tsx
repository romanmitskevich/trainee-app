import type { Newcomer } from '@/lib/newcomers/newcomers';
import styles from './HrSummaryView.module.css';

type AtRiskNewcomersTableProps = {
  newcomers: Newcomer[];
};

export function AtRiskNewcomersTable({ newcomers }: AtRiskNewcomersTableProps) {
  if (newcomers.length === 0) return <p className={styles.caption}>Никого.</p>;

  return (
    <table>
      <thead>
        <tr>
          <th>Сотрудник</th>
          <th>Подразделение</th>
          <th>День</th>
          <th>Руководитель</th>
          <th>Последний разговор</th>
        </tr>
      </thead>
      <tbody>
        {newcomers.map(({ employee, workDay, lastCheckIn }) => (
          <tr key={employee.id}>
            <td>{employee.fullName}</td>
            <td>{employee.department}</td>
            <td>{workDay}</td>
            <td>{employee.managerName}</td>
            <td>
              {lastCheckIn && (
                <>
                  {lastCheckIn.mood}/5{lastCheckIn.mightLeave && ', может уйти'} —{' '}
                  {lastCheckIn.note || 'без заметки'}
                </>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

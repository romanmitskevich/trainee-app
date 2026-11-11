import type { CheckIn } from '@/lib/newcomers/check-in.types';
import { formatRuDate } from '@/lib/utils/dates';
import styles from './NewcomerCard.module.css';

type CheckInHistoryProps = {
  checkIns: CheckIn[];
};

export function CheckInHistory({ checkIns }: CheckInHistoryProps) {
  if (checkIns.length === 0) return <p className={styles.historyEmpty}>Разговоров ещё не было.</p>;

  return (
    <table className={styles.history}>
      <thead>
        <tr>
          <th>Точка</th>
          <th>Дата</th>
          <th>Оценка</th>
          <th>Заметка</th>
        </tr>
      </thead>
      <tbody>
        {checkIns.map((checkIn) => (
          <tr key={checkIn.checkpointDay}>
            <td>{checkIn.checkpointDay}-й день</td>
            <td>{formatRuDate(checkIn.date)}</td>
            <td>
              {checkIn.mood}/5{checkIn.mightLeave && ', может уйти'}
            </td>
            <td>{checkIn.note}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

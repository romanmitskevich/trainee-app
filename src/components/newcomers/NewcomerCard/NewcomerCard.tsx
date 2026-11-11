import { useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { getReachedCheckpointDays, type Newcomer } from '@/lib/newcomers/newcomers';
import { classNames } from '@/lib/utils/class-names';
import { formatRuDate } from '@/lib/utils/dates';
import { CheckInForm } from './CheckInForm';
import { CheckInHistory } from './CheckInHistory';
import { getCheckInStatusText, getMissedCheckInsText } from './newcomer-status-text';
import styles from './NewcomerCard.module.css';

type NewcomerCardProps = {
  newcomer: Newcomer;
};

export function NewcomerCard({ newcomer }: NewcomerCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { employee, lastCheckIn } = newcomer;
  const canRecordCheckIn = getReachedCheckpointDays(newcomer.workDay).length > 0;
  const missedCheckInsText = getMissedCheckInsText(newcomer);

  const toggleLabel = isExpanded
    ? 'Свернуть'
    : newcomer.dueCheckpointDay !== null
      ? 'Провести разговор'
      : canRecordCheckIn
        ? 'Записать или изменить'
        : 'История';

  return (
    <li
      className={classNames(
        styles.card,
        newcomer.urgency === 'due' && styles.due,
        (newcomer.urgency === 'overdue' || newcomer.isAtRisk) && styles.needsAttention,
      )}
    >
      <div className={styles.header}>
        <div>
          <div className={styles.name}>{employee.fullName}</div>
          <div className={styles.muted}>
            {employee.position} · {employee.department} · <b>{newcomer.workDay}-й день</b> (с{' '}
            {formatRuDate(employee.hireDate)})
          </div>
        </div>
        <div className={styles.badges}>
          {newcomer.isAtRisk && <Badge variant="danger">Риск ухода</Badge>}
          {newcomer.urgency === 'overdue' && <Badge variant="danger">Просрочено</Badge>}
          {newcomer.urgency === 'due' && <Badge variant="warning">Пора</Badge>}
        </div>
      </div>

      <div className={styles.status}>{getCheckInStatusText(newcomer)}</div>
      {missedCheckInsText && <div className={styles.missed}>{missedCheckInsText}</div>}
      {lastCheckIn && (
        <div className={styles.lastCheckIn}>
          Последний разговор {formatRuDate(lastCheckIn.date)}: {lastCheckIn.mood}/5
          {lastCheckIn.mightLeave && ', может уйти'}
          {lastCheckIn.note && ` — «${lastCheckIn.note}»`}
        </div>
      )}

      <Button variant="link" className={styles.toggle} onClick={() => setIsExpanded(!isExpanded)}>
        {toggleLabel}
      </Button>

      {isExpanded && (
        <div className={styles.details}>
          {canRecordCheckIn && <CheckInForm newcomer={newcomer} onSaved={() => setIsExpanded(false)} />}
          <CheckInHistory checkIns={newcomer.checkIns} />
        </div>
      )}
    </li>
  );
}

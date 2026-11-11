import { NewcomerCard } from '@/components/newcomers/NewcomerCard';
import { ManagerSelect } from './ManagerSelect';
import { useNewcomersView } from './useNewcomersView';
import styles from './NewcomersView.module.css';

export function NewcomersView() {
  const view = useNewcomersView();

  return (
    <>
      <div className={styles.toolbar}>
        <ManagerSelect managerNames={view.managerNames} value={view.selectedManager} onChange={view.selectManager} />
        <span className={styles.counters}>
          Новичков: <b>{view.newcomers.length}</b> · Пора поговорить: <b>{view.dueCheckInCount}</b> · Риск ухода:{' '}
          <b>{view.atRiskCount}</b>
        </span>
      </div>

      <p className={styles.hint}>
        Короткий разговор с новичком на 3-й, 14-й, 30-й, 60-й и 80-й день работы. Сверху те, с кем надо поговорить
        сейчас. Итог разговора попадает в «Сводку для HR» в этом же браузере.
      </p>

      {view.newcomers.length === 0 ? (
        <p className={styles.empty}>{view.emptyMessage}</p>
      ) : (
        <ul className={styles.list}>
          {view.newcomers.map((newcomer) => (
            <NewcomerCard key={newcomer.employee.id} newcomer={newcomer} />
          ))}
        </ul>
      )}
    </>
  );
}

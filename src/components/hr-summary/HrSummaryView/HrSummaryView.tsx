import { StatCard } from '@/components/ui/StatCard';
import { AtRiskNewcomersTable } from './AtRiskNewcomersTable';
import { CountBreakdown } from './CountBreakdown';
import { DepartmentLossTable } from './DepartmentLossTable';
import { useHrSummaryView } from './useHrSummaryView';
import styles from './HrSummaryView.module.css';

export function HrSummaryView() {
  const { summary, atRiskNewcomers, newcomerExitShareText, onTimeCheckInText } = useHrSummaryView();

  return (
    <>
      <section className={styles.stats}>
        <StatCard value={summary.hiredCount} caption="пришли за 12 месяцев" />
        <StatCard value={summary.exitCount} caption="ушли за 12 месяцев" />
        <StatCard
          value={summary.newcomerExitCount}
          valueNote={`(${newcomerExitShareText})`}
          caption="из ушедших не доработали 90 дней"
        />
        <StatCard
          value={onTimeCheckInText}
          caption={`разговоров с работающими новичками проведено в срок (${summary.onTimeCheckInCount} из ${summary.expectedCheckInCount})`}
        />
      </section>

      <section className={styles.section}>
        <h2>Сейчас под риском: {atRiskNewcomers.length}</h2>
        <AtRiskNewcomersTable newcomers={atRiskNewcomers} />
      </section>

      <section className={styles.section}>
        <h2>Где теряем новичков</h2>
        <p className={styles.caption}>
          Люди, которые пришли от 3 до 12 месяцев назад: у всех уже прошли первые 90 дней, поэтому доли можно
          сравнивать.
        </p>
        <DepartmentLossTable departmentLosses={summary.departmentLosses} />
      </section>

      <div className={styles.columns}>
        <section className={styles.section}>
          <h2>Когда уходят</h2>
          <p className={styles.caption}>Ушедшие за 12 месяцев, не доработавшие 90 дней</p>
          <CountBreakdown items={summary.newcomerExitsByStage} />
        </section>
        <section className={styles.section}>
          <h2>Почему уходят</h2>
          <p className={styles.caption}>Причина из задачи на увольнение в Битрикс24</p>
          <CountBreakdown items={summary.newcomerExitsByReason} />
        </section>
      </div>
    </>
  );
}

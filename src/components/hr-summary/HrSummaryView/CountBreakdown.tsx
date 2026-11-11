import { ProgressBar } from '@/components/ui/ProgressBar';
import type { LabeledCount } from '@/lib/hr-summary/hr-summary';
import { getRatio } from '@/lib/utils/percent';
import styles from './HrSummaryView.module.css';

type CountBreakdownProps = {
  items: LabeledCount[];
};

export function CountBreakdown({ items }: CountBreakdownProps) {
  const maxCount = Math.max(...items.map((item) => item.count), 1);

  return (
    <div>
      {items.map((item) => (
        <div key={item.label} className={styles.breakdownRow}>
          <span>{item.label}</span>
          <ProgressBar ratio={getRatio(item.count, maxCount)} />
          <b>{item.count}</b>
        </div>
      ))}
    </div>
  );
}

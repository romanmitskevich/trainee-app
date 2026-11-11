import type { ReactNode } from 'react';
import styles from './StatCard.module.css';

type StatCardProps = {
  value: ReactNode;
  valueNote?: string;
  caption: string;
};

export function StatCard({ value, valueNote, caption }: StatCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.value}>
        {value}
        {valueNote && <small className={styles.valueNote}> {valueNote}</small>}
      </div>
      <div className={styles.caption}>{caption}</div>
    </div>
  );
}

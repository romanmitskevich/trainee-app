import styles from './ProgressBar.module.css';

type ProgressBarProps = {
  ratio: number;
};

export function ProgressBar({ ratio }: ProgressBarProps) {
  const widthPercent = Math.min(Math.max(ratio, 0), 1) * 100;
  return (
    <div className={styles.track}>
      <div className={styles.fill} style={{ width: `${widthPercent}%` }} />
    </div>
  );
}

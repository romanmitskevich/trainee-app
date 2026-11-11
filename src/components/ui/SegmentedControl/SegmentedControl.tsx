import { classNames } from '@/lib/utils/class-names';
import styles from './SegmentedControl.module.css';

export type SegmentedControlOption<Value extends string> = {
  value: Value;
  label: string;
};

type SegmentedControlProps<Value extends string> = {
  options: readonly SegmentedControlOption<Value>[];
  value: Value;
  onChange: (value: Value) => void;
  ariaLabel: string;
};

export function SegmentedControl<Value extends string>({
  options,
  value,
  onChange,
  ariaLabel,
}: SegmentedControlProps<Value>) {
  return (
    <nav className={styles.control} aria-label={ariaLabel}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-current={option.value === value ? 'page' : undefined}
          className={classNames(styles.option, option.value === value && styles.selected)}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </nav>
  );
}

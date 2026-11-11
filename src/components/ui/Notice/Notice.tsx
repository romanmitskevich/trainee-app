import type { ReactNode } from 'react';
import styles from './Notice.module.css';

type NoticeProps = {
  children: ReactNode;
};

export function Notice({ children }: NoticeProps) {
  return <div className={styles.notice}>{children}</div>;
}

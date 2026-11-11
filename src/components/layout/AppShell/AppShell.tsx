import type { ReactNode } from 'react';
import styles from './AppShell.module.css';

type AppShellProps = {
  title: string;
  subtitle: string;
  navigation: ReactNode;
  notice?: ReactNode;
  children: ReactNode;
};

export function AppShell({ title, subtitle, navigation, notice, children }: AppShellProps) {
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div>
          <h1>{title}</h1>
          <p className={styles.subtitle}>{subtitle}</p>
        </div>
        {navigation}
      </header>
      {notice && <div className={styles.notice}>{notice}</div>}
      <main>{children}</main>
    </div>
  );
}

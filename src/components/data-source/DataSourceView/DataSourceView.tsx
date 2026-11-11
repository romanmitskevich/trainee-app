import { Button } from '@/components/ui/Button';
import { TaskFormatHelp } from './TaskFormatHelp';
import { useDataSourceView } from './useDataSourceView';
import styles from './DataSourceView.module.css';

export function DataSourceView() {
  const view = useDataSourceView();

  return (
    <div className={styles.view}>
      <section className={styles.section}>
        <h2>Откуда данные</h2>
        <p>
          Сейчас: {view.sourceText}. Сотрудников в базе: {view.employeeCount}, разговоров: {view.checkInCount}.
        </p>
        <TaskFormatHelp />
        <p className={styles.caption}>
          Это прототип: данные и разговоры хранятся только в этом браузере (localStorage). Руководитель и HR видят
          одни и те же данные, только если работают на одном компьютере. Загрузка файла заменяет всех сотрудников.
        </p>
      </section>

      <section className={styles.actions}>
        <Button onClick={view.downloadDemoExport}>Скачать пример выгрузки</Button>
        <Button onClick={view.openFilePicker}>Загрузить выгрузку (JSON)</Button>
        <input
          ref={view.fileInputRef}
          type="file"
          accept=".json,application/json"
          hidden
          onChange={view.handleFileChange}
        />
        <Button onClick={view.resetToDemo}>Вернуть демо-данные</Button>
      </section>

      {view.feedback && <p className={styles.message}>{view.feedback.message}</p>}
      {view.shownWarnings.length > 0 && (
        <ul className={styles.warnings}>
          {view.shownWarnings.map((warning) => (
            <li key={warning}>{warning}</li>
          ))}
          {view.hiddenWarningCount > 0 && <li>…и ещё {view.hiddenWarningCount}</li>}
        </ul>
      )}
    </div>
  );
}

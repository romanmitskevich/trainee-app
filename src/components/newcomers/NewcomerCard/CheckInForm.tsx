import { Button } from '@/components/ui/Button';
import type { Newcomer } from '@/lib/newcomers/newcomers';
import { classNames } from '@/lib/utils/class-names';
import { MOOD_OPTIONS } from './checkpoint-questions.constants';
import { useCheckInForm } from './useCheckInForm';
import styles from './CheckInForm.module.css';

type CheckInFormProps = {
  newcomer: Newcomer;
  onSaved: () => void;
};

export function CheckInForm({ newcomer, onSaved }: CheckInFormProps) {
  const form = useCheckInForm(newcomer, onSaved);
  const { values } = form;

  return (
    <form className={styles.form} onSubmit={form.submit}>
      <div className={styles.row}>
        <label>
          Разговор{' '}
          <select
            value={values.checkpointDay}
            onChange={(event) => form.selectCheckpoint(Number(event.target.value))}
          >
            {form.checkpointOptions.map((option) => (
              <option key={option.checkpointDay} value={option.checkpointDay}>
                {`${option.checkpointDay}-го дня${option.isRecorded ? ' (записан)' : ''}`}
              </option>
            ))}
          </select>
        </label>
        <label>
          Дата{' '}
          <input
            type="date"
            value={values.date}
            min={form.minDate}
            max={form.maxDate}
            onChange={(event) => form.updateValues({ date: event.target.value })}
          />
        </label>
      </div>
      {!form.isDateValid && <div className={styles.error}>Дата должна быть между днём выхода и сегодня.</div>}

      <div className={styles.title}>О чём спросить:</div>
      <ul className={styles.questions}>
        {form.questions.map((question) => (
          <li key={question}>{question}</li>
        ))}
      </ul>

      <div className={styles.field}>
        <span>Как человек себя чувствует на работе?</span>
        <div className={styles.moodOptions}>
          {MOOD_OPTIONS.map((mood) => (
            <button
              key={mood}
              type="button"
              aria-pressed={values.mood === mood}
              className={classNames(styles.moodButton, values.mood === mood && styles.moodButtonSelected)}
              onClick={() => form.updateValues({ mood })}
            >
              {mood}
            </button>
          ))}
          <span className={styles.hint}>1 — плохо, 5 — отлично</span>
        </div>
      </div>

      <label className={styles.checkbox}>
        <input
          type="checkbox"
          checked={values.mightLeave}
          onChange={(event) => form.updateValues({ mightLeave: event.target.checked })}
        />
        Есть риск, что уйдёт
      </label>

      <textarea
        className={styles.note}
        placeholder="Что беспокоит, что пообещали сделать"
        value={values.note}
        onChange={(event) => form.updateValues({ note: event.target.value })}
        rows={2}
      />

      <Button type="submit" variant="primary" disabled={!form.canSubmit}>
        {form.isEditing ? 'Сохранить изменения' : 'Сохранить'}
      </Button>
    </form>
  );
}

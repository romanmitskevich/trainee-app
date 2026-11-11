import { useState, type FormEvent } from 'react';
import type { CheckIn } from '@/lib/newcomers/check-in.types';
import { getReachedCheckpointDays, type Newcomer } from '@/lib/newcomers/newcomers';
import { getTodayIsoDate } from '@/lib/utils/dates';
import { saveCheckIn } from '@/store/app-data';
import { CHECKPOINT_QUESTIONS } from './checkpoint-questions.constants';

type CheckInFormValues = {
  checkpointDay: number;
  date: string;
  mood: number | null;
  mightLeave: boolean;
  note: string;
};

function getFormValues(checkpointDay: number, recordedCheckIn: CheckIn | undefined, today: string): CheckInFormValues {
  return {
    checkpointDay,
    date: recordedCheckIn?.date ?? today,
    mood: recordedCheckIn?.mood ?? null,
    mightLeave: recordedCheckIn?.mightLeave ?? false,
    note: recordedCheckIn?.note ?? '',
  };
}

export function useCheckInForm(newcomer: Newcomer, onSaved: () => void) {
  const today = getTodayIsoDate();
  const { employee } = newcomer;
  const reachedCheckpointDays = getReachedCheckpointDays(newcomer.workDay);
  const findRecordedCheckIn = (checkpointDay: number) =>
    newcomer.checkIns.find((checkIn) => checkIn.checkpointDay === checkpointDay);

  const initialCheckpointDay = newcomer.dueCheckpointDay ?? reachedCheckpointDays.at(-1) ?? 0;
  const [values, setValues] = useState(() =>
    getFormValues(initialCheckpointDay, findRecordedCheckIn(initialCheckpointDay), today),
  );

  const isDateValid = values.date >= employee.hireDate && values.date <= today;
  const canSubmit = values.mood !== null && isDateValid;

  function selectCheckpoint(checkpointDay: number) {
    setValues(getFormValues(checkpointDay, findRecordedCheckIn(checkpointDay), today));
  }

  function updateValues(changes: Partial<CheckInFormValues>) {
    setValues((current) => ({ ...current, ...changes }));
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    if (values.mood === null || !isDateValid) return;
    saveCheckIn({
      employeeId: employee.id,
      checkpointDay: values.checkpointDay,
      date: values.date,
      mood: values.mood,
      mightLeave: values.mightLeave,
      note: values.note.trim(),
    });
    onSaved();
  }

  return {
    values,
    checkpointOptions: reachedCheckpointDays.map((checkpointDay) => ({
      checkpointDay,
      isRecorded: findRecordedCheckIn(checkpointDay) !== undefined,
    })),
    questions: CHECKPOINT_QUESTIONS[values.checkpointDay] ?? [],
    minDate: employee.hireDate,
    maxDate: today,
    isDateValid,
    isEditing: findRecordedCheckIn(values.checkpointDay) !== undefined,
    canSubmit,
    selectCheckpoint,
    updateValues,
    submit,
  };
}

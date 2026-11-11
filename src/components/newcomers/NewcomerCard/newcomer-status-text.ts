import type { Newcomer } from '@/lib/newcomers/newcomers';

export function getCheckInStatusText(newcomer: Newcomer): string {
  if (newcomer.urgency === 'overdue') {
    return `Разговор ${newcomer.dueCheckpointDay}-го дня просрочен на ${newcomer.overdueDays} дн.`;
  }
  if (newcomer.urgency === 'due') return `Пора поговорить: разговор ${newcomer.dueCheckpointDay}-го дня`;
  if (newcomer.nextCheckpointDay !== null) {
    const daysLeft = newcomer.nextCheckpointDay - newcomer.workDay;
    return `Следующий разговор на ${newcomer.nextCheckpointDay}-й день, через ${daysLeft} дн.`;
  }
  return 'Все разговоры проведены';
}

export function getMissedCheckInsText(newcomer: Newcomer): string | null {
  if (newcomer.missedCheckpointDays.length === 0) return null;
  const days = newcomer.missedCheckpointDays.map((checkpointDay) => `${checkpointDay}-го`).join(', ');
  return `Не было разговора: ${days} дня`;
}

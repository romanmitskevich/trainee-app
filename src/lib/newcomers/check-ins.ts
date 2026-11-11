import type { CheckIn } from './check-in.types';
import { LOW_MOOD_THRESHOLD } from './checkpoints.constants';

function isSameCheckpoint(first: CheckIn, second: CheckIn): boolean {
  return first.employeeId === second.employeeId && first.checkpointDay === second.checkpointDay;
}

export function upsertCheckIn(checkIns: CheckIn[], checkIn: CheckIn): CheckIn[] {
  return [...checkIns.filter((existing) => !isSameCheckpoint(existing, checkIn)), checkIn];
}

export function signalsLeavingRisk(checkIn: CheckIn): boolean {
  return checkIn.mood <= LOW_MOOD_THRESHOLD || checkIn.mightLeave;
}

export function compareCheckInsByDate(first: CheckIn, second: CheckIn): number {
  return first.date.localeCompare(second.date) || first.checkpointDay - second.checkpointDay;
}

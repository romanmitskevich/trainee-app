import { create } from 'zustand';
import { generateDemoDataset } from '@/lib/demo/demo-data';
import type { Employee } from '@/lib/employees/employee.types';
import type { CheckIn } from '@/lib/newcomers/check-in.types';
import { upsertCheckIn } from '@/lib/newcomers/check-ins';
import { getTodayIsoDate } from '@/lib/utils/dates';

const STORAGE_KEY = 'trainee-app:data:v2';

export type DataSource = 'demo' | 'import';

type AppDataState = {
  employees: Employee[];
  checkIns: CheckIn[];
  source: DataSource;
  loadedOn: string;
};

function createDemoState(): AppDataState {
  const today = getTodayIsoDate();
  return { ...generateDemoDataset(today), source: 'demo', loadedOn: today };
}

function readStoredState(): AppDataState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const stored = JSON.parse(raw) as Partial<AppDataState> | null;
    return Array.isArray(stored?.employees) && Array.isArray(stored?.checkIns) ? (stored as AppDataState) : null;
  } catch {
    return null;
  }
}

function writeStoredState({ employees, checkIns, source, loadedOn }: AppDataState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ employees, checkIns, source, loadedOn }));
  } catch {
    // Приватный режим или переполненное хранилище
  }
}

export const useAppDataStore = create<AppDataState>()(() => readStoredState() ?? createDemoState());

writeStoredState(useAppDataStore.getState());
useAppDataStore.subscribe(writeStoredState);

export function saveCheckIn(checkIn: CheckIn) {
  useAppDataStore.setState(({ checkIns }) => ({ checkIns: upsertCheckIn(checkIns, checkIn) }));
}

export function getCheckInsKeptAfterImport(importedEmployees: Employee[]): CheckIn[] {
  const { source, checkIns } = useAppDataStore.getState();
  if (source === 'demo') return [];
  const importedIds = new Set(importedEmployees.map((employee) => employee.id));
  return checkIns.filter((checkIn) => importedIds.has(checkIn.employeeId));
}

export function replaceWithImportedEmployees(employees: Employee[]) {
  useAppDataStore.setState({
    employees,
    checkIns: getCheckInsKeptAfterImport(employees),
    source: 'import',
    loadedOn: getTodayIsoDate(),
  });
}

export function resetToDemoData() {
  useAppDataStore.setState(createDemoState());
}

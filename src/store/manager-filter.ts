import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const ALL_MANAGERS = 'all';

type ManagerFilterState = {
  selectedManager: string;
};

export const useManagerFilterStore = create<ManagerFilterState>()(
  persist(() => ({ selectedManager: ALL_MANAGERS }), { name: 'trainee-app:manager-filter' }),
);

export function selectManager(managerName: string) {
  useManagerFilterStore.setState({ selectedManager: managerName });
}

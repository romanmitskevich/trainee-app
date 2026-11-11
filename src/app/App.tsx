import { useState } from 'react';
import { DataSourceView } from '@/components/data-source/DataSourceView';
import { HrSummaryView } from '@/components/hr-summary/HrSummaryView';
import { AppShell } from '@/components/layout/AppShell';
import { NewcomersView } from '@/components/newcomers/NewcomersView';
import { Notice } from '@/components/ui/Notice';
import { SegmentedControl, type SegmentedControlOption } from '@/components/ui/SegmentedControl';
import { formatRuDate, getTodayIsoDate } from '@/lib/utils/dates';
import { useAppDataStore } from '@/store/app-data';

type Screen = 'newcomers' | 'hr-summary' | 'data-source';

const SCREEN_OPTIONS: SegmentedControlOption<Screen>[] = [
  { value: 'newcomers', label: 'Мои новички' },
  { value: 'hr-summary', label: 'Сводка для HR' },
  { value: 'data-source', label: 'Данные' },
];

export function App() {
  const [activeScreen, setActiveScreen] = useState<Screen>('newcomers');
  const isDemoData = useAppDataStore((state) => state.source === 'demo');

  return (
    <AppShell
      title="Новички: первые 90 дней"
      subtitle={`Сегодня ${formatRuDate(getTodayIsoDate())}`}
      navigation={
        <SegmentedControl
          ariaLabel="Разделы"
          options={SCREEN_OPTIONS}
          value={activeScreen}
          onChange={setActiveScreen}
        />
      }
      notice={isDemoData && <Notice>Демо-данные: сотрудники, руководители и причины ухода выдуманы.</Notice>}
    >
      {activeScreen === 'newcomers' && <NewcomersView />}
      {activeScreen === 'hr-summary' && <HrSummaryView />}
      {activeScreen === 'data-source' && <DataSourceView />}
    </AppShell>
  );
}

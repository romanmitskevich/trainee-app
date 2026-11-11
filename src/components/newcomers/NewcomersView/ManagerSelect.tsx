import { ALL_MANAGERS } from '@/store/manager-filter';

type ManagerSelectProps = {
  managerNames: string[];
  value: string;
  onChange: (managerName: string) => void;
};

export function ManagerSelect({ managerNames, value, onChange }: ManagerSelectProps) {
  return (
    <label>
      Руководитель{' '}
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        <option value={ALL_MANAGERS}>Все руководители</option>
        {managerNames.map((managerName) => (
          <option key={managerName} value={managerName}>
            {managerName}
          </option>
        ))}
      </select>
    </label>
  );
}

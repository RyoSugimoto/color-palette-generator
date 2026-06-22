import type { ThemePreference } from "../theme.js";

interface ThemeControlProps {
  readonly value: ThemePreference;
  readonly onChange: (value: ThemePreference) => void;
}

export function ThemeControl({ value, onChange }: ThemeControlProps) {
  return (
    <label class="theme-control">
      <span>Theme</span>
      <select
        value={value}
        onChange={(event) => onChange(event.currentTarget.value as ThemePreference)}
      >
        <option value="system">System</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </label>
  );
}

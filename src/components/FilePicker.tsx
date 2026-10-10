import type { ReactNode } from 'react';

interface FilePickerProps {
  label: string;
  accept: string;
  onPick: (file: File) => void;
  className?: string;
  children: ReactNode;
}

export function FilePicker({ label, accept, onPick, className, children }: FilePickerProps) {
  return (
    <label className={className}>
      {children}
      <input
        type="file"
        accept={accept}
        aria-label={label}
        className="visually-hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = ''; // dieselbe Datei kann erneut gewählt werden
          if (file) onPick(file);
        }}
      />
    </label>
  );
}

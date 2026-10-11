import { useId, useState, type FormEvent } from 'react';

/**
 * Beim ersten Start fragt die App einmal nach dem Namen, damit das Namensband gleich richtig grüßt.
 * Leer lassen ist in Ordnung; geändert wird der Name später in den Einstellungen.
 */
export function NameAsk({ onSave }: { onSave: (name: string) => Promise<void> }) {
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);
  const id = useId();

  async function submit(e: FormEvent) {
    e.preventDefault();
    const name = draft.trim();
    if (!name || saving) return;
    setSaving(true);
    try {
      await onSave(name);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="name-ask" onSubmit={(e) => void submit(e)}>
      <label className="name-ask__label" htmlFor={id}>
        Wie heißt du?
      </label>
      <div className="name-ask__row">
        <input
          id={id}
          type="text"
          autoComplete="given-name"
          enterKeyHint="done"
          placeholder="Dein Vorname"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
        <button type="submit" className="button" disabled={!draft.trim() || saving}>
          Merken
        </button>
      </div>
    </form>
  );
}

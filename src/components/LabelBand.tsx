interface LabelBandProps {
  title: string;
  line: string;
  meta?: string;
  /** Vorschau in den Einstellungen: flach eingenäht, ohne eigene Seitenüberschrift. */
  preview?: boolean;
}

/** Das eingenähte Namensband: der persönliche Gruß oben im Schrank. */
export function LabelBand({ title, line, meta, preview = false }: LabelBandProps) {
  if (preview) {
    return (
      <div className="label-band label-band--preview" role="group" aria-label="Vorschau der Begrüßung">
        <p className="label-band__title">{title}</p>
        <p className="label-band__line">{line}</p>
      </div>
    );
  }
  return (
    <header className="label-band">
      <h1 className="label-band__title">{title}</h1>
      <p className="label-band__line" key={line}>
        {line}
      </p>
      {meta && <p className="label-band__meta">{meta}</p>}
    </header>
  );
}

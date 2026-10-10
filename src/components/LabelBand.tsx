interface LabelBandProps {
  title: string;
  line: string;
  meta: string;
}

/** Das eingenähte Namensband: der persönliche Gruß oben im Schrank. */
export function LabelBand({ title, line, meta }: LabelBandProps) {
  return (
    <header className="label-band">
      <h1 className="label-band__title">{title}</h1>
      <p className="label-band__line" key={line}>
        {line}
      </p>
      <p className="label-band__meta">{meta}</p>
    </header>
  );
}

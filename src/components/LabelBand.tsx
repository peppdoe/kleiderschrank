interface LabelBandProps {
  brand: string;
  title: string;
  line: string;
  meta: string;
}

/** Das eingewebte Namensband: der persönliche Gruß oben im Schrank. */
export function LabelBand({ brand, title, line, meta }: LabelBandProps) {
  return (
    <header className="label-band">
      <p className="label-band__brand">{brand}</p>
      <h1 className="label-band__title">{title}</h1>
      <p className="label-band__line">{line}</p>
      <p className="label-band__meta">{meta}</p>
    </header>
  );
}

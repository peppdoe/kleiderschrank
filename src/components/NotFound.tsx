import { navigate } from '../lib/route';

interface NotFoundProps {
  text: string;
  backTo: string;
}

export function NotFound({ text, backTo }: NotFoundProps) {
  return (
    <section className="screen-content">
      <div className="empty">
        <p>{text}</p>
        <button type="button" className="button" onClick={() => navigate(backTo, { replace: true })}>
          Zurück
        </button>
      </div>
    </section>
  );
}

import { Component, type ReactNode } from 'react';

interface ErrorBoundaryState {
  failed: boolean;
}

export class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { failed: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { failed: true };
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <section className="screen-content">
        <div className="empty">
          <p>Etwas ist schiefgelaufen.</p>
          <p>Deine Daten sind weiterhin auf dem iPhone gespeichert.</p>
          <button
            type="button"
            className="button"
            onClick={() => {
              window.location.hash = '#/';
              window.location.reload();
            }}
          >
            Neu laden
          </button>
        </div>
      </section>
    );
  }
}

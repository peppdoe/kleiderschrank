import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect, useRef, useState } from 'react';
import { FilePicker } from '../components/FilePicker';
import { ImportSheet } from '../components/ImportSheet';
import { InstallNotice } from '../components/InstallNotice';
import { LabelBand } from '../components/LabelBand';
import { countItems } from '../db/items';
import { META_LAST_BACKUP, META_PERSIST, META_USER_NAME, getMeta, setMeta } from '../db/meta';
import { countOutfits } from '../db/outfits';
import { backupFileName, exportBackup, importBackup, parseBackup, type ParsedBackup } from '../lib/backup';
import { plural, sinceBackup } from '../lib/describe';
import { greetingFor } from '../lib/greeting';
import { userMessage } from '../lib/errors';
import { readFileText, shareOrDownload } from '../lib/files';
import { makeThumb } from '../lib/image';
import { isStandalone, storageUsageMB } from '../lib/storage';

type Message = { kind: 'ok' | 'error'; text: string };

function formatUsage(mb: number): string {
  return mb < 1 ? '< 1 MB' : `${Math.round(mb)} MB`;
}

export function SettingsScreen({ prepareBackup = false }: { prepareBackup?: boolean }) {
  const itemCount = useLiveQuery(countItems, []);
  const outfitCount = useLiveQuery(countOutfits, []);
  const lastBackup = useLiveQuery(async () => (await getMeta(META_LAST_BACKUP)) ?? null, []);
  const persist = useLiveQuery(async () => (await getMeta(META_PERSIST)) ?? null, []);
  const storedName = useLiveQuery(async () => (await getMeta(META_USER_NAME)) ?? '', []);
  const [nameDraft, setNameDraft] = useState<string | null>(null);
  const [nameSaved, setNameSaved] = useState(false);
  const [usage, setUsage] = useState<number>();
  const [prepared, setPrepared] = useState<{ json: string; fileName: string } | null>(null);
  const [pendingImport, setPendingImport] = useState<{ text: string; backup: ParsedBackup } | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);
  const sharingRef = useRef(false);

  // Vom Hinweis „jetzt sichern“ kommend: die Sicherung gleich vorbereiten, Lena tippt nur noch „Backup sichern“.
  useEffect(() => {
    if (prepareBackup) void prepare();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    storageUsageMB().then(setUsage).catch(() => setUsage(undefined));
  }, [itemCount]);

  async function saveName() {
    if (nameDraft === null) return;
    await setMeta(META_USER_NAME, nameDraft.trim());
    setNameDraft(null);
    setNameSaved(true);
    setTimeout(() => setNameSaved(false), 2500);
  }

  async function prepare() {
    setBusy(true);
    setMessage(null);
    try {
      setPrepared({ json: await exportBackup(), fileName: backupFileName() });
    } catch (e) {
      setMessage({ kind: 'error', text: userMessage(e) });
    } finally {
      setBusy(false);
    }
  }

  // Muss ohne vorheriges await laufen, sonst verweigert Safari das Teilen-Menü.
  async function share() {
    if (!prepared || sharingRef.current) return;
    sharingRef.current = true;
    try {
      const result = await shareOrDownload(prepared.json, prepared.fileName);
      if (result === 'cancelled') return;
      if (result === 'downloaded' && isStandalone()) {
        // In der Home-Bildschirm-App landet ein Download nicht verlässlich in „Dateien“.
        setMessage({
          kind: 'error',
          text: 'Die Datei wurde heruntergeladen, das klappt in der installierten App aber nicht immer. Prüfe in der Dateien-App, ob sie dort liegt – sonst „Backup sichern“ noch einmal versuchen.',
        });
        return;
      }
      await setMeta(META_LAST_BACKUP, new Date().toISOString());
      setPrepared(null);
      setMessage({ kind: 'ok', text: result === 'shared' ? 'Backup gesichert. Dein Schrank ist sicher.' : 'Backup heruntergeladen.' });
    } catch (e) {
      setMessage({ kind: 'error', text: userMessage(e) });
    } finally {
      sharingRef.current = false;
    }
  }

  // Erst lesen und prüfen, dann mit Vergleich der Zahlen fragen; ersetzt wird erst nach „Ersetzen“.
  async function chooseImportFile(file: File) {
    setMessage(null);
    try {
      const text = await readFileText(file);
      setPendingImport({ text, backup: parseBackup(text) });
    } catch (e) {
      setMessage({ kind: 'error', text: userMessage(e) });
    }
  }

  async function confirmImport() {
    if (!pendingImport) return;
    const { text } = pendingImport;
    setPendingImport(null);
    setBusy(true);
    try {
      const result = await importBackup(text, makeThumb);
      setPrepared(null);
      setMessage({
        kind: 'ok',
        text: `Backup eingespielt: ${plural(result.items, 'Teil', 'Teile')}, ${plural(result.outfits, 'Look', 'Looks')}.`,
      });
    } catch (e) {
      setMessage({ kind: 'error', text: userMessage(e) });
    } finally {
      setBusy(false);
    }
  }

  const standalone = isStandalone();
  // Vorschau mit festem Spruch, damit beim Tippen nur der Name wechselt.
  const preview = greetingFor({ name: nameDraft ?? storedName ?? '', now: new Date(), pick: 0 });

  return (
    <section className="screen-content">
      <header className="page-header">
        <h1 className="page-header__title">Einstellungen</h1>
      </header>

      <div className="section">
        <h2 className="section-title">Du</h2>
        <label className="field field--inline">
          <span>
            Dein Name
            {nameSaved && (
              <span className="field-saved" role="status">
                Gespeichert
              </span>
            )}
          </span>
          <input
            type="text"
            autoComplete="given-name"
            placeholder="für die Begrüßung"
            value={nameDraft ?? storedName ?? ''}
            onChange={(e) => setNameDraft(e.target.value)}
            onBlur={() => void saveName()}
            onKeyDown={(e) => {
              if (e.key === 'Enter') e.currentTarget.blur();
            }}
          />
        </label>
        <LabelBand title={preview.title} line={preview.line} preview />
      </div>

      <div className="section">
        <h2 className="section-title">Backup</h2>
        <p>
          {lastBackup
            ? `Zuletzt gesichert: ${sinceBackup(lastBackup)}`
            : lastBackup === null ? 'Noch kein Backup – sichere am besten gleich.' : ''}
        </p>
        {prepared ? (
          <>
            <button type="button" className="button button--primary" onClick={share}>Backup sichern</button>
            <p className="notice">Die Datei ist bereit. Wähle „In Dateien sichern“ → iCloud Drive.</p>
          </>
        ) : (
          <button type="button" className="button button--primary" disabled={busy} onClick={prepare}>Backup erstellen</button>
        )}
        <FilePicker className="text-button text-button--center" label="Backup zurückholen" accept="application/json,.json" onPick={chooseImportFile} disabled={busy}>
          Backup zurückholen
        </FilePicker>
        {message && (
          <p className={message.kind === 'ok' ? 'success' : 'error'} role={message.kind === 'ok' ? 'status' : 'alert'}>
            {message.text}
          </p>
        )}
      </div>

      <div className="section">
        <h2 className="section-title">Auf diesem iPhone</h2>
        {itemCount !== undefined && outfitCount !== undefined && (
          <p>
            {`${plural(itemCount, 'Teil', 'Teile')} · ${plural(outfitCount, 'Look', 'Looks')}`}
            {usage !== undefined && ` · ${formatUsage(usage)}`}
          </p>
        )}
        {!standalone && <InstallNotice detailed />}
        {standalone && persist === 'false' && (
          <p className="notice">
            Dein iPhone darf hier im Zweifel aufräumen. Sichere deinen Schrank deshalb lieber etwas öfter.
          </p>
        )}
      </div>

      {pendingImport && (
        <ImportSheet
          backup={pendingImport.backup}
          currentItems={itemCount ?? 0}
          currentOutfits={outfitCount ?? 0}
          onConfirm={() => void confirmImport()}
          onBackupFirst={() => {
            setPendingImport(null);
            void prepare();
          }}
          onCancel={() => setPendingImport(null)}
        />
      )}
    </section>
  );
}

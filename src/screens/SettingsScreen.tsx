import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect, useRef, useState } from 'react';
import { FilePicker } from '../components/FilePicker';
import { InstallNotice } from '../components/InstallNotice';
import { countItems } from '../db/items';
import { META_LAST_BACKUP, META_PERSIST, getMeta, setMeta } from '../db/meta';
import { countOutfits } from '../db/outfits';
import { backupFileName, exportBackup, importBackup } from '../lib/backup';
import { plural } from '../lib/describe';
import { userMessage } from '../lib/errors';
import { readFileText, shareOrDownload } from '../lib/files';
import { makeThumb } from '../lib/image';
import { isStandalone, storageUsageMB } from '../lib/storage';

type Message = { kind: 'ok' | 'error'; text: string };

function formatUsage(mb: number): string {
  return mb < 1 ? '< 1 MB' : `${Math.round(mb)} MB`;
}

export function SettingsScreen() {
  const itemCount = useLiveQuery(countItems, []);
  const outfitCount = useLiveQuery(countOutfits, []);
  const lastBackup = useLiveQuery(async () => (await getMeta(META_LAST_BACKUP)) ?? null, []);
  const persist = useLiveQuery(async () => (await getMeta(META_PERSIST)) ?? null, []);
  const [usage, setUsage] = useState<number>();
  const [prepared, setPrepared] = useState<{ json: string; fileName: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);
  const sharingRef = useRef(false);

  useEffect(() => {
    storageUsageMB().then(setUsage).catch(() => setUsage(undefined));
  }, [itemCount]);

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
      setMessage({ kind: 'ok', text: result === 'shared' ? 'Backup gesichert.' : 'Backup heruntergeladen.' });
    } catch (e) {
      setMessage({ kind: 'error', text: userMessage(e) });
    } finally {
      sharingRef.current = false;
    }
  }

  async function importFile(file: File) {
    if (!window.confirm('Backup einspielen? Alle aktuellen Teile und Outfits werden dabei ersetzt.')) return;
    setBusy(true);
    setMessage(null);
    try {
      const result = await importBackup(await readFileText(file), makeThumb);
      setPrepared(null);
      setMessage({
        kind: 'ok',
        text: `Backup eingespielt: ${plural(result.items, 'Teil', 'Teile')}, ${plural(result.outfits, 'Outfit', 'Outfits')}.`,
      });
    } catch (e) {
      setMessage({ kind: 'error', text: userMessage(e) });
    } finally {
      setBusy(false);
    }
  }

  const standalone = isStandalone();

  return (
    <section className="screen-content">
      <header className="screen-header">
        <h1>Einstellungen</h1>
      </header>

      <div className="section">
        <h2>Backup</h2>
        <p>
          {lastBackup
            ? `Letztes Backup: ${new Date(lastBackup).toLocaleDateString('de-DE')}`
            : lastBackup === null ? 'Noch kein Backup' : ''}
        </p>
        {prepared ? (
          <>
            <button type="button" className="button button--primary" onClick={share}>Backup sichern</button>
            <p className="notice">Tipp: Wähle „In Dateien sichern“ → iCloud Drive.</p>
          </>
        ) : (
          <button type="button" className="button" disabled={busy} onClick={prepare}>Backup erstellen</button>
        )}
        <FilePicker className="button" label="Backup einspielen" accept="application/json,.json" onPick={importFile} disabled={busy}>
          Backup einspielen
        </FilePicker>
        {message && (
          <p className={message.kind === 'ok' ? 'success' : 'error'} role={message.kind === 'ok' ? 'status' : 'alert'}>
            {message.text}
          </p>
        )}
      </div>

      <div className="section">
        <h2>Speicher</h2>
        {itemCount !== undefined && outfitCount !== undefined && (
          <p>
            {`${plural(itemCount, 'Teil', 'Teile')} · ${plural(outfitCount, 'Outfit', 'Outfits')}`}
            {usage !== undefined && ` · ${formatUsage(usage)}`}
          </p>
        )}
        {!standalone && <InstallNotice />}
        {standalone && persist === 'false' && (
          <p className="notice">
            Das iPhone hat dauerhaften Speicher nicht zugesagt. Mach deshalb besonders regelmäßig ein Backup.
          </p>
        )}
      </div>
    </section>
  );
}

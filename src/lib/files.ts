export type ShareResult = 'shared' | 'downloaded' | 'cancelled';

export async function shareOrDownload(content: string, fileName: string): Promise<ShareResult> {
  const file = new File([content], fileName, { type: 'application/json' });
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: 'Kleiderschrank-Backup' });
      return 'shared';
    } catch (error) {
      const name = (error as Error).name;
      // InvalidStateError: Das Teilen-Menü ist schon offen (z. B. Doppeltipp) – nichts wurde gesichert.
      if (name === 'AbortError' || name === 'InvalidStateError') return 'cancelled';
      // z. B. NotAllowedError → auf Download ausweichen
    }
  }
  const url = URL.createObjectURL(file);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
  return 'downloaded';
}

export function readFileText(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

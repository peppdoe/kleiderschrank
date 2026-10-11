import { FilePicker } from './FilePicker';
import { Icon } from './Icon';

interface OutfitPhotoPickerProps {
  /** Zugänglicher Name des Datei-Felds. */
  label: string;
  /** Sichtbarer Text im Rahmen. */
  text: string;
  busy: boolean;
  onPick: (file: File) => void;
}

/** Gestrichelter Rahmen (Naht) für das Foto von Lena im Look; die ganze Fläche ist antippbar. */
export function OutfitPhotoPicker({ label, text, busy, onPick }: OutfitPhotoPickerProps) {
  return (
    <FilePicker className={busy ? 'look-picker look-picker--busy' : 'look-picker'} label={label} accept="image/*" onPick={onPick} disabled={busy}>
      <Icon name="camera" size={22} />
      <span>{busy ? 'Foto wird vorbereitet …' : text}</span>
    </FilePicker>
  );
}

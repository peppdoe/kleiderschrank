import { ItemPhoto } from './ItemPhoto';

const MAX_CELLS = 3;

/** Ein Outfit als Look: ein großes Hauptteil, daneben gestapelt die nächsten Teile, bei mehr Teilen „+N“. */
export function OutfitPreview({ itemIds }: { itemIds: string[] }) {
  if (itemIds.length === 0) return <span className="muted">Keine Teile mehr</span>;
  const overflow = itemIds.length > MAX_CELLS;
  const shown = overflow ? itemIds.slice(0, MAX_CELLS - 1) : itemIds;
  const cells = Math.min(itemIds.length, MAX_CELLS);
  return (
    <div className={`outfit-preview outfit-preview--${cells}`} aria-hidden="true">
      {shown.map((id) => (
        <div key={id} className="outfit-preview__cell">
          <ItemPhoto itemId={id} alt="" />
        </div>
      ))}
      {overflow && (
        <div className="outfit-preview__cell outfit-preview__more">+{itemIds.length - shown.length}</div>
      )}
    </div>
  );
}

const LEGACY_POSITIONS = {
  'narrow-left': [2, 2],
  'narrow-center': [5, 3],
  'narrow-right': [9, 2],
  'medium-left': [2, 5],
  'medium-left-indented': [3, 4],
  'medium-center': [5, 5],
  'medium-right': [7, 5],
  wide: [2, 8],
  'wide-indented': [4, 6],
  'two-columns': [3, 8],
  left: [2, 4],
  right: [8, 4],
  center: [5, 4],
};

const COLUMNS = 12;

/**
 * Grid placement of a body block as CSS variables: its desktop band on the
 * 12-line grid, plus the mobile start derived from where the band sits
 * (left, middle or right third of the page).
 * `fallback` is a legacy position name or a [start, span] pair.
 */
export function columnStyle({ startColumn, columnSpan, position } = {}, fallback = 'wide') {
  const defaults =
    LEGACY_POSITIONS[position] ||
    (Array.isArray(fallback) ? fallback : LEGACY_POSITIONS[fallback]) ||
    LEGACY_POSITIONS.wide;
  const start = Number.isFinite(startColumn) ? startColumn : defaults[0];
  const span = Number.isFinite(columnSpan) ? columnSpan : defaults[1];

  const safeSpan = Math.min(Math.max(span, 1), COLUMNS);
  const safeStart = Math.min(Math.max(start, 1), COLUMNS + 1 - safeSpan);

  const desktopCentre = safeStart + safeSpan / 2;
  const mobileStart = desktopCentre < 5.5 ? 1 : desktopCentre <= 8.5 ? 2 : 3;

  return { '--col-start': safeStart, '--col-end': safeStart + safeSpan, '--col-start-m': mobileStart };
}

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
const NARROW_SPAN = 4;
// Line between the 6th and 7th columns, the middle of the 12-line grid
const PAGE_CENTRE_LINE = 7;

/**
 * Grid placement of a body block as CSS variables: its desktop band on the
 * 12-line grid, plus its mobile band on the 6-column mobile grid. Wide
 * blocks go full width on mobile, narrow ones (4 lines or less) take half
 * of it on the side where they sit on desktop, reaching slightly past the
 * middle line.
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

  const isNarrow = safeSpan <= NARROW_SPAN;
  const sitsLeft = safeStart + safeSpan / 2 <= PAGE_CENTRE_LINE;
  const [mobileStart, mobileEnd] = !isNarrow ? [1, 7] : sitsLeft ? [1, 4] : [4, 7];

  return {
    '--col-start': safeStart,
    '--col-end': safeStart + safeSpan,
    '--col-start-m': mobileStart,
    '--col-end-m': mobileEnd,
    // Which edge of a half-width block reaches past the middle line (1 or 0)
    '--grow-start-m': isNarrow && !sitsLeft ? 1 : 0,
    '--grow-end-m': isNarrow && sitsLeft ? 1 : 0,
  };
}

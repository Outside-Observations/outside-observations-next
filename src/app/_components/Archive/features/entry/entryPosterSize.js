const FALLBACK_WIDTH = 1200;

/**
 * Intrinsic size given to an entry's poster image. Shared by the entry page
 * and the pager's hidden preloads, so both request the very same file.
 */
export function getEntryPosterSize(entry) {
  const width = entry?.poster?.dimensions?.width || FALLBACK_WIDTH;
  const ratio = entry?.poster?.dimensions?.aspectRatio;
  return { width, height: ratio ? Math.round(width / ratio) : width };
}

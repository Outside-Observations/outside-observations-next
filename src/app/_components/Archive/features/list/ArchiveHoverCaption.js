'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';
import { hideHoverCaption, useHoverCaption } from '@/app/_components/Archive/state/archiveHoverCaptionStore';
import styles from '@app/_assets/archive/archive-page.module.css';

const GAP = 6;
const EDGE = 9;

/**
 * Tooltip for small thumbnails in the images view: year, source and title
 * shown just below the hovered image (above it when there is no room),
 * centred on it and kept inside the viewport. One element serves the whole
 * grid, driven by archiveHoverCaptionStore. It stays mounted so the opacity
 * transition runs in both directions, keeping the last caption while it
 * fades out.
 */
export default function ArchiveHoverCaption() {
  const caption = useHoverCaption();
  const lastCaptionRef = useRef(null);
  const elementRef = useRef(null);

  if (caption) {
    lastCaptionRef.current = caption;
  }
  const displayed = caption ?? lastCaptionRef.current;

  useLayoutEffect(() => {
    const element = elementRef.current;
    if (!element || !caption) return;

    const { rect } = caption;
    const width = element.offsetWidth;
    const height = element.offsetHeight;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const centre = rect.left + rect.width / 2;
    const left = Math.min(Math.max(centre - width / 2, EDGE), viewportWidth - EDGE - width);

    const below = rect.bottom + GAP;
    const fitsBelow = below + height <= viewportHeight - EDGE;
    const top = fitsBelow ? below : rect.top - GAP - height;

    element.style.left = `${Math.round(left)}px`;
    element.style.top = `${Math.round(top)}px`;
  }, [caption]);

  // The tooltip is anchored to a rectangle measured on hover: once the grid
  // scrolls or the window resizes, that rectangle is stale.
  useEffect(() => {
    const hide = () => hideHoverCaption();
    document.addEventListener('scroll', hide, { capture: true, passive: true });
    window.addEventListener('resize', hide);
    return () => {
      document.removeEventListener('scroll', hide, { capture: true });
      window.removeEventListener('resize', hide);
      hideHoverCaption();
    };
  }, []);

  return (
    <div
      ref={elementRef}
      className={styles.hoverCaption}
      data-visible={caption ? 'true' : 'false'}
      data-visited={displayed?.visited ? 'true' : 'false'}
      aria-hidden="true"
    >
      {displayed?.items.map((item, index) => (
        <div key={`${index}-${item}`} className={styles.archiveEntryImageOverlayContentItem}>
          <p>{item}</p>
        </div>
      ))}
    </div>
  );
}

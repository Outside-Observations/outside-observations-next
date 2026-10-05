'use client';

import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import styles from '@app/_assets/archive/archive-entry.module.css';
import { useArchiveEntriesSafe } from '@/app/_components/Archive/providers/ArchiveEntriesProvider';
import SanityImage from '@/sanity/components/SanityImage';
import { getEntryPosterSize } from '@/app/_components/Archive/features/entry/entryPosterSize';

function getEntrySlug(entry) {
  return entry?.metadata?.slug?.current || entry?.slug?.current || null;
}

function buildEntryHref(entry) {
  if (entry?.kind === 'widlineMedia') {
    const index = Number.isInteger(entry.widlineMediaIndex) ? entry.widlineMediaIndex : 0;
    return `/archive/widline-cadet?media=${index}`;
  }

  const slug = getEntrySlug(entry);
  if (!slug) {
    return null;
  }

  return entry.mediaType === 'visualEssay'
    ? `/archive/entry/${slug}?image=0`
    : `/archive/entry/${slug}`;
}

function findNeighbour(entries, fromIndex, step) {
  for (let i = fromIndex + step; i >= 0 && i < entries.length; i += step) {
    if (buildEntryHref(entries[i])) {
      return entries[i];
    }
  }

  return null;
}

export default function ArchiveEntryPager({ slug }) {
  const archive = useArchiveEntriesSafe();
  const router = useRouter();

  const entries = useMemo(() => archive?.visibleEntries ?? [], [archive?.visibleEntries]);
  const { hasMore, isLoadingMore, loadMore } = archive ?? {};

  const currentIndex = useMemo(
    () => entries.findIndex((entry) => getEntrySlug(entry) === slug),
    [entries, slug]
  );

  const previousEntry = useMemo(
    () => (currentIndex < 0 ? null : findNeighbour(entries, currentIndex, -1)),
    [entries, currentIndex]
  );
  const nextEntry = useMemo(
    () => (currentIndex < 0 ? null : findNeighbour(entries, currentIndex, 1)),
    [entries, currentIndex]
  );
  const previousHref = buildEntryHref(previousEntry);
  const nextHref = buildEntryHref(nextEntry);
  // Posters of both neighbours, requested with the entry page's own props so
  // the browser picks the same file and finds it in cache on arrival
  const preloads = [previousEntry, nextEntry].filter((entry) => entry?.poster?.asset);

  const lookaheadRef = useRef(0);
  const MAX_LOOKAHEAD_PAGES = 3;

  useEffect(() => {
    if (typeof loadMore !== 'function' || !hasMore || isLoadingMore) {
      return;
    }

    if (currentIndex >= 0) {
      lookaheadRef.current = 0;
      if (currentIndex >= entries.length - 2) {
        loadMore();
      }
      return;
    }

    if (entries.length > 0 && lookaheadRef.current < MAX_LOOKAHEAD_PAGES) {
      lookaheadRef.current += 1;
      loadMore();
    }
  }, [currentIndex, entries.length, hasMore, isLoadingMore, loadMore]);

  // Both neighbours are fetched ahead, so an arrow press only has to render.
  // 'full': the archive layout is dynamic, a default prefetch would stop at
  // the layout and leave the page itself to fetch on press.
  useEffect(() => {
    if (previousHref) router.prefetch(previousHref, { kind: 'full' });
    if (nextHref) router.prefetch(nextHref, { kind: 'full' });
  }, [router, previousHref, nextHref]);

  const goTo = useCallback(
    (href) => {
      if (href) {
        router.push(href);
      }
    },
    [router]
  );

  const swipeStartRef = useRef(null);

  useEffect(() => {
    const SWIPE_MIN_DISTANCE = 60;
    const SWIPE_MAX_VERTICAL_RATIO = 0.6;

    const isSwipeCapable = (event) =>
      event.pointerType === 'touch' ||
      event.pointerType === 'pen' ||
      window.matchMedia('(pointer: coarse)').matches;

    const handlePointerDown = (event) => {
      if (!event.isPrimary || !isSwipeCapable(event)) {
        swipeStartRef.current = null;
        return;
      }
      swipeStartRef.current = { x: event.clientX, y: event.clientY };
    };

    const handlePointerUp = (event) => {
      const start = swipeStartRef.current;
      swipeStartRef.current = null;
      if (!start) {
        return;
      }

      const deltaX = event.clientX - start.x;
      const deltaY = event.clientY - start.y;

      if (Math.abs(deltaX) < SWIPE_MIN_DISTANCE) {
        return;
      }
      if (Math.abs(deltaY) > Math.abs(deltaX) * SWIPE_MAX_VERTICAL_RATIO) {
        return;
      }

      goTo(deltaX < 0 ? nextHref : previousHref);
    };

    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    window.addEventListener('pointerup', handlePointerUp, { passive: true });
    window.addEventListener('pointercancel', () => { swipeStartRef.current = null; }, { passive: true });

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [goTo, previousHref, nextHref]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }

      const target = event.target;
      const isTyping =
        target instanceof HTMLElement &&
        (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));
      if (isTyping) {
        return;
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        goTo(previousHref);
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        goTo(nextHref);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goTo, previousHref, nextHref]);

  if (!archive || currentIndex < 0) {
    return null;
  }

  // The arrows are plain links, without data-transition: like keys and swipe
  // they skip the site-wide exit fade and only get PageTransition's short
  // entry-to-entry fade-in. Prefetching is handled above.
  return (
    <nav className={styles.archiveEntryPager} aria-label="Archive entry navigation">
      {preloads.length > 0 ? (
        <div className={styles.archiveEntryPagerPreload} aria-hidden="true">
          {preloads.map((entry) => {
            const { width, height } = getEntryPosterSize(entry);
            return (
              <SanityImage
                key={getEntrySlug(entry) || entry._id}
                image={entry.poster}
                alt=""
                width={width}
                height={height}
                loading="eager"
              />
            );
          })}
        </div>
      ) : null}
      {previousHref ? (
        <Link
          href={previousHref}
          className={`${styles.archiveEntryPagerButton} ${styles.archiveEntryPagerPrevious}`}
          prefetch={false}
          aria-label="Previous entry"
          rel="prev"
        />
      ) : (
        <span
          className={`${styles.archiveEntryPagerButton} ${styles.archiveEntryPagerPrevious}`}
          data-disabled="true"
          aria-hidden="true"
        />
      )}
      {nextHref ? (
        <Link
          href={nextHref}
          className={`${styles.archiveEntryPagerButton} ${styles.archiveEntryPagerNext}`}
          prefetch={false}
          aria-label="Next entry"
          rel="next"
        />
      ) : (
        <span
          className={`${styles.archiveEntryPagerButton} ${styles.archiveEntryPagerNext}`}
          data-disabled="true"
          aria-hidden="true"
        />
      )}
    </nav>
  );
}

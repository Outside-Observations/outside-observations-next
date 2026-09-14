'use client';

import { useEffect } from 'react';

import styles from '@app/_assets/archive/archive-page.module.css';

const SCRUB_RANGE = 200;

export default function ArchiveHero() {
  useEffect(() => {
    let frame = null;
    let latest = 0;
    let applied = -1;

    const apply = () => {
      frame = null;
      const progress = Math.round(Math.min(1, Math.max(0, latest / SCRUB_RANGE)) * 1000) / 1000;
      if (progress === applied) return;
      applied = progress;
      document.body.style.setProperty('--hero-progress', String(progress));
    };

    const onScroll = (event) => {
      // Freeze the hero while the mobile menu modal is open: nothing
      // behind it may move, whatever fired the scroll.
      if (document.body.classList.contains('mobile-nav-open')) return;
      const target = event.target;
      // Only the grid's own scroller (or the document) drives the hero:
      // other scrollables (the mobile menu modal, dropdowns) must not.
      const isGridScroller =
        target !== document && target?.matches?.('[class*="containerContent"]');
      if (target !== document && !isGridScroller) return;
      const top =
        target === document
          ? document.documentElement.scrollTop || document.body.scrollTop
          : target?.scrollTop;
      if (typeof top !== 'number') return;
      latest = top;
      if (frame === null) {
        frame = requestAnimationFrame(apply);
      }
    };

    const onWheel = (event) => {
      if (document.body.classList.contains('mobile-nav-open')) return;
      const scroller = document.querySelector('[class*="containerContent"]');
      if (!scroller || scroller.contains(event.target)) return;
      scroller.scrollBy({ top: event.deltaY });
    };

    document.body.style.setProperty('--hero-progress', '0');
    document.addEventListener('scroll', onScroll, { passive: true, capture: true });
    window.addEventListener('wheel', onWheel, { passive: true });
    return () => {
      if (frame !== null) cancelAnimationFrame(frame);
      document.removeEventListener('scroll', onScroll, { capture: true });
      window.removeEventListener('wheel', onWheel);
      document.body.style.removeProperty('--hero-progress');
    };
  }, []);

  return (
    <h1 className={styles.archiveHero} aria-label="An Index of What We Found">
      An Index of
      <br />
      What We Found
    </h1>
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

import styles from '@app/_assets/layout/nav.module.css';

// Must outlast the CSS closing animation (mobileMenuPieceOut + header fade)
const CLOSE_DURATION = 340;

export default function MobileMenuButton() {
  // 'closed' -> 'open' -> 'closing' (fade-out plays) -> 'closed'
  const [phase, setPhase] = useState('closed');
  const isFirstPathname = useRef(true);
  const pathname = usePathname();

  useEffect(() => {
    const body = document.body;
    body.classList.toggle('mobile-nav-open', phase !== 'closed');
    body.classList.toggle('mobile-nav-closing', phase === 'closing');

    if (phase !== 'closing') return undefined;
    const timer = setTimeout(() => setPhase('closed'), CLOSE_DURATION);
    return () => clearTimeout(timer);
  }, [phase]);

  // Leaving through a link of the menu closes it with the same fade as the
  // Close button, from the tap on, so it fades out along with the page.
  useEffect(() => {
    if (phase !== 'open') return undefined;

    const closeOnMenuLink = (event) => {
      const link = event.target.closest?.('a[href]');
      if (link && link.closest('#main-header')) {
        setPhase('closing');
      }
    };

    document.addEventListener('click', closeOnMenuLink);
    return () => document.removeEventListener('click', closeOnMenuLink);
  }, [phase]);

  // The modal must not survive a navigation, however it was triggered
  useEffect(() => {
    if (isFirstPathname.current) {
      isFirstPathname.current = false;
      return;
    }
    setPhase((current) => (current === 'open' ? 'closing' : current));
  }, [pathname]);

  useEffect(() => {
    return () => {
      document.body.classList.remove('mobile-nav-open', 'mobile-nav-closing');
    };
  }, []);

  const handleToggle = () => {
    setPhase((current) => (current === 'open' ? 'closing' : 'open'));
  };

  return (
    <div className={`${styles.navMenuMobile} ${styles.navBubble}`}>
      <button
        className={styles.navMenuMobileButton}
        type="button"
        onClick={handleToggle}
        aria-expanded={phase === 'open'}
      >
        {phase === 'open' ? 'Close' : 'Menu'}
      </button>
    </div>
  );
}

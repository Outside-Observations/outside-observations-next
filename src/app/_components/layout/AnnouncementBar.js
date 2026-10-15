'use client';

import styles from '@app/_assets/layout/announcement-bar.module.css';
import { setLocalStorage } from '@/app/_helpers/storage/localStorage';
import { trackOutboundClick } from '@/app/_helpers/analytics/gtag';

import {
  ANNOUNCEMENT_ID,
  ANNOUNCEMENT_STORAGE_KEY,
  ANNOUNCEMENT_URL,
} from '@/app/_components/layout/announcementConfig';

// A closed announcement is hidden before paint by the guard script in the
// pages layout (html[data-announcement="hidden"]), so it never flashes.

export default function AnnouncementBar() {
  const handleClose = () => {
    setLocalStorage(ANNOUNCEMENT_STORAGE_KEY, ANNOUNCEMENT_ID);
    document.documentElement.setAttribute('data-announcement', 'hidden');
  };

  return (
    <div className={styles.bar} role="region" aria-label="Announcement">
      <a
        className={styles.link}
        href={ANNOUNCEMENT_URL}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackOutboundClick('feedback_form', ANNOUNCEMENT_URL)}
      >
        Have feedback about the site? <span className={styles.cta}>Write to us</span> and get a
        free T-shirt
      </a>
      <button
        type="button"
        className={styles.close}
        onClick={handleClose}
        aria-label="Close announcement"
      />
    </div>
  );
}

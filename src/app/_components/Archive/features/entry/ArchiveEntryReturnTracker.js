'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { recordEntryNavigation } from '@/app/_components/Archive/state/entryReturnPath';

// Mounted in the archive layout, which persists across archive routes:
// remembers the page an entry was opened from (see entryReturnPath).
export default function ArchiveEntryReturnTracker() {
  const pathname = usePathname();
  const previousPathnameRef = useRef(null);

  useEffect(() => {
    recordEntryNavigation(previousPathnameRef.current, pathname);
    previousPathnameRef.current = pathname;
  }, [pathname]);

  return null;
}

import {
  SESSION_STORAGE_KEYS,
  readFromSessionStorage,
  removeFromSessionStorage,
  writeToSessionStorage,
} from '@/app/_components/Archive/state/archiveStorage';

/**
 * Where an archive entry's Close button leads.
 *
 * Entries open from the archive index, but also from other archive pages
 * (Unexpected Connections, Widline Cadet). Each move is recorded here so
 * Close can go back to the page the visitor came from, with `steps` counting
 * the entries browsed since (arrows, keys, swipe).
 * The index itself is not recorded: its Close keeps the existing behaviour.
 */
const ENTRY_PREFIX = '/archive/entry/';
const ARCHIVE_INDEX = '/archive';

export function isEntryPath(pathname) {
  return typeof pathname === 'string' && pathname.startsWith(ENTRY_PREFIX);
}

export function recordEntryNavigation(previousPathname, pathname) {
  if (!isEntryPath(pathname)) {
    return;
  }

  // Opened from a link outside the site or a reload: no known origin
  if (!previousPathname) {
    removeFromSessionStorage(SESSION_STORAGE_KEYS.ENTRY_RETURN);
    return;
  }

  if (isEntryPath(previousPathname)) {
    const current = readEntryReturn();
    if (current) {
      writeToSessionStorage(SESSION_STORAGE_KEYS.ENTRY_RETURN, {
        ...current,
        steps: current.steps + 1,
      });
    }
    return;
  }

  if (previousPathname === ARCHIVE_INDEX) {
    removeFromSessionStorage(SESSION_STORAGE_KEYS.ENTRY_RETURN);
    return;
  }

  writeToSessionStorage(SESSION_STORAGE_KEYS.ENTRY_RETURN, {
    path: previousPathname,
    steps: 0,
  });
}

export function readEntryReturn() {
  const value = readFromSessionStorage(SESSION_STORAGE_KEYS.ENTRY_RETURN, null);
  if (!value || typeof value.path !== 'string' || !value.path.startsWith('/')) {
    return null;
  }
  return { path: value.path, steps: Number.isInteger(value.steps) ? value.steps : 0 };
}

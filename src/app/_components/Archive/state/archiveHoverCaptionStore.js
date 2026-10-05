'use client';

import { useSyncExternalStore } from 'react';

/**
 * Hover caption for small archive thumbnails.
 *
 * When the caption does not fit inside the image, the thumbnail hands it to
 * a single tooltip rendered outside the grid (the thumbnails are clipped and
 * paint-contained, nothing can overflow them).
 */

let current = null;
const listeners = new Set();

function emit() {
  listeners.forEach((listener) => listener());
}

export function showHoverCaption(caption) {
  current = caption;
  emit();
}

export function hideHoverCaption(id) {
  if (!current || (id !== undefined && current.id !== id)) return;
  current = null;
  emit();
}

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return current;
}

function getServerSnapshot() {
  return null;
}

export function useHoverCaption() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

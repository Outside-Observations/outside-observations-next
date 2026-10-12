'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

import styles from '@app/_assets/access/access-gate.module.css';
import gridStyles from '@app/_assets/main.module.css';
import { ACCESS_API_PATH, sanitizeNextPath } from '@/lib/siteAccess';

// The ring of the first-visit animation: one dot per character typed
const DOTS = Array.from({ length: 8 }, (_, index) => index);
const GRID_LINES = Array.from({ length: 5 }, (_, index) => index);
// Matches the dots flying out in access-gate.module.css
const SUCCESS_EXIT_MS = 1100;
const ERROR_SHAKE_MS = 500;

const MESSAGES = {
  idle: 'An early look at the new Outside Observations, open to a small circle of people. Enter the password to continue.',
  denied: 'Not quite. Try again.',
  failed: 'Something went wrong. Try again.',
  success: 'Welcome in.',
};

export default function AccessGate() {
  const [password, setPassword] = useState('');
  // idle -> checking -> success | error (shake, then back to idle)
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState(MESSAGES.idle);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (status !== 'error') return undefined;
    const timer = setTimeout(() => setStatus('idle'), ERROR_SHAKE_MS);
    return () => clearTimeout(timer);
  }, [status]);

  const isBusy = status === 'checking' || status === 'success';
  const filledDots = status === 'success' ? DOTS.length : Math.min(password.length, DOTS.length);

  const handleChange = (event) => {
    setPassword(event.target.value);
    if (message !== MESSAGES.idle) setMessage(MESSAGES.idle);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!password || isBusy) return;

    setStatus('checking');
    try {
      const response = await fetch(ACCESS_API_PATH, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        setStatus('success');
        setMessage(MESSAGES.success);
        inputRef.current?.blur();
        const next = sanitizeNextPath(new URLSearchParams(window.location.search).get('next'));
        setTimeout(() => window.location.assign(next), SUCCESS_EXIT_MS);
        return;
      }

      setMessage(response.status === 401 ? MESSAGES.denied : MESSAGES.failed);
    } catch {
      setMessage(MESSAGES.failed);
    }

    setPassword('');
    setStatus('error');
    inputRef.current?.focus();
  };

  return (
    <main className={styles.page} data-status={status}>
      <div className={`${gridStyles.linesGrid} ${styles.lines}`} aria-hidden="true">
        {GRID_LINES.map((line) => (
          <div key={line} className={gridStyles.linesGridItem} />
        ))}
      </div>

      <Image
        className={styles.logo}
        src="/logo.png"
        alt="Outside Observations"
        width={30}
        height={41}
        priority
      />

      <form className={styles.gate} onSubmit={handleSubmit}>
        <h1 className={styles.title}>Private Preview</h1>

        {/* Clicking anywhere in the ring focuses the field */}
        <div className={styles.ring} onClick={() => inputRef.current?.focus()}>
          {DOTS.map((dot) => (
            <span key={dot} className={styles.arm} style={{ '--i': dot }} aria-hidden="true">
              <span className={styles.dot} data-filled={dot < filledDots} />
            </span>
          ))}
          <input
            ref={inputRef}
            className={styles.input}
            type="password"
            name="password"
            value={password}
            onChange={handleChange}
            placeholder="Password"
            aria-label="Password"
            autoComplete="current-password"
            readOnly={isBusy}
          />
        </div>

        <p className={styles.message} role="status" aria-live="polite">
          {message}
        </p>

        <button type="submit" className={styles.submit} disabled={!password || isBusy}>
          Enter
        </button>
      </form>
    </main>
  );
}

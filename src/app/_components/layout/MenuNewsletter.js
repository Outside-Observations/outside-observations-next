'use client';

import { useRef, useState } from 'react';

import styles from '@app/_assets/layout/nav.module.css';
import { KLAVIYO_LIST_ID, KLAVIYO_SUBSCRIBE_URL } from '@/app/_helpers/newsletter/klaviyo';

export default function MenuNewsletter() {
  const formRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const form = formRef.current;
    const email = form?.querySelector('input[name="email"]')?.value;
    if (!email) return;

    setIsSubmitting(true);
    try {
      await fetch(KLAVIYO_SUBSCRIBE_URL, {
        method: 'POST',
        body: new FormData(form),
        mode: 'no-cors',
      });
    } catch {
      // no-cors hides the response, and Klaviyo records the signup anyway
    }
    setIsSubmitting(false);
    setIsSubscribed(true);
    form.reset();
  };

  return (
    <div className={styles.menuNewsletter}>
      <p className={styles.menuNewsletterTitle}>Subscribe to our newsletter</p>

      {isSubscribed ? (
        <p className={styles.menuNewsletterSuccess}>Successfully subscribed!</p>
      ) : (
        <form
          ref={formRef}
          className={styles.menuNewsletterForm}
          action={KLAVIYO_SUBSCRIBE_URL}
          method="POST"
          onSubmit={handleSubmit}
          noValidate
        >
          <input type="hidden" name="g" value={KLAVIYO_LIST_ID} />
          <label className={styles.menuNewsletterField}>
            <span className={styles.menuNewsletterArrow} aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12h15" />
                <path d="M12.5 5.5 19 12l-6.5 6.5" />
              </svg>
            </span>
            <input
              className={styles.menuNewsletterInput}
              type="email"
              name="email"
              placeholder="Enter your email here"
              aria-label="Your email address"
              required
              disabled={isSubmitting}
              autoComplete="email"
              spellCheck="false"
            />
          </label>
          <button type="submit" className={styles.menuNewsletterSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Subscribing...' : 'Subscribe'}
          </button>
        </form>
      )}
    </div>
  );
}

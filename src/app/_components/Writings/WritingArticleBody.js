'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';

import styles from '@app/_assets/writings/writings-article.module.css';
import ArticleBlock from './ArticleBlock';

export function formatArticleDate(value) {
  if (!value) return null;
  try {
    return new Date(value)
      .toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
      .toUpperCase();
  } catch {
    return null;
  }
}

export default function WritingArticleBody({ article, nextArticle, showHeader = true }) {
  const [shareState, setShareState] = useState('idle');
  const shareResetRef = useRef(null);

  const handleShare = async () => {
    const url = window.location.href;
    const payload = { title: article?.title || document.title, url };

    if (typeof navigator.share === 'function' && (!navigator.canShare || navigator.canShare(payload))) {
      try {
        await navigator.share(payload);
      } catch {
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      setShareState('copied');
    } catch {
      setShareState('error');
    }
    if (shareResetRef.current) {
      clearTimeout(shareResetRef.current);
    }
    shareResetRef.current = setTimeout(() => setShareState('idle'), 2000);
  };

  const date = formatArticleDate(article.publishedAt);
  const nextDate = formatArticleDate(nextArticle?.publishedAt);

  return (
    <article className={styles.article} data-slug={article.slug}>
      {showHeader ? (
        <header className={styles.header}>
          <h1 className={styles.title}>{article.title}</h1>
          <p className={styles.byline}>
            {article.author?.name}
            {date ? <span className={styles.date}>{date}</span> : null}
          </p>
        </header>
      ) : null}

      <div className={styles.body}>
        {(article.body ?? []).map((block) => (
          <ArticleBlock key={block._key} block={block} />
        ))}
      </div>

      <footer className={styles.footer}>
        <nav className={styles.footerNav}>
          <Link href="/writings" data-transition="nav" className={styles.footerNavLeft}>
            See our other articles
          </Link>
          <button type="button" className={`${styles.footerNavCenter} ${styles.footerShare}`} onClick={handleShare}>
            {shareState === 'copied' ? 'Link copied' : shareState === 'error' ? 'Copy failed' : 'Share'}
          </button>
          <span className={styles.footerNavRight}>
            Written by{' '}
            {article.author?.link ? (
              <a href={article.author.link} target="_blank" rel="noreferrer">
                {article.author.name}
              </a>
            ) : (
              article.author?.name
            )}
          </span>
          <span className={styles.footerDot} style={{ '--line': 6 }} aria-hidden="true" />
          <span className={styles.footerDot} style={{ '--line': 9 }} aria-hidden="true" />
        </nav>

        {nextArticle ? (
          <div className={styles.footerTitleBlock}>
            <p className={styles.footerTitle}>{nextArticle.title}</p>
            <p className={styles.footerByline}>
              {nextArticle.authorName}
              {nextDate ? ` - ${nextDate}` : ''}
            </p>
          </div>
        ) : null}
      </footer>
    </article>
  );
}

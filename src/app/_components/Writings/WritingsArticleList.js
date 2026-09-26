'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

import styles from '@app/_assets/writings/writings-page.module.css';
import ArticleReadLink from '@/app/_components/Writings/ArticleReadLink';
import SanityImage from '@/sanity/components/SanityImage';

const PREVIEW_QUERY = '(hover: hover) and (min-width: 769px)';
// Covers fetched as soon as the page shows, so the first hovers are instant.
// Beyond that the browser fetches them at idle, still ahead of the hover.
const EAGER_COVERS = 16;

export default function WritingsArticleList({ articles }) {
  const [activeId, setActiveId] = useState(null);
  // Decided after mount: the server renders no previews, phones never get
  // them, and desktops mount every cover at once, hidden, ready to show.
  const [previewsEnabled, setPreviewsEnabled] = useState(false);

  useEffect(() => {
    setPreviewsEnabled(window.matchMedia(PREVIEW_QUERY).matches);
  }, []);

  const covers = previewsEnabled ? articles.filter((article) => article.coverImage?.asset) : [];

  return (
    <>
      <ul className={styles.articleList}>
        {articles.map((article) => (
          <li
            key={article._id}
            className={styles.articleRow}
            onMouseEnter={() => setActiveId(article._id)}
            onMouseLeave={() => setActiveId(null)}
          >
            <Link
              href={`/writings/${article.slug}`}
              className={styles.articleTitle}
              data-transition="nav"
            >
              {article.title}
            </Link>
            <span className={styles.articleAuthor}>{article.authorName}</span>
            <ArticleReadLink
              slug={article.slug}
              title={article.title}
              className={styles.articleRead}
            />
          </li>
        ))}
      </ul>

      {covers.length > 0 ? (
        <div className={styles.hoverPreview} aria-hidden="true">
          {covers.map((article, index) => {
            const ratio = article.coverImage.dimensions?.aspectRatio || 1;
            return (
              <SanityImage
                key={article._id}
                image={article.coverImage}
                alt=""
                width={900}
                height={Math.round(900 / ratio)}
                sizes="420px"
                loading={index < EAGER_COVERS ? 'eager' : 'lazy'}
                className={styles.hoverPreviewImage}
                data-visible={article._id === activeId ? 'true' : 'false'}
              />
            );
          })}
        </div>
      ) : null}
    </>
  );
}

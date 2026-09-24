'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';

import styles from '@app/_assets/writings/writings-page.module.css';
import ArticleReadLink from '@/app/_components/Writings/ArticleReadLink';
import SanityImage from '@/sanity/components/SanityImage';

const PREVIEW_QUERY = '(hover: hover) and (min-width: 769px)';

export default function WritingsArticleList({ articles }) {
  const [preview, setPreview] = useState(null);

  // Touch screens fire mouseenter on tap: the preview is a desktop pointer
  // affordance only, and must not fetch an image on phones.
  const showPreview = useCallback((article) => {
    if (!article.coverImage?.asset || !window.matchMedia(PREVIEW_QUERY).matches) return;
    setPreview(article);
  }, []);

  const ratio = preview?.coverImage?.dimensions?.aspectRatio || 1;

  return (
    <>
      <ul className={styles.articleList}>
        {articles.map((article) => (
          <li
            key={article._id}
            className={styles.articleRow}
            onMouseEnter={() => showPreview(article)}
            onMouseLeave={() => setPreview(null)}
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

      {preview ? (
        <div className={styles.hoverPreview} aria-hidden="true">
          <SanityImage
            key={preview._id}
            image={preview.coverImage}
            alt=""
            width={900}
            height={Math.round(900 / ratio)}
            sizes="420px"
            placeholder={preview.coverImage.lqip ? 'blur' : undefined}
            blurDataURL={preview.coverImage.lqip || undefined}
          />
        </div>
      ) : null}
    </>
  );
}

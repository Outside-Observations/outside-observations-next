'use client';

import articleStyles from '@app/_assets/writings/writings-article.module.css';
import styles from '@app/_assets/writings/writings-article-blocks.module.css';
import SanityImage from '@/sanity/components/SanityImage';
import ArticleRichText from './ArticleRichText';
import { columnStyle } from './articleColumns';

function BlockImage({ image, alt, sizes, className }) {
  const ratio = image.dimensions?.aspectRatio || 1;

  return (
    <SanityImage
      image={image}
      alt={alt}
      width={1600}
      height={Math.round(1600 / ratio)}
      sizes={sizes}
      className={className}
      placeholder={image.lqip ? 'blur' : undefined}
      blurDataURL={image.lqip || undefined}
    />
  );
}

function ArticleImage({ block }) {
  if (!block.image?.asset) return null;

  // Both versions are lazy images: the one hidden by CSS on the current
  // screen is never downloaded.
  const hasMobileImage = Boolean(block.mobileImage?.asset);
  const alt = block.captionTitle || '';
  const hasCaption = Boolean(block.captionTitle || block.captionCredit);

  return (
    <figure className={styles.figure}>
      <BlockImage
        image={block.image}
        alt={alt}
        sizes={hasMobileImage ? '50vw' : '(max-width: 768px) 100vw, 50vw'}
        className={hasMobileImage ? styles.desktopOnly : undefined}
      />
      {hasMobileImage ? (
        <BlockImage image={block.mobileImage} alt={alt} sizes="100vw" className={styles.mobileOnly} />
      ) : null}
      {hasCaption ? (
        <figcaption className={styles.caption}>
          {block.captionTitle ? <span>{block.captionTitle}</span> : null}
          {block.captionCredit ? <span>{block.captionCredit}</span> : null}
        </figcaption>
      ) : null}
    </figure>
  );
}

function ArticleList({ items }) {
  if (!items?.length) return null;

  return (
    <ul className={styles.list}>
      {items.map((item, index) => (
        <li key={`${index}-${item}`}>{item}</li>
      ))}
    </ul>
  );
}

function ColumnBlock({ block }) {
  if (block._type === 'columnText') {
    return (
      <div
        className={`${styles.columnText} ${styles.richText}`}
        data-width={block.width || 'full'}
      >
        <ArticleRichText value={block.text} />
      </div>
    );
  }
  if (block._type === 'columnImage') {
    return <ArticleImage block={block} />;
  }
  if (block._type === 'columnList') {
    return (
      <div className={styles.columnList}>
        <ArticleList items={block.items} />
      </div>
    );
  }
  return null;
}

export default function ArticleBlock({ block }) {
  switch (block._type) {
    case 'textSection':
      return (
        <section className={articleStyles.textSection} data-position={block.position || undefined}>
          <div
            className={`${articleStyles.sectionInner} ${styles.richText}`}
            style={columnStyle(block, 'wide')}
          >
            <ArticleRichText value={block.text} />
          </div>
        </section>
      );

    case 'imageBlock':
      return (
        <section className={styles.placed} data-kind="image">
          <div className={styles.placedInner} style={columnStyle(block, [2, 4])}>
            <ArticleImage block={block} />
          </div>
        </section>
      );

    case 'listBlock':
      return (
        <section className={styles.placed} data-kind="list">
          <div className={styles.placedInner} style={columnStyle(block, [2, 4])}>
            <ArticleList items={block.items} />
          </div>
        </section>
      );

    case 'quoteBlock':
      return block.text ? (
        <blockquote className={styles.quote}>
          <p>{block.text}</p>
        </blockquote>
      ) : null;

    case 'rowBlock':
      return (
        <section className={styles.row}>
          {(block.columns ?? []).map((column) => (
            <div key={column._key} className={styles.column} style={columnStyle(column, [2, 5])}>
              {(column.blocks ?? []).map((inner) => (
                <ColumnBlock key={inner._key} block={inner} />
              ))}
            </div>
          ))}
        </section>
      );

    default:
      return null;
  }
}

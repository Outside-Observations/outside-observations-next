'use client';

import articleStyles from '@app/_assets/writings/writings-article.module.css';
import styles from '@app/_assets/writings/writings-article-blocks.module.css';
import SanityImage from '@/sanity/components/SanityImage';
import ArticleRichText from './ArticleRichText';
import { columnStyle } from './articleColumns';

function ArticleImage({ block }) {
  if (!block.image?.asset) return null;

  const ratio = block.image.dimensions?.aspectRatio || 1;
  const hasCaption = Boolean(block.captionTitle || block.captionCredit);

  return (
    <figure className={styles.figure}>
      <SanityImage
        image={block.image}
        alt={block.captionTitle || ''}
        width={1600}
        height={Math.round(1600 / ratio)}
        sizes="(max-width: 768px) 100vw, 50vw"
        placeholder={block.image.lqip ? 'blur' : undefined}
        blurDataURL={block.image.lqip || undefined}
      />
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
        data-size={block.size || 'normal'}
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
            data-size={block.size || 'normal'}
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

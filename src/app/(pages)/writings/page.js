import { unstable_cache } from 'next/cache';
import { client } from '@/sanity/lib/client';
import { WRITINGS_LIST_QUERY, WRITINGS_SETTINGS_QUERY } from '@/sanity/lib/queries';
import { SITE_NAME, SITE_URL } from '@/lib/siteUrl';
import styles from '@app/_assets/writings/writings-page.module.css';
import { ErrorBoundary } from '@/app/_components/shared/error/ErrorBoundary';
import WritingsScrollReset from '@/app/_components/Writings/WritingsScrollReset';
import WritingsArticleList from '@/app/_components/Writings/WritingsArticleList';

export const revalidate = 60;

const DEFAULT_ABOUT_FIRST =
  "We've always looked at the world the same way: found images rather than produced ones, places and people we don't usually notice, things that carry a history without ever explaining it. This part of the site is where we finally put words to that way of looking. Everything is turning into an image to look at - a life, a street, a face - and even what's real has become a style you can buy. Here, we're interested in what wasn't made to be seen.";

const getWritingsData = unstable_cache(
  async () => {
    try {
      const [settings, articles] = await Promise.all([
        client.fetch(WRITINGS_SETTINGS_QUERY),
        client.fetch(WRITINGS_LIST_QUERY),
      ]);
      return { settings, articles: Array.isArray(articles) ? articles : [] };
    } catch (error) {
      console.error('Failed to fetch writings:', error);
      return { settings: null, articles: [] };
    }
  },
  ['writings-list'],
  { revalidate: 60 }
);

export async function generateMetadata() {
  const title = `Writings | ${SITE_NAME}`;
  const description = `Essays and editorial writing by ${SITE_NAME} - on images, looking, and what wasn't made to be seen.`;
  const canonicalUrl = `${SITE_URL}/writings`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: canonicalUrl,
      images: [{ url: `${SITE_URL}/share-image.png`, width: 1200, height: 630, alt: title }],
    },
    alternates: { canonical: canonicalUrl },
  };
}

const collectionJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: `${SITE_NAME} - Writings`,
  url: `${SITE_URL}/writings`,
  isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: SITE_URL },
};

function formatDate(value) {
  if (!value) return null;
  try {
    return new Date(value)
      .toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
      .toUpperCase();
  } catch {
    return null;
  }
}

export default async function WritingsPage() {
  const { settings, articles } = await getWritingsData();

  const aboutFirst = settings?.aboutFirstColumn?.trim() || DEFAULT_ABOUT_FIRST;

  return (
    <ErrorBoundary>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <WritingsScrollReset />
      <main className={styles.container}>
        <section className={styles.intro}>
          <p className={styles.description}>{aboutFirst}</p>
        </section>

        {articles.length > 0 ? (
          <WritingsArticleList articles={articles} />
        ) : (
          <p className={styles.emptyState}>Nothing published yet - first texts are on their way.</p>
        )}
      </main>
    </ErrorBoundary>
  );
}

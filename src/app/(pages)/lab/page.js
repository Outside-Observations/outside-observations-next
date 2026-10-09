import styles from '@app/_assets/lab/work-with-us.module.css';
import { SITE_NAME, SITE_URL } from '@/lib/siteUrl';

const baseUrl = SITE_URL;

const CONTACT_MAILTO = 'mailto:contact@outsideobservations.com';

export async function generateMetadata() {
  const title = `Work with us | ${SITE_NAME}`;
  const description =
    `${SITE_NAME} is open to projects of all kinds, drawing on strategy, curation, and art direction. Get in touch for new projects and ideas.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: `${baseUrl}/lab`,
      images: [
        {
          url: `${baseUrl}/share-image.png`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${baseUrl}/share-image.png`],
    },
    alternates: { canonical: `${baseUrl}/lab` },
  };
}

export default function WorkWithUsPage() {
  return (
    <div className={styles.container}>
      <div className={styles.main}>
        <h1 className={styles.title}>How to Work with Outside Observations</h1>

        <p className={styles.intro}>
          We’re open to projects of all kinds. Our work is grounded in our personal
          research practice and the way we see the world. We draw on strategy,
          curation, and art direction, with an approach shaped by what each project
          needs.
        </p>
      </div>

      <div className={styles.contact}>
        <p>
          If you have a project you think we should be involved in, or for general
          enquiries, <a href={CONTACT_MAILTO}>[write to us.]</a>
        </p>
      </div>
    </div>
  );
}

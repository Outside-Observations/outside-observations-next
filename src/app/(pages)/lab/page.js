import styles from '@app/_assets/lab/work-with-us.module.css';
import { SITE_NAME, SITE_URL } from '@/lib/siteUrl';

const baseUrl = SITE_URL;

const CONTACT_MAILTO = 'mailto:contact@outsideobservations.com';

const SERVICES = [
  'Creative direction and advisory',
  'Cultural strategy and research',
  'Art advisory and curation',
  'Brand positioning and development',
  'Image and reference research',
  'Art direction and visual identity',
  'Editorial and publishing',
  'Special projects and collaborations',
  'Curation and sourcing',
];

export async function generateMetadata() {
  const title = `Work with us | ${SITE_NAME}`;
  const description =
    `${SITE_NAME} works with creatives, brands, institutions, and individuals across culture. Get in touch for new projects and ideas.`;

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
      <h1 className={styles.title}>
        Outside Observations works with creatives, brands, institutions, and
        individuals across culture.
      </h1>

      <ul className={styles.tags}>
        {SERVICES.map((service) => (
          <li key={service} className={styles.tag}>
            {service}
          </li>
        ))}
      </ul>

      <div className={styles.contact}>
        <p>
          If you have a project you think we should be involved in,{' '}
          <a href={CONTACT_MAILTO}>[write to us.]</a>
        </p>
        <p>
          For general inquiries: <a href={CONTACT_MAILTO}>[Email us.]</a>
        </p>
      </div>
    </div>
  );
}

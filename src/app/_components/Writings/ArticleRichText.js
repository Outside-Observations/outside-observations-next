'use client';

import { PortableText } from 'next-sanity';

import HoverImageLink from './HoverImageLink';

const portableComponents = {
  marks: {
    link: ({ value, children }) => (
      <a href={value?.href} target="_blank" rel="noreferrer">
        {children}
      </a>
    ),
    hoverImage: ({ value, children }) => {
      if (!value?.image?.asset) {
        return <span>{children}</span>;
      }

      return (
        <HoverImageLink image={value.image} caption={value.caption}>
          {children}
        </HoverImageLink>
      );
    },
  },
};

export default function ArticleRichText({ value }) {
  return <PortableText value={value} components={portableComponents} />;
}

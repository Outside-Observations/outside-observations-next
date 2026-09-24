import {defineField, defineType} from 'sanity'
import {articleBodyBlocks} from './article-blocks'

export const writingArticle = defineType({
  name: 'writingArticle',
  title: 'Writing',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required().min(1).max(180),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'title', maxLength: 96},
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'reference',
      to: [{type: 'author'}],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published on',
      type: 'date',
      description:
        'Shown under the title, and controls visibility: a published article only appears on the site once this date is reached. Set a future date to schedule.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      rows: 3,
      description: 'One or two sentences used on the listing page and for search engines.',
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover image',
      type: 'image',
      options: {hotspot: true},
      description: 'Shown on the Editorial listing while the reader hovers this article.',
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      of: articleBodyBlocks,
      validation: (Rule) => Rule.required().min(1),
    }),
  ],
  orderings: [
    {
      title: 'Published date, newest first',
      name: 'publishedAtDesc',
      by: [{field: 'publishedAt', direction: 'desc'}],
    },
  ],
  preview: {
    select: {title: 'title', authorName: 'author.name', date: 'publishedAt'},
    prepare({title, authorName, date}) {
      return {title, subtitle: [authorName, date].filter(Boolean).join(' - ')}
    },
  },
})

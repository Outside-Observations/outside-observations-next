import {createElement as h} from 'react'
import {defineArrayMember, defineField} from 'sanity'
import {ColumnBandPreview} from '../../components/previews/ColumnBandPreview'

/** Field factories and preview helpers shared by the article body blocks. */

export const LINES = 12

export const bandLabel = (from, width) => `Line ${from} -> ${from + width} (${width} col.)`

export const bandFields = ({start, span}) => [
  defineField({
    name: 'startColumn',
    title: 'Starts at line',
    type: 'number',
    initialValue: start,
    hidden: true,
    validation: (Rule) => Rule.required().integer().min(1).max(LINES),
  }),
  defineField({
    name: 'columnSpan',
    title: 'Width',
    type: 'number',
    initialValue: span,
    hidden: true,
    validation: (Rule) => Rule.required().integer().min(1).max(LINES),
  }),
]

export const richTextField = defineField({
  name: 'text',
  title: 'Text',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
      styles: [{title: 'Normal', value: 'normal'}],
      lists: [],
      marks: {
        decorators: [
          {title: 'Bold', value: 'strong'},
          {title: 'Italic', value: 'em'},
        ],
        annotations: [
          {
            name: 'link',
            type: 'object',
            title: 'Link (URL)',
            fields: [{name: 'href', type: 'url', title: 'URL'}],
          },
          {
            name: 'hoverImage',
            type: 'object',
            title: 'Link (image on hover)',
            description: 'Underlines the text and reveals this image while the reader hovers it.',
            fields: [
              {
                name: 'image',
                type: 'image',
                title: 'Image',
                options: {hotspot: true},
                validation: (Rule) => Rule.required(),
              },
              {name: 'caption', type: 'string', title: 'Caption / credit'},
            ],
          },
        ],
      },
    }),
  ],
  validation: (Rule) => Rule.required(),
})

export const imageFields = [
  defineField({
    name: 'image',
    title: 'Image',
    type: 'image',
    options: {hotspot: true},
    validation: (Rule) => Rule.required(),
  }),
  defineField({
    name: 'mobileImage',
    title: 'Mobile image (optional)',
    type: 'image',
    options: {hotspot: true},
    description: 'Shown on phones instead of the image above. Leave empty to use the same image everywhere.',
  }),
  defineField({name: 'captionTitle', title: 'Caption - title', type: 'string'}),
  defineField({name: 'captionCredit', title: 'Caption - credit', type: 'string'}),
]

export const listItemsField = defineField({
  name: 'items',
  title: 'Lines',
  type: 'array',
  of: [defineArrayMember({type: 'string'})],
  validation: (Rule) => Rule.required().min(1),
})

export const firstTextLine = (text) => {
  const first = Array.isArray(text) ? text.find((block) => block?._type === 'block') : null
  return first?.children?.map((child) => child.text).join('') || ''
}

export const bandPreview = (start, span) => h(ColumnBandPreview, {start: start ?? 2, span: span ?? 8})

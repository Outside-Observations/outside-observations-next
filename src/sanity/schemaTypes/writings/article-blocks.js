import {createElement as h} from 'react'
import {defineArrayMember, defineField} from 'sanity'
import {ColumnBandPreview} from '../../components/previews/ColumnBandPreview'
import {ColumnBandInput} from '../../components/inputs/ColumnBandInput'
import {
  bandFields,
  bandLabel,
  bandPreview,
  firstTextLine,
  imageFields,
  listItemsField,
  richTextField,
  sizeField,
} from './article-block-fields'

/**
 * Body blocks of a writing article. Top-level blocks carry their own place on
 * the 12-line grid, a Row holds up to two columns side by side, and the
 * blocks stacked inside a column take the column's width.
 */

const MAX_COLUMNS_PER_ROW = 2

// ---- Blocks stacked inside a row column (the column owns the placement) ----

const columnText = defineArrayMember({
  name: 'columnText',
  title: 'Text',
  type: 'object',
  fields: [
    richTextField,
    sizeField,
    defineField({
      name: 'width',
      title: 'Width in the column',
      type: 'string',
      options: {
        list: [
          {title: 'Full', value: 'full'},
          {title: 'Reduced', value: 'reduced'},
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
      initialValue: 'full',
    }),
  ],
  preview: {
    select: {text: 'text', size: 'size', width: 'width'},
    prepare: ({text, size, width}) => ({
      title: firstTextLine(text).slice(0, 80) || 'Text',
      subtitle: ['Text', size === 'large' && 'large', width === 'reduced' && 'reduced']
        .filter(Boolean)
        .join(' - '),
    }),
  },
})

const columnImage = defineArrayMember({
  name: 'columnImage',
  title: 'Image',
  type: 'object',
  fields: imageFields,
  preview: {
    select: {media: 'image', title: 'captionTitle', credit: 'captionCredit'},
    prepare: ({media, title, credit}) => ({
      title: title || 'Image',
      subtitle: credit || 'Image',
      media,
    }),
  },
})

const columnList = defineArrayMember({
  name: 'columnList',
  title: 'List',
  type: 'object',
  fields: [listItemsField],
  preview: {
    select: {items: 'items'},
    prepare: ({items}) => ({
      title: items?.[0] || 'List',
      subtitle: `List - ${items?.length || 0} line(s)`,
    }),
  },
})

const rowColumn = defineArrayMember({
  name: 'rowColumn',
  title: 'Column',
  type: 'object',
  fields: [
    ...bandFields({start: 2, span: 5}),
    defineField({
      name: 'blocks',
      title: 'Blocks in this column',
      type: 'array',
      of: [columnText, columnImage, columnList],
      validation: (Rule) => Rule.required().min(1),
    }),
  ],
  components: {input: ColumnBandInput},
  preview: {
    select: {startColumn: 'startColumn', columnSpan: 'columnSpan', blocks: 'blocks'},
    prepare: ({startColumn, columnSpan, blocks}) => ({
      title: `Column - ${blocks?.length || 0} block(s)`,
      subtitle: bandLabel(startColumn ?? 2, columnSpan ?? 5),
      media: bandPreview(startColumn, columnSpan),
    }),
  },
})

const overlaps = (a, b) => {
  const aStart = a.startColumn ?? 2
  const bStart = b.startColumn ?? 2
  return aStart < bStart + (b.columnSpan ?? 5) && bStart < aStart + (a.columnSpan ?? 5)
}

// ---- Top-level blocks of the article body ----

export const textSection = defineArrayMember({
  name: 'textSection',
  title: 'Text section',
  type: 'object',
  fields: [richTextField, sizeField, ...bandFields({start: 2, span: 8})],
  components: {input: ColumnBandInput},
  preview: {
    select: {text: 'text', startColumn: 'startColumn', columnSpan: 'columnSpan'},
    prepare: ({text, startColumn, columnSpan}) => ({
      title: firstTextLine(text).slice(0, 80) || 'Text section',
      subtitle: bandLabel(startColumn ?? 2, columnSpan ?? 8),
      media: bandPreview(startColumn, columnSpan),
    }),
  },
})

export const imageBlock = defineArrayMember({
  name: 'imageBlock',
  title: 'Image',
  type: 'object',
  fields: [...imageFields, ...bandFields({start: 2, span: 4})],
  components: {input: ColumnBandInput},
  preview: {
    select: {
      media: 'image',
      title: 'captionTitle',
      startColumn: 'startColumn',
      columnSpan: 'columnSpan',
    },
    prepare: ({media, title, startColumn, columnSpan}) => ({
      title: title || 'Image',
      subtitle: `Image - ${bandLabel(startColumn ?? 2, columnSpan ?? 4)}`,
      media,
    }),
  },
})

export const quoteBlock = defineArrayMember({
  name: 'quoteBlock',
  title: 'Quote',
  type: 'object',
  fields: [
    defineField({
      name: 'text',
      title: 'Quote',
      type: 'text',
      rows: 3,
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {text: 'text'},
    prepare: ({text}) => ({title: text?.slice(0, 80) || 'Quote', subtitle: 'Quote - centered'}),
  },
})

export const listBlock = defineArrayMember({
  name: 'listBlock',
  title: 'List',
  type: 'object',
  fields: [listItemsField, ...bandFields({start: 2, span: 4})],
  components: {input: ColumnBandInput},
  preview: {
    select: {items: 'items', startColumn: 'startColumn', columnSpan: 'columnSpan'},
    prepare: ({items, startColumn, columnSpan}) => ({
      title: items?.[0] || 'List',
      subtitle: `List - ${bandLabel(startColumn ?? 2, columnSpan ?? 4)}`,
      media: bandPreview(startColumn, columnSpan),
    }),
  },
})

export const rowBlock = defineArrayMember({
  name: 'rowBlock',
  title: 'Row (side by side)',
  type: 'object',
  fields: [
    defineField({
      name: 'columns',
      title: 'Columns',
      description: 'Up to two columns placed side by side on the same row.',
      type: 'array',
      of: [rowColumn],
      validation: (Rule) =>
        Rule.required()
          .min(1)
          .max(MAX_COLUMNS_PER_ROW)
          .custom((columns) => {
            if (!Array.isArray(columns) || columns.length < 2) return true
            return overlaps(columns[0], columns[1])
              ? 'The two columns overlap on the grid: move or narrow one of them.'
              : true
          }),
    }),
  ],
  preview: {
    select: {columns: 'columns'},
    prepare: ({columns}) => {
      const bands = (columns || []).map((column) => ({
        start: column.startColumn ?? 2,
        span: column.columnSpan ?? 5,
      }))
      return {
        title: 'Row',
        subtitle: `${bands.length} column(s) side by side`,
        media: h(ColumnBandPreview, {bands}),
      }
    },
  },
})

export const articleBodyBlocks = [textSection, imageBlock, quoteBlock, listBlock, rowBlock]

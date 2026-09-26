import {createElement as h} from 'react'

/**
 * Mini map of the site grid shown as the media thumbnail of a block: twelve
 * cells, the ones the block occupies are filled. A row passes one band per
 * column. Lets contributors read the collage of a whole article at a glance
 * in the block list.
 */
export function ColumnBandPreview({start = 2, span = 8, bands}) {
  const shown = bands?.length ? bands : [{start, span}]
  const cells = Array.from({length: 12}, (_, i) => {
    const line = i + 1
    const active = shown.some((band) => line >= band.start && line < band.start + band.span)
    return h('span', {
      key: line,
      style: {
        flex: 1,
        height: '60%',
        borderRadius: 1,
        backgroundColor: active ? 'currentColor' : 'transparent',
        border: '1px solid currentColor',
        opacity: active ? 0.9 : 0.25,
      },
    })
  })

  return h(
    'span',
    {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        width: '100%',
        height: '100%',
        padding: 2,
        boxSizing: 'border-box',
      },
    },
    cells
  )
}

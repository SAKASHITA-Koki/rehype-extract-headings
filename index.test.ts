import { test, expect } from 'vitest'
import { unified } from 'unified'
import rehypeParse from 'rehype-parse'
import rehypeStringify from 'rehype-stringify'

import {
  Heading,
  InnerHeading,
  incrementNumbering,
  stringifyNumbering,
  convertInnerHeadingToHeading,
  extractHeadings,
  rehypeExtractHeadings
} from './index.js'


test('incrementNumbering', () => {
  expect(incrementNumbering([0,0,0,0,0,0], 1))
    .toEqual([1,0,0,0,0,0])
  expect(incrementNumbering([1,0,0,0,0,0], 2))
    .toEqual([1,1,0,0,0,0])
  expect(incrementNumbering([1,1,0,0,0,0], 3))
    .toEqual([1,1,1,0,0,0])
  expect(incrementNumbering([1,1,1,0,0,0], 4))
    .toEqual([1,1,1,1,0,0])
  expect(incrementNumbering([1,1,1,1,0,0], 5))
    .toEqual([1,1,1,1,1,0])
  expect(incrementNumbering([1,1,1,1,1,0], 6))
    .toEqual([1,1,1,1,1,1])
  // reset lower numbering when upper numbering incremented
  expect(incrementNumbering([1,1,1,1,1,1], 2))
    .toEqual([1,2,0,0,0,0])
  // set 1 when heading level skipped
  expect(incrementNumbering([1,2,0,0,0,0], 6))
    .toEqual([1,2,1,1,1,1])
})


test('stringifyNumbering', () => {
  expect(stringifyNumbering([1,0,0,0,0,0]))
    .toBe('1')
  expect(stringifyNumbering([1,1,0,0,0,0]))
    .toBe('1-1')
  expect(stringifyNumbering([1,1,0,0,0,0]))
    .toBe('1-1')
  expect(stringifyNumbering([1,1,1,0,0,0]))
    .toBe('1-1-1')
  expect(stringifyNumbering([1,1,1,1,0,0]))
    .toBe('1-1-1-1')
  expect(stringifyNumbering([1,1,1,1,1,0]))
    .toBe('1-1-1-1-1')
  expect(stringifyNumbering([1,1,1,1,1,1]))
    .toBe('1-1-1-1-1-1')
  
  expect(stringifyNumbering([1,2,0,0,0,1]))
    .toBe('1-2-1-1-1-1')
})


test('convertInnerHeadingToHeading', () => {
  innerHeadings.forEach((innerHeading: InnerHeading[], i: number) => {
    const expected = headings[i]

    const actual: Heading[] = innerHeading.map((ih: InnerHeading) => (
      convertInnerHeadingToHeading(ih)
    ))

    expect(actual)
      .toEqual(expected)
  })

})


test('extractHeadings', () => {
  inputHTMLs.forEach((inputHTML: string, i: number) => {
    const expected = headings[i]

    const processor = unified()
      .use(rehypeParse, { fragment: true })

    const tree = processor.parse(inputHTML)

    expect(extractHeadings(tree))
      .toEqual(expected)
  })
})


test('rehypeExtractHeadings', () => {
  inputHTMLs.forEach(async (inputHTML: string, i: number) => {
    const expected = expectedHTMLs[i]

    const processor = unified()
      .use(rehypeParse, { fragment: true })
      .use(rehypeExtractHeadings)
      .use(rehypeStringify)

    const result = await processor.process(inputHTML)

    expect(String(result))
      .toBe(expected)
  })
})


const inputHTMLs = [
`<h1>heading 1</h1>
<h2>heading 1-1</h2>
<h3>heading 1-1-1</h3>
<h4>heading 1-1-1-1</h4>
<h5>heading 1-1-1-1-1</h5>
<h6>heading 1-1-1-1-1-1</h6>`,

`<h1>heading 1</h1>
<h2>heading 1-1</h2>
<h3>heading 1-1-1</h3>
<h4>heading 1-1-1-1</h4>
<h5>heading 1-1-1-1-1</h5>
<h6>heading 1-1-1-1-1-1</h6>
<h2>heading 1-2</h2>`,

`<h1>heading 1</h1>
<h2>heading 1-1</h2>
<h2>heading 1-2</h2>
<h6>heading 1-2-1-1-1-1</h6>`,

`<h1 id="heading-1">heading 1</h1>
<h2 id="heading-1-1">heading 1-1</h2>
<h3 id="heading-1-1-1">heading 1-1-1</h3>
<h2>heading 1-2</h2>`
]

const expectedHTMLs = [
`<h1 id="1">heading 1</h1>
<h2 id="1-1">heading 1-1</h2>
<h3 id="1-1-1">heading 1-1-1</h3>
<h4 id="1-1-1-1">heading 1-1-1-1</h4>
<h5 id="1-1-1-1-1">heading 1-1-1-1-1</h5>
<h6 id="1-1-1-1-1-1">heading 1-1-1-1-1-1</h6>`,

`<h1 id="1">heading 1</h1>
<h2 id="1-1">heading 1-1</h2>
<h3 id="1-1-1">heading 1-1-1</h3>
<h4 id="1-1-1-1">heading 1-1-1-1</h4>
<h5 id="1-1-1-1-1">heading 1-1-1-1-1</h5>
<h6 id="1-1-1-1-1-1">heading 1-1-1-1-1-1</h6>
<h2 id="1-2">heading 1-2</h2>`,

`<h1 id="1">heading 1</h1>
<h2 id="1-1">heading 1-1</h2>
<h2 id="1-2">heading 1-2</h2>
<h6 id="1-2-1-1-1-1">heading 1-2-1-1-1-1</h6>`,

`<h1 id="heading-1">heading 1</h1>
<h2 id="heading-1-1">heading 1-1</h2>
<h3 id="heading-1-1-1">heading 1-1-1</h3>
<h2 id="1-2">heading 1-2</h2>`
]


const innerHeadings: InnerHeading[][] = [

  [
    { id: '1', text: 'heading 1', depth: 1, children: [
      { id: '1-1', text: 'heading 1-1', depth: 2, children: [
        { id: '1-1-1', text: 'heading 1-1-1', depth: 3, children: [
          { id: '1-1-1-1', text: 'heading 1-1-1-1', depth: 4, children: [
            { id: '1-1-1-1-1', text: 'heading 1-1-1-1-1', depth: 5, children: [
              { id: '1-1-1-1-1-1', text: 'heading 1-1-1-1-1-1', depth: 6, children: [] }
            ] }
          ] }
        ] }
      ] }
    ] }
  ],


  [
    { id: '1', text: 'heading 1', depth: 1, children: [
      { id: '1-1', text: 'heading 1-1', depth: 2, children: [
        { id: '1-1-1', text: 'heading 1-1-1', depth: 3, children: [
          { id: '1-1-1-1', text: 'heading 1-1-1-1', depth: 4, children: [
            { id: '1-1-1-1-1', text: 'heading 1-1-1-1-1', depth: 5, children: [
              { id: '1-1-1-1-1-1', text: 'heading 1-1-1-1-1-1', depth: 6, children: [] }
            ] }
          ] }
        ] }
      ] },
      { id: '1-2', text: 'heading 1-2', depth: 2, children: [] }
    ] }
  ],


  [
    { id: '1', text: 'heading 1', depth: 1, children: [
      { id: '1-1', text: 'heading 1-1', depth: 2, children: [] },
      { id: '1-2', text: 'heading 1-2', depth: 2, children: [
        { id: '1-2-1-1-1-1', text: 'heading 1-2-1-1-1-1', depth: 6, children: [] }
      ] }
    ] }
  ],


  [
    { id: 'heading-1', text: 'heading 1', depth: 1, children: [
      { id: 'heading-1-1', text: 'heading 1-1', depth: 2, children: [
        { id: 'heading-1-1-1', text: 'heading 1-1-1', depth: 3, children: [] }
      ] },
      { id: '1-2', text: 'heading 1-2', depth: 2, children: [] }
    ] }
  ]

]


const headings: Heading[][] = [

  [
    { id: '1', text: 'heading 1', depth: 1, children: [
      { id: '1-1', text: 'heading 1-1', depth: 2, children: [
        { id: '1-1-1', text: 'heading 1-1-1', depth: 3, children: [
          { id: '1-1-1-1', text: 'heading 1-1-1-1', depth: 4, children: [
            { id: '1-1-1-1-1', text: 'heading 1-1-1-1-1', depth: 5, children: [
              { id: '1-1-1-1-1-1', text: 'heading 1-1-1-1-1-1', depth: 6 }
            ] }
          ] }
        ] }
      ] }
    ] }
  ],


  [
    { id: '1', text: 'heading 1', depth: 1, children: [
      { id: '1-1', text: 'heading 1-1', depth: 2, children: [
        { id: '1-1-1', text: 'heading 1-1-1', depth: 3, children: [
          { id: '1-1-1-1', text: 'heading 1-1-1-1', depth: 4, children: [
            { id: '1-1-1-1-1', text: 'heading 1-1-1-1-1', depth: 5, children: [
              { id: '1-1-1-1-1-1', text: 'heading 1-1-1-1-1-1', depth: 6 }
            ] }
          ] }
        ] }
      ] },
      { id: '1-2', text: 'heading 1-2', depth: 2 }
    ] }
  ],


  [
    { id: '1', text: 'heading 1', depth: 1, children: [
      { id: '1-1', text: 'heading 1-1', depth: 2 },
      { id: '1-2', text: 'heading 1-2', depth: 2, children: [
        { id: '1-2-1-1-1-1', text: 'heading 1-2-1-1-1-1', depth: 6 }
      ] }
    ] }
  ],


  [
    { id: 'heading-1', text: 'heading 1', depth: 1, children: [
      { id: 'heading-1-1', text: 'heading 1-1', depth: 2, children: [
        { id: 'heading-1-1-1', text: 'heading 1-1-1', depth: 3 }
      ] },
      { id: '1-2', text: 'heading 1-2', depth: 2 }
    ] }
  ]

]



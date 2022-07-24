rehype-extract-headings
==============================

A rehype plugin to extract headings data.
It's useful to make a table of contents in SSG.


installation
------------------------------

```sh
npm install SAKASHITA-Koki/rehype-extract-headings
```


usage
------------------------------

```js
import { unified } from 'unified'
import rehypeParse from 'rehype-parse'
import rehypeStringify from 'rehype-stringify'
import { rehypeExtractHeadings } from 'rehype-extract-headings'


const input = `<h1 id="foo">heading 1</h1>
<h2 id="bar">heading 1-1</h2>
<h3>heading 1-1-1</h3>
<h2>heading 1-2</h2>`


const processor = unified()
  .use(rehypeParse, { fragment: true })
  .use(rehypeExtractHeadings)
  .use(rehypeStringify)


const vfile = await processor.process(input)

console.log(String(vfile))
/*
<h1 id="foo">heading 1</h1>
<h2 id="bar">heading 1-1</h2>
<h3 id="1-1-1">heading 1-1-1</h3>
<h2 id="1-2">heading 1-2</h2>
*/


console.log(vfile.data.headings)
/*
{ id: 'foo', text: 'heading 1', depth: 1, children: [
  { id: 'bar', text: 'heading 1-1', depth: 2, children: [
    { id: '1-1-1', text: 'heading 1-1-1', depth: 3 }
  ] },
  { id: '1-2', text: 'heading 1-2', depth: 2 }
] }
*/
```

To make a table of contents, when a heading has no id attribute, this plugin automatically sets its numbering to its id attribute.


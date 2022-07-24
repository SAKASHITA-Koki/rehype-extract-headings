import { Node } from 'unist'
import { Element, Text } from 'hast'
import { visit } from 'unist-util-visit'
import { headingRank } from 'hast-util-heading-rank'
import { toString } from 'hast-util-to-string'
import { VFileWithOutput } from 'unified'



export type Heading = {
  id: string,
  text: string,
  depth: number,
  children?: Heading[]
}

export type InnerHeading = {
  id: string,
  text: string,
  depth: number,
  children: InnerHeading[]
}



export const incrementNumbering = (
  numbering: number[],
  depth: number
): number[] => [
  ...numbering.slice(0, depth-1).map(i => Math.max(i, 1)),
  numbering[depth-1]+1,
  ...[0, 0, 0, 0, 0, 0].slice(depth)
]


export const stringifyNumbering = (
  numbering: number[]
): string => (
  // remove tail zeros brefore join
  numbering.reduceRight((acc: number[], n: number) => {
    if(acc.length === 0 && n === 0) {
      return []
    }
    return [Math.max(1,n), ...acc]
  }, []).join('-')
)


export const convertInnerHeadingToHeading = (inner: InnerHeading): Heading => {
  const { id, text, depth, children: innerChildren } = inner
  const hasChild = innerChildren.length !== 0
  if(hasChild) {
    const children: Heading[] = innerChildren.map(
      (child: InnerHeading): Heading => (
        convertInnerHeadingToHeading(child)
      )
    )
    const heading: Heading = { id, text, depth, children }
    return heading
  } else {
    const heading: Heading = { id, text, depth }
    return heading
  }
}


export const extractHeadings = (tree: Node): Heading[] => {
  let numbering = [0, 0, 0, 0, 0, 0]
  const headings: InnerHeading[] = []
  let stack: InnerHeading[] = []

  visit(tree, 'element', (node: Node) => {
    const depth = headingRank(node as Text)
    if(typeof depth === 'number') {
      numbering = incrementNumbering(numbering, depth)
      const text = toString(node as Text)
      // @ts-ignore
      const props: any = node.properties ?? (node.properties = {})
      const hasId = props.hasOwnProperty('id')
      const id: string = hasId
        ? props.id as string
        : stringifyNumbering(numbering)
      if(!hasId) {
        props.id = id
      }
      const children: InnerHeading[] = []
      const heading: InnerHeading = { id, text, depth, children }
      stack = stack.slice(0, depth-1)
      const parent = stack.length === 0
        ? headings
        : stack[stack.length-1].children
      parent.push(heading)
      stack = [ ...stack, heading ]
    }
  })

  return headings.map((inner: InnerHeading): Heading => (
    convertInnerHeadingToHeading(inner)
  ))
}


export const rehypeExtractHeadings = () => ((
  node: Node,
  file: VFileWithOutput<any>
) => {
  file.data.headings = extractHeadings(node)
})


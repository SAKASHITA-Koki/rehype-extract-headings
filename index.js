import { visit } from 'unist-util-visit';
import { headingRank } from 'hast-util-heading-rank';
import { toString } from 'hast-util-to-string';
export const incrementNumbering = (numbering, depth) => [
    ...numbering.slice(0, depth - 1).map(i => Math.max(i, 1)),
    numbering[depth - 1] + 1,
    ...[0, 0, 0, 0, 0, 0].slice(depth)
];
export const stringifyNumbering = (numbering) => (
// remove tail zeros brefore join
numbering.reduceRight((acc, n) => {
    if (acc.length === 0 && n === 0) {
        return [];
    }
    return [Math.max(1, n), ...acc];
}, []).join('-'));
export const convertInnerHeadingToHeading = (inner) => {
    const { id, text, depth, children: innerChildren } = inner;
    const hasChild = innerChildren.length !== 0;
    if (hasChild) {
        const children = innerChildren.map((child) => (convertInnerHeadingToHeading(child)));
        const heading = { id, text, depth, children };
        return heading;
    }
    else {
        const heading = { id, text, depth };
        return heading;
    }
};
export const extractHeadings = (tree) => {
    let numbering = [0, 0, 0, 0, 0, 0];
    const headings = [];
    let stack = [];
    visit(tree, 'element', (node) => {
        const depth = headingRank(node);
        if (typeof depth === 'number') {
            numbering = incrementNumbering(numbering, depth);
            const text = toString(node);
            // @ts-ignore
            const props = node.properties ?? (node.properties = {});
            const hasId = props.hasOwnProperty('id');
            const id = hasId
                ? props.id
                : stringifyNumbering(numbering);
            if (!hasId) {
                props.id = id;
            }
            const children = [];
            const heading = { id, text, depth, children };
            stack = stack.slice(0, depth - 1);
            const parent = stack.length === 0
                ? headings
                : stack[stack.length - 1].children;
            parent.push(heading);
            stack = [...stack, heading];
        }
    });
    return headings.map((inner) => (convertInnerHeadingToHeading(inner)));
};
export const rehypeExtractHeadings = () => ((node, file) => {
    file.data.headings = extractHeadings(node);
});

import { Node } from 'unist';
import { VFileWithOutput } from 'unified';
export declare type Heading = {
    id: string;
    text: string;
    depth: number;
    children?: Heading[];
};
export declare type InnerHeading = {
    id: string;
    text: string;
    depth: number;
    children: InnerHeading[];
};
export declare const incrementNumbering: (numbering: number[], depth: number) => number[];
export declare const stringifyNumbering: (numbering: number[]) => string;
export declare const convertInnerHeadingToHeading: (inner: InnerHeading) => Heading;
export declare const extractHeadings: (tree: Node) => Heading[];
export declare const rehypeExtractHeadings: () => (node: Node, file: VFileWithOutput<any>) => void;

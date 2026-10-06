import type { Renderer } from './index'
import { SVG_NS, svgTree, type SvgNode } from './svg-tree'

function build(doc: Document, { tag, attrs, children }: SvgNode): SVGElement {
    const element = doc.createElementNS(SVG_NS, tag)
    for (const name of Object.keys(attrs)) element.setAttribute(name, attrs[name]!)
    for (const child of children) element.appendChild(build(doc, child))
    return element
}

/**
 * Render an inline `<svg>` element and append it to `target`.
 * Nodes are created with `createElementNS` in the target's own document,
 * so no markup is ever parsed.
 */
export function dom(target: Element): Renderer<SVGSVGElement> {
    return model => {
        const element = build(target.ownerDocument, svgTree(model)) as SVGSVGElement
        target.appendChild(element)
        return element
    }
}

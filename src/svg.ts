import type { Renderer } from './index'
import { SVG_NS, svgTree, type SvgNode } from './svg-tree'

function escapeAttr(value: string): string {
    return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
}

function serialize({ tag, attrs, children }: SvgNode): string {
    const attributes = Object.keys(attrs).map(name => ` ${name}="${escapeAttr(attrs[name]!)}"`).join('')
    return children.length
        ? `<${tag}${attributes}>${children.map(serialize).join('')}</${tag}>`
        : `<${tag}${attributes}/>`
}

/** Render to an SVG markup string. */
export function svg(): Renderer<string> {
    return model => {
        const root = svgTree(model)
        return serialize({ ...root, attrs: { xmlns: SVG_NS, ...root.attrs } })
    }
}

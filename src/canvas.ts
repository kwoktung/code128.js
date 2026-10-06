import type { Renderer } from './index'

/**
 * The subset of `CanvasRenderingContext2D` the renderer uses, so browser
 * canvas, node-canvas and react-native-canvas contexts all fit without
 * requiring the DOM type library.
 */
export interface CanvasContext {
    fillStyle: string | object
    fillRect(x: number, y: number, width: number, height: number): void
    save(): void
    restore(): void
}

/** Draw onto a canvas 2D context, at its current origin. */
export function canvas(context: CanvasContext): Renderer<void> {
    return ({ width, height, bars, color, background }) => {
        context.save()
        try {
            if (background) {
                context.fillStyle = background
                context.fillRect(0, 0, width, height)
            }
            context.fillStyle = color
            for (const bar of bars) context.fillRect(bar.x, 0, bar.width, height)
        } finally {
            context.restore()
        }
    }
}

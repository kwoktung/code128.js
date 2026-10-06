import Core from './core'

// Browser entry: adds DOM helpers on top of the environment-agnostic core.
class Code128 extends Core {
    insert(target = document.body, options) {
        const canvas = document.createElement('canvas')
        const { width, height } = this.size(options)
        canvas.width = width
        canvas.height = height
        this.draw(canvas.getContext('2d'), options)
        target.appendChild(canvas)
        return canvas
    }
}

export default Code128

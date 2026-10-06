import ELEMENT_TABLE from './ELEMENT_TABLE'

// Environment-agnostic Code128 encoder. Must not reference `document`,
// `window` or any platform API so it can run in browsers, React Native and Node.

const DEFAULT_OPTIONS = {
    unitWidth: 1,
    height: 50,
    color: '#000',
    background: '#fff'
}

function encode(input) {
    if (!input) throw new Error('Input Required')

    let start = 0;
    let end = 106;
    let elements = [];

    const chars = input.split('')
    if (
        /^[0-9]{1}$/.test(input)
    ) {
        start = 103
        elements = chars.map(item => ELEMENT_TABLE.find(o => o[1] === item))
    } else if (/^[0-9]+$/.test(input) && input.length % 2 === 0) {
        start = 105
        for (let i = 0, len = chars.length; i < len; i += 2) {
            let key = `${chars[i]}${chars[i + 1]}`
            elements.push(ELEMENT_TABLE.find(o => o[3] === key))
        }
    } else if (/^[0-9]+$/.test(input) && input.length % 2 === 1) {
        start = 105
        for (let i = 0, len = chars.length - 1; i < len; i += 2) {
            let key = `${chars[i]}${chars[i + 1]}`
            elements.push(ELEMENT_TABLE.find(o => o[3] === key))
        }
        elements.push(ELEMENT_TABLE[101])
        elements.push(ELEMENT_TABLE.find(o => o[1] === chars[chars.length - 1]))
    } else if (/^[A-Z0-9]+$/.test(input)) {
        start = 103
        elements = chars.map(item => ELEMENT_TABLE.find(o => o[1] === item))
    } else {
        start = 104
        elements = chars.map(item => ELEMENT_TABLE.find(o => o[2] === item))
    }

    let checkSum = 0;
    elements.forEach((item, i) => {
        checkSum += item[0] * (i + 1)
    })
    checkSum += start

    elements.push(ELEMENT_TABLE[checkSum % 103])
    elements.unshift(ELEMENT_TABLE[start])
    elements.push(ELEMENT_TABLE[end])
    return elements
}

// Collapse a bit string into runs of black modules: [{ x, width }] in module units.
function toBars(bits) {
    const bars = []
    for (let i = 0, len = bits.length; i < len; i++) {
        if (bits[i] !== '1') continue
        const x = i
        while (bits[i + 1] === '1') i++
        bars.push({ x, width: i - x + 1 })
    }
    return bars
}

class Code128 {
    constructor(input) {
        this.elements = encode(input)
        this.bits = this.elements.map(item => item[5]).join('')
        this.bars = toBars(this.bits)
    }

    size(options) {
        const { unitWidth, height } = Object.assign({}, DEFAULT_OPTIONS, options)
        return { width: this.bits.length * unitWidth, height }
    }

    // Draw onto any CanvasRenderingContext2D-compatible context
    // (browser canvas, react-native-canvas, node-canvas, ...).
    draw(context, options) {
        const { unitWidth, height, color, background } = Object.assign({}, DEFAULT_OPTIONS, options)
        const { width } = this.size(options)
        context.save()
        try {
            if (background) {
                context.fillStyle = background
                context.fillRect(0, 0, width, height)
            }
            context.fillStyle = color
            this.bars.forEach(bar => {
                context.fillRect(bar.x * unitWidth, 0, bar.width * unitWidth, height)
            })
        } finally {
            context.restore()
        }
    }

    toSVG(options) {
        const { unitWidth, height, color, background } = Object.assign({}, DEFAULT_OPTIONS, options)
        const { width } = this.size(options)
        const rects = this.bars
            .map(bar => `<rect x="${bar.x * unitWidth}" y="0" width="${bar.width * unitWidth}" height="${height}"/>`)
            .join('')
        const bg = background ? `<rect width="100%" height="100%" fill="${background}"/>` : ''
        return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" shape-rendering="crispEdges">${bg}<g fill="${color}">${rects}</g></svg>`
    }
}

export { encode, toBars }
export default Code128

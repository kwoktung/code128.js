import ELEMENT_TABLE from './ELEMENT_TABLE'

class Code128 {
    constructor(input) {
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
        this.elements = elements;
    }

    insert(target = document.body) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        const units = this.elements.map(item => item[5]).join('').split('')
        const uw = 1
        const uh = uw * 50
        canvas.height = uh;
        canvas.width = units.length * 3
        const drawUnit = function (context, i, uw, uh, color) {
            context.save()
            try {
                context.beginPath()
                context.rect(uw * i, 0, uw, uh)
                if (color) {
                    context.fillStyle = color
                }
                context.closePath()
                context.fill()
            } finally {
                context.restore()
            }

        }
        for (let i = 0, len = units.length; i < len; i++) {
            if (+units[i]) {
                drawUnit(context, i, uw, uh, '#000')
            } else {
                drawUnit(context, i, uw, uh, '#fff')
            }
        }
        target.appendChild(canvas)
        return canvas
    }
}

export default Code128
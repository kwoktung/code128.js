import CHARACTERS from './characters'

class Code128 {
    constructor (charactors) {
        if (!charactors) throw new Error('Missing Charactors')

        const canvas = this.canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        const uw = 1
        const uh = uw * 50
        canvas.height = uh;

        let startCodeIndex = 0
        let dataCodes;

        const charUnits = charactors.split('')
        if (/^[0-9]+$/.test(charactors) && charactors.length === 1) {
            startCodeIndex = 103
            dataCodes = charUnits.map(item => CHARACTERS.find(o => o[0] === item))
        }
        else if (/^[0-9]+$/.test(charactors) && charactors.length % 2 === 0) {
            startCodeIndex = 105
            dataCodes = []
            for (let i = 0, len = charUnits.length; i < len; i += 2) {
                let key = `${charUnits[i]}${charUnits[i+1]}`
                dataCodes.push(CHARACTERS.find(o => o[2] === key))
            }
        } else if (/^[0-9]+$/.test(charactors) && charactors.length % 2 === 1) {
            startCodeIndex = 105
            dataCodes = []
            for (let i = 0, len = charUnits.length - 1; i < len; i += 2) {
                let key = `${charUnits[i]}${charUnits[i+1]}`
                dataCodes.push(CHARACTERS.find(o => o[2] === key))
            }
            dataCodes.push(CHARACTERS[101])
            dataCodes.push(CHARACTERS.find(o => o[0] === charUnits[charUnits.length - 1]))
        } else if (/^[A-Z0-9]+$/.test(charactors)) {
            startCodeIndex = 103
            dataCodes = charUnits.map(item => CHARACTERS.find(o => o[0] === item))
        } else {
            startCodeIndex = 104
            dataCodes = charUnits.map(item => CHARACTERS.find(o => o[1] === item))
        }

        let checkSum = 0;
        dataCodes.forEach((item, i) => {
            checkSum += item[5] * (i + 1)
        })
        checkSum += startCodeIndex

        let checkSumCode = checkSum % 103
        
        dataCodes.push(CHARACTERS[checkSumCode])
        dataCodes.unshift(CHARACTERS[startCodeIndex])
        dataCodes.push(CHARACTERS[106])
        console.log(dataCodes)
        
        let elements = dataCodes.map(item => item[4])
        let units = elements.join('').split('')

        this.canvas.width = units.length * 3
        document.body.appendChild(this.canvas)

        function drawUnit(context, i, uw, uh, color) {
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

        for (let i = 0, len = units.length; i < len; i ++) {
            if (+units[i]) {
                drawUnit(context, i, uw, uh, '#000')
            } else {
                drawUnit(context, i, uw, uh, '#fff')
            }
        }
        
    }
}

export default Code128
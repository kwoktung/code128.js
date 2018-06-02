import { findChar,  getCharById } from './characters'

let uuid = 0
function get_uuid() {
    return uuid++
}

function Code128B() {
    this.canvas = document.createElement('canvas')
    this.ctx = this.canvas.getContext('2d')
    this.id = this.canvas.id = get_uuid()
    this.canvas.width = 800;
    this.canvas.height = 200; // width 需要根据 数据来生成
    this.minLen = 3
    this.index = 0
    document.body.appendChild(this.canvas)
}

Code128B.prototype.drawMinSpace = function (color) {
    this.ctx.save()
    try {
        this.ctx.beginPath()
        this.ctx.rect(this.minLen * this.index, 0, this.minLen, this.canvas.height )
        if (color) {
            this.ctx.fillStyle = color
        }
        this.ctx.closePath()
        this.ctx.fill()
    } finally {
        this.index ++
    }
    this.ctx.restore()
}

Code128B.prototype.blackSpace = function() {
    this.drawMinSpace('#000')
}

Code128B.prototype.whiteSpace = function () {
    this.drawMinSpace('#fff')
}

Code128B.prototype.bitsCode = function(str) {
    var array = str.split('')
    array.forEach(element => {
        if (+element) {
            this.blackSpace()
        } else {
            this.whiteSpace()
        }
    });
}

Code128B.prototype.char = function(str) {
    var array = str.split('')
    var arr = array.map(function(item){ return findChar(item) })
    
    var sum = 0
    arr.forEach(function (item, index) {
        console.log(index, item[2])
        sum += item[2] * (index + 1)
    })
    sum += 104
    var code = sum%103
    console.log(code)
    arr.push(getCharById(code))
    arr.unshift(getCharById(104))
    arr.push(getCharById(106))
    
    var arr2 = arr.map(function(item){ return item[4]})
    var arr3 = arr2.join('')
    this.bitsCode(arr3)
}

export default Code128B
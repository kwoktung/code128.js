describe("new Code128 instance", function () {
    it("must have an array property `element`", function () {
        const instance = new Code128('AAAAA');
        expect(Array.isArray(instance.elements)).toBe(true);
    });
});

describe("new Code128('hello code128') instance", function () {
    const instance = new Code128('hello code128');
    it("must havev start code 104", function () {
        expect(instance.elements[0][0]).toBe(104);
    });
    it("must has checkSum 33", function(){
        expect(instance.elements[instance.elements.length -2][0]).toBe(33)
    })
    it("must has code string", function() {
        expect(instance.elements.map(o => o[5]).join('')).toBe('1101001000010011000010101100100001100101000011001010000100011110101101100110010000101100100011110101000010011010110010000100111001101100111001011101001100101000110001100011101011')
    })
});

describe("new Code128('AAA9') instance", function() {
    const instance = new Code128('AAA9');
    it("must havev start code 103", function () {
        expect(instance.elements[0][0]).toBe(103);
    });
    it("must has checkSum 92", function(){
        expect(instance.elements[instance.elements.length -2][0]).toBe(92)
    })
    it("must has code string", function() {
        expect(instance.elements.map(o => o[5]).join('')).toBe('1101000010010100011000101000110001010001100011100101100101011110001100011101011')
    })
})

describe("new Code128('1234') instance", function() {
    const instance = new Code128('1234');
    it("must havev start code 105", function () {
        expect(instance.elements[0][0]).toBe(105);
    });
    it("must has checkSum 82", function(){
        expect(instance.elements[instance.elements.length -2][0]).toBe(82)
    })
    it("must has code string", function() {
        expect(instance.elements.map(o => o[5]).join('')).toBe('110100111001011001110010001011000100100111101100011101011')
    })
})

describe("new Code128('12345') instance", function() {
    const instance = new Code128('12345');
    it("must havev start code 105", function () {
        expect(instance.elements[0][0]).toBe(105);
    });
    it("must has checkSum 57", function(){
        expect(instance.elements[instance.elements.length -2][0]).toBe(57)
    })
    it("must has code string", function() {
        expect(instance.elements.map(o => o[5]).join('')).toBe('1101001110010110011100100010110001110101111011011100100111011010001100011101011')
    })
})
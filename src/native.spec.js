const Module = require('module')

describe("native build", function () {
    let native;
    beforeAll(function () {
        const createElement = (type, props, children) => ({ type, props, children });
        const stubs = {
            'react': { createElement, useMemo: fn => fn(), default: undefined },
            'react-native': { View: 'View' }
        };
        stubs.react.default = stubs.react;
        const load = Module._load;
        Module._load = function (request) {
            return stubs[request] || load.apply(this, arguments);
        };
        try {
            native = require('../dist/native');
        } finally {
            Module._load = load;
        }
    });

    it("must export the core class", function () {
        expect(new native.default('1234').bits).toBe(new Code128('1234').bits);
    });

    it("must render one View per bar", function () {
        const el = native.Barcode({ value: '1234', unitWidth: 3, height: 40 });
        const code = new native.default('1234');
        expect(el.type).toBe('View');
        expect(el.props.style[0]).toEqual({ width: code.bits.length * 3, height: 40, backgroundColor: '#fff' });
        expect(el.children.length).toBe(code.bars.length);
        expect(el.children[0].props.style.left).toBe(code.bars[0].x * 3);
    });
});

const { default: Core, toBars } = require('../dist/core')

describe("core (environment-agnostic)", function () {
    it("must not depend on the DOM", function () {
        expect(typeof document).toBe('undefined');
        expect(() => new Core('hello')).not.toThrow();
    });

    it("must produce the same bits as the browser build", function () {
        expect(new Core('1234').bits).toBe(new Code128('1234').bits);
    });

    it("must collapse bits into bars", function () {
        expect(toBars('1101001')).toEqual([{ x: 0, width: 2 }, { x: 3, width: 1 }, { x: 6, width: 1 }]);
    });

    it("must report size from options", function () {
        const code = new Core('1234');
        expect(code.size({ unitWidth: 2, height: 30 })).toEqual({ width: code.bits.length * 2, height: 30 });
    });

    it("must draw bars on a canvas-like context", function () {
        const calls = [];
        const ctx = {
            save() {}, restore() {},
            fillRect(x, y, w, h) { calls.push([this.fillStyle, x, y, w, h]); }
        };
        const code = new Core('1234');
        code.draw(ctx, { unitWidth: 2, height: 10 });
        expect(calls[0]).toEqual(['#fff', 0, 0, code.bits.length * 2, 10]);
        expect(calls.slice(1)).toEqual(code.bars.map(b => ['#000', b.x * 2, 0, b.width * 2, 10]));
    });

    it("must render an svg string", function () {
        const code = new Core('1234');
        const svg = code.toSVG({ height: 20 });
        expect(svg).toContain(`width="${code.bits.length}" height="20"`);
        expect((svg.match(/<rect /g) || []).length).toBe(code.bars.length + 1);
    });
});

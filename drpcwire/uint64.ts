const mask = 0xffffffff;
const bitsInBlock = 32;

/**
 * uint64 is a pure-JavaScript implementation of a uint64. Since JavaScript numbers are 64-bit floating point
 * numbers, we wouldn't be able to store the full spectrum of uint64 without some loss of precision. This
 * upper limit for a number is somewhere around (2 ^ 53) - 1.
 *
 * As you might guess, there are a handful of libraries out there that I could've used. I chose to write my
 * own for a few reasons.
 *   - many uint64 implementations call into C which can complicate things on the browser
 *   - trying to sift through dozens of libraries looking for a pure javascript implementation didn't seem
 *     like the best use of time.
 *   - there were other immutability guarantees I wanted to ensure and that added another thing to the list
 *     look for.
 *
 * <code>
 *     const mask = uint64.new(1).shiftLeft(32).subtract(1)
 *
 *     // yields ffffffff00000000
 *     const highBits = uint64.MAX_VALUE.and(mask)
 * </code>
 *
 * This is currently a partial implementation and only provides the methods needed by the drpc.
 */
export default class uint64 {
    static get MAX_VALUE(): uint64 {
        return new uint64(mask, mask);
    }

    static new(val: number | uint64): uint64 {
        let low, high;

        if (typeof val == "number") {
            const hex = val.toString(16);
            const minorStart = Math.max(0, hex.length - 8);
            const majorStart = Math.max(0, minorStart - 8);

            low = parseInt(hex.substring(minorStart), 16) >>> 0;
            high = parseInt(hex.substring(majorStart, minorStart), 16) >>> 0;
        } else {
            const v = (val as uint64);
            low = v.low;
            high = v.high;
        }

        return new uint64(low, high);
    }

    private readonly _high: number
    private readonly _low: number

    private constructor(low: number, high?: number) {
        this._low = (mask & low) >>> 0;
        this._high = (mask & (high ? high : 0)) >>> 0;
    }

    get high(): number {
        return this._high;
    }

    get low(): number {
        return this._low;
    }

    and(other: uint64): uint64 {
        return new uint64(
            this._low & other._low,
            this._high & other._high,
        );
    }

    or(other: uint64): uint64 {
        return new uint64(
            this._low | other._low,
            this._high | other._high,
        );
    }

    leftShift(bits: number): uint64 {
        if (bits <= 0) {
            return this;
        } else if (bits >= 64) {
            return new uint64(0, 0);
        }

        const bitShifts = bits % bitsInBlock;
        if (bits >= bitsInBlock) {
            return new uint64(0, this._low << bitShifts);
        }

        const caryBits = this._low >>> (bitsInBlock - bitShifts);
        return new uint64(
            this._low << bitShifts,
            (this._high << bitShifts) | caryBits,
        );
    }

    rightShift(bits: number): uint64 {
        if (bits <= 0) {
            return this;
        } else if (bits >= 64) {
            return new uint64(0, 0);
        }

        const bitShifts = bits % bitsInBlock;
        if (bits >= bitsInBlock) {
            return new uint64(this._high >>> bitShifts, 0);
        }

        const caryMask = Math.pow(2, bits) - 1;
        const caryBits = (this._high & caryMask) << (bitsInBlock - bitShifts);

        return new uint64(
            (this._low >>> bitShifts) | caryBits,
            this._high >>> bitShifts,
        );
    }

    add(x: number): uint64 {
        if (x < 0) {
            return this.subtract(Math.abs(x));
        }

        let low = this._low + x;
        const high = this._high;
        const cary = Math.max(0, low - mask);

        if (low > mask) {
            low &= mask;
        }

        return new uint64(low, high + cary);
    }

    subtract(x: number): uint64 {
        if (x < 0) {
            return this.add(Math.abs(x));
        } else if (this._low < x && this._high == 0) {
            return new uint64(0, 0);
        }

        let low = this._low - x;
        let high = this._high;

        if (low < 0) {
            low = mask + (low + 1);
            high--;
        }

        return new uint64(low, high);
    }

    divide(x: number): uint64 {
        const rem = this._high % x;
        const low = this._low + (rem * (mask + 1));

        return new uint64(
            Math.floor(low / x),
            Math.floor(this._high / x),
        );
    }

    mod(x: number): number {
        const rem = this._high % x;
        const low = this._low + (rem * (mask + 1));
        return low % x;
    }

    greaterThan(other: uint64): boolean {
        const majorDelta = this._high - other._high;
        const minorDelta = this._low - other._low;

        if (majorDelta != 0) {
            return majorDelta > 0;
        }

        return minorDelta > 0;
    }

    lessThan(other: uint64): boolean {
        const majorDelta = this._high - other._high;
        const minorDelta = this._low - other._low;

        if (majorDelta != 0) {
            return majorDelta < 0;
        }

        return minorDelta < 0;
    }

    equals(other: uint64): boolean {
        return this._high == other._high &&
            this._low == other._low;
    }

    valueOf(): number {
        return parseInt(this.toString(16), 16);
    }

    toString(radix?: number): string {
        radix = radix ? radix : 10;

        if (radix < 2 || radix > 36) {
            throw new Error("radix must be between 2 and 36");
        }

        return toString(this, radix);
    }
}

function toString(v: uint64, base: number): string {
    if (v.high == 0 && v.low == 0) {
        return "0";
    }

    let i = 0;
    const out = new Array(72).fill(null);

    while (v.high > 0 || v.low > 0) {
        const rem = v.mod(base);
        if (rem < 10) {
            out[i] = String.fromCharCode("0".charCodeAt(0) + rem);
        } else {
            out[i] = String.fromCharCode("a".charCodeAt(0) + (rem - 10));
        }

        i++;
        v = v.divide(base);
    }

    return out.slice(0, i).reverse().join("");
}

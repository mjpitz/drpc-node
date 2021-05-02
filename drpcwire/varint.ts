import uint64 from "./uint64";

export const readVarint = (buffer: Buffer): [Buffer, uint64] => {
    let rem = buffer;

    let out = uint64.new(0);

    for (let shift = 0; shift < 64; shift += 7) {
        if (rem.length == 0) {
            throw new Error("unexpected end of buffer");
        }

        const val = rem.readUInt8(0);
        out = out.or(uint64.new(val & 127).leftShift(shift));
        rem = rem.slice(1);

        if (val < 128) {
            return [rem, out];
        }
    }

    throw new Error("varint too long");
};

export const appendVarint = (buf: Buffer, i: uint64): Buffer => {
    const encoded: number[] = [];

    let x = uint64.new(i);
    const last = uint64.new(128);

    while (x.greaterThan(last) || x.equals(last)) {
        encoded.push(x.low & 127 | 128);
        x = x.rightShift(7);
    }
    encoded.push(x.valueOf());

    return append(buf, ...encoded);
};

function append(a: Buffer, ...b: number[]): Buffer {
    const c = Buffer.alloc(a.length + b.length);
    c.set(a, 0);
    c.set(b, a?.length);
    return c;
}

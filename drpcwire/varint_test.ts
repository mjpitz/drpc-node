import {readVarint, appendVarint} from "./varint";

import uint64 from "./uint64";

function runner(i: number, val: uint64): () => void {
    return () => {
        const buf = appendVarint(Buffer.alloc(0), val);
        expect(buf.length).toEqual(Math.floor(i / 7) + 1);

        const [remaining, read] = readVarint(buf);
        expect(buf.length).toEqual(Math.floor(i / 7) + 1);
        expect(remaining.length).toEqual(0);

        expect(read.toString()).toEqual(val.toString());
    };
}

describe("varint", () => {
    for (let i = 0; i < 63; i++) {
        let val = uint64.new(1).leftShift(i + 1).subtract(1);

        test(`round trip (${i} bits)`, runner(i, val));
    }

    test("round trip (64 bits)", runner(64, uint64.MAX_VALUE));
});

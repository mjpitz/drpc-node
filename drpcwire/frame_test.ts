import uint64 from "./uint64";
import Frame from "./frame";
import Kind from "./kind";
import ID from "./id";

describe("frame", () => {
    test("round trip (message)", () => {
        let frame = new Frame({
            data: Buffer.alloc("hello world!".length, "hello world!", "ascii"),
            id: new ID({
                stream: uint64.new(Number.MAX_SAFE_INTEGER),
                message: uint64.new(Number.MAX_SAFE_INTEGER),
            }),
            kind: Kind.MESSAGE,
            done: false,
            control: false,
        });

        let buf = Frame.appendToBuffer(frame, null)
        expect(buf.length).toEqual(30)
        expect(buf.toString("hex")).toEqual("04ffffffffffffff0fffffffffffffff0f0c68656c6c6f20776f726c6421")

        let [ rem, read ] = Frame.fromBuffer(buf)
        expect(rem.length).toEqual(0)

        expect(read.data.toString("ascii")).toEqual("hello world!")
        expect(read.id.stream.equals(frame.id.stream)).toBeTruthy()
        expect(read.id.message.equals(frame.id.message)).toBeTruthy()
        expect(read.kind.toString()).toEqual(frame.kind.toString())
        expect(read.kind.valueOf()).toEqual(frame.kind.valueOf())
        expect(read.done.toString()).toEqual(frame.done.toString())
        expect(read.control.toString()).toEqual(frame.control.toString())
    });

    test("round trip (close)", () => {
        let frame = new Frame({
            data: null,
            id: new ID({
                stream: uint64.new(Number.MAX_SAFE_INTEGER),
                message: uint64.new(Number.MAX_SAFE_INTEGER),
            }),
            kind: Kind.CLOSE,
            done: true,
            control: true,
        });

        let buf = Frame.appendToBuffer(frame, null)
        expect(buf.length).toEqual(18)
        expect(buf.toString("hex")).toEqual("8bffffffffffffff0fffffffffffffff0f00")


        let [ rem, read ] = Frame.fromBuffer(buf)
        expect(rem.length).toEqual(0)

        expect(read.data.length).toBe(0)
        expect(read.id.stream.equals(frame.id.stream)).toBeTruthy()
        expect(read.id.message.equals(frame.id.message)).toBeTruthy()
        expect(read.kind.toString()).toEqual(frame.kind.toString())
        expect(read.kind.valueOf()).toEqual(frame.kind.valueOf())
        expect(read.done.toString()).toEqual(frame.done.toString())
        expect(read.control.toString()).toEqual(frame.control.toString())
    });
});

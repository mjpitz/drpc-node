import splitPacket from "./split";
import Packet from "./packet";
import ID from "./id";
import uint64 from "./uint64";
import Kind from "./kind";
import Frame from "./frame";

describe("splitPacket", () => {
    test("no split", () => {
        let packet = new Packet({
            data: Buffer.from("hello world!", "ascii"),
            id: new ID({
                stream: uint64.new(Number.MAX_SAFE_INTEGER),
                message: uint64.new(Number.MAX_SAFE_INTEGER),
            }),
            kind: Kind.INVOKE,
        });

        splitPacket(packet, -1, (frame: Frame) => {
            expect(frame.data.toString("ascii")).toEqual("hello world!");
            expect(frame.id.stream.equals(packet.id.stream)).toBeTruthy();
            expect(frame.id.message.equals(packet.id.message)).toBeTruthy();
            expect(frame.kind).toEqual(packet.kind);
            expect(frame.control).toEqual(false);
            expect(frame.done).toEqual(true);
        });
    });

    test("default split", () => {
        let packet = new Packet({
            data: Buffer.from("hello world!", "ascii"),
            id: new ID({
                stream: uint64.new(Number.MAX_SAFE_INTEGER),
                message: uint64.new(Number.MAX_SAFE_INTEGER),
            }),
            kind: Kind.INVOKE,
        });

        splitPacket(packet, 0, (frame: Frame) => {
            expect(frame.data.toString("ascii")).toEqual("hello world!");
            expect(frame.id.stream.equals(packet.id.stream)).toBeTruthy();
            expect(frame.id.message.equals(packet.id.message)).toBeTruthy();
            expect(frame.kind).toEqual(packet.kind);
            expect(frame.control).toEqual(false);
            expect(frame.done).toEqual(true);
        });
    });

    test("split", () => {
        let packet = new Packet({
            data: Buffer.from("hello world!", "ascii"),
            id: new ID({
                stream: uint64.new(Number.MAX_SAFE_INTEGER),
                message: uint64.new(Number.MAX_SAFE_INTEGER),
            }),
            kind: Kind.INVOKE,
        });

        let i = 0;
        const expectedFrames = [
            new Frame({
                data: Buffer.from("hello ", "ascii"),
                id: new ID({
                    stream: uint64.new(Number.MAX_SAFE_INTEGER),
                    message: uint64.new(Number.MAX_SAFE_INTEGER),
                }),
                kind: Kind.INVOKE,
            }),
            new Frame({
                data: Buffer.from("world!", "ascii"),
                id: new ID({
                    stream: uint64.new(Number.MAX_SAFE_INTEGER),
                    message: uint64.new(Number.MAX_SAFE_INTEGER),
                }),
                kind: Kind.INVOKE,
                done: true,
            }),
        ];

        splitPacket(packet, "hello world!".length / 2, (frame: Frame) => {
            let expectedFrame = expectedFrames[i];
            expect(frame.data.toString("ascii")).toEqual(expectedFrame.data.toString("ascii"));
            expect(frame.id.stream.equals(expectedFrame.id.stream)).toBeTruthy();
            expect(frame.id.message.equals(expectedFrame.id.message)).toBeTruthy();
            expect(frame.kind).toEqual(expectedFrame.kind);
            expect(frame.control).toEqual(expectedFrame.control);
            expect(frame.done).toEqual(expectedFrame.done);
            i++;
        });
    });
});
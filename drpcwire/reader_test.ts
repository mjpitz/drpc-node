import Frame from "./frame";
import ID from "./id";
import uint64 from "./uint64";
import Kind from "./kind";
import {Readable} from "stream";
import Packet from "./packet";
import Reader from "./reader";
import DoneCallback = jest.DoneCallback;

describe("reader", () => {
    test("read packet", (done: DoneCallback) => {
        const expectedFrames = [
            new Frame({
                data: Buffer.alloc("hello ".length, "hello ", "ascii"),
                id: new ID({
                    stream: uint64.new(Number.MAX_SAFE_INTEGER),
                    message: uint64.new(Number.MAX_SAFE_INTEGER),
                }),
                kind: Kind.INVOKE,
            }),
            new Frame({
                data: Buffer.alloc("world!".length, "world!", "ascii"),
                id: new ID({
                    stream: uint64.new(Number.MAX_SAFE_INTEGER),
                    message: uint64.new(Number.MAX_SAFE_INTEGER),
                }),
                kind: Kind.INVOKE,
                done: true,
            }),
        ];

        let buffer = Buffer.alloc(0);

        expectedFrames.forEach((frame: Frame) => {
            buffer = Frame.appendToBuffer(frame, buffer);
        });

        const readable = Readable.from(buffer);
        const reader = new Reader({ readable: readable });

        reader.on("packet", (packet: Packet) => {
            expect(packet.data.toString("ascii")).toEqual("hello world!");
            expect(packet.id.stream.valueOf()).toEqual(Number.MAX_SAFE_INTEGER);
            expect(packet.id.message.valueOf()).toEqual(Number.MAX_SAFE_INTEGER);
            expect(packet.kind.valueOf()).toEqual(Kind.INVOKE.valueOf());
            expect(packet.kind.toString()).toEqual(Kind.INVOKE.toString());

            readable.emit("close");
        });

        reader.on("close", done);
    });
});

import {Readable, Writable} from "stream";
import Writer from "./writer";
import Packet from "./packet";
import ID from "./id";
import uint64 from "./uint64";
import Kind from "./kind";
import DoneCallback = jest.DoneCallback;
import Reader from "./reader";

describe("writer", () => {
    test("write packet", (done: DoneCallback) => {
        let buffer = Buffer.alloc(0);

        let writer = new Writer({
            writable: new Writable({
                write(chunk: any, encoding: BufferEncoding, callback: (error?: (Error | null)) => void) {
                    try {
                        let next = Buffer.alloc(buffer.length + chunk.length);
                        next.set(buffer, 0);
                        next.set(chunk, buffer.length);
                        buffer = next;
                        callback(null);
                    } catch (err) {
                        callback(err);
                    }
                },
            })
        });

        writer.emit("packet", new Packet({
            data: Buffer.alloc("hello world!".length, "hello world!", "ascii"),
            id: new ID({
                stream: uint64.new(Number.MAX_SAFE_INTEGER),
                message: uint64.new(Number.MAX_SAFE_INTEGER),
            }),
            kind: Kind.INVOKE,
        }));

        writer.end();

        expect(buffer.length).toEqual(30);

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
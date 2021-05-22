import Stream from "./stream";
import Writer from "../drpcwire/writer";
import {Writable} from "stream";
import uint64 from "../drpcwire/uint64";
import Channel from "./channel";
import Packet from "../drpcwire/packet";
import ID from "../drpcwire/id";
import Kind from "../drpcwire/kind";
import {ErrorWithCode, ProtocolError} from "../errors";
import {encodeError} from "../drpcwire/error";

function newStream(): [Channel<Buffer>, Stream] {
    const writer = new Writer({writable: new Writable()});
    const id = uint64.new(0);

    const channel = new Channel<Buffer>();
    const stream = new Stream({writer, id, opts: {}});
    stream.on("message", (message: Buffer) => {
        channel.push(message);
    });

    return [channel, stream];
}

function newPacket(kind: Kind, data: Buffer): Packet {
    return new Packet({
        data: data,
        id: new ID({
            stream: uint64.new(0),
            message: uint64.new(0),
        }),
        kind: kind,
    });
}

describe("stream", () => {
    test("open --> terminated --> finished", () => {
        const [, stream] = newStream();
        stream.end(null);
    });

    test("open -- invoke --> terminated --> finished", (done) => {
        const [, stream] = newStream();

        stream.on("close", (err: Error) => {
            expect(err).not.toBeNull();
            expect(err instanceof ProtocolError).toBeTruthy();
            expect(err.message).toEqual("invoke on existing stream");
            done();
        });

        stream.handlePacket(newPacket(Kind.INVOKE, Buffer.alloc(0)));
    });

    test("open -- recv --> open", async () => {
        const [channel, stream] = newStream();

        stream.handlePacket(newPacket(Kind.MESSAGE, Buffer.from("hello world!", "ascii")));

        const message = await channel.poll();

        expect(message.toString("ascii")).toEqual("hello world!");
    });

    test("open --> recv-closed", (done) => {
        const [, stream] = newStream();

        stream.on("close", (err: Error) => {
            expect(err).not.toBeNull();
            expect(err instanceof ErrorWithCode).toBeTruthy();

            let codeErr = err as ErrorWithCode;
            expect(codeErr.code.high).toEqual(0);
            expect(codeErr.code.low).toEqual(400);
            expect(codeErr.message).toEqual("something failed");

            done();
        });

        let err = new ErrorWithCode(400, "something failed");
        stream.handlePacket(newPacket(Kind.ERROR, encodeError(err)));
    });

    test("open -- close --> terminated --> finished", (done) => {
        const [, stream] = newStream();

        stream.on("close", (err: Error) => {
            expect(err).not.toBeNull();
            expect(err.message).toEqual("stream terminated by sending close");
            done();
        });

        stream.handlePacket(newPacket(Kind.CLOSE, Buffer.alloc(0)));
    });

    test("open -- close_send --> terminated --> finished", () => {
        const [channel, stream] = newStream();

        stream.handlePacket(newPacket(Kind.CLOSE_SEND, Buffer.alloc(0)));

        // now we shouldn't receive any new messages
        stream.handlePacket(newPacket(Kind.MESSAGE, Buffer.from("hello world!", "ascii")));
        expect(channel.length).toEqual(0);
    });
});

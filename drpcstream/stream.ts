import Packet from "../drpcwire/packet";
import Kind from "../drpcwire/kind";
import ID from "../drpcwire/id";
import Writer from "../drpcwire/writer";
import split from "../drpcwire/split";
import Frame from "../drpcwire/frame";
import {InternalError, ProtocolError} from "../errors";
import Signal from "./signal";
import Channel from "./channel";
import {Message} from "../drpc";
import Encoder from "../drpcenc/encoder";

interface Options {
    splitSize: number
}

interface StreamProps {
    writer: Writer
    id: ID
    opts?: Options
}

interface Signals {
    send: Signal
    recv: Signal
    term: Signal
    fin: Signal
    cancel: Signal
}

const sendClosed = new Error("send closed");
const endErr = new Error("stream terminated by sending error");
const endClosed = new Error("stream terminated by sending close");
const endBothClosed = new Error("stream terminated by both issuing close send");

/**
 * Stream represents an RPC actively happening on a transport.
 */
export default class Stream {
    private readonly opts: Options

    private writeCount: number
    private readCount: number

    private readonly id: ID
    private readonly writer: Writer
    private readonly signals: Signals

    private readonly queue: Channel<Packet>

    public constructor({writer, id, opts}: StreamProps) {
        this.opts = opts || {splitSize: 0};

        this.writeCount = 0;
        this.readCount = 0;

        this.id = id;
        this.writer = writer;

        this.signals = {
            send: new Signal(),
            recv: new Signal(),
            term: new Signal(),
            fin: new Signal(),
            cancel: new Signal(),
        };

        this.queue = new Channel<Packet>();
    }

    handlePacket(packet: Packet): boolean {
        let err: Error;
        switch (packet.kind) {
            case Kind.INVOKE:
                err = new ProtocolError("invoke on existing stream");
                this.end(err);
                throw err;

            case Kind.MESSAGE:
                if (this.signals.recv.isSet() || this.signals.term.isSet()) {
                    return true;
                }

                this.queue.push(packet);
                return true;

            case Kind.ERROR:
                // unmarshal
                this.signals.send.set(new Error("eof"));
                // end
                return false;

            case Kind.CLOSE:
                this.signals.recv.set(new Error("eof"));
                this.end(new Error("remote closed the stream"));
                return false;

            case Kind.CLOSE_SEND:
                this.signals.recv.set(new Error("eof"));
                this.endIfBothClosed();
                return false;

            default:
                err = new InternalError(`unknown packet kind ${packet.kind.toString()}`);
                this.end(err);
                throw err;
        }
    }

    //
    // helpers
    //

    private newPacket(kind: Kind, data: Buffer) {
        this.id.message = this.id.message.add(1);

        return new Packet({
            data,
            id: new ID({
                stream: this.id.stream,
                message: this.id.message,
            }),
            kind,
        });
    }

    private checkFinished() {
        if (this.signals.term.isSet() && this.writeCount == 0 && this.readCount == 0) {
            this.signals.fin.set();
        }
    }

    private endIfBothClosed() {
        if (this.signals.send.isSet() && this.signals.recv.isSet()) {
            this.end(endBothClosed);
        }
    }

    end(err?: Error) {
        this.signals.send.set(err);
        this.signals.recv.set(err);
        this.signals.term.set(err);
        this.checkFinished();
    }

    //
    // raw read/write
    //

    async rawWrite(kind: Kind, data: Buffer): Promise<void> {
        this.writeCount++;
        try {
            let promises: Array<Promise<void>> = [];

            split(this.newPacket(kind, data), this.opts.splitSize, (frame: Frame) => {
                let err: Error;
                if (this.signals.send.isSet()) {
                    err = this.signals.send.get();
                    if (err) {
                        throw err;
                    }
                    return;
                } else if (this.signals.term.isSet()) {
                    err = this.signals.term.get();
                    if (err) {
                        throw err;
                    }
                    return;
                }

                promises.push(this.writer.writeFrame(frame));
            });

            await Promise.all(promises);

        } finally {
            this.writeCount--;
            this.checkFinished();
        }
    }

    async rawRecv(): Promise<Buffer> {
        this.readCount++;
        try {
            if (this.signals.recv.isSet()) {
                let err = this.signals.recv.get();
                if (err) {
                    throw err;
                }
                return;
            }

            let packet = await this.queue.poll();

            return packet.data;

        } finally {
            this.readCount--;
            this.checkFinished();
        }
    }

    // msg read/write

    msgSend(msg: Message, enc: Encoder): Promise<void> {
        return this.rawWrite(Kind.MESSAGE, enc.marshal(msg));
    }

    async msgRecv<T>(msg: T, enc: Encoder): Promise<T> {
        let buffer = await this.rawRecv();
        return enc.unmarshal(buffer, msg);
    }
}

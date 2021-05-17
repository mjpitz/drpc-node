import Packet from "../drpcwire/packet";
import Kind from "../drpcwire/kind";
import ID from "../drpcwire/id";
import Writer from "../drpcwire/writer";
import split from "../drpcwire/split";
import Frame from "../drpcwire/frame";
import {InternalError, ProtocolError} from "../errors";
import uint64 from "../drpcwire/uint64";
import {EventEmitter} from "events";
import {parseError} from "../drpcwire/error";

// State defines a given state that a stream can exist in.
type State = number

// States is an enumeration of all the states that a stream can exist in.
const States: { [key: string]: State } = {
    OPEN: 0,
    SEND_CLOSED: 1,
    RECV_CLOSED: 2,
    TERMINATED: 3,
    CANCELLED: 4,
    FINISHED: 5,
};

interface StreamOpts {
    splitSize?: number
}

interface StreamProps {
    writer: Writer
    id: uint64
    opts?: StreamOpts
}

const sendClosed = new Error("send closed");
const endErr = new Error("stream terminated by sending error");
const endClosed = new Error("stream terminated by sending close");
const endBothClosed = new Error("stream terminated by both issuing close send");

/**
 * Stream represents an RPC actively happening on a transport.
 */
export default class Stream extends EventEmitter {
    private readonly opts: StreamOpts

    private writeCount: number

    private readonly id: ID
    private readonly writer: Writer

    private currentState: State
    private err?: Error

    public constructor({writer, id, opts}: StreamProps) {
        super();

        this.opts = opts || {splitSize: 0};

        this.writeCount = 0;

        this.id = new ID({
            stream: id,
            message: uint64.new(0),
        });
        this.writer = writer;

        this.currentState = States.OPEN;
    }

    handlePacket(packet: Packet) {
        if (this.currentState >= States.TERMINATED) {
            // terminated / cancelled / finished
            return;
        }

        switch (packet.kind) {
            case Kind.INVOKE:
                let err = new ProtocolError("invoke on existing stream");
                this.end(err);
                return;

            case Kind.MESSAGE:
                if (this.currentState == States.RECV_CLOSED) {
                    return;
                }

                this.emit("message", packet.data);
                return;

            case Kind.ERROR:
                this.end(parseError(packet.data));
                return;

            case Kind.CLOSE:
                this.end(endClosed);
                return;

            case Kind.CLOSE_SEND:
                if (this.currentState == States.SEND_CLOSED) {
                    this.end(endBothClosed);
                } else {
                    this.currentState = States.RECV_CLOSED;
                }

                return;

            default:
                this.end(new InternalError(`unknown packet kind ${packet.kind.toString()}`));
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
        if (this.currentState == States.TERMINATED && this.writeCount == 0) {
            this.currentState = States.FINISHED;
            this.emit("close", this.err);
        }
    }

    end(err?: Error) {
        this.currentState = States.TERMINATED;
        this.err = this.err ? this.err : err;
        this.checkFinished();
    }

    //
    // raw read/write
    //

    async write(kind: Kind, data: Buffer): Promise<void> {
        if (this.currentState >= States.TERMINATED) {
            if (this.err) {
                throw this.err;
            }

            // terminated / cancelled / finished
            return;
        } else if (this.currentState == States.SEND_CLOSED) {
            throw sendClosed;
        }

        this.writeCount++;
        try {
            let promises: Array<Promise<void>> = [];

            split(this.newPacket(kind, data), this.opts.splitSize, (frame: Frame) => {
                promises.push(this.writer.writeFrame(frame));
            });

            await Promise.all(promises);

        } finally {
            this.writeCount--;
            this.checkFinished();
        }
    }
}

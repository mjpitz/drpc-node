import Reader from "../drpcwire/reader";
import Writer from "../drpcwire/writer";
import Packet from "../drpcwire/packet";
import Stream from "./stream";
import Kind from "../drpcwire/kind";
import {ProtocolError} from "../errors";
import {Duplex} from "stream";
import {EventEmitter} from "events";
import uint64 from "../drpcwire/uint64";

interface SocketProps {
    socket: Duplex
}

interface NewClientStreamParams {
}

/**
 * In NodeJS, Sockets are created when a client dials a server, or a server accepts a new connection. This Socket
 * wraps an underlying Duplex stream (i.e. something like a net.Socket) and spawns {@link Stream} instances on method
 * invocation.
 *
 * <code>
 *    const socket = new Socket({ socket });
 *
 *    // EXAMPLE SERVER USAGE
 *
 *    socket.on("stream", (stream: Stream) => {
 *      stream.on("message", (data: MessageType) => {
 *        // ...
 *      });
 *
 *      stream.on("close", (err: Err) => {
 *        // ...
 *      });
 *    });
 *
 *    // EXAMPLE CLIENT USAGE
 *
 *    const queue = new Channel<Buffer>();
 *
 *    const stream = socket.newClientStream(info_for_invoke);
 *    stream.on("message", (resp: Buffer) => {
 *        queue.push(resp);
 *    })
 *
 *    // once invoked, send messages
 *    await stream.write(Kind.MESSAGE, Buffer.from("hello world!", "ascii"))
 *
 *    // wait for response
 *    const resp = await queue.poll()
 *
 *    // send close
 *    await stream.write(Kind.CLOSE, Buffer.alloc(0))
 * </code>
 *
 * Currently, the Socket is written to support multiple concurrent streams on a single socket. This class acts as an
 * intelligent router to ensure packets are forwarded to their appropriate streams. When a stream is closed, it is
 * removed from the internal Stream table.
 */
export default class Socket extends EventEmitter {
    private streamID: uint64;
    private readonly reader: Reader;
    private readonly writer: Writer;
    private readonly streams: { [key: string]: Stream };
    private readonly socket: Duplex;

    constructor({socket}: SocketProps) {
        super();
        this.streamID = uint64.new(0);
        this.reader = new Reader({readable: socket});
        this.writer = new Writer({writable: socket});
        this.streams = {};

        this.reader.on("packet", this.handlePacket.bind(this));
        this.reader.on("close", this.handleClose.bind(this));
    }

    private newStream(streamID: uint64): Stream {
        let id = streamID.toString();
        let stream = new Stream({
            writer: this.writer,
            id: streamID,
            opts: {},
        });

        this.streams[id] = stream;
        stream.on("close", () => {
            delete this.streams[id];
        });
        this.emit("stream", stream);

        return stream;
    }

    private handlePacket(packet: Packet) {
        let id = packet.id.stream.toString();
        let existingStream = this.streams[id];

        switch (packet.kind) {
            case Kind.INVOKE_METADATA:
                if (existingStream) {
                    this.end(new ProtocolError("invoke on existing stream"));
                    return;
                }

                // pull metadata off packet
                break;
            case Kind.INVOKE:
                if (existingStream) {
                    this.end(new ProtocolError("invoke on existing stream"));
                    return;
                }

                this.newStream(packet.id.stream);
                break;

            default:
                if (existingStream) {
                    // delegate to stream
                    existingStream.handlePacket(packet);
                }
        }
    }

    private handleClose() {
        Object.keys(this.streams)
            .map((key) => this.streams[key])
            .forEach((stream) => stream.end(new Error("socket closed")));

        this.emit("close");
    }

    newClientStream({}: NewClientStreamParams): Stream {
        this.streamID = this.streamID.add(1);
        return this.newStream(this.streamID);
    }

    end(err?: Error): Promise<void> {
        Object.keys(this.streams).forEach((key) => this.streams[key].end(err));

        return new Promise<void>((resolve) => this.socket.end(resolve));
    }
}

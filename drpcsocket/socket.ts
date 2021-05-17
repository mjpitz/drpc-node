import {createServer, Socket as NetSocket} from "net";
import Reader from "../drpcwire/reader";
import Writer from "../drpcwire/writer";
import Packet from "../drpcwire/packet";
import Stream from "./stream";
import Kind from "../drpcwire/kind";
import {ProtocolError} from "../errors";
import {Duplex} from "stream";
import {EventEmitter} from "events";

interface SocketProps {
    socket: Duplex
}

/**
 * Alright, so I think where I'm leaning toward is having a Socket class that can wrap any  object.
 * Just some scratch thoughts here....
 *
 * const socket = Socket.newServerSocket({ socket });
 *
 * socket.on("stream", (stream: Stream) => {
 *     stream.on("message", (data: MessageType) => {
 *         // ...
 *     });
 *
 *     stream.on("close", () => {
 *         // ...
 *     });
 * });
 *
 * socket.on("close", () => {
 *     allStreams.forEach((stream) => stream.end());
 * });
 */
export default class Socket extends EventEmitter {
    private readonly reader: Reader
    private readonly writer: Writer
    private readonly streams: { [key: string]: Stream }

    constructor({ socket }: SocketProps) {
        super();
        this.reader = new Reader({ readable: socket });
        this.writer = new Writer({ writable: socket });
        this.streams = {};

        this.reader.on("packet", this.handlePacket.bind(this));
        this.reader.on("close", this.handleClose.bind(this));
    }

    private handlePacket(packet: Packet) {
        let id = packet.id.stream.toString();
        let existingStream = this.streams[id];

        switch (packet.kind) {
            case Kind.INVOKE_METADATA:
                if (existingStream) {
                    throw new ProtocolError("invoke on existing stream");
                }

                // pull metadata off packet
                break;
            case Kind.INVOKE:
                if (existingStream) {
                    throw new ProtocolError("invoke on existing stream");
                }

                this.streams[id] = new Stream({
                    writer: this.writer,
                    id: packet.id.stream,
                    opts: {},
                });

                this.streams[id].on("close", () => {
                    delete this.streams[id];
                });

                this.emit("stream", this.streams[id]);

                break;

            default:
                if (!existingStream) {
                    throw new ProtocolError("packet sent to unknown stream");
                }

                // delegate to stream
                existingStream.handlePacket(packet);
        }
    }

    private handleClose() {
        Object.keys(this.streams).
            map((key) => this.streams[key]).
            forEach((stream) => stream.end(new Error("socket closed")));
    }

    // static async main() {
    //     const server = createServer((socket: NetSocket) => {
    //         // handle socket
    //         const drpcSocket = new Socket({ socket });
    //
    //         drpcSocket.on("stream", (stream: Stream) => {
    //             stream.on("message", (buffer: Buffer) => {
    //                 // handle message
    //             });
    //
    //             stream.on("close", (err?: Error) => {
    //                 // stream closed
    //             });
    //
    //             //
    //             stream.write(Kind.INVOKE, Buffer.alloc(0));
    //         });
    //
    //         drpcSocket.on("close", () => {
    //             // socket closed
    //         });
    //     });
    //
    //     server.listen(8080, "0.0.0.0", () => {
    //         // listening
    //     });
    // }
}

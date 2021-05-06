import {Readable} from "stream";
import Packet from "./packet";
import {EventEmitter} from "events";
import Frame from "./frame";
import {InternalError, ProtocolError} from "../errors";
import ID from "./id";

interface ReaderProps {
    readable: Readable
}

/**
 * Reader handles assembling packets from the underlying readable stream.
 *
 * <code>
 *     const reader = new Reader({ readable });
 *
 *     reader.on("packet", (packet: Packet) => {
 *         ...
 *     });
 *
 *     reader.on("close", () => {
 *         ...
 *     });
 * </code>
 *
 */
export default class Reader extends EventEmitter {
    private buffer?: Buffer
    private id?: ID
    private packet?: Packet

    constructor({readable}: ReaderProps) {
        super();

        this.on("frame", this._handleFrame.bind(this));

        readable.on("data", this._handleData.bind(this));
        readable.on("close", this._handleClose.bind(this));
    }

    private _handleFrame(frame: Frame) {
        if (frame.control) {
            // Ignore any frames with the control bit set so that we can use it in
            // the future to mean things to people who understand it.
            // - I am not one of these people.... yet
            return;
        }

        if (this.id == null || this.id.lessThan(frame.id)) {
            this.id = frame.id;
            this.packet = new Packet({
                id: frame.id,
                kind: frame.kind,
            });
        } else if (frame.id.lessThan(this.id)) {
            throw new ProtocolError("id monotonicity violation");
        } else if (frame.kind != this.packet.kind) {
            throw new ProtocolError("packet kind change");
        }

        this.packet.append(frame.data);
        if (this.packet.data.length > (4 << 20)) {
            throw new ProtocolError("data overflow");
        }

        if (frame.done) {
            this.emit("packet", this.packet);
            this.packet = null;
        }
    }

    private _handleData(chunk: Buffer) {
        let buf = Buffer.concat([this.buffer, chunk].filter((s) => !!s));
        this.buffer = buf;

        let frame: Frame;
        while (buf.length > 0) {
            try {
                [buf, frame] = Frame.fromBuffer(buf);

                this.buffer = buf;
                this.emit("frame", frame);
            } catch (err: any) {
                if (err instanceof ProtocolError) {
                    throw err;
                }

                throw new InternalError(err);
            }
        }
    }

    private _handleClose() {
        this.emit("close");
    }
}

import { Writable } from "stream";
import Packet from "./packet";
import Frame from "./frame";
import {EventEmitter} from "events";

interface WriterProps {
    writable: Writable
}

/**
 * Writer is used to send the provided Packet or Frame to the underlying transport.
 *
 * <code>
 *     const writer = new Writer({ writable });
 *
 *     // send data
 *     writer.emit("packet", packet);
 *     writer.emit("frame", frame);
 *
 *     // close the underlying writable
 *     writer.end();
 * </code>
 */
export default class Writer extends EventEmitter {
    private readonly writable: Writable

    constructor({ writable }: WriterProps) {
        super();

        this.writable = writable;

        this.on("packet", this._writePacket.bind(this));
        this.on("frame", this._writeFrame.bind(this));
    }

    private _writePacket(packet: Packet) {
        this.emit("frame", new Frame({
            data: packet.data,
            id: packet.id,
            kind: packet.kind,
            done: true,
        }));
    }

    private _writeFrame(frame: Frame) {
        this.writable.write(Frame.appendToBuffer(frame));
    }

    end() {
        this.writable.end();
    }
}

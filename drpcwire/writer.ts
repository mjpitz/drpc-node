import {Writable} from "stream";
import Packet from "./packet";
import Frame from "./frame";

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
 *     writer.writePacket(packet);
 *     writer.writeFrame(frame);
 *
 *     // close the underlying writable
 *     writer.end();
 * </code>
 */
export default class Writer {
    private readonly writable: Writable

    constructor({writable}: WriterProps) {
        this.writable = writable;
    }

    writePacket(packet: Packet): Promise<void> {
        return this.writeFrame(new Frame({
            data: packet.data,
            id: packet.id,
            kind: packet.kind,
            done: true,
        }));
    }

    writeFrame(frame: Frame): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.writable.write(Frame.appendToBuffer(frame), (err: Error) => {
                if (err != null) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    end() {
        this.writable.end();
    }
}

import Packet from "./packet";
import Frame from "./frame";

/**
 * splitPacket splits the marshalled packet into some number of frames such that each frame is
 * at most n bytes. The callback function is invoked with every frame. If n is zero, it defaults
 * to 1024. If n is less than 0, the packet isn't split and only one frame is sent.
 *
 * @param packet - the packet to split
 * @param n - the maximum size of a frame
 * @param cb - the callback to invoke with each frame
 */
export default function splitPacket(packet: Packet, n: number, cb: (Frame) => void) {
    if (!n) {
        n = 1024;
    } else if (n < 0) {
        n = 0;
    }

    while (true) {
        let frame = new Frame({
            data: packet.data,
            id: packet.id,
            kind: packet.kind,
            done: true,
        });

        if (packet.data.length > n && n > 0) {
            frame.data = packet.data.slice(0, n);
            packet.data = packet.data.slice(n);
            frame.done = false;
        }

        cb(frame);

        if (frame.done) {
            return;
        }
    }
}

import ID from "./id";
import Kind from "./kind";

interface PacketProps {
    data?: Buffer
    id: ID
    kind: Kind
}

/**
 * Packet is a single message sent by drpc.
 */
export default class Packet {
    data: Buffer
    id: ID
    kind: Kind

    constructor({data, id, kind}: PacketProps) {
        this.data = data ? data : Buffer.alloc(0);
        this.id = id;
        this.kind = kind;
    }

    append(data: Buffer) {
        if (this.data.length == 0) {
            this.data = data.slice(0);
        } else {
            let buffer = Buffer.alloc(this.data.length + data.length);
            buffer.set(this.data, 0);
            buffer.set(data, this.data.length);
            this.data = buffer;
        }
    }

    toString(): string {
        return `<s:${this.id.stream} m:${this.id.message} k:${this.kind} d:${this.data.length}>`;
    }
}

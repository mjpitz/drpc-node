import ID from "./id";
import Kind from "./kind";

interface PacketProps {
    data: Buffer
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
        this.data = data;
        this.id = id;
        this.kind = kind;
    }

    toString(): string {
        return `<s:${this.id.stream} m:${this.id.message} k:${this.kind} d:${this.data.length}>`;
    }
}

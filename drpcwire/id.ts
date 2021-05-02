import uint64 from "./uint64";

interface IDProps {
    stream: uint64
    message: uint64
}

/**
 * ID represents the packet ID.
 */
export default class ID {
    // stream is the stream identifier.
    stream: uint64
    // message is the message identifier.
    message: uint64

    constructor({stream, message}: IDProps) {
        this.stream = stream;
        this.message = message;
    }

    lessThan(other: ID): boolean {
        return this.stream.lessThan(other.stream) || (
            this.stream.equals(other.stream) && this.message.lessThan(other.message)
        );
    }

    toString(): string {
        return `<${this.stream},${this.message}>`;
    }
}

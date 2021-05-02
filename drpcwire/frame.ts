import ID from "./id";
import Kind from "./kind";
import {appendVarint, readVarint} from "./varint";
import uint64 from "./uint64";

const doneBit = 0b00000001;
const controlBit = 0b10000000;
const kindBits = 0b01111110;

interface FrameProps {
    data: Uint8Array
    id: ID
    kind: Kind
    done: boolean
    control: boolean
}

/**
 * Frame is a split data frame on the wire.
 */
export default class Frame {
    /**
     * fromBuffer attempts to parse a frame at the beginning of the provided buffer. If successful,
     * then the returned buffer contains the unparsed data and the resulting frame will be populated.
     * This method does not modify the original buffer.
     *
     * @param buf
     */
    static fromBuffer(buf: Buffer): [Buffer, Frame] {
        const header = buf.readUInt8(0);
        const done = (header & doneBit) > 0;
        const control = (header & controlBit) > 0;
        const kind = (header & kindBits) >>> 0;

        let streamID: uint64;
        let messageID: uint64;
        let len: uint64;

        let rem = buf.slice(1);
        [ rem, streamID ] = readVarint(rem);
        [ rem, messageID ] = readVarint(rem);
        [ rem, len ] = readVarint(rem);

        const data = rem.slice(0, len.valueOf());
        rem = rem.slice(len.valueOf());

        return [ rem, new Frame({
            data,
            id: new ID({
                stream: streamID,
                message: messageID,
            }),
            kind: Kind.of(kind),
            done,
            control,
        }) ];
    }

    static appendToBuffer(fr: Frame, buf?: Buffer): Buffer {
        return fr.appendTo(buf);
    }

    data: Uint8Array
    id: ID
    kind: Kind
    done: boolean
    control: boolean

    constructor({data, id, kind, done, control}: FrameProps) {
        this.data = data;
        this.id = id;
        this.kind = kind;
        this.done = done;
        this.control = control;
    }

    private appendTo(buf?: Buffer): Buffer {
        let header = this.kind.valueOf() << 1;
        if (this.done) {
            header |= doneBit;
        }

        if (this.control) {
            header |= controlBit;
        }

        let outFrame = Buffer.alloc(1, header & 255);
        outFrame = appendVarint(outFrame, this.id.stream);
        outFrame = appendVarint(outFrame, this.id.message);
        outFrame = appendVarint(outFrame, uint64.new(this.data.length));

        const outLength = buf?.length + outFrame.length + this.data.length;
        const out = Buffer.alloc(outLength);

        if (buf) {
            out.set(buf, 0);
        }

        out.set(outFrame, buf?.length);

        if (this.data) {
            out.set(this.data, buf?.length + outFrame.length);
        }

        return out;
    }
}

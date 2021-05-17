import uint64 from "./uint64";
import {ErrorWithCode} from "../errors";

export function encodeError(err: Error): Buffer {
    let code = new uint64(500), message = err.message;
    if (err instanceof ErrorWithCode) {
        code = err.code;
    }

    let buffer = Buffer.alloc(8);
    buffer.writeInt32BE(code.high, 0);
    buffer.writeInt32BE(code.low, 4);

    return Buffer.concat([
        buffer,
        Buffer.from(message, "utf-8"),
    ]);
}

export function parseError(buffer: Buffer): Error {
    if (buffer.length < 8) {
        return new Error(`${buffer.toString("utf-8")} (drpcwire note: invalid error data)`);
    }

    let high = buffer.readInt32BE(0);
    let low = buffer.readInt32BE(4);

    return new ErrorWithCode(new uint64(low, high), buffer.slice(8).toString());
}

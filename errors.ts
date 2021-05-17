import uint64 from "./drpcwire/uint64";

export class Err {
    name: string;
    readonly message: string;
    readonly stack: string;

    constructor(message: string) {
        this.message = message;
        Error.captureStackTrace(this, Err.constructor);
    }
}

export class WrappedError extends Err {
    readonly cause?: Error

    constructor(err: Error|string, msg?: string) {
        super(msg ? msg : err.toString());
        this.name = "WrappedError";

        if (err instanceof Error) {
            this.cause = err;
        }
    }
}

export class ErrorWithCode extends WrappedError {
    readonly code: uint64

    constructor(code: uint64|number, err: Error|string, msg?: string) {
        super(err, msg);
        this.name = "ErrorWithCode";

        if (code instanceof uint64) {
            this.code = code;
        } else {
            this.code = uint64.new(code);
        }
    }
}

export class InternalError extends WrappedError {
    constructor(err: string|Error, msg?: string) {
        super(err, msg);
        this.name = "InternalError";
    }
}

export class ProtocolError extends WrappedError {
    constructor(err: string|Error, msg?: string) {
        super(err, msg);
        this.name = "ProtocolError";
    }
}

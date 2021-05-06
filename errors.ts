export class InternalError extends Error {
    readonly wrapped?: Error

    constructor(err: string|Error, msg?: string) {
        super(msg ? msg : err.toString());

        if (err instanceof Error) {
            this.wrapped = err
        }
    }
}

export class ProtocolError extends Error {
    readonly wrapped?: Error

    constructor(err: string|Error, msg?: string) {
        super(msg ? msg : err.toString());

        if (err instanceof Error) {
            this.wrapped = err
        }
    }
}

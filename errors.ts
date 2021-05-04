export class InternalError extends Error {
    static new(message: string): InternalError {
        return new InternalError(message)
    }

    static wrap(err: Error, message?: string): InternalError {
        return new InternalError(message || err.message, err)
    }

    readonly wrapped?: Error

    private constructor(message: string, wrapped?: Error) {
        super(message);
        this.wrapped = wrapped;
    }
}

export class ProtocolError extends Error {
    static new(message: string): ProtocolError {
        return new ProtocolError(message)
    }

    static wrap(err: Error, message?: string): ProtocolError {
        return new ProtocolError(message || err.message, err)
    }

    readonly wrapped?: Error

    private constructor(message: string, wrapped?: Error) {
        super(message);
        this.wrapped = wrapped;
    }
}

export type Encoding = string

export interface Message {}

export interface Metadata {}

export interface ChannelCredentials {}

// Mostly pulled from NodeJS.EventEmitter
export interface Readable<T> {
    on(event: "data" | symbol, fn: (t: T) => void): void
    once(event: "data" | symbol, fn: (t: T) => void): void
    removeListener(event: "data" | symbol, fn: (t: T) => void): void
}

// Mostly pulled from NodeJS.WritableStream
export interface Writable<T> {
    write(msg: T, cb?: (err?: Error | null) => void): boolean;
    write(msg: T, encoding?: Encoding, cb?: (err?: Error | null) => void): boolean;
    end(cb?: () => void): void;
    end(msg: T, cb?: () => void): void;
    end(msg: T, encoding?: Encoding, cb?: () => void): void;
}

export type Call = {
    metadata: Metadata
}

export type ClientDuplexStream<Request, Response> = Call & Writable<Request> & Readable<Response>

export type ServerDuplexStream<Request, Response> = Call & Readable<Request> & Writable<Response>

export type ServerReadableStream<Request> = Call & Readable<Request>

export type ServerWritableStream<Request, Response> = Call & Writable<Response> & { request: Request }

export type ServerUnaryCall<Request> = Call & { request: Request }

export type Callback<T> = (err: Error, t: T) => void

export type ServiceDefinition<T> = any

export class Client {}

export class Server {}

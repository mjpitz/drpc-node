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

export interface Client {}


/// contents below would be in the generated protobuf file.
/// not exported as I'm treating it as a waypoint.

interface UnaryRequest {}
interface UnaryResponse {}

interface ClientStreamRequest {}
interface ClientStreamResponse {}

interface ServerStreamRequest {}
interface ServerStreamResponse {}

interface DuplexRequest {}
interface DuplexResponse {}

interface IExampleService {
    unary(call: ServerUnaryCall<UnaryRequest>, callback: Callback<UnaryResponse>)

    clientStream(call: ServerReadableStream<ClientStreamRequest>, callback: Callback<ClientStreamResponse>)

    serverStream(call: ServerWritableStream<ServerStreamRequest, ServerStreamResponse>)

    clientStream(call: ServerDuplexStream<DuplexRequest, DuplexResponse>)
}

interface ExampleService extends Client {
    //public static service: ServiceDefinition<IExampleService>;

    constructor(address: string, credentials: ChannelCredentials, options?: object);

    unary(req: UnaryRequest): Promise<UnaryResponse>
    unary(req: UnaryRequest, metadata: Metadata): Promise<UnaryResponse>
    unary(req: UnaryRequest, callback: Callback<UnaryResponse>): void
    unary(req: UnaryRequest, metadata: Metadata, callback: Callback<UnaryResponse>): void

    clientStream(callback: Callback<ClientStreamResponse>): Writable<ClientStreamRequest>
    clientStream(metadata: Metadata, callback: Callback<ClientStreamResponse>): Writable<ClientStreamRequest>

    serverStream(req: ServerStreamRequest): Readable<ServerStreamResponse>
    serverStream(req: ServerStreamRequest, metadata: Metadata): Readable<ServerStreamResponse>

    duplex(): ClientDuplexStream<DuplexRequest, DuplexResponse>
    duplex(metadata: Metadata): ClientDuplexStream<DuplexRequest, DuplexResponse>
}

/**
 * The most common way to use NodeJS and gRPC is using the @grpc/proto-loader library. That project doesn't
 * generate code, but rather dynamically loads reads the files. At some point, they added support for
 * code-generating TypeScript definitions for proto-loader. The following provides a gist for the generated code.
 * For a complete reference, see the generated golden set here:
 *
 * https://github.com/grpc/grpc-node/blob/master/packages/proto-loader/golden-generated/echo.ts
 *
 *
 */

import {
    Callback,
    ChannelCredentials,
    Client,
    ClientDuplexStream,
    Metadata,
    Readable,
    ServerDuplexStream,
    ServerReadableStream,
    ServerUnaryCall,
    ServerWritableStream,
    ServiceDefinition,
    Writable
} from "../drpc";

export interface UnaryRequest {
}

export interface UnaryResponse {
}

export interface ClientStreamRequest {
}

export interface ClientStreamResponse {
}

export interface ServerStreamRequest {
}

export interface ServerStreamResponse {
}

export interface DuplexRequest {
}

export interface DuplexResponse {
}

export interface IExampleService {
    unary(call: ServerUnaryCall<UnaryRequest>, callback: Callback<UnaryResponse>)

    clientStream(call: ServerReadableStream<ClientStreamRequest>, callback: Callback<ClientStreamResponse>)

    serverStream(call: ServerWritableStream<ServerStreamRequest, ServerStreamResponse>)

    duplex(call: ServerDuplexStream<DuplexRequest, DuplexResponse>)
}

export class ExampleService extends Client {
    public static service: ServiceDefinition<IExampleService>;

    constructor(address: string, credentials: ChannelCredentials, options?: any);

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

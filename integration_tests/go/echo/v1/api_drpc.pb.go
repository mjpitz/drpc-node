// Code generated by protoc-gen-go-drpc. DO NOT EDIT.
// protoc-gen-go-drpc version: v0.0.21
// source: echo/v1/api.proto

package echov1

import (
	context "context"
	errors "errors"
	protojson "google.golang.org/protobuf/encoding/protojson"
	proto "google.golang.org/protobuf/proto"
	drpc "storj.io/drpc"
	drpcerr "storj.io/drpc/drpcerr"
)

type drpcEncoding_File_echo_v1_api_proto struct{}

func (drpcEncoding_File_echo_v1_api_proto) Marshal(msg drpc.Message) ([]byte, error) {
	return proto.Marshal(msg.(proto.Message))
}

func (drpcEncoding_File_echo_v1_api_proto) Unmarshal(buf []byte, msg drpc.Message) error {
	return proto.Unmarshal(buf, msg.(proto.Message))
}

func (drpcEncoding_File_echo_v1_api_proto) JSONMarshal(msg drpc.Message) ([]byte, error) {
	return protojson.Marshal(msg.(proto.Message))
}

func (drpcEncoding_File_echo_v1_api_proto) JSONUnmarshal(buf []byte, msg drpc.Message) error {
	return protojson.Unmarshal(buf, msg.(proto.Message))
}

type DRPCEchoServiceClient interface {
	DRPCConn() drpc.Conn

	Echo(ctx context.Context, in *Echo) (*Echo, error)
}

type drpcEchoServiceClient struct {
	cc drpc.Conn
}

func NewDRPCEchoServiceClient(cc drpc.Conn) DRPCEchoServiceClient {
	return &drpcEchoServiceClient{cc}
}

func (c *drpcEchoServiceClient) DRPCConn() drpc.Conn { return c.cc }

func (c *drpcEchoServiceClient) Echo(ctx context.Context, in *Echo) (*Echo, error) {
	out := new(Echo)
	err := c.cc.Invoke(ctx, "/echo.v1.EchoService/Echo", drpcEncoding_File_echo_v1_api_proto{}, in, out)
	if err != nil {
		return nil, err
	}
	return out, nil
}

type DRPCEchoServiceServer interface {
	Echo(context.Context, *Echo) (*Echo, error)
}

type DRPCEchoServiceUnimplementedServer struct{}

func (s *DRPCEchoServiceUnimplementedServer) Echo(context.Context, *Echo) (*Echo, error) {
	return nil, drpcerr.WithCode(errors.New("Unimplemented"), 12)
}

type DRPCEchoServiceDescription struct{}

func (DRPCEchoServiceDescription) NumMethods() int { return 1 }

func (DRPCEchoServiceDescription) Method(n int) (string, drpc.Encoding, drpc.Receiver, interface{}, bool) {
	switch n {
	case 0:
		return "/echo.v1.EchoService/Echo", drpcEncoding_File_echo_v1_api_proto{},
			func(srv interface{}, ctx context.Context, in1, in2 interface{}) (drpc.Message, error) {
				return srv.(DRPCEchoServiceServer).
					Echo(
						ctx,
						in1.(*Echo),
					)
			}, DRPCEchoServiceServer.Echo, true
	default:
		return "", nil, nil, nil, false
	}
}

func DRPCRegisterEchoService(mux drpc.Mux, impl DRPCEchoServiceServer) error {
	return mux.Register(impl, DRPCEchoServiceDescription{})
}

type DRPCEchoService_EchoStream interface {
	drpc.Stream
	SendAndClose(*Echo) error
}

type drpcEchoService_EchoStream struct {
	drpc.Stream
}

func (x *drpcEchoService_EchoStream) SendAndClose(m *Echo) error {
	if err := x.MsgSend(m, drpcEncoding_File_echo_v1_api_proto{}); err != nil {
		return err
	}
	return x.CloseSend()
}

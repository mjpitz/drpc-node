package main

import (
	"context"
	echov1 "github.com/mjpitz/drpc-node/integration_tests/go/echo/v1"
	"log"
	"net"
	"storj.io/drpc/drpcmux"
	"storj.io/drpc/drpcserver"
)

type echoServer struct {}

func (e *echoServer) Echo(ctx context.Context, echo *echov1.Echo) (*echov1.Echo, error) {
	log.Print(echo.Message)
	return echo, nil
}

func main() {
	err := func () error {
		mux := drpcmux.New()

		log.Print("registering echo service")
		err := echov1.DRPCRegisterEchoService(mux, &echoServer{})
		if err != nil {
			return err
		}

		server := drpcserver.New(mux)

		log.Print("binding to :8080")
		listener, err := net.Listen("tcp", ":8080")
		if err != nil {
			return err
		}

		log.Print("serving drpc")
		return server.Serve(context.Background(), listener)
	}()

	if err != nil {
		panic(err)
	}
}

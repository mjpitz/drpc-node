package main

import (
	"context"
	echov1 "github.com/mjpitz/drpc-node/integration_tests/go/echo/v1"
	"log"
	"net"
	"storj.io/drpc/drpcconn"
	"time"
)

func main() {
	err := func() error {
		log.Print("dialing server")
		rawConn, err := net.Dial("tcp", "localhost:8080")
		if err != nil {
			return err
		}

		log.Print("wrapping connection")
		drpcConn := drpcconn.New(rawConn)

		echoClient := echov1.NewDRPCEchoServiceClient(drpcConn)

		for {
			echo, err := echoClient.Echo(context.Background(), &echov1.Echo{
				Message: "hello world!",
			})

			if err != nil {
				return err
			}

			log.Print(echo.Message)
			time.Sleep(time.Second)
		}

		return nil
	}()

	if err != nil {
		panic(err)
	}
}

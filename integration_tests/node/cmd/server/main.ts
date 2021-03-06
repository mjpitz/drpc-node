import {createServer, Socket as NetSocket} from "net";
import Socket from "../../../../drpcsocket/socket";
import Stream from "../../../../drpcsocket/stream";
import Kind from "../../../../drpcwire/kind";

async function main() {
    const server = createServer((netSocket: NetSocket) => {
        const socket = new Socket({ socket: netSocket });

        socket.on("stream", (stream: Stream) => {
            stream.on("message", (buffer: Buffer) => {
                console.log(buffer.toString("hex"));
                // because of the way the echo service is written, we should be able to just
                // write this back and everything should work fine.
                stream.write(Kind.MESSAGE, buffer);
            });
        });
    });

    console.log("binding to :8080");
    server.listen(8080, "", () => {
        console.log("serving drpc");
    });
}

main().catch((err) => console.error(err));

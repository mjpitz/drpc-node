import {createServer, Socket as NetSocket} from "net";
import Socket from "../../../../drpcsocket/socket";
import Stream from "../../../../drpcsocket/stream";

async function main() {
    const server = createServer((netSocket: NetSocket) => {
        const socket = new Socket({ socket: netSocket });

        socket.on("stream", (stream: Stream) => {
            stream.on("message", (buffer: Buffer) => {
                console.log(buffer.toString("hex"));
            });
        });
    });

    console.log("binding to :8080");
    server.listen(8080, "", () => {
        console.log("serving drpc");
    });
}

main().catch((err) => console.error(err));

import {connect, Socket as NetSocket} from "net";
import Socket from "../../../../drpcsocket/socket";
import Kind from "../../../../drpcwire/kind";
import Channel from "../../../../drpcsocket/channel";

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

async function handleSocket(netSocket: NetSocket): Promise<void> {
    const socket = new Socket({socket: netSocket});

    let done = false;
    const channel = new Channel<Buffer>();
    const stream = socket.newClientStream({});

    stream.on("message", (message: Buffer) => {
        channel.push(message);
    });

    stream.on("close", () => {
        done = true;
    });

    // send invoke
    await stream.write(Kind.INVOKE, Buffer.from("", "hex"));

    while (!done) {
        let message = await Promise.resolve().
            then(() => stream.write(Kind.MESSAGE, Buffer.from("0a0c68656c6c6f20776f726c6421", "hex"))).
            then(() => channel.poll());

        console.log(message.toString("hex"));
        await sleep(1000);
    }
}

async function main() {
    console.log("dialing server");
    const netSocket = connect(8080, "", () => {
        console.log("wrapping connection");
        handleSocket(netSocket).catch((err) => console.error(err));
    });
}

main().catch((err) => console.error(err));

import {Encoder} from "./encoders";
import Encoders from "./encoders";

const jsonEncoder: Encoder<any> = {
    marshal(msg: any): Buffer {
        return Buffer.from(JSON.stringify(msg), "utf8");
    },

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    unmarshal(buf: Buffer, msg: any): any {
        return JSON.parse(buf.toString());
    },
};

Encoders.register("json", jsonEncoder);

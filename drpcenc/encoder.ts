import {Encoding} from "../drpc";

interface IEncoder {
    marshal(msg: any): Buffer
    unmarshal<T>(buf: Buffer, msg: T): T
}

const index: { [key: string]: Encoder } = {};

export default class Encoder implements IEncoder {
    static register(name: Encoding, props: IEncoder) {
        index[name] = new Encoder(props);
    }

    private readonly props: IEncoder

    private constructor(props: IEncoder) {
        this.props = props;
    }

    marshal(msg: any): Buffer {
        return this.props.marshal(msg);
    }

    unmarshal<T>(buf: Buffer, msg: T): T {
        return this.props.unmarshal<T>(buf, msg);
    }
}

// default encoders

Encoder.register("json", {
    marshal(msg: any): Buffer {
        return Buffer.from(JSON.stringify(msg), "utf8");
    },

    unmarshal<T>(buf: Buffer, msg: T): T {
        return JSON.parse(buf.toString());
    },
});

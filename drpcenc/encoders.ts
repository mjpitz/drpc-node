import {Encoding} from "../drpc";

export interface Encoder<T> {
    marshal(msg: T): Buffer
    unmarshal(buf: Buffer, msg: T): T
}

const index: { [key: string]: Encoder<any> } = {};

export default class Encoders {
    static register<T>(name: Encoding, props: Encoder<T>) {
        index[name] = props;
    }

    static lookup(name: Encoding): Encoder<any> {
        return index[name];
    }

    private constructor({}) {
        // not constructable
    }
}

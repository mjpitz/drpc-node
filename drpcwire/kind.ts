const kindNames = [
    "kindReserved",
    "KindInvoke",
    "KindMessage",
    "KindError",
    "kindCancelDeprecated",
    "KindClose",
    "KindCloseSend",
    "KindInvokeMetadata",
];

/**
 * Kind is the enumeration of all the different kinds of message drpc sends.
 */
export default class Kind extends Number {
    static get values(): Kind[] {
        return [
            Kind.RESERVED,
            Kind.INVOKE,
            Kind.MESSAGE,
            Kind.ERROR,
            Kind.CANCEL_DEPRECATED,
            Kind.CLOSE,
            Kind.CLOSE_SEND,
            Kind.INVOKE_METADATA,
        ];
    }

    static of(value: number): Kind {
        if (value < Kind.values.length) {
            return Kind.values[value];
        }

        return new Kind(value);
    }

    /**
     * RESERVED is saved for the future in case we need to extend.
     */
    static RESERVED = new Kind(0)

    /**
     * INVOKE is used to invoke an rpc. The body is the name of the rpc.
     */
    static INVOKE = new Kind(1)

    /**
     * MESSAGE is used to send messages. The body is an encoded message.
     */
    static MESSAGE = new Kind(2)

    /**
     * ERROR is used to inform that an error happened. The body is an error
     * with a code attached.
     */
    static ERROR = new Kind(3)

    /**
     * CANCEL_DEPRECATED is a reminder that we once used this kind value.
     * @deprecated
     */
    static CANCEL_DEPRECATED = new Kind(4)

    /**
     * CLOSE is used to inform that the rpc is dead. It has no body.
     */
    static CLOSE = new Kind(5)

    /**
     * CLOSE_SEND is used to inform that no more messages will be sent.
     * It has no body.
     */
    static CLOSE_SEND = new Kind(6)

    /**
     * INVOKE_METADATA includes metadata about the next Invoke packet.
     */
    static INVOKE_METADATA = new Kind(7)


    constructor(value: any) {
        super(value);
    }

    toString(): string {
        const value = this.valueOf();
        if (value >= kindNames.length) {
            return `Kind(${value})`;
        }
        return kindNames[value];
    }
}

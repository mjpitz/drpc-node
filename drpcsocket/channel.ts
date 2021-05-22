/**
 * Consumer is an internal abstraction used to reference promise resolvers.
 */
declare type Consumer<T> = (t: T) => void

/**
 * Channel implements a queue-like structure that behaves similarly to Golang's chan primitive.
 *
 * <code>
 *     let channel = new Channel<String>()
 *
 *     setTimeout(() => channel.push("hello world"), 1000)
 *
 *     let message = await channel.poll()
 *     // message = "hello world"
 * </code>
 */
export default class Channel<T> {
    private data: Array<T>;
    private awaiting: Array<Consumer<T>>;

    constructor() {
        this.data = [];
        this.awaiting = [];
    }

    get length() {
        return this.data.length;
    }

    get waiting() {
        return this.awaiting.length;
    }

    private notify() {
        while (this.data.length > 0 && this.awaiting.length > 0) {
            const item = this.data.pop();
            const awaiting = this.awaiting.pop();
            awaiting(item);
        }
    }

    push(...data: T[]): void {
        this.data = [].concat(data.reverse(), this.data);
        this.notify();
    }

    poll(): Promise<T> {
        return new Promise<T>((resolve) => {
            this.awaiting = [].concat([resolve], this.awaiting);
            this.notify();
        });
    }
}

export default class Signal {
    private _set: boolean
    private err?: Error

    isSet() {
        return this._set;
    }

    set(err?: Error) {
        if (this._set) {
            return;
        }

        this._set = true;
        this.err = err;
    }

    get(): Error {
        return this.err;
    }
}

export type PipeCallback = (data?: unknown) => unknown

export class Pipe {
    callback: PipeCallback

    constructor(callback: PipeCallback) {
        this.callback = callback
    }

    get() {
        return this.callback()
    }
}

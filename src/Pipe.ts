export type PipeCallback = (data?: unknown) => unknown

export class Pipe {
    callback: PipeCallback

    earlierData: unknown

    constructor(callback: PipeCallback, earlierData?: unknown) {
        this.callback = callback
        this.earlierData = earlierData
    }

    /**
     * Executes the callback function and returns the result
     * This method "breaks" the pipeflow
     */
    get(): unknown {
        return this.callback(this.earlierData)
    }

    /**
     * Executes the callback function but do not returns anything
     * This method "breaks" the pipeflow
     */
    finish() {
        this.callback(this.earlierData)
    }

    /**
     * Executes the callback function and send it to the next pipe.
     * In practice, creates a new Pipe object.
     */
    pipe(callback: PipeCallback): Pipe {
        return new Pipe(callback, this.get())
    }
}

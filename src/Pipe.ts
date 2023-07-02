import { FakePipe } from './FakePipe'
import {
    PipeInterface,
    PipeCallback,
    PipeCatchCallback,
    CatchOptions,
} from './PipeInterface'

export class Pipe implements PipeInterface {
    /**
     * The callback function that should be executed by the pipeflow.
     */
    callback: PipeCallback

    /**
     * The data coming from the last pipe.
     * If this is the first pipe, this property will be undefined.
     */
    earlierData: unknown

    /**
     * Callback that should be runned on failure
     */
    catchCallback: {
        callback: PipeCatchCallback
        options: CatchOptions
    } | null

    /**
     * Should stop the pipe
     */
    stop = false

    constructor(callback: PipeCallback, earlierData?: unknown) {
        this.callback = callback
        this.earlierData = earlierData
        this.catchCallback = null
    }

    /**
     * Executes the callback function and returns the result
     * This method "breaks" the pipeflow
     */
    get(): unknown {
        try {
            return this.callback(this.earlierData)
        } catch (err) {
            if (!this.catchCallback) {
                throw err
            }
            if (!this.catchCallback.options.keepGoing) {
                this.stop = true
            }
            return this.catchCallback.callback(err as Error, this.earlierData)
        }
    }

    /**
     * Executes the callback function but do not returns anything
     * This method "breaks" the pipeflow
     */
    finish(): void {
        this.callback(this.earlierData)
    }

    /**
     * Executes the callback function and send it to the next pipe.
     * In practice, creates a new Pipe object.
     */
    pipe(callback: PipeCallback): PipeInterface {
        const result = this.get()
        if (this.stop) {
            return new FakePipe()
        }
        return new Pipe(callback, result)
    }

    /**
     * Add a catch callback.
     * This callback is going to be executed in case the callback function of pipe throws some error.
     */
    catch(
        errorHandlingCallback: PipeCatchCallback,
        options: Partial<CatchOptions> = {}
    ): this {
        const defaultOptions: CatchOptions = {
            keepGoing: false,
        }
        this.catchCallback = {
            callback: errorHandlingCallback,
            options: { ...defaultOptions, ...options },
        }
        return this
    }
}

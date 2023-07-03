import { FakePipe } from './FakePipe'
import {
    PipeInterface,
    PipeCallback,
    PipeCatchCallback,
    CatchOptions,
    PipeOptions,
} from './types'
import { runSync } from './utils'

export class Pipe implements PipeInterface {
    /**
     * The callback function that should be executed by the pipeflow.
     */
    callback: PipeCallback

    /**
     * Pipe Options
     */
    options: PipeOptions

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
        this.options = { asyncTimeout: 10_000 } // 10 seconds
    }

    /**
     * Executes the callback function and returns the result
     * This method "breaks" the pipeflow
     */
    get(): unknown {
        try {
            const result = this.callback(this.earlierData)
            // If it's a promise, resolve it synchronously
            result.then(value => console.log('bbb', value))
            return result instanceof Promise
                ? runSync(result, this.options.asyncTimeout)
                : result
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
    pipe(
        callback: PipeCallback,
        options?: Partial<PipeOptions>
    ): PipeInterface {
        if (options) {
            this.options = {
                ...this.options,
                ...options,
            }
        }
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

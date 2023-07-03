import {
    PipeCallback,
    PipeCatchCallback,
    CatchOptions,
    PipeOptions,
} from './types'

export class Pipe {
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
    previousData: unknown

    /**
     * The next pipe.
     * The next pipe will only be executed after this pipe is executed.
     */
    nextPipe: Pipe | null

    /**
     * The previous pipe.
     */
    previousPipe: Pipe | null

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

    constructor(callback: PipeCallback) {
        this.callback = callback
        this.previousData = undefined
        this.catchCallback = null
        this.options = { asyncTimeout: 10_000 } // 10 seconds
        this.nextPipe = null
        this.previousPipe = null
    }

    /**
     * Set the previous pipe.
     */
    setPreviousPipe(previous: Pipe) {
        this.previousPipe = previous
    }

    /**
     * Set the next pipe.
     */
    setNextPipe(next: Pipe) {
        this.nextPipe = next
    }

    /**
     * Executes the callback function and returns the result
     * This method "breaks" the pipeflow
     */
    get(): Promise<unknown> | void {
        if (this.previousPipe) {
            this.previousPipe.get()
        } else {
            return this.process()
        }
    }

    /**
     * Process the entire pipe.
     * One pipe will call another until there is no more pipes to process.
     * In case of thrown errors, the catchCallback function will be executed.
     */
    async process(previousData?: unknown): Promise<unknown> {
        try {
            const data = await this.callback(previousData)
            if (!this.nextPipe) {
                return data
            }
            return await this.nextPipe.process(data)
        } catch (err) {
            if (!this.catchCallback) {
                throw err
            }
            const callbackReturn = await this.catchCallback.callback(
                err as Error,
                previousData
            )
            if (!this.catchCallback.options.keepGoing || !this.nextPipe) {
                return callbackReturn
            }
            return await this.nextPipe.process(callbackReturn)
        }
    }

    /**
     * Executes the callback function and send it to the next pipe.
     * In practice, creates a new Pipe object.
     */
    pipe(callback: PipeCallback): Pipe {
        const pipe = new Pipe(callback)
        pipe.setPreviousPipe(this)
        this.setNextPipe(pipe)
        return pipe
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

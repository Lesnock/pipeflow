import { PipeCallback, PipeCatchCallback, CatchOptions } from './types'

export class Pipe {
    callback: PipeCallback

    nextPipe: Pipe | null

    previousPipe: Pipe | null

    catchCallback: {
        callback: PipeCatchCallback
        options: CatchOptions
    } | null

    constructor(callback: PipeCallback) {
        this.callback = callback
        this.catchCallback = null
        this.nextPipe = null
        this.previousPipe = null
    }

    setPreviousPipe(previous: Pipe) {
        this.previousPipe = previous
    }

    setNextPipe(next: Pipe) {
        this.nextPipe = next
    }

    get(): Promise<unknown> {
        return this.start()
    }

    start() {
        if (this.previousPipe) {
            return this.previousPipe.get()
        } else {
            return this.process()
        }
    }

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

    pipe(callback: PipeCallback): Pipe {
        const pipe = new Pipe(callback)
        pipe.setPreviousPipe(this)
        this.setNextPipe(pipe)
        return pipe
    }

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

import {
    PipeCallback,
    PipeCatchCallback,
    CatchOptions,
    Condition,
    PipeOptions,
} from './types'

export class Pipe<T = any> {
    callback: {
        callback: PipeCallback<T>
        condition: Condition<T>
    }

    nextPipe: Pipe | null

    previousPipe: Pipe | null

    catchCallback: {
        callback: PipeCatchCallback<T>
        options: CatchOptions
    } | null

    options: PipeOptions

    constructor(
        callback: PipeCallback,
        condition: Condition = true,
        options: Partial<PipeOptions> = {}
    ) {
        this.callback = { callback, condition }
        this.catchCallback = null
        this.nextPipe = null
        this.previousPipe = null
        this.options = { ...this.getPipeDefaultOptions(), ...options }
    }

    setPreviousPipe(previous: Pipe) {
        this.previousPipe = previous
    }

    setNextPipe(next: Pipe) {
        this.nextPipe = next
    }

    get<ReturnType = T>(): Promise<ReturnType> {
        return this.start()
    }

    start() {
        if (this.previousPipe) {
            return this.previousPipe.get()
        } else {
            return this.process()
        }
    }

    async process(previousData?: any): Promise<any> {
        const checkCondition =
            typeof this.callback.condition == 'function'
                ? this.callback.condition(previousData)
                : this.callback.condition

        if (!checkCondition) {
            if (!this.nextPipe || this.options.stopOnFalse) {
                return previousData
            }
            return await this.nextPipe.process(previousData)
        }

        try {
            const data = await this.callback.callback(previousData)
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

    pipe<ReturnType = T>(callback: PipeCallback<T>): Pipe<ReturnType> {
        const pipe = new Pipe<ReturnType>(callback, true)
        pipe.setPreviousPipe(this)
        this.setNextPipe(pipe)
        return pipe
    }

    pipeIf<ReturnType = T>(
        condition: Condition<T>,
        callback: PipeCallback<T>,
        options?: Partial<PipeOptions>
    ): Pipe<ReturnType> {
        const pipe = new Pipe<ReturnType>(callback, condition, options)
        pipe.setPreviousPipe(this)
        this.setNextPipe(pipe)
        return pipe
    }

    catch<ReturnT = any>(
        errorHandlingCallback: PipeCatchCallback<T, ReturnT>,
        options: Partial<CatchOptions> = {}
    ): this {
        const catchOptions: CatchOptions = {
            ...this.getCatchDefaultOptions(),
            ...options,
        }
        this.catchCallback = {
            callback: errorHandlingCallback,
            options: catchOptions,
        }
        return this
    }

    private getCatchDefaultOptions(): CatchOptions {
        return {
            keepGoing: false,
        }
    }

    private getPipeDefaultOptions(): PipeOptions {
        return {
            stopOnFalse: true,
        }
    }
}

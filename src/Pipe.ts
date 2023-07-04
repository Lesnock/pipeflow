import {
    PipeCallback,
    PipeCatchCallback,
    CatchOptions,
    Condition,
    PipeOptions,
    PromiseResult,
} from './types'

export class Pipe<InjectType = any, ExportType = any> {
    callback: {
        callback: PipeCallback<InjectType, ExportType>
        condition: Condition<InjectType>
    }

    nextPipe: Pipe | null

    previousPipe: Pipe | null

    catchCallback: {
        callback: PipeCatchCallback<ExportType>
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

    get<ReturnType = ExportType>(): Promise<ReturnType> {
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

    pipe<NextPipeExportType = any>(
        callback: PipeCallback<ExportType, NextPipeExportType>
    ): Pipe<ExportType, PromiseResult<NextPipeExportType>> {
        const pipe = new Pipe<ExportType, PromiseResult<NextPipeExportType>>(
            callback,
            true
        )
        pipe.setPreviousPipe(this)
        this.setNextPipe(pipe)
        return pipe
    }

    pipeIf<NextPipeExportType = any>(
        condition: Condition<ExportType>,
        callback: PipeCallback<ExportType, NextPipeExportType>,
        options?: Partial<PipeOptions>
    ): Pipe<ExportType, PromiseResult<NextPipeExportType>> {
        const pipe = new Pipe<ExportType, PromiseResult<NextPipeExportType>>(
            callback,
            condition,
            options
        )
        pipe.setPreviousPipe(this)
        this.setNextPipe(pipe)
        return pipe
    }

    catch(errorHandlingCallback: PipeCatchCallback<ExportType>): this
    catch<ReturnType>(errorHandlingCallback: PipeCatchCallback<ExportType, ReturnType>, options: CatchOptions & { keepGoing: false } ): this // prettier-ignore
    catch<ReturnType>(errorHandlingCallback: PipeCatchCallback<ExportType, ReturnType>, options: CatchOptions & { keepGoing: true } ): Pipe<InjectType, ReturnType> // prettier-ignore
    // prettier-ignore
    catch<ReturnType>(errorHandlingCallback: PipeCatchCallback<ExportType, ReturnType>, options?: CatchOptions & { keepGoing?: boolean } ): this | Pipe<InjectType, ReturnType> {
        const catchOptions: CatchOptions = {
            ...this.getCatchDefaultOptions(),
            ...options,
        }
        this.catchCallback = {
            callback: errorHandlingCallback,
            options: catchOptions,
        }
        if (!catchOptions.keepGoing) {
            return this
        }
        return this as unknown as Pipe<InjectType, ReturnType>
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

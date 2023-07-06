import {
    PipeCallback,
    PipeCatchCallback,
    CatchOptions,
    Condition,
    PipeOptions,
    PromiseResult,
    IsExactlyUndefined,
} from './types'

export class Pipe<
    InjectType = any,
    ExportType = any,
    PossibleReturnTypes = undefined
> {
    callback: {
        callback: PipeCallback<InjectType, ExportType>
        condition: Condition<InjectType>
    }

    private nextPipe: Pipe | null

    private previousPipe: Pipe | null

    private catchCallback: {
        callback: PipeCatchCallback<InjectType>
        options: CatchOptions
    } | null

    private options: PipeOptions

    isIf = false

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

    // prettier-ignore
    get<ReturnType = ExportType>(): IsExactlyUndefined<PossibleReturnTypes> extends true ? Promise<ReturnType> : Promise<ReturnType> | PossibleReturnTypes {
        return this.start() as IsExactlyUndefined<PossibleReturnTypes> extends true ? Promise<ReturnType> : Promise<ReturnType> | PossibleReturnTypes
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

    pipe<PipeReturnType = any>(
        callback: PipeCallback<ExportType, PipeReturnType>
    ): Pipe<ExportType, PromiseResult<PipeReturnType>, PossibleReturnTypes> {
        const pipe = new Pipe<
            ExportType,
            PromiseResult<PipeReturnType>,
            PossibleReturnTypes
        >(callback, true)
        // @ts-ignore
        pipe.setPreviousPipe(this)
        // @ts-ignore
        this.setNextPipe(pipe)
        return pipe
    }

    pipeIf<PipeReturnType = any>(
        condition: Condition<ExportType>,
        callback: PipeCallback<ExportType, PipeReturnType>,
        options?: Partial<PipeOptions> & { stopOnFalse: false }
    ): Pipe<
        ExportType,
        PromiseResult<PipeReturnType> | ExportType,
        PossibleReturnTypes
    >
    pipeIf<PipeReturnType = any>(
        condition: Condition<ExportType>,
        callback: PipeCallback<ExportType, PipeReturnType>,
        options?: Partial<PipeOptions> & { stopOnFalse: true }
    ): Pipe<
        ExportType,
        PromiseResult<PipeReturnType> | ExportType,
        IsExactlyUndefined<PossibleReturnTypes> extends true
            ? PromiseResult<PipeReturnType>
            : PossibleReturnTypes | PromiseResult<PipeReturnType> | ExportType
    >
    pipeIf<PipeReturnType = any>(
        condition: Condition<ExportType>,
        callback: PipeCallback<ExportType, PipeReturnType>,
        options?: Partial<PipeOptions> & { stopOnFalse: boolean }
    ): Pipe<
        ExportType,
        PromiseResult<PipeReturnType> | ExportType,
        PossibleReturnTypes
    > {
        const pipe = new Pipe<ExportType, PromiseResult<PipeReturnType>>(
            callback,
            condition,
            options
        )
        pipe.isIf = true
        // @ts-ignore
        pipe.setPreviousPipe(this)
        this.setNextPipe(pipe)
        // @ts-ignore
        return pipe
    }

    catch<ReturnType>(
        errorHandlingCallback: PipeCatchCallback<InjectType, ReturnType>
    ): Pipe<
        InjectType,
        ExportType,
        IsExactlyUndefined<PossibleReturnTypes> extends true
            ? ReturnType
            : PossibleReturnTypes | ReturnType
    > {
        if (this.catchCallback) {
            throw new Error(
                'Catch callback already attached to the pipe. Only 1 catch is allowed for each pipe.'
            )
        }
        this.catchCallback = {
            callback: errorHandlingCallback,
            options: { keepGoing: false },
        }
        // @ts-ignore
        return this
    }

    catchAndContinue<ReturnType>(
        errorHandlingCallback: PipeCatchCallback<InjectType, ReturnType>
    ): Pipe<InjectType, ReturnType | ExportType> {
        if (this.catchCallback) {
            throw new Error(
                'Catch callback already attached to the pipe. Only 1 catch is allowed for each pipe.'
            )
        }
        this.catchCallback = {
            callback: errorHandlingCallback,
            options: { keepGoing: true },
        }
        return this as unknown as Pipe<InjectType, ReturnType>
    }

    private getPipeDefaultOptions(): PipeOptions {
        return {
            stopOnFalse: false,
        }
    }
}

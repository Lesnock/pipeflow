export type PipeCallback<T = unknown> = (data?: T) => unknown
export type PipeCatchCallback = (err: Error, data: unknown) => void
export type CatchOptions = { keepGoing: boolean }
export interface PipeInterface {
    get(): unknown
    finish(): void
    pipe(callback: PipeCallback): PipeInterface
    catch(errorHandlingCallback: PipeCatchCallback, options: CatchOptions): this
}

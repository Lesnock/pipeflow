export type PipeCallback<T = unknown> = (data?: T) => unknown
export type PipeCatchCallback = (err: Error, data: unknown) => void
export type PipeOptions = { asyncTimeout: number }
export type CatchOptions = { keepGoing: boolean }
export interface PipeInterface {
    get(): unknown
    finish(): void
    pipe(callback: PipeCallback, options?: PipeOptions): PipeInterface
    catch(errorHandlingCallback: PipeCatchCallback, options: CatchOptions): this
}

export type PipeCallback<T = unknown> = (data?: T) => unknown
export type PipeCatchCallback = (
    err: Error,
    data: unknown
) => unknown | Promise<unknown>
export type CatchOptions = { keepGoing: boolean }

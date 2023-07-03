export type PipeCallback<T = unknown> = (data?: T) => unknown
export type PipeCatchCallback = (
    err: Error,
    data: unknown
) => unknown | Promise<unknown>
export type PipeOptions = { asyncTimeout: number }
export type CatchOptions = { keepGoing: boolean }

export type PipeCallback<T = any> = (data: T) => any
export type PipeCatchCallback<T = any, ReturnT = void> = (
    err: Error,
    data: T
) => ReturnT
export type CatchOptions = { keepGoing: boolean }
export type Condition<T = any> = boolean | ((data: T) => boolean)

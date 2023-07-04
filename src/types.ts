export type PromiseResult<T> = T extends Promise<infer Type> ? Type : T
export type PipeCallback<ArgumentType = any, ReturnType = any> = (
    data: ArgumentType
) => ReturnType
export type PipeCatchCallback<ArgumentType = any, ReturnType = any> = (
    err: Error,
    data: ArgumentType
) => ReturnType
export type CatchOptions = { keepGoing: boolean }
export type Condition<ArgumentType = any> =
    | boolean
    | ((data: ArgumentType) => boolean)
export type PipeOptions = { stopOnFalse: boolean }

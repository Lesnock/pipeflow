export type PipeCallback<T = any> = (data: T) => any
export type PipeCatchCallback = (err: Error, data: any) => any | Promise<any>
export type CatchOptions = { keepGoing: boolean }

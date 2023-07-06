import { Pipe } from './Pipe'
import type { PipeCallback, PromiseResult } from './types'

export function pipe<ExportType = any>(
    callback: PipeCallback<undefined, ExportType>
): Pipe<undefined, PromiseResult<ExportType>> {
    return new Pipe<undefined, PromiseResult<ExportType>>(callback)
}

export { Pipe }
export type { PipeCallback, Condition, PipeCatchCallback } from './types'

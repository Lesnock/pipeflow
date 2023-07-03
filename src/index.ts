import { Pipe } from './Pipe'
import type { PipeCallback } from './types'

export function pipe<T>(callback: PipeCallback<T>): Pipe<T> {
    return new Pipe<T>(callback)
}

export { Pipe }

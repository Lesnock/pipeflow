import { Pipe } from './Pipe'
import type { PipeCallback } from './PipeInterface'

export function pipe(callback: PipeCallback): Pipe {
    return new Pipe(callback)
}

export { Pipe }

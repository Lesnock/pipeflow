import { Pipe } from './Pipe'
import type { PipeCallback } from './Pipe'

export function pipe(callback: PipeCallback): Pipe {
    return new Pipe(callback)
}

export { Pipe }

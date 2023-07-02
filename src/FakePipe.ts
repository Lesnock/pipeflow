import { PipeInterface, PipeCallback, PipeCatchCallback } from './PipeInterface'

/**
 * FakePipe
 * This class is used for not break the chain made by the user even when an error is thrown.
 * In this way, Pipe will simulate he keeps executing for the javascript engine.
 */
export class FakePipe implements PipeInterface {
    get() {
        return undefined
    }

    finish() {
        //
    }

    /* eslint-disable-next-line */
    pipe(): PipeInterface {
        return this
    }

    /* eslint-disable-next-line */
    catch() {
        return this
    }
}

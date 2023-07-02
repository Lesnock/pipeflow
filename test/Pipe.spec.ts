import { pipe, Pipe } from '../src'
import { expect } from 'chai'

describe('Pipe', () => {
    it('returns a Pipe object', () => {
        expect(pipe(() => '')).to.instanceOf(Pipe)
    })
})

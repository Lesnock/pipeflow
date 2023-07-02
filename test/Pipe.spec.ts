import { pipe, Pipe } from '../src'
import { expect } from 'chai'
import { assert, spy } from 'sinon'

describe('Pipe', () => {
    it('returns a Pipe object', () => {
        expect(pipe(() => '')).to.instanceOf(Pipe)
    })

    it('returns callback result on calling get', () => {
        const result = pipe(() => 'callbackResult').get()
        expect(result).to.be.equal('callbackResult')
    })

    it('not returns callback result on calling finish', () => {
        const result = pipe(() => 'callbackResult').finish()
        expect(result).to.be.undefined
    })

    it('should receive callback result of first pipe', () => {
        const spyCall = spy()
        pipe(() => 'myArgs')
            .pipe(spyCall)
            .get()
        assert.calledWith(spyCall, 'myArgs')
    })
})

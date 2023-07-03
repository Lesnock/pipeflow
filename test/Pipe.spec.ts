import { pipe, Pipe } from '../src'
import { expect } from 'chai'
import { assert, spy } from 'sinon'

describe('Pipe', () => {
    it('returns a Pipe object', () => {
        expect(pipe(() => '')).to.instanceOf(Pipe)
    })

    it('returns callback result on calling get', async () => {
        const result = await pipe(() => 'callbackResult').get()
        expect(result).to.be.equal('callbackResult')
    })

    it('should pass the callback return data to the next pipe', async () => {
        const spyCall = spy()
        await pipe(() => 'myArgs')
            .pipe(spyCall)
            .get()
        assert.calledWith(spyCall, 'myArgs')
    })

    it('should catch the error', async () => {
        const catcherSpy = spy()
        const error = new Error('Some error...')
        await pipe(() => {
            throw error
        })
            .catch(catcherSpy)
            .get()
        assert.calledWith(catcherSpy, error)
    })

    it('should not call the next pipe after error', async () => {
        const pipeSpy = spy()
        const error = new Error('Some error...')
        await pipe(() => {
            throw error
        })
            .catch(() => {}) // eslint-disable-line
            .pipe(pipeSpy) // eslint-disable-line
            .get()
        assert.notCalled(pipeSpy)
    })

    it('should call the next pipe after error', async () => {
        const pipeSpy = spy()
        const error = new Error('Some error...')
        await pipe(() => {
            throw error
        })
            .catch(() => {}, { keepGoing: true }) // eslint-disable-line
            .pipe(pipeSpy) // eslint-disable-line
            .get()
        assert.called(pipeSpy)
    })

    it('should return the correct result', async () => {
        const string = await pipe(() => 'abc')
            .pipe(string => string.toUpperCase())
            .get()
        expect(string).to.be.equals('ABC')
    })
})

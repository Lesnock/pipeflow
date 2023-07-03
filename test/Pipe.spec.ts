import { pipe, Pipe } from '../src'
import { expect } from 'chai'
import { assert, spy } from 'sinon'
import { runSync } from '../src/utils'

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

    it('should pass the callback return data to the next pipe', () => {
        const spyCall = spy()
        pipe(() => 'myArgs')
            .pipe(spyCall)
            .get()
        assert.calledWith(spyCall, 'myArgs')
    })

    it('should catch the error', () => {
        const catcherSpy = spy()
        const error = new Error('Some error...')
        pipe(() => {
            throw error
        })
            .catch(catcherSpy)
            .get()
        assert.calledWith(catcherSpy, error)
    })

    it('should not call the next pipe after error', () => {
        const pipeSpy = spy()
        const error = new Error('Some error...')
        pipe(() => {
            throw error
        })
            .catch(() => {}) // eslint-disable-line
            .pipe(pipeSpy) // eslint-disable-line
            .get()
        assert.notCalled(pipeSpy)
    })

    it('should call the next pipe after error', () => {
        const pipeSpy = spy()
        const error = new Error('Some error...')
        pipe(() => {
            throw error
        })
            .catch(() => {}, { keepGoing: true }) // eslint-disable-line
            .pipe(pipeSpy) // eslint-disable-line
            .get()
        assert.called(pipeSpy)
    })

    it.only('should resolve promise before keep going', () => {
        const resultSync = runSync(
            () =>
                new Promise(res =>
                    setTimeout(() => {
                        console.log('set timeout')
                        res(true)
                    }, 500)
                ),
            5000
        )
        console.log('result Sn', resultSync)
        // pipe(
        //     () =>
        //         new Promise(res => {
        //             console.log('aqui ó')
        //             res(true)
        //         })
        // ).get()
    })
})

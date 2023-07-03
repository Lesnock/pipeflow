/**
 * Freeze the execution for an amount of time
 */
export function sleep(duration: number) {
    const now = new Date().getTime()
    while (new Date().getTime() < now + duration) {
        /* Sleeping... */
    }
}

/**
 * Resolve Promise synchronously
 */
export function runSync<T = unknown>(
    callback: () => Promise<T>,
    timeout = 10_000
) {
    let promiseStatus = 'running'
    let promiseError = null
    let promiseValue = null

    callback()
        .then(value => {
            console.log('utils', value)
            promiseStatus = 'resolved'
            promiseValue = value
        })
        .catch(err => {
            promiseStatus = 'rejected'
            promiseError = err
        })

    const timeoutTime = new Date().getTime() + timeout

    while (promiseStatus == 'running') {
        // sleep(1000)
    }

    // sleep(2000)

    if (promiseStatus == 'running') {
        throw new Error('Pipe Error: Timeout while trying to execute callback')
    }

    if (promiseStatus == 'rejected') {
        throw promiseError
    }

    return promiseValue
}

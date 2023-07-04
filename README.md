# Pipeflow.js

Pipeflow is a useful tool for creating beautiful and functional interfaces using callbacks, error handling, and much more. With Pipeflow, you can chain multiple operations in an elegant and controlled manner.

## Installation

Pipeflow can be installed using a package manager such as npm or yarn.

```shell
npm install --save pipeflow.js
```

or

```shell
yarn add pipeflow.js
```

## Basic Usage

Here's a basic example of how to use the Pipeflow:

```typescript
import { pipe } from 'pipeflow.js';

// Call pipe and chain the callback functions
async function () {
    const result = await pipe(() => 'hello world')
        .pipe(data => data.toUpperCase())
        .pipe(data => data.split(' '))
        .pipe(data => data.reverse())
        .get()
}

console.log(result); // Output: ['WORLD', 'HELLO']
```

In this example, we create a pipe and chain multiple operations. Each callback function is executed in sequence, and the result is passed to the next operation. Finally, we call the `get()` method to start the pipe flow. The final result is returned to the user. Pipeflow will ever return a promise, so you have to `await` for the result.

## Error Handling

Pipeflow also supports error handling with the `catch()` method. Here's an example:

```javascript
import { pipe } from 'pipeflow.js'

// Create a callback function that can throw an error
const stringToUppercase = data => {
    if (!data) {
        throw new Error('Invalid data')
    }
    return data.toUpperCase()
}

// Create an error handling function for the pipe
const myErrorHandler = (error, data) => {
    console.error(`Pipe error: ${error.message}`)
    return 'Handled error'
}

const result = await pipe(stringToUppercase)
    .catch(myErrorHandler)
    .get()

console.log(result) // Output: undefined
```

In this example, we add an error handling function to the pipe using the `catch()` method. If an error occurs during the pipe execution, the error handling function will be called, and the error will be captured. 

The `catch` method will always be **ONLY** attached to the last pipe.

By default, when some error is thrown, the `catch` callback will be executed and the execution of the pipe will be stopped. If you want to keep the execution running even when some error occurs, you can pass `keepGoing: true` in the options object as the second parameter. The value returned from the catch callback will be injected in the next `pipe` call:

```javascript
const result = await pipe(stringToUppercase)
    .catch((err) => {
        return 'Error happend'
    }, { keepGoing: true })
    .pipe(data => console.log(data)) // 'Error happend'
    .get()
```

## Conditional Pipe

Piperflow supports conditional pipe. The `pipeIf` method receives a condition as its first parameter and the callback as the second parameter:

```javascript
import { pipe } from 'pipeflow.js'

pipe(() => 'hello world')
    .pipeIf(string => string.length < 3, () => { // Will not be executed
        return string.toUpperCase()
    })
    .pipe(string => console.log(string)) // Output: hello world
    .get()
```

If the condition is `falsy`, Pipeflow will jump through the `pipeIf` and send the data to next pipe. The condition parameter can be a boolean or a function that return a boolean:

```javascript
const condition = true // Some external condition

pipe(() => 2)
    .pipeIf(condition, number => number * 2)
    .get()

// Or

pipe(() => 2)
    .pipeIf(() => condition, number => number * 2)
    .get()
```

## Contribution

If you find any issues, have suggestions, or want to contribute to this project, feel free to open an issue or submit a pull request. We are open to ideas and improvements!

## License

This project is licensed under the MIT License.

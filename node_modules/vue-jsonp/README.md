# Vue-jsonp

[![VueJsonp](https://github.com/LancerComet/vue-jsonp/workflows/Test/badge.svg)](https://github.com/LancerComet/vue-jsonp/actions)

A tiny library for handling JSONP request.

## Quick Start

As Vue plugin:

```ts
import { VueJsonp } from 'vue-jsonp'

// Vue Plugin.
Vue.use(VueJsonp)

// Now you can use this.$jsonp in Vue components.
const vm = new Vue()
vm.$jsonp('/some-jsonp-url', {
  myCustomUrlParam: 'veryNice'
})
```

Use function directly:

```ts
import { jsonp } from 'vue-jsonp'

jsonp('/some-jsonp-url', {
  myCustomUrlParam: 'veryNice'
})
```

## Send data and set query & function name

### Send data

```ts
// The request url will be "/some-jsonp-url?name=LancerComet&age=100&callback=jsonp_{RANDOM_STR}".
jsonp('/some-jsonp-url', {
  name: 'LancerComet',
  age: 100
})
```

### Custom query & function name

The url uniform is `/url?{callbackQuery}={callbackName}&...`, the default is `/url?callback=jsonp_{RANDOM_STRING}&...`.

And you can change it like this:

```ts
// The request url will be "/some-jsonp-url?name=LancerComet&age=100&cb=jsonp_func".
jsonp('/some-jsonp-url', {
  callbackQuery: 'cb',
  callbackName: 'jsonp_func',
  name: 'LancerComet',
  age: 100
})
```

## Module exports

 - `VueJsonp: PluginObject<never>`
 
 - `jsonp<T>: (url: string, param?: IJsonpParam, timeout?: number) => Promise<T>`
 
## API

### IJsonpParam

IJsonpParam is the type of param for jsonp function.

```ts
/**
 * JSONP parameter declaration.
 */
interface IJsonpParam {
  /**
   * Callback query name.
   * This param is used to define the query name of the callback function.
   *
   * @example
   * // The request url will be "/some-url?myCallback=jsonp_func&myCustomUrlParam=veryNice"
   * jsonp('/some-url', {
   *   callbackQuery: 'myCallback',
   *   callbackName: 'jsonp_func',
   *   myCustomUrlParam: 'veryNice'
   * })
   *
   * @default callback
   */
  callbackQuery?: string

  /**
   * Callback function name.
   * This param is used to define the jsonp function name.
   *
   * @example
   * // The request url will be "/some-url?myCallback=jsonp_func&myCustomUrlParam=veryNice"
   * jsonp('/some-url', {
   *   callbackQuery: 'myCallback',
   *   callbackName: 'jsonp_func',
   *   myCustomUrlParam: 'veryNice'
   * })
   *
   * @default jsonp_ + randomStr()
   */
  callbackName?: string

  /**
   * Custom data.
   */
  [key: string]: any
}
```

## Example

```ts
import Vue from 'vue'
import { VueJsonp } from 'vue-jsonp'

Vue.use(VueJsonp)

const vm = new Vue()
const { code, data, message } = await vm.$jsonp<{
  code: number,
  message: string,
  data: {
    id: number,
    nickname: string
  }
}>('/my-awesome-url', {
  name: 'MyName', age: 20
})

assert(code === 0)
assert(message === 'ok')
assert(data.id === 1)
assert(data.nickname === 'John Smith')
```

```ts
import { jsonp } from 'vue-jsonp'

const result = await jsonp<string>('/my-awesome-url')
assert(result === 'such a jsonp')
```

## License

MIT

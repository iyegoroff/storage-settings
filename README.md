# storage-settings

[![npm](https://img.shields.io/npm/v/storage-settings)](https://npm.im/storage-settings)
[![build](https://github.com/iyegoroff/storage-settings/workflows/build/badge.svg)](https://github.com/iyegoroff/storage-settings/actions/workflows/build.yml)
[![publish](https://github.com/iyegoroff/storage-settings/workflows/publish/badge.svg)](https://github.com/iyegoroff/storage-settings/actions/workflows/publish.yml)
[![codecov](https://codecov.io/gh/iyegoroff/storage-settings/branch/main/graph/badge.svg?token=YC314L3ZF7)](https://codecov.io/gh/iyegoroff/storage-settings)
[![Type Coverage](https://img.shields.io/badge/dynamic/json.svg?label=type-coverage&prefix=%E2%89%A5&suffix=%&query=$.typeCoverage.atLeast&uri=https%3A%2F%2Fraw.githubusercontent.com%2Fiyegoroff%2Fts-railway%2Fmain%2Fpackage.json)](https://github.com/plantain-00/type-coverage)
![Libraries.io dependency status for latest release](https://img.shields.io/librariesio/release/npm/storage-settings)
[![Bundlephobia](https://img.shields.io/bundlephobia/minzip/storage-settings?label=min+gzip)](https://bundlephobia.com/package/storage-settings)
[![npm](https://img.shields.io/npm/l/storage-settings.svg?t=1495378566926)](https://www.npmjs.com/package/storage-settings)

<!-- [![Bundlephobia](https://badgen.net/bundlephobia/minzip/storage-settings?label=min+gzip)](https://bundlephobia.com/package/storage-settings) -->

Storage API based settings manager

## Getting started

```
npm i storage-settings
```

## Description

This is simple settings manager that wraps `Storage`-like object, emits 'onChange' events, catches all possible exceptions and returns a 'success or failure' wrapped values. The first parameter is an object that maps setting name to validating transform and default value, the second one - `Storage`-like object.

Read the docs [here](https://iyegoroff.github.io/storage-settings/modules.html#createstorage-settings) and check how `storage-settings` infers types at the [playground](https://www.typescriptlang.org/play?jsx=0#code/JYWwDg9gTgLgBAbzgYygUwIYzQMTTZACxAzDgF84AzKCEOAcivyJLAYCgPkIA7AZ3j8ArsmRp+-OAF44AHgAqAPgAUANwwAbYWgBccBQEoZSuCqQwMAc30MRYifwYAaOPfGT9G7WgpwMUjwCMIbcfILUGMDa6DLyyipoULRQ+kYmZhbWtlRRMWgukdHC6PpJKX4BKOEhXEERzATEpHGomNh4TWwqjUShYcFwJZpxDIQwMGC6APTTmhDIWoQQgroArAAMG2ucAxEAVsKCAEoSkAK+sr3NYObkrsP99fAgCwDWACJYGABqWsAAEyw0DiKiBln0wl4b14EAA7rxjNJTOCMDJpLIGMBeN5AXBUQBCBhwAD8RXyKixOP+AOJVWexn07kc5nx3woTxqcH2-D4f00gKwaABcQwcKi8Gu3SQEDe+iQPL4+leyE+335gpgIMo9yGUE0-WAVDMit4GvBwoAdJYrOjMczJAxjAgOHA3dUBBBNGhLfMrJSHfxdIVTeahQDLYHQpQ0Jp+L4Xe6Pbzvb6IP6mHkSnoQ7yzTTw5bcsV0NG6lyAEbzCsAZVEHn4AEFeACFGgAB4wHBZ2JXFg3Vmy+VwKsQCv6dsZQMqdvGXWwmAAeTliDg2E7E6n9ZZs78use5cGsIAQhAAQBPOsOSRxKWkQcrpAns-n-QqKBI0zTqCRywwI5zhQDz6pygwgMImgwMAYDegAsqQUh9l096Ju6ABMWzDhgyQYOex7CFQzCpHAk7Im426SDOc7OK67oACwbHRw5UNAIBfBCJFbte-BUUBtFukOq7rjAm5kdOu73PxcALsuw7Pheb4flxDbvta55gGgc4cPuIGHhE6AAI46IIACSvDAEuYAwIh1D9tKOmaK4SAgPgywArYAAKi41gohRtACaC8FBWhBow2LINoAXEuQoRAA). Also there is a compatible result library - [ts-railway](https://github.com/iyegoroff/ts-railway).

## Example

```ts
import { createStorageSettings } from 'storage-settings'

// storage-settings compatible result creators
const success = <T>(value: T) => ({ tag: 'success', success: value } as const)
const failure = <T>(error: T) => ({ tag: 'failure', failure: error } as const)

// define a settings shape and wrap any Storage-like object
const settings = createStorageSettings(
  {
    foo: {
      map: (x) => (typeof x === 'string' ? success(x) : failure('foo is not a string' as const)),
      default: ''
    },
    bar: {
      map: (x) => (typeof x === 'number' ? success(x) : failure('bar is not a number' as const)),
      default: 0
    }
  },
  localStorage
)

expect(settings.setBar(123)).toEqual({ tag: 'success', success: undefined })

// OK - bar is a number
expect(settings.getBar()).toEqual({ tag: 'success', success: 123 })

// underlying storage is corrupted
localStorage.setItem('bar', JSON.stringify('a string'))

// validation fails - bar is not a number
expect(settings.getBar()).toEqual({ tag: 'failure', failure: 'bar is not a number' })

// reset settings to default values
settings.reset()

// OK - bar is a number
expect(settings.getBar()).toEqual({ tag: 'success', success: 0 })
```

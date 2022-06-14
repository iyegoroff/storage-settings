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

Read the docs [here](https://iyegoroff.github.io/storage-settings/modules.html#createstorage-settings) and check how `storage-settings` infers types at the [playground](https://www.typescriptlang.org/play?jsx=0#code/JYWwDg9gTgLgBAbzgYygUwIYzQZRtDAc1zRhmADtCBnOAXzgDMoIQ4Bya-KItAWmqlyVauwBQYgPSS4XAsQFDKNFKzBZgAIwA2aOOmoBXbfFSZu1McggUusw8mRpqtALxwAPABUAfAAoANwxtQzQALjgvAEo4Vx84PyQYIgjOBycXdgAae0dnagigkL0GDFprWxgoqxs7RgxgEPRYz18-NCgWKAjo2PjEuGTCVPrGw3Rspgam8LgOrvo4MtVK6qkZABM0Rko9DFklEVkACwwwPYoNuAB3HjAligBPODx5fm1gAGs9CE0AKzQyBgNUqBzIyjcKHQWFw3F4OEOND8YjgiBRqKYEAgEQQ6IxcBAZwifgAHjE4gkYI9zhBGHASbFXO5ODAoMp2HAAPy5DLUUkxCKjGZ+diMLFwYC0CgQeD7Lhsqgc5YVLhRKJZPEYrb1YwwVLifF0DX4zQYbpo-GowlgYlkvqU6loWn0xnMiiGECaDoc7lGPIuflwQXTcZoEWmqASqUypZwd2e71Lcq1KrqzWo7UYXURAAMmro6KN6O0EGQwVePGIYjWKvgghgADFxe568IaAA6etNiB+ABEYogvZrKbgxEbzbBbeo7bH3b8w9BhgoHy4aAo3ZarYh7ZX2HXWL8fnl5PiuPxKoguh3EEIfgABqKsRzkKcqGgrgASBDyuh3tb49AYHGCg4CXbVdg2MQ6AXOwDFIDcW0Rac4PHHs1iXXc1znKIgA). Also there is a compatible result library - [ts-railway](https://github.com/iyegoroff/ts-railway).

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

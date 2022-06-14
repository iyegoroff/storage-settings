import { createStorageMap } from 'storage-map'
import { upperCaseFirst } from 'upper-case-first'
import mitt from 'mitt'

type SuccessResult<Success> = {
  readonly tag: 'success'
  readonly success: Success
}

type FailureResult<Failure> = {
  readonly tag: 'failure'
  readonly failure: Failure
}

type SuccessOf<ResultLike> = ResultLike extends SuccessResult<infer S> ? S : never

type Result<Success = unknown, Failure = unknown> = SuccessResult<Success> | FailureResult<Failure>

type PrettyType<V> = Extract<{ [K in keyof V]: V[K] }, unknown>

type UnionToIntersection<T> = (T extends unknown ? (x: T) => unknown : never) extends (
  x: infer R
) => unknown
  ? R
  : never

type Setting = {
  readonly map: (value: unknown) => Result
  readonly default: unknown
}

type StorageMapInit = Parameters<typeof createStorageMap>[0]
type SetItemReturnType = ReturnType<ReturnType<typeof createStorageMap>['setItem']>
type ClearReturnType = ReturnType<ReturnType<typeof createStorageMap>['clear']>
type RemoveItemReturnType = ReturnType<ReturnType<typeof createStorageMap>['removeItem']>
type GetItemReturnType = ReturnType<ReturnType<typeof createStorageMap>['getItem']>
type FilterKeyNotExistError<T> = T extends FailureResult<{ readonly keyNotExistError: undefined }>
  ? never
  : T
type SetSuccess<T, Success> = T extends SuccessResult<unknown> ? SuccessResult<Success> : T

type StorageSettings<Settings extends Readonly<Record<string, Setting>>> = UnionToIntersection<
  {
    readonly [Key in keyof Settings]: Key extends string
      ? PrettyType<
          {
            readonly /** Set setting value. Emits 'onChange' event. */
            [k in `set${Capitalize<Key>}`]: (
              value: SuccessOf<ReturnType<Settings[Key]['map']>>
            ) => SetItemReturnType
          } & {
            readonly /** Get setting value. */
            [k in `get${Capitalize<Key>}`]: () => FilterKeyNotExistError<
              SetSuccess<GetItemReturnType, SuccessOf<ReturnType<Settings[Key]['map']>>>
            >
          } & {
            readonly /** Listen to setting changes. Returns 'unlisten' function. */
            [k in `listen${Capitalize<Key>}`]: (
              onChange: (value: SuccessOf<ReturnType<Settings[Key]['map']>>) => undefined
            ) => () => undefined
          } & {
            readonly /** Reset a setting to default. Emits 'onChange' event. */
            [k in `reset${Capitalize<Key>}`]: () => RemoveItemReturnType
          } & {
            /** Reset all settings to defaults. Emits 'onChange' event for every setting. */
            readonly reset: () => ClearReturnType
          }
        >
      : never
  }[keyof Settings]
>

/**
 * Creates storage settings.
 *
 * @param shape An object that maps setting name to validating transform and default value.
 * @param storage A `Storage`-like object
 */
export function createStorageSettings<Settings extends Readonly<Record<string, Setting>>>(
  shape: Settings & {
    readonly [Key in keyof Settings]: {
      readonly default: SuccessOf<ReturnType<Settings[Key]['map']>>
    }
  },
  storage: StorageMapInit
): PrettyType<StorageSettings<Settings>>

/**
 * Creates storage settings. Curried version.
 *
 * @param shape An object that maps setting name to validating transform and default value.
 *
 * @returns A function that takes a `Storage`-like object and return storage settings object.
 */
export function createStorageSettings<Settings extends Readonly<Record<string, Setting>>>(
  shape: Settings & {
    readonly [Key in keyof Settings]: {
      readonly default: SuccessOf<ReturnType<Settings[Key]['map']>>
    }
  }
): (storage: StorageMapInit) => PrettyType<StorageSettings<Settings>>

export function createStorageSettings(
  shape: Readonly<Record<string, Setting>>,
  storage?: StorageMapInit
) {
  if (storage === undefined) {
    return (s: StorageMapInit) => createStorageSettings(shape, s)
  }

  const storageMap = createStorageMap(storage)
  const emitter = mitt()
  const entries = Object.entries(shape)

  return entries.reduce(
    (acc, [key, { map, default: def }]) => {
      const name = upperCaseFirst(key)

      return {
        ...acc,
        [`set${name}`]: (value: unknown) => {
          emitter.emit(key, value)

          return storageMap.setItem(key, value)
        },
        [`get${name}`]: () => {
          const result = storageMap.getItem(key, map)

          return result.tag === 'failure' && 'keyNotExistError' in result.failure
            ? { tag: 'success', success: def }
            : result
        },
        [`listen${name}`]: (onChange: (value: unknown) => undefined) => {
          emitter.on(key, onChange)

          return () => emitter.off(key, onChange)
        },
        [`reset${name}`]: () => {
          emitter.emit(key, def)

          return storageMap.removeItem(key)
        }
      }
    },
    {
      reset: () => {
        entries.forEach(([key, { default: def }]) => emitter.emit(key, def))

        return storageMap.clear()
      }
    }
  )
}

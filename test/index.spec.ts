import { createStorageSettings } from '../src'

const success = <T>(value: T) => ({ tag: 'success', success: value } as const)
const failure = <T>(error: T) => ({ tag: 'failure', failure: error } as const)

const noop = () => {
  /**/
}

const mockStorage = {
  setItem: noop,
  getItem: () => 'item',
  removeItem: noop,
  clear: noop
}

describe('storage-settings', () => {
  test('setItem', () => {
    const storage = {
      ...mockStorage,
      setItem: jest.fn((key: string, value: unknown) => {
        expect(key).toEqual('foo')
        expect(value).toEqual(JSON.stringify(1))
      })
    }
    const settings = createStorageSettings({ foo: { map: success, default: undefined } }, storage)
    const result = settings.setFoo(1)

    expect(result).toEqual<typeof result>(success(undefined))
    expect(storage.setItem).toReturnTimes(1)
  })

  test('reset', () => {
    const storage = {
      ...mockStorage,
      clear: jest.fn(noop)
    }
    const settings = createStorageSettings({ foo: { map: success, default: 123 } })(storage)

    const onChange = jest.fn((value: unknown) => {
      expect(value).toEqual(123)
      return undefined
    })

    settings.listenFoo(onChange)
    const result = settings.reset()

    expect(result).toEqual<typeof result>(success(undefined))
    expect(storage.clear).toReturnTimes(1)
    expect(onChange).toReturnTimes(1)
  })

  test('resetItem', () => {
    const storage = {
      ...mockStorage,
      removeItem: jest.fn((key: string) => {
        expect(key).toEqual('foo')
      })
    }
    const settings = createStorageSettings({ foo: { map: success, default: 123 } })(storage)

    const onChange = jest.fn((value: unknown) => {
      expect(value).toEqual(123)
      return undefined
    })

    settings.listenFoo(onChange)
    const result = settings.resetFoo()

    expect(result).toEqual<typeof result>(success(undefined))
    expect(storage.removeItem).toReturnTimes(1)
    expect(onChange).toReturnTimes(1)
  })

  test('getItem - success', () => {
    const storage = {
      ...mockStorage,
      getItem: jest.fn((key: string) => {
        expect(key).toEqual('bar')

        return JSON.stringify('test')
      })
    }
    const settings = createStorageSettings(
      {
        bar: { map: (x) => (typeof x === 'string' ? success(x) : failure('what?')), default: '?' }
      },
      storage
    )
    const result = settings.getBar()

    expect(result).toEqual<typeof result>(success('test'))
    expect(storage.getItem).toReturnTimes(1)
  })

  test('getItem - keyNotExistError failure', () => {
    const storage = {
      ...mockStorage,
      getItem: jest.fn((key: string) => {
        expect(key).toEqual('foobar')

        // eslint-disable-next-line no-null/no-null
        return null
      })
    }
    const settings = createStorageSettings(
      {
        foobar: {
          map: (x) => (typeof x === 'string' ? success(x) : failure('what?')),
          default: '?'
        }
      },
      storage
    )
    const result = settings.getFoobar()

    expect(result).toEqual<typeof result>(success('?'))
    expect(storage.getItem).toReturnTimes(1)
  })

  test('listen', () => {
    const storage = {
      ...mockStorage,
      setItem: jest.fn((key: string, value: unknown) => {
        expect(key).toEqual('foo')
        expect(value).toEqual(JSON.stringify(1))
      })
    }
    const settings = createStorageSettings({ foo: { map: success, default: 2 } }, storage)
    const onChange = jest.fn((value: unknown) => {
      expect(value).toEqual(1)
      return undefined
    })

    const off = settings.listenFoo(onChange)
    const result = settings.setFoo(1)

    expect(result).toEqual<typeof result>(success(undefined))
    expect(onChange).toReturnTimes(1)

    off()

    settings.setFoo(100)
    expect(onChange).toReturnTimes(1)
  })
})

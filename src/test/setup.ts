import '@testing-library/jest-dom'

import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

// 各テスト後にReactコンポーネントをクリーンアップ
afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

// グローバルモックの設定

// SWRのモック
vi.mock('swr', async () => {
  const actual = await vi.importActual<typeof import('swr')>('swr')
  return {
    ...actual,
    default: vi
      .fn()
      .mockImplementation((...args: Parameters<typeof actual.default>) => {
        const hookResult = actual.default(...args)
        // デフォルトのモック値を先に設定し、実際の結果で上書き
        return {
          ...{
            data: undefined,
            error: undefined,
            isLoading: false,
            isValidating: false,
            mutate: vi.fn(),
          },
          ...hookResult,
        }
      }),
  }
})

// next/navigationのモック
vi.mock('next/navigation', async () => {
  return {
    useRouter: vi.fn(() => ({
      push: vi.fn(),
      replace: vi.fn(),
      back: vi.fn(),
      refresh: vi.fn(),
    })),
    usePathname: vi.fn(() => '/'),
    useSearchParams: vi.fn(() => new URLSearchParams()),
  }
})

// window.confirmのモック
Object.defineProperty(window, 'confirm', {
  writable: true,
  value: vi.fn().mockImplementation(() => true),
})

// console.errorのモック
console.error = vi.fn()

import { beforeEach, describe, expect, it, vi } from 'vitest'

const axiosGetMock = vi.fn()
const axiosPostMock = vi.fn()
const axiosIsAxiosErrorMock = vi.fn()

vi.mock('axios', () => ({
  default: {
    get: axiosGetMock,
    post: axiosPostMock,
    isAxiosError: axiosIsAxiosErrorMock
  }
}))

vi.mock('node-forge', () => ({
  default: {
    pki: {
      publicKeyFromPem: vi.fn(() => ({
        encrypt: vi.fn(() => 'encrypted-aes-key')
      }))
    },
    random: {
      getBytesSync: vi.fn(() => '0123456789abcdef')
    },
    cipher: {
      createCipher: vi.fn(() => ({
        start: vi.fn(),
        update: vi.fn(),
        finish: vi.fn(),
        output: {
          getBytes: vi.fn(() => 'encrypted-payload')
        }
      }))
    },
    util: {
      createBuffer: vi.fn(() => ({})),
      encode64: vi.fn((value: string) => `base64:${value}`)
    }
  }
}))

describe('sendDataToServer', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    vi.unmock('@/assets/sendDataToServer')

    axiosGetMock.mockResolvedValue({
      data: {
        publicKey: 'mock-public-key'
      }
    })
    axiosPostMock.mockResolvedValue({
      status: 200,
      data: { ok: true }
    })
    axiosIsAxiosErrorMock.mockImplementation((error: unknown) => {
      return Boolean((error as { isAxiosError?: boolean })?.isAxiosError)
    })
  })

  it('retries retryable post failures before succeeding', async () => {
    const retryableError = {
      isAxiosError: true,
      message: 'temporary outage',
      response: {
        status: 503,
        statusText: 'Service Unavailable'
      }
    }

    axiosPostMock
      .mockRejectedValueOnce(retryableError)
      .mockResolvedValueOnce({
        status: 200,
        data: { ok: true }
      })

    const { default: sendDataToServer } = await import('@/assets/sendDataToServer')

    const response = await sendDataToServer(
      'https://example.test/log',
      'https://example.test/key',
      { score: 12 },
      {
        maxRetries: 2,
        retryDelay: 0,
        exponentialBackoff: false
      }
    )

    expect(axiosPostMock).toHaveBeenCalledTimes(2)
    expect(response.success).toBe(true)
    expect(response.attempt).toBe(2)
  })
})

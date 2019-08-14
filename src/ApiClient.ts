import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'
import { ConfigOptions, JSO, Token } from 'jso'

interface QueueItem {
  config: AxiosRequestConfig
  resolve: (value?: any | PromiseLike<any>) => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  reject: (reason?: any) => void
}

export class ApiClient {
  private running: boolean = false
  private queue: QueueItem[] = []
  private client: AxiosInstance
  private jso: JSO

  public constructor(options: ConfigOptions, config: AxiosRequestConfig) {
    this.client = axios.create(config)
    this.jso = new JSO(options)
    // this.jso.setLoader(IFramePassive)
    // this.jso.setLoader(Popup)
    this.jso.callback()
  }

  public getNewToken = (): Promise<Token> => {
    // TODO: try passive first, then popup
    return this.jso.getToken()
  }

  public logout = () => {
    this.queue = []
    this.jso.wipeTokens()
  }

  public request = <T>(config: AxiosRequestConfig): Promise<T> => {
    const promise = new Promise<T>((resolve, reject) => {
      this.queue.push({ config, resolve, reject })
    })

    if (!this.running) {
      this.run()
    }

    return promise
  }

  private run = async (): Promise<void> => {
    this.running = true

    const item = this.queue.shift()

    if (!item) {
      this.running = false
      return
    }

    const { config, resolve, reject } = item

    const token = await this.jso.getToken()

    if (!token) {
      this.running = false
      reject('No token!')
      return
    }

    try {
      const response = await this.client.request({
        ...config,
        headers: {
          ...config.headers,
          authorization: `Bearer ${token.access_token}`,
        },
      })

      switch (response.status) {
        case 200:
        case 204:
          resolve(response.data)
          break

        case 401:
          await this.getNewToken()
          this.queue.unshift(item)
          break

        case 409:
          // TODO: use timeout from response headers
          console.log('Waiting for 10 seconds', response)
          await new Promise(resolve => window.setTimeout(resolve, 10000))
          this.queue.unshift(item)
          break

        default:
          reject(response.statusText)
          break
      }
    } catch (error) {
      console.error(error)
    }

    this.run()
  }
}

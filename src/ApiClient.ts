import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'
import { ConfigOptions, IFramePassive, JSO, Popup, Token } from 'jso'

interface QueueItem {
  config: AxiosRequestConfig
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  resolve: (value?: any | PromiseLike<any>) => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  reject: (reason?: any) => void
}

export class ApiClient extends EventTarget {
  private running = false

  private queue: QueueItem[] = []

  private client: AxiosInstance

  private jso: JSO

  private authenticated = false

  public constructor(options: ConfigOptions, config: AxiosRequestConfig) {
    super()

    this.client = axios.create(config)
    this.jso = new JSO(options)

    this.jso.callback()
  }

  public getPassiveToken = async () => {
    this.jso.setLoader(IFramePassive)

    const token = await this.jso.getToken()

    if (token) {
      this.setAuthenticated(true)
    }

    return token
  }

  public getNewToken = async (force = false): Promise<Token> => {
    if (force) {
      this.jso.wipeTokens()
      // TODO: setAuthenticated(false)?
    }

    this.jso.setLoader(Popup)

    const token = await this.jso.getToken()

    if (!token) {
      this.setAuthenticated(false)
      throw new Error()
    }

    this.setAuthenticated(true)

    return token
  }

  public login = () => {
    return this.getNewToken()
  }

  public logout = () => {
    this.queue = []
    this.jso.wipeTokens()
    this.setAuthenticated(false)
    // TODO: stop player!
  }

  public isAuthenticated = () => this.authenticated

  private setAuthenticated = (authenticated: boolean) => {
    this.authenticated = authenticated

    this.dispatchEvent(new Event('authentication_change'))

    if (authenticated) {
      this.run()
    }
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
    if (!this.isAuthenticated()) {
      return
    }

    this.running = true

    const item = this.queue.shift()

    if (!item) {
      this.running = false
      return
    }

    const { config, resolve, reject } = item

    const token = await this.jso.getToken() // TODO: checkToken?

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
          await new Promise((resolve) => window.setTimeout(resolve, 10000))
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

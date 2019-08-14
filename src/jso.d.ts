declare module 'jso' {
  export declare type ResponseType =
    | 'id_token token'
    | 'code id_token'
    | 'token'
    | 'code'

  export declare type TokenType = 'Bearer'

  export declare interface Request {
    providerID: string
    response_type: ResponseType
    redirect_uri?: string
    client_id: string
    state: string
    openid: boolean
    scope?: string
    nonce?: string
    scopes?: string[]
    restoreHash?: string
  }

  export declare interface AuthorizationResponse extends Response {
    code: string
  }

  export declare interface ImplicitResponse extends Response {
    access_token: string
  }

  export declare interface Response {
    expires_in: number
    scope: string
    state: string
    token_type: TokenType
  }

  export declare interface Token {
    access_token: string
    expires: number
    expires_in: number
    received: number
    scopes: string[]
    state: string
    token_type: TokenType
  }

  export declare class JSO extends EventEmitter {
    public constructor(config: ConfigOptions)

    public callback(
      data?: Response | string
    ): Token | Promise<Token> | undefined
    public checkToken(opts?: TokenOptions): Token | undefined
    public configure(config: ConfigOptions): void
    public dump(): Token[]
    public getProviderID(): string
    public getToken(opts?: TokenOptions): Promise<Token>
    public setLoader(loader: BasicLoader): void
    public setStore(newstore: Store): void
    public wipeTokens(): void
  }

  export declare class EventEmitter {
    public on(type: string, callback: (args: any) => void): void
    public emit(type: string, ...args: any[]): void
  }

  export declare interface TokenOptions {
    scopes?: ScopeOptions
    allowredir?: boolean
  }

  export declare class Config {
    public constructor(...opts: ConfigOptions[])

    public has(key: string): boolean

    public getValue<K extends keyof ConfigOptions>(
      key: K,
      defaultValue: ConfigOptions[K],
      isRequired: boolean
    ): ConfigOptions[K]
  }

  export declare interface ConfigOptions {
    providerID?: string
    client_id: string
    client_secret?: string
    authorization: string
    // token: string
    redirect_uri?: string
    scopes?: ScopeOptions
    default_lifetime?: number
    permanent_scope?: string
    response_type?: ResponseType
    debug?: boolean
    request?: Partial<Request>
  }

  export declare interface ScopeOptions {
    require?: string[]
    request?: string[]
  }

  export declare class Store {
    public constructor()

    public saveState<V>(state: string, obj: V): void
    public getState<V>(state: string): V

    public hasScope(token: Token, scope: string): boolean

    public filterTokens(tokens: Token[], scopes: string[]): Token[]

    public saveToken(provider: string, token: Token): void
    public saveTokens(provider: string, tokens: Token[]): void

    public wipeTokens(provider: string): void

    public getToken(provider: string, scopes: string[]): Token
    public getTokens(provider: string): Token[]
  }

  // Errors
  export declare class Error {
    public constructor(props: any)

    public set(key: any, value: any): Error
  }

  export declare class ExpiredTokenError extends Error {}
  export declare class HTTPError extends Error {}
  export declare class OAuthResponseError extends Error {
    public toString(): string
  }

  // Loaders
  export declare class BasicLoader {
    public constructor(url: string)

    public execute(): Promise<void>
  }

  export declare class HTTPRedirect extends BasicLoader {}
  export declare class IFramePassive extends BasicLoader {}
  export declare class Popup extends BasicLoader {}
}

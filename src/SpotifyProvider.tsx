import * as React from 'react'
import { authorize, validateState } from './authorization'

interface SpotifyContextValue {
  accessToken: string | null
  login: () => void
  logout: () => void
  error: string | null
}

export const SpotifyContext = React.createContext<SpotifyContextValue>(
  {} as SpotifyContextValue
)

export const SpotifyProvider: React.FC<{ clientID: string; scope: string }> = ({
  children,
  clientID,
  scope,
}) => {
  const [error, setError] = React.useState<string | null>(null)

  const [accessToken, setAccessToken] = React.useState<string | null>(
    window.localStorage.getItem('access_token')
  )

  React.useEffect(() => {
    const hash = window.location.hash.substring(1)

    if (!hash) {
      return
    }

    const params = new URLSearchParams(hash)
    window.history.replaceState(null, '', ' ')

    const state = params.get('state')

    if (state) {
      if (!validateState(state)) {
        setError('Invalid state')
        return
      }

      if (params.has('error')) {
        setError(params.get('error'))
      } else if (params.has('access_token')) {
        const token = params.get('access_token')
        if (token) {
          window.localStorage.setItem('access_token', token)
          setAccessToken(token)
        }

        // TODO: fetch profile?
      }
    }
  }, [setAccessToken])

  const login = React.useCallback(() => {
    authorize(clientID, scope)
  }, [clientID, scope])

  const logout = React.useCallback(() => {
    window.localStorage.removeItem('access_token')
    setAccessToken(null)
  }, [setAccessToken])

  return (
    <SpotifyContext.Provider value={{ accessToken, login, logout, error }}>
      {children}
    </SpotifyContext.Provider>
  )
}

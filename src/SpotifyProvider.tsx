import * as React from 'react'
import { authorizationURL, readAccessToken, refresh } from './authorization'
import { SpotifyProfileProvider } from './SpotifyProfileProvider'
import { SpotifyClientProvider } from './SpotifyClientProvider'

interface SpotifyContextValue {
  accessToken: string | null
  login: () => void
  logout: () => void
  error: string | null
}

export const SpotifyContext = React.createContext<SpotifyContextValue>(
  {} as SpotifyContextValue
)

export const SpotifyProvider: React.FC<{
  clientID: string
  redirectURI: string
  scopes: string[]
}> = ({ children, clientID, redirectURI, scopes }) => {
  const [accessToken, setAccessToken] = React.useState<string | null>(
    window.localStorage.getItem('access_token')
  )

  const [error, setError] = React.useState<string | null>(null)

  const handleExpiry = React.useCallback(() => {
    refresh(
      authorizationURL(clientID, redirectURI, scopes),
      setAccessToken,
      handleExpiry
    )
  }, [clientID, redirectURI, scopes])

  React.useEffect(() => {
    try {
      const token = readAccessToken(window.location, handleExpiry)

      if (token) {
        setAccessToken(token)
      }
    } catch (error) {
      setError(error.message)
    }
  }, [setAccessToken, setError, handleExpiry])

  const login = React.useCallback(() => {
    // window.open(authorizationURL(clientID, redirectURI, scope))
    window.location.href = authorizationURL(clientID, redirectURI, scopes)
  }, [clientID, redirectURI, scopes])

  const logout = React.useCallback(() => {
    window.localStorage.removeItem('access_token')
    setAccessToken(null)
  }, [setAccessToken])

  return (
    <SpotifyContext.Provider value={{ accessToken, login, logout, error }}>
      <SpotifyClientProvider>
        <SpotifyProfileProvider>{children}</SpotifyProfileProvider>
      </SpotifyClientProvider>
    </SpotifyContext.Provider>
  )
}

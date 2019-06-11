import axios, { AxiosInstance } from 'axios'
import * as React from 'react'
import { SpotifyContext } from './SpotifyProvider'

export const SpotifyClientContext = React.createContext<
  AxiosInstance | undefined
>(undefined)

export const SpotifyClientProvider: React.FC = ({ children }) => {
  const { accessToken, logout } = React.useContext(SpotifyContext)

  const [client, setClient] = React.useState<AxiosInstance>()

  React.useEffect(() => {
    if (accessToken) {
      const client = axios.create({
        baseURL: 'https://api.spotify.com/v1',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      client.interceptors.response.use(
        response => response,
        error => {
          if (error.response && error.response.status === 401) {
            logout()
          }

          return Promise.reject(error)
        }
      )

      setClient(() => client)
    }
  }, [accessToken, logout, setClient])

  return (
    <SpotifyClientContext.Provider value={client}>
      {children}
    </SpotifyClientContext.Provider>
  )
}

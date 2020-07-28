import { SpotifyClientContext } from './SpotifyClientProvider'
import * as React from 'react'

export const SpotifyProfileContext = React.createContext<{
  data: SpotifyApi.UserObjectPublic | undefined
  loading: boolean
  error?: Error
}>({
  data: {} as SpotifyApi.UserObjectPublic,
  loading: false,
})

export const SpotifyProfileProvider: React.FC = ({ children }) => {
  const client = React.useContext(SpotifyClientContext)

  const [loading, setLoading] = React.useState<boolean>(true)
  const [error, setError] = React.useState<Error>()
  const [data, setData] = React.useState<SpotifyApi.UserObjectPublic>()

  React.useEffect(() => {
    const handleChange = () => {
      if (client.isAuthenticated()) {
        client
          .request<SpotifyApi.UserObjectPublic>({
            url: '/me',
          })
          .then((data) => {
            setData(data)
          })
          .catch(setError)
          .finally(() => {
            setLoading(false)
          })
      } else {
        setData(undefined)
        setLoading(false)
      }
    }

    handleChange()

    client.addEventListener('authentication_change', handleChange)

    return () => {
      client.removeEventListener('authentication_change', handleChange)
    }
  }, [client])

  return (
    <SpotifyProfileContext.Provider value={{ error, loading, data }}>
      {children}
    </SpotifyProfileContext.Provider>
  )
}

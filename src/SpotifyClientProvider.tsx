import * as React from 'react'
import { ApiClient } from './ApiClient'

export const SpotifyClientContext = React.createContext<ApiClient>(
  new ApiClient(
    {
      // eslint-disable-next-line @typescript-eslint/camelcase
      client_id: 'foo',
      authorization: 'https://example.com',
    },
    {}
  )
)

export const SpotifyClientProvider: React.FC<{
  clientID: string
  scopes: string[]
}> = ({ children, clientID, scopes }) => {
  const [client, setClient] = React.useState<ApiClient>()

  React.useEffect(() => {
    const client = new ApiClient(
      {
        providerID: 'spotify',
        // eslint-disable-next-line @typescript-eslint/camelcase
        client_id: clientID,
        // eslint-disable-next-line @typescript-eslint/camelcase
        redirect_uri: window.location.origin,
        authorization: 'https://accounts.spotify.com/authorize',
        // eslint-disable-next-line @typescript-eslint/camelcase
        response_type: 'token',
        scopes: {
          request: scopes,
        },
      },
      {
        baseURL: 'https://api.spotify.com/v1',
      }
    )

    setClient(client)
  }, [])

  if (!client) {
    return null
  }

  return (
    <SpotifyClientContext.Provider value={client}>
      {children}
    </SpotifyClientContext.Provider>
  )
}

import * as React from 'react'
import { ApiClient } from './ApiClient'

export const SpotifyClientContext = React.createContext<ApiClient>(
  new ApiClient(
    {
      // eslint-disable-next-line camelcase
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
        // eslint-disable-next-line camelcase
        client_id: clientID,
        // redirect_uri: window.location.origin,
        // eslint-disable-next-line camelcase
        redirect_uri: window.location.origin + '/popup-callback',
        // redirect_uri: window.location.origin + '/passive-callback',
        authorization: 'https://accounts.spotify.com/authorize',
        // eslint-disable-next-line camelcase
        response_type: 'token',
        scopes: {
          request: scopes,
        },
      },
      {
        baseURL: 'https://api.spotify.com/v1',
      }
    )

    client.getPassiveToken().finally(() => {
      setClient(client)
    })
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

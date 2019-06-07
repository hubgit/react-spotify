import { useSpotifyClient } from './SpotifyClient'
import * as React from 'react'

export const SpotifyProfileContext = React.createContext<
  SpotifyApi.UserObjectPublic | undefined
>(undefined)

export const SpotifyProfileProvider: React.FC = ({ children }) => {
  const client = useSpotifyClient()

  const [profile, setProfile] = React.useState<SpotifyApi.UserObjectPublic>()

  React.useEffect(() => {
    if (client) {
      client.get('/me').then(({ data }) => {
        setProfile(data)
      })
    }
  }, [client])

  return (
    <SpotifyProfileContext.Provider value={profile}>
      {children}
    </SpotifyProfileContext.Provider>
  )
}

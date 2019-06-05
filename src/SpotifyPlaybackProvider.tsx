import * as React from 'react'
import { SpotifyContext } from './SpotifyProvider'

interface SpotifyPlaybackContextValue {
  player?: Spotify.SpotifyPlayer
  error?: string
}

export const SpotifyPlaybackContext = React.createContext(
  {} as SpotifyPlaybackContextValue
)

export const SpotifyPlaybackProvider: React.FC<{
  deviceName: string
}> = ({ children, deviceName }) => {
  const { accessToken } = React.useContext(SpotifyContext)

  const [error, setError] = React.useState()
  const [player, setPlayer] = React.useState<Spotify.SpotifyPlayer>()

  React.useEffect(() => {
    if (accessToken) {
      if (!player) {
        window.onSpotifyWebPlaybackSDKReady = () => {
          const player = new window.Spotify.Player({
            name: deviceName,
            volume: 1.0,
            getOAuthToken: callback => callback(accessToken),
          })

          player.connect().then((connected: boolean) => {
            if (connected) {
              setPlayer(player)
            } else {
              setError('Could not connect')
            }
          })
        }

        const script = document.createElement('script')
        script.src = 'https://sdk.scdn.co/spotify-player.js'
        document.body.appendChild(script)
      }
    } else {
      if (player) {
        player.disconnect()
      }
      setPlayer(undefined)
    }

    return () => {
      if (player) {
        player.disconnect()
      }
    }
  }, [accessToken, deviceName, player])

  return (
    <SpotifyPlaybackContext.Provider value={{ player, error }}>
      {children}
    </SpotifyPlaybackContext.Provider>
  )
}

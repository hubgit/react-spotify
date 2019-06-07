import { AxiosResponse } from 'axios'
import * as React from 'react'
import { useSpotifyClient } from './SpotifyClient'
import { SpotifyContext } from './SpotifyProvider'

interface SpotifyPlaybackContextValue {
  player?: Spotify.SpotifyPlayer
  error?: string
  play: (uris: string[]) => Promise<AxiosResponse<void>> | undefined
}

export const SpotifyPlaybackContext = React.createContext(
  {} as SpotifyPlaybackContextValue
)

export const SpotifyPlaybackProvider: React.FC<{
  deviceName: string
}> = ({ children, deviceName }) => {
  const client = useSpotifyClient()

  const { accessToken } = React.useContext(SpotifyContext)

  const [error, setError] = React.useState()
  const [playerInstance, setPlayerInstance] = React.useState<Spotify.WebPlaybackInstance>()
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

          player.addListener('ready', playerInstance => {
            setPlayerInstance(playerInstance)
            setPlayer(player)
          })

          player.connect().then((connected: boolean) => {
            if (!connected) {
              setError('Could not connect')
            }
          })
        }

        const script = document.createElement('script')
        script.src = 'https://sdk.scdn.co/spotify-player.js'
        document.body.appendChild(script)
      }

      return () => {
        if (player) {
          player.disconnect()
        }
      }
    }
  }, [accessToken, deviceName, player])

  const play = React.useCallback(
    (uris: string[]) => {
      if (client && player && playerInstance) {
        return client.put<void>(
          '/me/player/play',
          { uris },
          {
            params: {
              // eslint-disable-next-line @typescript-eslint/camelcase
              device_id: playerInstance.device_id,
            },
          }
        )
      }
    },
    [client, player]
  )

  return (
    <SpotifyPlaybackContext.Provider value={{ player, error, play }}>
      {children}
    </SpotifyPlaybackContext.Provider>
  )
}
